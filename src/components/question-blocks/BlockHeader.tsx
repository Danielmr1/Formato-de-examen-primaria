import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Check, 
  Sparkles,
  Layers,
  MoreHorizontal,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { BlockWidth, ExamBlock, QuestionType } from '../../types';

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

const QUESTION_FORMATS: { id: QuestionType; label: string; desc: string }[] = [
  { id: 'statement_only', label: 'Solo Enunciado (Sin alternativas)', desc: 'Pregunta directa, abierta o conceptual' },
  { id: 'multiple_choice', label: 'Opción Múltiple (A, B, C, D)', desc: 'Con alternativas marcables y clave de respuesta' },
  { id: 'open_development', label: 'Desarrollo / Cálculo', desc: 'Espacio con cuadrícula para operaciones paso a paso' },
  { id: 'true_false', label: 'Verdadero o Falso (V/F)', desc: 'Lista de afirmaciones para responder V o F' },
  { id: 'matching', label: 'Relacionar Columnas', desc: 'Conceptos y definiciones para emparejar' },
  { id: 'reading_passage', label: 'Texto de Lectura', desc: 'Texto extenso o caso de análisis previo (0 pts)' },
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
  const [showTypePopover, setShowTypePopover] = useState(false);
  const typePopoverRef = useRef<HTMLDivElement>(null);

  const [showMorePopover, setShowMorePopover] = useState(false);
  const morePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typePopoverRef.current && !typePopoverRef.current.contains(e.target as Node)) {
        setShowTypePopover(false);
      }
      if (morePopoverRef.current && !morePopoverRef.current.contains(e.target as Node)) {
        setShowMorePopover(false);
      }
    };
    if (showTypePopover || showMorePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTypePopover, showMorePopover]);

  if (!isEditor) return null;

  const handleSelectType = (newType: QuestionType) => {
    setShowTypePopover(false);
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
          { id: 'm-1', leftText: 'Concepto o término 1', rightText: 'Definición o descripción A' },
          { id: 'm-2', leftText: 'Concepto o término 2', rightText: 'Definición o descripción B' },
          { id: 'm-3', leftText: 'Concepto o término 3', rightText: 'Definición o descripción C' },
        ];
      }
    } else if (newType === 'reading_passage') {
      updates.points = 0;
    }

    onUpdateBlock(updates);
  };

  const getCurrentTypeLabel = () => {
    switch (block.type) {
      case 'statement_only': return 'Sin alternativas';
      case 'open_development': return 'Desarrollo';
      case 'true_false': return 'Verdadero / Falso';
      case 'matching': return 'Relacionar';
      case 'reading_passage': return 'Lectura';
      case 'figure_only': return 'Solo figura';
      case 'multiple_choice':
      default: return 'Opción múltiple';
    }
  };

  return (
    <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-200 text-xs text-slate-600 print:hidden select-none">
      {/* Left controls: Number & Format Type */}
      <div className="flex items-center gap-1.5 min-w-0">
        {/* Question Number */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-black text-slate-800 text-xs">N°</span>
          <input
            type="text"
            value={block.titleNumber || ''}
            onChange={(e) => onUpdateBlock({ titleNumber: e.target.value })}
            className="w-9 px-1 py-0.5 text-center font-black text-slate-900 bg-white border border-slate-300 rounded focus:border-indigo-500 focus:outline-hidden"
            title="Número o etiqueta de la pregunta (ej: 1, 2, 3b)"
          />
        </div>

        {/* Formato / Tipo de Pregunta */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowTypePopover(!showTypePopover)}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-bold text-[11px] text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer shadow-2xs"
            title="Cambiar formato de esta pregunta (Sin alternativas, Opción múltiple, Desarrollo, etc.)"
          >
            <Layers className="w-3 h-3 text-indigo-500 shrink-0" />
            <span className="font-bold text-indigo-700 truncate max-w-[110px] sm:max-w-none">{getCurrentTypeLabel()}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showTypePopover && (
            <div
              ref={typePopoverRef}
              className="absolute left-0 top-7 bg-white border border-slate-300 rounded-xl shadow-xl p-1.5 z-50 w-72 flex flex-col gap-1 text-xs animate-in fade-in"
            >
              <div className="font-bold text-slate-800 text-[11px] px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                <span>Formato de la Pregunta</span>
                <span className="text-[10px] font-normal text-slate-400">Elige un tipo</span>
              </div>
              {QUESTION_FORMATS.map(fmt => {
                const isSelected = block.type === fmt.id || (!block.type && fmt.id === 'multiple_choice');
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleSelectType(fmt.id)}
                    className={`flex flex-col text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{fmt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 font-normal">{fmt.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right controls: Points, Figure, Clear ELIMINAR Button, More Options Popover */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Points input */}
        <div className="flex items-center gap-1 bg-indigo-50/90 border border-indigo-200 px-1.5 py-0.5 rounded text-[11px] font-bold text-indigo-950">
          <span>Pts:</span>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={block.points ?? 2}
            onChange={(e) => onUpdateBlock({ points: parseFloat(e.target.value) || 0 })}
            className="w-7 px-0.5 text-center bg-white border border-indigo-200 rounded font-black text-indigo-900"
            title="Puntaje asignado a esta pregunta"
          />
        </div>

        {/* Selector de Ancho: Ajuste paso a paso (de 1 en 1) */}
        <div 
          className="flex items-center bg-white border border-slate-300 rounded overflow-hidden text-[11px] font-bold shadow-2xs"
          title="Ajustar ancho de 1 en 1 (de 3 a 12 columnas)"
        >
          <button
            type="button"
            disabled={(block.width || 6) <= 3}
            onClick={() => onUpdateBlock({ width: Math.max(3, (block.width || 6) - 1) })}
            className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors cursor-pointer border-r border-slate-200"
            title="Reducir 1 columna (-1)"
          >
            -
          </button>
          
          <button
            type="button"
            onClick={() => onUpdateBlock({ width: (block.width || 6) === 12 ? 6 : 12 })}
            className="px-1.5 py-0.5 text-slate-800 hover:text-indigo-600 font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            title="Ancho actual. Clic para alternar rápido entre 6/12 y 12/12"
          >
            {(block.width || 6) === 12 ? '12/12' : `${block.width || 6}/12`}
          </button>

          <button
            type="button"
            disabled={(block.width || 6) >= 12}
            onClick={() => onUpdateBlock({ width: Math.min(12, (block.width || 6) + 1) })}
            className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors cursor-pointer border-l border-slate-200"
            title="Aumentar 1 columna (+1)"
          >
            +
          </button>
        </div>

        {/* Add Figure button if not present */}
        {!block.figure && onOpenDiagramModal && (
          <button
            type="button"
            onClick={() => onOpenDiagramModal(block.id)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50 border border-dashed border-indigo-300 transition-colors cursor-pointer"
            title="Agregar figura o diagrama geométrico"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span className="hidden sm:inline">+ Figura</span>
          </button>
        )}

        {/* BOTÓN ELIMINAR PREGUNTA: Visible, claro y destacado */}
        <button
          type="button"
          onClick={() => onDeleteBlock(block.id)}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded transition-all cursor-pointer shadow-2xs"
          title="Eliminar esta pregunta completa (incluye opción Deshacer)"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Eliminar</span>
        </button>

        {/* Menú Más Opciones (Ancho, Mover, Duplicar, Tema) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMorePopover(!showMorePopover)}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded transition-colors cursor-pointer"
            title="Más opciones (Ancho de columna, Mover, Duplicar, Color)"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMorePopover && (
            <div
              ref={morePopoverRef}
              className="absolute right-0 top-7 bg-white border border-slate-300 rounded-xl shadow-xl p-2 z-50 w-60 flex flex-col gap-2 text-xs animate-in fade-in"
            >
              {/* Ancho de columna */}
              <div>
                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-1 px-1">
                  Ancho de la tarjeta
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { w: 6, label: '1/2 Hoja (2 cols)' },
                    { w: 12, label: 'Ancho total (1 col)' },
                    { w: 5, label: 'Estrecho (5/12)' },
                    { w: 7, label: 'Amplio (7/12)' }
                  ].map(({ w, label }) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        onUpdateBlock({ width: w as BlockWidth });
                        setShowMorePopover(false);
                      }}
                      className={`px-2 py-1 rounded text-left text-[11px] cursor-pointer ${
                        block.width === w
                          ? 'bg-indigo-50 font-bold text-indigo-900 border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posición / Orden */}
              <div className="border-t border-slate-100 pt-1.5">
                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-1 px-1">
                  Posición y Acciones
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      onMoveUp(index);
                      setShowMorePopover(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1 text-slate-700 hover:bg-slate-50 rounded disabled:opacity-40 cursor-pointer text-[11px]"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mover hacia arriba</span>
                  </button>
                  <button
                    type="button"
                    disabled={index === totalBlocks - 1}
                    onClick={() => {
                      onMoveDown(index);
                      setShowMorePopover(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1 text-slate-700 hover:bg-slate-50 rounded disabled:opacity-40 cursor-pointer text-[11px]"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mover hacia abajo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicateBlock(block.id);
                      setShowMorePopover(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1 text-slate-700 hover:bg-slate-50 rounded cursor-pointer text-[11px]"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Duplicar pregunta</span>
                  </button>
                </div>
              </div>

              {/* Color y Tema */}
              <div className="border-t border-slate-100 pt-1.5">
                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-1 px-1">
                  Estilo de Tarjeta
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'standard', label: 'Estándar' },
                    { id: 'accent', label: 'Azul suave' },
                    { id: 'highlight', label: 'Ámbar' },
                    { id: 'minimal', label: 'Minimalista' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        onUpdateBlock({ blockTheme: theme.id as any });
                        setShowMorePopover(false);
                      }}
                      className={`px-2 py-0.5 rounded text-left text-[11px] cursor-pointer ${
                        (block.blockTheme || 'standard') === theme.id
                          ? 'bg-indigo-50 font-bold text-indigo-900 border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
