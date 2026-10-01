import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  ImageIcon,
  MoreVertical
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
  { id: 'multiple_choice', label: 'Opción Múltiple' },
  { id: 'true_false', label: 'Verdadero / Falso' },
  { id: 'statement_only', label: 'Pregunta Abierta' },
  { id: 'open_development', label: 'Desarrollo / Cálculo' },
  { id: 'matching', label: 'Relacionar' },
  { id: 'reading_passage', label: 'Lectura (0 pts)' },
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

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const isCompact = (block.width || 6) <= 5;

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
          { id: `opt-1`, label: 'A', text: 'Opción A' },
          { id: `opt-2`, label: 'B', text: 'Opción B', isCorrect: true },
          { id: `opt-3`, label: 'C', text: 'Opción C' },
          { id: `opt-4`, label: 'D', text: 'Opción D' },
        ];
      }
    } else if (newType === 'open_development') {
      if (!block.developmentConfig) {
        updates.developmentConfig = {
          style: 'grid',
          heightPx: 120,
          promptHint: 'Espacio de resolución'
        };
      }
    } else if (newType === 'true_false') {
      if (!block.trueFalseOptions || block.trueFalseOptions.length === 0) {
        updates.trueFalseOptions = [
          { id: `tf-1`, statement: 'Afirmación 1', isTrue: true },
          { id: `tf-2`, statement: 'Afirmación 2', isTrue: false },
        ];
      }
    } else if (newType === 'matching') {
      if (!block.matchingPairs || block.matchingPairs.length === 0) {
        updates.matchingPairs = [
          { id: 'm-1', leftText: 'Elemento 1', rightText: 'Definición A' },
          { id: 'm-2', leftText: 'Elemento 2', rightText: 'Definición B' },
          { id: 'm-3', leftText: 'Elemento 3', rightText: 'Definición C' },
        ];
      }
    } else if (newType === 'reading_passage') {
      updates.points = 0;
    }

    onUpdateBlock(updates);
  };

  return (
    <div className="flex items-center justify-between gap-1 pb-1.5 mb-2 border-b border-slate-200 text-xs text-slate-700 print:hidden select-none">
      {/* Izquierda: Número y tipo */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-bold text-slate-700 shrink-0">N°</span>
        <input
          type="text"
          value={block.titleNumber || ''}
          onChange={(e) => onUpdateBlock({ titleNumber: e.target.value })}
          className="w-8 px-1 py-0.5 text-center font-bold text-indigo-700 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden shrink-0"
          title="Número de la pregunta"
        />

        <select
          value={block.type || 'multiple_choice'}
          onChange={(e) => handleSelectType(e.target.value as QuestionType)}
          className={`bg-white border border-slate-300 rounded px-1.5 py-0.5 font-semibold text-xs text-slate-700 cursor-pointer focus:border-indigo-500 focus:outline-hidden truncate ${
            isCompact ? 'max-w-[75px] sm:max-w-[90px]' : 'max-w-[130px] sm:max-w-none'
          }`}
          title="Tipo de pregunta"
        >
          {QUESTION_FORMATS.map(fmt => (
            <option key={fmt.id} value={fmt.id}>
              {fmt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Derecha: Puntos, Figura y Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded font-semibold text-[11px]">
          <span>Pts:</span>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={block.points ?? 2}
            onChange={(e) => onUpdateBlock({ points: parseFloat(e.target.value) || 0 })}
            className="w-7 text-center font-bold text-indigo-700 bg-transparent focus:outline-hidden"
            title="Puntos de esta pregunta"
          />
        </div>

        {isCompact ? (
          /* Modo Compacto (<= 5 columnas): Menú desplegable de 3 puntos */
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(prev => !prev)}
              className={`p-1 border rounded transition-colors cursor-pointer ${
                showMenu
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title="Más opciones"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in-50">
                {!block.figure && onOpenDiagramModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDiagramModal(block.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Añadir Figura</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    onMoveUp(index);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>Subir</span>
                </button>

                <button
                  type="button"
                  disabled={index === totalBlocks - 1}
                  onClick={() => {
                    onMoveDown(index);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bajar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDuplicateBlock(block.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duplicar</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    onDeleteBlock(block.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Modo Normal (> 5 columnas): Botones horizontales */
          <>
            {/* Añadir imagen/figura si no tiene */}
            {!block.figure && onOpenDiagramModal && (
              <button
                type="button"
                onClick={() => onOpenDiagramModal(block.id)}
                className="p-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded transition-colors cursor-pointer"
                title="Añadir una figura o diagrama"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mover Arriba / Abajo */}
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-500 disabled:opacity-20 transition-colors cursor-pointer"
              title="Subir"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={index === totalBlocks - 1}
              onClick={() => onMoveDown(index)}
              className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-500 disabled:opacity-20 transition-colors cursor-pointer"
              title="Bajar"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Duplicar */}
            <button
              type="button"
              onClick={() => onDuplicateBlock(block.id)}
              className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Duplicar"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Eliminar */}
            <button
              type="button"
              onClick={() => onDeleteBlock(block.id)}
              className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded transition-colors cursor-pointer"
              title="Borrar pregunta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
