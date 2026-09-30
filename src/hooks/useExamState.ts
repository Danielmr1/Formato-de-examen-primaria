import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BlockWidth, 
  ChoiceOption, 
  ExamBlock, 
  ExamDocument, 
  FigureData, 
  QuestionType 
} from '../types';
import { SAMPLE_EXAMS } from '../data/sampleExams';
import { PRESET_DIAGRAMS } from '../data/sampleFigures';
import { saveLocalSnapshot } from '../utils/versionHistory';

export const createBlankExam = (id?: string): ExamDocument => ({
  id: id || `exam-${Date.now()}`,
  title: 'Nuevo Examen',
  createdAt: new Date().toISOString().split('T')[0],
  updatedAt: 'Recién creado',
  header: {
    institutionName: '',
    examTitle: '',
    subject: '',
    teacherName: '',
    gradeLevel: '',
    durationMinutes: 60,
    dateStr: '',
    headerStyle: 'boxed',
    showStudentNameField: true,
    showDateField: true,
    showScoreBox: true,
    generalInstructions: '',
    scoreBoxSize: 'large',
    titleAlignment: 'left',
    logoUrl: ''
  },
  settings: {
    paperSize: 'a4',
    fontFamily: 'sans',
    baseFontSize: 'md',
    gridColumns: 12,
    showPointsInPrint: true,
    showBorders: true,
    twoColumnLayout: false,
    statementJustify: true,
    lineSpacing: 'normal'
  },
  blocks: []
});

export function sanitizeExam(doc: any): ExamDocument {
  const fallback = createBlankExam(doc?.id);
  if (!doc || typeof doc !== 'object') return fallback;

  return {
    ...fallback,
    id: typeof doc.id === 'string' ? doc.id : fallback.id,
    title: typeof doc.title === 'string' ? doc.title : (doc.header?.examTitle || fallback.title),
    createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : fallback.createdAt,
    updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : fallback.updatedAt,
    header: {
      ...fallback.header,
      ...(doc.header && typeof doc.header === 'object' ? doc.header : {})
    },
    settings: {
      ...fallback.settings,
      ...(doc.settings && typeof doc.settings === 'object' ? doc.settings : {})
    },
    blocks: Array.isArray(doc.blocks) ? doc.blocks.map((b: any) => {
      // Purgar textos genéricos o innecesarios de pie de figura
      if (b?.figure?.caption) {
        const cap = b.figure.caption.trim().toLowerCase();
        if (
          cap.includes('diagrama ilustrativo') || 
          cap.startsWith('figura:') || 
          cap.startsWith('figura 1') ||
          cap.startsWith('figura 2') ||
          cap.startsWith('figura 3') ||
          cap === 'figura'
        ) {
          const nextFig = { ...b.figure };
          delete nextFig.caption;
          return { ...b, figure: nextFig };
        }
      }
      return b;
    }) : []
  };
}

export interface UndoAction {
  message: string;
  onUndo: () => void;
}

