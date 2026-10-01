import { ExamDocument, ExamBlock } from '../types';

/**
 * Guardrail de Seguridad: Sanitización de SVG
 * Elimina scripts, atributos ejecutables y elementos peligrosos en gráficos SVG
 */
export function sanitizeSvg(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== 'string') return '';

  return rawSvg
    // Eliminar etiquetas script y su contenido
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Eliminar objetos externos incrustados
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Eliminar atributos de eventos JavaScript (onclick, onload, onerror, etc.)
    .replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Desactivar enlaces javascript: en href o xlink:href
    .replace(/(?:href|xlink:href)\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
}

/**
 * Guardrail de Seguridad y Calidad Tipográfica:
 * Limita la longitud total y la longitud máxima de palabras continuas sin espacios
 */
export function sanitizeTextLength(text: string, maxTotal: number, maxWordLength: number = 25): string {
  if (!text || typeof text !== 'string') return '';
  
  // 1. Limitar longitud total
  const trimmed = text.slice(0, maxTotal);

  // 2. Limitar palabras continuas sin espacios para evitar desbordes de caja
  return trimmed
    .split(/(\s+)/)
    .map(w => (!/^\s+$/.test(w) && w.length > maxWordLength ? w.slice(0, maxWordLength) : w))
    .join('');
}

