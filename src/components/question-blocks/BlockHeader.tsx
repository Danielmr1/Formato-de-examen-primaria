import React from 'react';
import { 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  ImageIcon,
  Columns2,
  RectangleHorizontal
} from 'lucide-react';
import { ExamBlock, QuestionType } from '../../types';

interface BlockHeaderProps {
  block: ExamBlock;
  index: number;
  totalBlocks: number;
  isEditor: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onOpenDiagramModal?: (blockId: string) => void;
}

const QUESTION_FORMATS: { id: QuestionType; label: string }[] = [
  { id: 'multiple_choice', label: 'Opción Múltiple (A, B, C, D)' },
  { id: 'true_false', label: 'Verdadero o Falso (V/F)' },
  { id: 'statement_only', label: 'Pregunta Abierta / Sin alternativas' },
  { id: 'open_development', label: 'Espacio de Desarrollo / Cuadrícula' },
  { id: 'matching', label: 'Relacionar Columnas' },
  { id: 'reading_passage', label: 'Texto de Lectura (0 pts)' },
];

export const BlockHeader: React.FC<BlockHeaderProps> = ({
  block,
  index,
  totalBlocks,
  isEditor,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveUp,
  onMoveDown,
  onOpenDiagramModal
}) => {
  if (!isEditor) return null;

  const handleSelectType = (newType: QuestionType) => {
    if (newType === block.type) return;

    const updates: Partial<ExamBlock> = { type: newType };

    if (newType === 'statement_only' || newType === 'figure_only') {
      updates.options = undefined;
      updates.trueFalseOptions = undefined;
      updates.matchingPairs = undefined;
      updates.developmentConfig = undefined;
    } else if (newType === 'multiple_choice') {
      if (!block.options || block.options.length === 0) {
        updates.options = [
          { id: `opt-1`, label: 'A', text: 'Primera alternativa de respuesta' },
          { id: `opt-2`, label: 'B', text: 'Segunda alternativa de respuesta', isCorrect: true },
          { id: `opt-3`, label: 'C', text: 'Tercera alternativa de respuesta' },
          { id: `opt-4`, label: 'D', text: 'Cuarta alternativa de respuesta' },
        ];
      }
    } else if (newType === 'open_development') {
      if (!block.developmentConfig) {
        updates.developmentConfig = {
          style: 'grid',
          heightPx: 120,
          promptHint: 'Espacio cuadriculado para cálculo y operaciones paso a paso'
        };
      }
    } else if (newType === 'true_false') {
      if (!block.trueFalseOptions || block.trueFalseOptions.length === 0) {
        updates.trueFalseOptions = [
          { id: `tf-1`, statement: 'Primera afirmación para verificar si es verdadera o falsa.', isTrue: true },
          { id: `tf-2`, statement: 'Segunda afirmación para verificar si es verdadera o falsa.', isTrue: false },
        ];
      }
    } else if (newType === 'matching') {
      if (!block.matchingPairs || block.matchingPairs.length === 0) {
        updates.matchingPairs = [
          { id: 'm-1', leftText: 'Concepto 1', rightText: 'Definición A' },
          { id: 'm-2', leftText: 'Concepto 2', rightText: 'Definición B' },
          { id: 'm-3', leftText: 'Concepto 3', rightText: 'Definición C' },
        ];
      }
    } else if (newType === 'reading_passage') {
      updates.points = 0;
    }

    onUpdateBlock(updates);
  };

  const isFullWidth = (block.width || 6) >= 12;

  const toggleWidth = () => {
    onUpdateBlock({ width: isFullWidth ? 6 : 12 });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs text-slate-700 print:hidden select-none bg-slate-50/70 p-2 rounded-lg">
      {/* Controles de la izquierda: Número y Tipo de pregunta */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 font-bold text-slate-800">
          <span>Pregunta</span>
          <input
            type="text"
            value={block.titleNumber || ''}
            onChange={(e) => onUpdateBlock({ titleNumber: e.target.value })}
            className="w-10 px-1 py-0.5 text-center font-bold text-indigo-700 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
            title="Número de la pregunta"
          />
        </div>

        {/* Selector de Tipo de Pregunta */}
        <select
          value={block.type || 'multiple_choice'}
          onChange={(e) => handleSelectType(e.target.value as QuestionType)}
          className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-xs text-slate-700 cursor-pointer focus:border-indigo-500 focus:outline-hidden"
          title="Tipo de pregunta"
        >
          {QUESTION_FORMATS.map(fmt => (
            <option key={fmt.id} value={fmt.id}>
              {fmt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Controles de la derecha: Puntos, Ancho, Imagen y Acciones */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Puntos */}
        <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded font-semibold text-xs">
          <span>Pts:</span>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={block.points ?? 2}
            onChange={(e) => onUpdateBlock({ points: parseFloat(e.target.value) || 0 })}
            className="w-8 text-center font-bold text-indigo-700 focus:outline-hidden"
            title="Puntos de esta pregunta"
          />
        </div>

        {/* Alternar Ancho (Media Hoja / Hoja Completa) */}
        <button
          type="button"
          onClick={toggleWidth}
          className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-medium transition-colors cursor-pointer"
          title={isFullWidth ? "Cambiar a media hoja (2 columnas)" : "Cambiar a ancho completo (1 columna)"}
        >
          {isFullWidth ? (
            <>
              <RectangleHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Hoja Completa</span>
            </>
          ) : (
            <>
              <Columns2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Media Hoja</span>
            </>
          )}
        </button>

        {/* Añadir imagen/figura si no tiene */}
        {!block.figure && onOpenDiagramModal && (
          <button
            type="button"
            onClick={() => onOpenDiagramModal(block.id)}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-medium transition-colors cursor-pointer"
            title="Añadir una figura o diagrama a esta pregunta"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">+ Imagen</span>
          </button>
        )}

        {/* Estilo / Color de tarjeta */}
        <select
          value={block.blockTheme || 'standard'}
          onChange={(e) => onUpdateBlock({ blockTheme: e.target.value as any })}
          className="bg-white border border-slate-300 rounded px-1.5 py-1 font-medium text-xs text-slate-600 cursor-pointer focus:outline-hidden"
          title="Color de fondo de la tarjeta"
        >
          <option value="standard">Fondo Normal</option>
          <option value="accent">Azul Suave</option>
          <option value="highlight">Fondo Ámbar</option>
          <option value="minimal">Sin Borde</option>
        </select>

        <div className="w-px h-4 bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Mover Arriba / Abajo */}
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMoveUp(index)}
          className="p-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
          title="Subir pregunta"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={index === totalBlocks - 1}
          onClick={() => onMoveDown(index)}
          className="p-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
          title="Bajar pregunta"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Duplicar */}
        <button
          type="button"
          onClick={() => onDuplicateBlock(block.id)}
          className="p-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-600 transition-colors cursor-pointer"
          title="Duplicar esta pregunta"
        >
          <Copy className="w-3.5 h-3.5 text-slate-600" />
        </button>

        {/* Eliminar */}
        <button
          type="button"
          onClick={() => onDeleteBlock(block.id)}
          className="flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold transition-colors cursor-pointer"
          title="Eliminar pregunta"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden md:inline">Borrar</span>
        </button>
      </div>
    </div>
  );
};