export function useExamState() {
  const [exam, setExam] = useState<ExamDocument>(() => {
    try {
      const savedCurrent = localStorage.getItem('docu_current_exam');
      if (savedCurrent) {
        const parsed = JSON.parse(savedCurrent);
        if (parsed && typeof parsed === 'object') {
          return sanitizeExam(parsed);
        }
      }
    } catch {}
    return createBlankExam();
  });
  const [currentExamId, setCurrentExamId] = useState<string>(() => exam.id);
  const [examsList, setExamsList] = useState<ExamDocument[]>(() => {
    try {
      const saved = localStorage.getItem('docu_teacher_exams_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeExam);
        }
      }
    } catch {}
    return [SAMPLE_EXAMS[0]];
  });

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [undoItem, setUndoItem] = useState<UndoAction | null>(null);

  const notify = useCallback((message: string, duration: number = 3000) => {
    setCopiedNotification(message);
    setTimeout(() => {
      setCopiedNotification(prev => (prev === message ? null : prev));
    }, duration);
  }, []);

  // Total points calculation
  const totalPoints = useMemo(() => {
    return exam.blocks.reduce((sum, b) => sum + (b.points || 0), 0);
  }, [exam.blocks]);

  // Questions without key calculation
  const questionsWithoutKeyCount = useMemo(() => {
    return exam.blocks.filter(b => {
      if (b.type === 'multiple_choice') {
        return !b.options || b.options.length === 0 || !b.options.some(o => o.isCorrect);
      }
      return false;
    }).length;
  }, [exam.blocks]);

  // Guardar copia local en examsList
  useEffect(() => {
    setExamsList(prevList => {
      const idx = prevList.findIndex(e => e.id === exam.id);
      const nowStr = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      const updatedExam = { ...exam, updatedAt: nowStr };
      let nextList: ExamDocument[];
      if (idx >= 0) {
        nextList = [...prevList];
        nextList[idx] = updatedExam;
      } else {
        nextList = [updatedExam, ...prevList];
      }
      localStorage.setItem('docu_teacher_exams_list', JSON.stringify(nextList));
      localStorage.setItem('docu_current_exam', JSON.stringify(updatedExam));
      return nextList;
    });
  }, [exam]);

  // Auto-guardar snapshots locales periódicos (Time Machine)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (exam && exam.blocks && exam.blocks.length > 0) {
        saveLocalSnapshot(exam, totalPoints);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [exam, totalPoints]);

  // Block management
  const handleAddBlock = useCallback((width: BlockWidth = 6, type: QuestionType = 'multiple_choice', withFigure: boolean = false) => {
    setExam(prev => {
      const count = prev.blocks.length + 1;
      const blockNum = `${count}`;

      const defaultOptions: ChoiceOption[] = [
        { id: `opt-1`, label: 'A', text: 'Primera alternativa de respuesta' },
        { id: `opt-2`, label: 'B', text: 'Segunda alternativa de respuesta', isCorrect: true },
        { id: `opt-3`, label: 'C', text: 'Tercera alternativa de respuesta' },
        { id: `opt-4`, label: 'D', text: 'Cuarta alternativa de respuesta' },
      ];

      let figureData: FigureData | undefined = undefined;
      if (withFigure) {
        figureData = {
          svgData: PRESET_DIAGRAMS[0].svg,
          position: width === 12 ? 'right' : 'top',
          widthPercent: width === 12 ? 40 : 90
        };
      }

      const newBlock: ExamBlock = {
        id: `blk-${Date.now()}`,
        titleNumber: blockNum,
        statement: type === 'reading_passage' 
          ? 'Escriba aquí el texto de lectura o caso de estudio para el análisis del estudiante...'
          : 'Escriba aquí el enunciado de la pregunta. Puede utilizar **negrita** para resaltar conceptos y añadir figuras.',
        type: type,
        width: width,
        points: type === 'reading_passage' ? 0 : 2,
        heightMode: 'auto',
        figure: figureData,
        options: (type === 'multiple_choice') ? defaultOptions : undefined,
        trueFalseOptions: (type === 'true_false') ? [
          { id: `tf-1`, statement: 'Primera afirmación para verificar si es verdadera o falsa.', isTrue: true },
          { id: `tf-2`, statement: 'Segunda afirmación para verificar si es verdadera o falsa.', isTrue: false },
        ] : undefined,
        developmentConfig: (type === 'open_development') ? {
          style: 'grid',
          heightPx: 120,
          promptHint: 'Espacio cuadriculado para cálculo y operaciones paso a paso'
        } : undefined,
        matchingPairs: (type === 'matching') ? [
          { id: 'm-1', leftText: 'Concepto o término 1', rightText: 'Definición o descripción A' },
          { id: 'm-2', leftText: 'Concepto o término 2', rightText: 'Definición o descripción B' },
          { id: 'm-3', leftText: 'Concepto o término 3', rightText: 'Definición o descripción C' },
        ] : undefined
      };

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock]
      };
    });
  }, []);

  const handleUpdateBlock = useCallback((blockId: string, updated: Partial<ExamBlock>) => {
    setExam(prev => {
      if (updated.width !== undefined) {
        const nextWidth = Math.max(3, Math.min(12, Math.round(updated.width)));
        return {
          ...prev,
          blocks: prev.blocks.map(b => b.id === blockId ? { ...b, ...updated, width: nextWidth } : b)
        };
      }

      return {
        ...prev,
        blocks: prev.blocks.map(b => b.id === blockId ? { ...b, ...updated } : b)
      };
    });
  }, []);

  // Delete with Undo Guardrail
  const handleDeleteBlock = useCallback((blockId: string) => {
    setExam(prev => {
      const idx = prev.blocks.findIndex(b => b.id === blockId);
      const targetBlock = prev.blocks[idx];
      if (!targetBlock) return prev;

      setUndoItem({
        message: `Pregunta ${targetBlock.titleNumber || ''} eliminada`,
        onUndo: () => {
          setExam(p => {
            const next = [...p.blocks];
            next.splice(idx, 0, targetBlock);
            return { ...p, blocks: next };
          });
          notify(`✓ Pregunta ${targetBlock.titleNumber || ''} restaurada`);
        }
      });

      setTimeout(() => {
        setUndoItem(curr => (curr?.message.includes(targetBlock.titleNumber || '') ? null : curr));
      }, 6000);

      return {
        ...prev,
        blocks: prev.blocks.filter(b => b.id !== blockId)
      };
    });
  }, [notify]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    setExam(prev => {
      const target = prev.blocks.find(b => b.id === blockId);
      if (!target) return prev;
      const duplicated: ExamBlock = {
        ...target,
        id: `blk-${Date.now()}`,
        titleNumber: `${target.titleNumber || ''} (copia)`,
      };
      const index = prev.blocks.findIndex(b => b.id === blockId);
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, duplicated);
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setExam(prev => {
      const newBlocks = [...prev.blocks];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index - 1];
      newBlocks[index - 1] = temp;
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setExam(prev => {
      if (index === prev.blocks.length - 1) return prev;
      const newBlocks = [...prev.blocks];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index + 1];
      newBlocks[index + 1] = temp;
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  const handleResizeWidthPair = useCallback((leftBlockId: string, rightBlockId: string, newLeftWidth: number, newRightWidth: number) => {
    setExam(prev => {
      const leftWidth = Math.max(1, Math.min(11, newLeftWidth)) as BlockWidth;
      const rightWidth = Math.max(1, Math.min(11, newRightWidth)) as BlockWidth;
      return {
        ...prev,
        blocks: prev.blocks.map(b => {
          if (b.id === leftBlockId) return { ...b, width: leftWidth };
          if (b.id === rightBlockId) return { ...b, width: rightWidth };
          return b;
        })
      };
    });
  }, []);

  const handleUpdateExamTitle = useCallback((title: string) => {
    setExam(prev => ({ ...prev, title }));
  }, []);

  const handleUpdateHeader = useCallback((updated: Partial<ExamDocument['header']>) => {
    setExam(prev => ({
      ...prev,
      header: { ...prev.header, ...updated }
    }));
  }, []);

  const handleUpdateSettings = useCallback((settings: Partial<ExamDocument['settings']>) => {
    setExam(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  }, []);

  const handleLoadTemplate = useCallback((templateId: string) => {
    const found = SAMPLE_EXAMS.find(e => e.id === templateId);
    if (found) {
      const cloned: ExamDocument = JSON.parse(JSON.stringify(found));
      const newId = `exam-${Date.now()}`;
      cloned.id = newId;
      cloned.title = `${cloned.title} (Copia)`;
      cloned.updatedAt = 'Recién importado';
      setExam(cloned);
      setCurrentExamId(newId);
      notify(`Plantilla "${found.title}" cargada`);
    }
  }, [notify]);

  const handleNewBlankExam = useCallback(() => {
    const blank = createBlankExam();
    setExam(blank);
    setCurrentExamId(blank.id);
    notify('Nuevo examen en blanco iniciado');
  }, [notify]);

  const handleSelectExam = useCallback((examId: string) => {
    const target = examsList.find(e => e.id === examId);
    if (target) {
      setExam(sanitizeExam(target));
      setCurrentExamId(target.id);
      notify(`Examen "${target.title}" cargado en pantalla`);
    }
  }, [examsList, notify]);

  const handleDeleteExam = useCallback((examId: string) => {
    setExamsList(prev => {
      const next = prev.filter(e => e.id !== examId);
      localStorage.setItem('docu_teacher_exams_list', JSON.stringify(next));
      return next;
    });

    if (exam.id === examId) {
      const remaining = examsList.filter(e => e.id !== examId);
      if (remaining.length > 0) {
        setExam(sanitizeExam(remaining[0]));
        setCurrentExamId(remaining[0].id);
      } else {
        handleNewBlankExam();
      }
    }
    notify('Examen eliminado');
  }, [exam.id, examsList, handleNewBlankExam, notify]);

  const handleDuplicateExam = useCallback((examId: string) => {
    const target = examsList.find(e => e.id === examId);
    if (!target) return;
    const duplicated: ExamDocument = {
      ...JSON.parse(JSON.stringify(target)),
      id: `exam-${Date.now()}`,
      title: `${target.title} (Copia)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'Recién duplicado'
    };
    setExamsList(prev => {
      const next = [duplicated, ...prev];
      localStorage.setItem('docu_teacher_exams_list', JSON.stringify(next));
      return next;
    });
    setExam(duplicated);
    setCurrentExamId(duplicated.id);
    notify(`Examen duplicado como "${duplicated.title}"`);
  }, [examsList, notify]);

  const handleRestoreSnapshot = useCallback((restoredExam: ExamDocument) => {
    setExam(sanitizeExam(restoredExam));
    notify(`✓ Respaldo "${restoredExam.title}" restaurado exitosamente`, 3500);
  }, [notify]);

  return {
    exam,
    setExam,
    currentExamId,
    setCurrentExamId,
    examsList,
    setExamsList,
    totalPoints,
    questionsWithoutKeyCount,
    copiedNotification,
    setCopiedNotification,
    undoItem,
    setUndoItem,
    notify,
    // Operations
    handleAddBlock,
    handleUpdateBlock,
    handleDeleteBlock,
    handleDuplicateBlock,
    handleMoveUp,
    handleMoveDown,
    handleResizeWidthPair,
    handleUpdateExamTitle,
    handleUpdateHeader,
    handleUpdateSettings,
    handleLoadTemplate,
    handleNewBlankExam,
    handleSelectExam,
    handleDeleteExam,
    handleDuplicateExam,
    handleRestoreSnapshot
  };
}