/**
 * Guardrail de Seguridad: Validación defensiva de esquema de Examen JSON
 * Previene congelamientos o errores fatales si un archivo subido está corrupto o malicioso
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedExam?: ExamDocument;
}

export function validateExamJson(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'El archivo no contiene un objeto JSON válido.' };
  }

  if (!data.header || typeof data.header !== 'object') {
    return { isValid: false, error: 'Estructura inválida: Falta la sección de cabecera (header).' };
  }

  if (!Array.isArray(data.blocks)) {
    return { isValid: false, error: 'Estructura inválida: La lista de preguntas (blocks) debe ser una lista.' };
  }

  // Sanitizar bloques
  const validBlocks: ExamBlock[] = [];
  for (let i = 0; i < data.blocks.length; i++) {
    const b = data.blocks[i];
    if (!b || typeof b !== 'object') continue;

    const sanitizedBlock: ExamBlock = {
      id: typeof b.id === 'string' && b.id ? b.id : `blk-${Date.now()}-${i}`,
      titleNumber: typeof b.titleNumber === 'string' && b.titleNumber.trim() ? b.titleNumber.trim() : `${i + 1}`,
      statement: sanitizeTextLength(
        typeof b.statement === 'string' ? b.statement : `Pregunta ${i + 1}`,
        b.type === 'reading_passage' ? 2000 : 400,
        25
      ),
      type: ['multiple_choice', 'true_false', 'open_development', 'matching', 'figure_only', 'reading_passage'].includes(b.type)
        ? b.type
        : 'multiple_choice',
      width: (typeof b.width === 'number' && !isNaN(b.width))
        ? (Math.max(4, Math.min(12, Math.round(b.width))) as any)
        : 12,
      heightMode: ['auto', 'compact', 'tall'].includes(b.heightMode) ? b.heightMode : 'auto',
      points: typeof b.points === 'number' && !isNaN(b.points) ? Math.max(0, b.points) : 2,
      blockTheme: ['standard', 'accent', 'highlight', 'minimal', 'dashed'].includes(b.blockTheme) ? b.blockTheme : 'standard',
      customMinHeight: typeof b.customMinHeight === 'number' ? b.customMinHeight : undefined,
    };

    // Validar figura si existe
    if (b.figure && typeof b.figure === 'object') {
      sanitizedBlock.figure = {
        url: typeof b.figure.url === 'string' ? b.figure.url : undefined,
        svgData: typeof b.figure.svgData === 'string' ? sanitizeSvg(b.figure.svgData) : undefined,
        caption: typeof b.figure.caption === 'string' && b.figure.caption.trim() ? b.figure.caption.trim() : undefined,
        position: ['top', 'bottom', 'left', 'right', 'full'].includes(b.figure.position) ? b.figure.position : 'right',
        widthPercent: typeof b.figure.widthPercent === 'number' ? Math.min(100, Math.max(15, b.figure.widthPercent)) : 45
      };
    }

    // Validar opciones de opción múltiple
    if (Array.isArray(b.options)) {
      sanitizedBlock.options = b.options.map((opt: any, oIdx: number) => ({
        id: typeof opt.id === 'string' ? opt.id : `opt-${oIdx}`,
        label: typeof opt.label === 'string' ? opt.label : String.fromCharCode(65 + oIdx),
        text: sanitizeTextLength(typeof opt.text === 'string' ? opt.text : '', 160, 25),
        isCorrect: Boolean(opt.isCorrect)
      }));
    }

    // Validar opciones de verdadero/falso
    if (Array.isArray(b.trueFalseOptions)) {
      sanitizedBlock.trueFalseOptions = b.trueFalseOptions.map((tf: any, tIdx: number) => ({
        id: typeof tf.id === 'string' ? tf.id : `tf-${tIdx}`,
        statement: sanitizeTextLength(typeof tf.statement === 'string' ? tf.statement : '', 200, 25),
        isTrue: Boolean(tf.isTrue)
      }));
    }

    // Validar desarrollo abierto
    if (b.developmentConfig && typeof b.developmentConfig === 'object') {
      sanitizedBlock.developmentConfig = {
        style: ['grid', 'lines', 'blank', 'dotted'].includes(b.developmentConfig.style) ? b.developmentConfig.style : 'grid',
        heightPx: typeof b.developmentConfig.heightPx === 'number' ? Math.max(40, Math.min(600, b.developmentConfig.heightPx)) : 120,
        promptHint: typeof b.developmentConfig.promptHint === 'string' ? b.developmentConfig.promptHint : ''
      };
    }

    // Validar pares de emparejamiento
    if (Array.isArray(b.matchingPairs)) {
      sanitizedBlock.matchingPairs = b.matchingPairs.map((m: any, mIdx: number) => ({
        id: typeof m.id === 'string' ? m.id : `m-${mIdx}`,
        leftText: sanitizeTextLength(typeof m.leftText === 'string' ? m.leftText : '', 180, 20),
        rightText: sanitizeTextLength(typeof m.rightText === 'string' ? m.rightText : '', 180, 20)
      }));
    }

    validBlocks.push(sanitizedBlock);
  }

  const sanitizedExam: ExamDocument = {
    id: typeof data.id === 'string' && data.id ? data.id : `exam-${Date.now()}`,
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Examen Importado',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString().split('T')[0],
    updatedAt: 'Recién importado',
    header: {
      institutionName: typeof data.header.institutionName === 'string' ? data.header.institutionName : '',
      examTitle: typeof data.header.examTitle === 'string' ? data.header.examTitle : '',
      subject: typeof data.header.subject === 'string' ? data.header.subject : '',
      teacherName: typeof data.header.teacherName === 'string' ? data.header.teacherName : '',
      gradeLevel: typeof data.header.gradeLevel === 'string' ? data.header.gradeLevel : '',
      durationMinutes: typeof data.header.durationMinutes === 'number' ? data.header.durationMinutes : 60,
      dateStr: typeof data.header.dateStr === 'string' ? data.header.dateStr : '',
      headerStyle: ['boxed', 'modern', 'minimal', 'double_line'].includes(data.header.headerStyle) ? data.header.headerStyle : 'boxed',
      showStudentNameField: data.header.showStudentNameField !== false,
      showDateField: data.header.showDateField !== false,
      showScoreBox: data.header.showScoreBox !== false,
      generalInstructions: typeof data.header.generalInstructions === 'string' ? data.header.generalInstructions : '',
      scoreBoxSize: ['compact', 'large'].includes(data.header.scoreBoxSize) ? data.header.scoreBoxSize : 'large',
      titleAlignment: 'center',
      logoUrl: typeof data.header.logoUrl === 'string' ? data.header.logoUrl : ''
    },
    settings: {
      paperSize: ['a4', 'letter'].includes(data.settings?.paperSize) ? data.settings.paperSize : 'a4',
      fontFamily: ['sans', 'serif', 'mono'].includes(data.settings?.fontFamily) ? data.settings.fontFamily : 'sans',
      baseFontSize: ['sm', 'md', 'lg'].includes(data.settings?.baseFontSize) ? data.settings.baseFontSize : 'md',
      gridColumns: 12,
      showPointsInPrint: data.settings?.showPointsInPrint !== false,
      showBorders: data.settings?.showBorders !== false,
      twoColumnLayout: Boolean(data.settings?.twoColumnLayout),
      statementJustify: true,
      lineSpacing: ['compact', 'normal', 'relaxed'].includes(data.settings?.lineSpacing) ? data.settings.lineSpacing : 'normal'
    },
    blocks: validBlocks
  };

  return { isValid: true, sanitizedExam };
}
