import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  RectangleHorizontal, 
  RectangleVertical, 
  Columns2, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  Settings, 
  Type, 
  Grid, 
  AlignLeft, 
  Maximize2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Hash,
  Sliders,
  Settings2,
  Move,
  X
} from 'lucide-react';
import { 
  BlockWidth, 
  ChoiceOption, 
  DevelopmentBoxStyle, 
  ExamBlock, 
  FigureData, 
  FigurePosition, 
  QuestionType 
} from '../types';
import { FormattedMathText } from '../utils/mathFormatter';

interface BlockItemProps {
  block: ExamBlock;
  index: number;
  totalBlocks: number;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
  onDeleteBlock: () => void;
  onDuplicateBlock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenFigureModal: () => void;
  viewMode: 'editor' | 'preview_a4' | 'solution_key' | 'student';
  showBorders: boolean;
  baseFontSize: 'sm' | 'md' | 'lg';
  statementJustify?: boolean;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveUp,
  onMoveDown,
  onOpenFigureModal,
  viewMode,
  showBorders,
  baseFontSize,
  statementJustify,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfigPopover, setShowConfigPopover] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isEditor = viewMode === 'editor';
  const isSolutionKey = viewMode === 'solution_key';

  // Keep popover open while clicking inside it, close when clicking outside
  useEffect(() => {
    if (!showConfigPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowConfigPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConfigPopover]);

  // Automatically adjust textarea height to fit multiline content in editor
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(26, textareaRef.current.scrollHeight)}px`;
    }
  }, [block.statement, isEditor]);

  // Exact Grid Span classes based on block width (strictly respects 12-col exam grid in all views)
  const getColSpanClass = (width: BlockWidth) => {
    switch (width) {
      case 12: return 'col-span-12';
      case 8: return 'col-span-8';
      case 6: return 'col-span-6';
      case 4: return 'col-span-4';
      case 3: return 'col-span-3';
      default: return 'col-span-12';
    }
  };

  // Border & background style classes
  const getThemeClasses = () => {
    if (!showBorders) return 'border-transparent bg-transparent';
    switch (block.blockTheme) {
      case 'accent':
        return 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-300';
      case 'dashed':
        return 'border-2 border-dashed border-slate-300 bg-white hover:border-slate-400';
      case 'highlight':
        return 'border-amber-200 bg-amber-50/30 hover:border-amber-300';
      case 'minimal':
        return 'border-b border-slate-200 bg-transparent rounded-none';
      case 'standard':
      default:
        return 'border border-slate-200 bg-white hover:border-slate-300 shadow-2xs';
    }
  };

  // Interactive mouse drag to resize development box height
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = block.developmentConfig?.heightPx || 120;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newH = Math.max(50, Math.min(650, startH + delta));
      onUpdateBlock({
        developmentConfig: {
          style: block.developmentConfig?.style || 'grid',
          heightPx: Math.round(newH),
          promptHint: ''
        }
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Multiple Choice Option Handlers
  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const currentCount = block.options?.length || 0;
    const newLabel = letters[currentCount] || `${currentCount + 1}`;
    const newOptions: ChoiceOption[] = [
      ...(block.options || []),
      { id: `opt-${Date.now()}`, label: newLabel, text: 'Nueva alternativa de respuesta' }
    ];
    onUpdateBlock({ options: newOptions });
  };

  const handleUpdateOption = (optionId: string, updated: Partial<ChoiceOption>) => {
    const newOptions = (block.options || []).map((opt) =>
      opt.id === optionId ? { ...opt, ...updated } : opt
    );
    onUpdateBlock({ options: newOptions });
  };

  const handleDeleteOption = (optionId: string) => {
    const newOptions = (block.options || []).filter((opt) => opt.id !== optionId);
    onUpdateBlock({ options: newOptions });
  };

  const handleSetCorrectOption = (optionId: string) => {
    const newOptions = (block.options || []).map((opt) => ({
      ...opt,
      isCorrect: opt.id === optionId ? !opt.isCorrect : false,
    }));
    onUpdateBlock({ options: newOptions });
  };

  // True / False Handlers
  const handleAddTrueFalse = () => {
    const current = block.trueFalseOptions || [];
    onUpdateBlock({
      trueFalseOptions: [
        ...current,
        { id: `tf-${Date.now()}`, statement: 'Nueva afirmación para clasificar (V / F)', isTrue: true }
      ]
    });
  };

  const handleUpdateTrueFalse = (id: string, statement: string, isTrue: boolean) => {
    const current = (block.trueFalseOptions || []).map((item) =>
      item.id === id ? { ...item, statement, isTrue } : item
    );
    onUpdateBlock({ trueFalseOptions: current });
  };

  const handleDeleteTrueFalse = (id: string) => {
    const current = (block.trueFalseOptions || []).filter((item) => item.id !== id);
    onUpdateBlock({ trueFalseOptions: current });
  };

  // Matching Handlers
  const handleAddMatchingPair = () => {
    const current = block.matchingPairs || [];
    onUpdateBlock({
      matchingPairs: [
        ...current,
        { id: `m-${Date.now()}`, leftText: `Concepto ${current.length + 1}`, rightText: `Definición ${current.length + 1}` }
      ]
    });
  };

  const handleUpdateMatchingPair = (id: string, leftText: string, rightText: string) => {
    const current = (block.matchingPairs || []).map((p) =>
      p.id === id ? { ...p, leftText, rightText } : p
    );
    onUpdateBlock({ matchingPairs: current });
  };

  const handleDeleteMatchingPair = (id: string) => {
    const current = (block.matchingPairs || []).filter((p) => p.id !== id);
    onUpdateBlock({ matchingPairs: current });
  };

  // Render Figure helper
  const renderFigureElement = (isSide?: boolean) => {
    if (!block.figure) return null;

    const currentW = block.figure.widthPercent || 50;

    return (
      <div 
        className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-200/80 my-1 group/fig relative overflow-hidden transition-all w-full max-w-full"
        style={{
          width: isSide 
            ? '100%' 
            : (block.figure.position === 'full' ? '100%' : `${currentW}%`),
          margin: isSide ? '0' : '0 auto'
        }}
      >
        {block.figure.svgData ? (
          <div 
            className="w-full flex items-center justify-center overflow-hidden"
            dangerouslySetInnerHTML={{ __html: block.figure.svgData }}
          />
        ) : block.figure.url ? (
          <img 
            src={block.figure.url} 
            alt={block.figure.caption || ''} 
            className="w-full h-auto object-contain rounded block"
            style={{
              maxHeight: isSide ? '360px' : '480px'
            }}
          />
        ) : null}

        {block.figure.caption && block.figure.caption.trim() ? (
          <div className="text-[11px] font-medium text-slate-500 mt-1 text-center italic w-full">
            {isEditor ? (
              <input
                type="text"
                value={block.figure.caption}
                onChange={(e) => onUpdateBlock({
                  figure: { ...block.figure!, caption: e.target.value }
                })}
                placeholder="Pie de figura..."
                className="text-center w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden"
              />
            ) : (
              block.figure.caption
            )}
          </div>
        ) : isEditor ? (
          <div className="opacity-0 group-hover/fig:opacity-100 transition-opacity mt-1 text-center w-full print:hidden">
            <input
              type="text"
              value={block.figure.caption || ''}
              onChange={(e) => onUpdateBlock({
                figure: { ...block.figure!, caption: e.target.value }
              })}
              placeholder="Añadir pie de figura (opcional)..."
              className="text-center w-full bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-hidden text-[10px] text-slate-400 italic"
            />
          </div>
        ) : null}

        {/* Figure overlay actions in Editor Mode with Quick Resize */}
        {isEditor && (
          <div className="absolute top-1 right-1 opacity-0 group-hover/fig:opacity-100 transition-opacity bg-white/95 backdrop-blur-xs shadow-md border border-slate-200 rounded-lg p-1 flex items-center gap-1 z-10">
            {/* Quick zoom out */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newW = Math.max(20, currentW - 10);
                onUpdateBlock({
                  figure: { ...block.figure!, widthPercent: newW }
                });
              }}
              title="Reducir tamaño (-10%)"
              className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              −
            </button>
            <span className="text-[10px] font-bold text-indigo-900 px-1 font-mono">
              {currentW}%
            </span>
            {/* Quick zoom in */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newW = Math.min(100, currentW + 10);
                onUpdateBlock({
                  figure: { ...block.figure!, widthPercent: newW }
                });
              }}
              title="Agrandar imagen (+10%)"
              className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer"
            >
              +
            </button>
            <div className="w-[1px] h-3 bg-slate-300 mx-0.5"></div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFigureModal();
              }}
              title="Configuración de figura (Galería y Tamaño)"
              className="p-1 hover:bg-indigo-50 text-indigo-700 rounded text-xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateBlock({ figure: undefined });
              }}
              title="Eliminar figura"
              className="p-1 hover:bg-rose-50 text-rose-600 rounded text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`${getColSpanClass(block.width)} rounded-xl p-4 transition-all relative group flex flex-col justify-between ${getThemeClasses()} ${
        block.heightMode === 'tall' ? 'min-h-[320px]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Block Top Header Controls (Hover in Editor) */}
      {isEditor && (
        <div className={`absolute -top-3.5 right-3 ${showConfigPopover ? 'opacity-100 z-30' : 'opacity-0 group-hover:opacity-100 z-20'} transition-opacity bg-slate-900 text-white rounded-lg shadow-md px-2 py-1 flex items-center gap-1.5 text-xs print:hidden`}>
          
          {/* Question Type Selector */}
          <select
            value={block.type}
            onChange={(e) => onUpdateBlock({ type: e.target.value as QuestionType })}
            className="text-[11px] font-semibold bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 focus:outline-hidden focus:border-indigo-400 cursor-pointer"
          >
            <option value="multiple_choice">Opción Múltiple</option>
            <option value="true_false">Verdadero / Falso</option>
            <option value="open_development">Desarrollo / Cálculo</option>
            <option value="matching">Relacionar Columnas</option>
            <option value="reading_passage">Texto de Lectura</option>
          </select>

          <div className="w-[1px] h-3 bg-slate-700"></div>

          {/* Quick Shape Selector */}
          <button
            onClick={() => onUpdateBlock({ width: block.width === 12 ? 6 : block.width === 6 ? 4 : block.width === 4 ? 8 : 12 })}
            title={`Tamaño actual: ${block.width}/12 cols. Haz clic para cambiar.`}
            className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-slate-700 rounded text-[11px] font-bold text-indigo-300 cursor-pointer"
          >
            {block.width === 12 && <RectangleHorizontal className="w-3.5 h-3.5" />}
            {block.width === 6 && <Square className="w-3.5 h-3.5" />}
            {block.width === 4 && <RectangleVertical className="w-3.5 h-3.5" />}
            {block.width === 8 && <Columns2 className="w-3.5 h-3.5" />}
            <span>{block.width}/12</span>
          </button>

          {/* Development Box Settings Button (if type is open_development) */}
          {block.type === 'open_development' && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfigPopover(!showConfigPopover);
                }}
                title="Configurar estilo y alto del recuadro de desarrollo"
                className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-slate-700 rounded text-[11px] font-bold text-amber-300 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Recuadro</span>
              </button>

              {showConfigPopover && (
                <div 
                  ref={popoverRef}
                  className="absolute right-0 sm:right-auto sm:left-0 top-7 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-2xl p-3 w-72 z-50 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Estilo de Recuadro
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfigPopover(false)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <select
                    value={block.developmentConfig?.style || 'grid'}
                    onChange={(e) => onUpdateBlock({
                      developmentConfig: {
                        style: e.target.value as DevelopmentBoxStyle,
                        heightPx: block.developmentConfig?.heightPx || 120,
                        promptHint: block.developmentConfig?.promptHint || 'Espacio de resolución'
                      }
                    })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="grid">Cuadrícula matemática</option>
                    <option value="lines">Líneas de escritura</option>
                    <option value="blank">Recuadro en blanco</option>
                    <option value="dotted">Puntos guía</option>
                  </select>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Altura del espacio:</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {block.developmentConfig?.heightPx || 120}px
                      </span>
                    </div>

                    {/* Quick +/- buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const currentH = block.developmentConfig?.heightPx || 120;
                          onUpdateBlock({
                            developmentConfig: {
                              style: block.developmentConfig?.style || 'grid',
                              heightPx: Math.max(50, currentH - 30),
                              promptHint: ''
                            }
                          });
                        }}
                        className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded border border-slate-300 active:scale-95 cursor-pointer"
                      >
                        − Reducir (-30px)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentH = block.developmentConfig?.heightPx || 120;
                          onUpdateBlock({
                            developmentConfig: {
                              style: block.developmentConfig?.style || 'grid',
                              heightPx: Math.min(600, currentH + 30),
                              promptHint: ''
                            }
                          });
                        }}
                        className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded border border-indigo-700 active:scale-95 cursor-pointer"
                      >
                        + Agrandar (+30px)
                      </button>
                    </div>

                    <input
                      type="range"
                      min="50"
                      max="600"
                      step="10"
                      value={block.developmentConfig?.heightPx || 120}
                      onChange={(e) => onUpdateBlock({
                        developmentConfig: {
                          style: block.developmentConfig?.style || 'grid',
                          heightPx: Number(e.target.value),
                          promptHint: ''
                        }
                      })}
                      className="w-full accent-indigo-600 cursor-pointer mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-[1px] h-3 bg-slate-700"></div>

          {/* Add Figure button */}
          {!block.figure && (
            <button
              onClick={onOpenFigureModal}
              title="Añadir Figura / Gráfico a esta pregunta"
              className="p-1 hover:bg-slate-700 text-amber-300 rounded"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Move Up / Down */}
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            title="Mover arriba"
            className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
            title="Mover abajo"
            className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            onClick={onDuplicateBlock}
            title="Duplicar bloque"
            className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={onDeleteBlock}
            title="Eliminar bloque"
            className="p-1 hover:bg-rose-900 text-rose-300 hover:text-rose-100 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-1.5">
        
        {/* Top Figure (if position is top) */}
        {block.figure && block.figure.position === 'top' && (
          <div className="mb-1">
            {renderFigureElement()}
          </div>
        )}

        {/* Streamlined Question Row: Number + Statement (and side figure) + Points Badge */}
        <div className="flex items-start gap-2">
          
          {/* Question Number Pill */}
          <div className="shrink-0 pt-0.5">
            {isEditor ? (
              <input
                type="text"
                value={block.titleNumber || ''}
                onChange={(e) => onUpdateBlock({ titleNumber: e.target.value })}
                placeholder={`${index + 1}`}
                className="font-extrabold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white w-9 text-center focus:outline-hidden"
                title="Número de ejercicio"
              />
            ) : (
              <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {block.titleNumber || `${index + 1}`}
              </span>
            )}
          </div>

          {/* Statement & Side Figure - Starts immediately beside the exercise number! */}
          <div className="flex-1 min-w-0">
            <div className={`flex ${
              block.figure && block.figure.position === 'left' ? 'flex-row-reverse gap-3 items-start' : 
              block.figure && block.figure.position === 'right' ? 'flex-row gap-3 items-start' : 'flex-col gap-1.5'
            }`}>
              
              {/* Statement text */}
              <div className="flex-1 min-w-0">
                {isEditor ? (
                  <>
                    <textarea
                      ref={textareaRef}
                      value={block.statement}
                      onChange={(e) => {
                        onUpdateBlock({ statement: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.max(26, e.target.scrollHeight)}px`;
                      }}
                      onFocus={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.max(26, e.target.scrollHeight)}px`;
                      }}
                      placeholder="Escribe el enunciado aquí... (usa **palabra** para negritas)"
                      rows={1}
                      className={`w-full text-xs sm:text-sm text-slate-900 p-0.5 bg-transparent rounded border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-slate-50/40 focus:outline-hidden transition-all resize-none overflow-hidden font-normal leading-relaxed print:hidden ${
                        statementJustify ? 'text-justify' : 'text-left'
                      }`}
                      style={{ minHeight: '26px' }}
                    />
                    {/* Multiline clean statement specifically for Print / PDF Export */}
                    <FormattedMathText
                      text={block.statement}
                      className={`hidden print:block text-xs sm:text-sm text-slate-900 leading-relaxed font-normal ${
                        statementJustify ? 'text-justify' : 'text-left'
                      }`}
                    />
                  </>
                ) : (
                  <div 
                    className={`text-xs sm:text-sm text-slate-900 leading-relaxed ${
                      block.type === 'reading_passage' ? 'p-2 bg-amber-50/40 rounded-lg border-l-4 border-amber-500 italic' : ''
                    } ${statementJustify ? 'text-justify' : 'text-left'}`}
                  >
                    {block.type === 'reading_passage' && (
                      <span className="inline-block mr-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded not-italic">
                        Lectura
                      </span>
                    )}
                    <FormattedMathText text={block.statement} />
                  </div>
                )}
              </div>

              {/* Side Figure (Left or Right) */}
              {block.figure && (block.figure.position === 'left' || block.figure.position === 'right') && (
                <div 
                  className="shrink-0 flex items-center justify-center transition-all print:shrink-0"
                  style={{
                    width: `${Math.min(75, Math.max(20, block.figure.widthPercent || 45))}%`,
                    maxWidth: `${Math.min(75, Math.max(20, block.figure.widthPercent || 45))}%`
                  }}
                >
                  {renderFigureElement(true)}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Figure (if position is bottom or full) */}
        {block.figure && (block.figure.position === 'bottom' || block.figure.position === 'full') && (
          <div className="mt-1 flex justify-center w-full">
            {renderFigureElement(false)}
          </div>
        )}

        {/* Dynamic Answer Format Layouts */}
        
        {/* 1. Multiple Choice Options */}
        {block.type === 'multiple_choice' && (
          <div className="mt-1 space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(block.options || []).map((opt) => (
                <div 
                  key={opt.id}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs transition-colors ${
                    isSolutionKey && opt.isCorrect
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                      : 'bg-slate-50/50 border-slate-200 text-slate-800'
                  }`}
                >
                  {/* Option Label / Radio Button */}
                  <button
                    onClick={() => isEditor && handleSetCorrectOption(opt.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                      opt.isCorrect && (isSolutionKey || isEditor)
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'border border-slate-300 bg-white text-slate-700 hover:border-indigo-500'
                    }`}
                    title={isEditor ? 'Haz clic para marcar como respuesta correcta (clave docente)' : ''}
                  >
                    {opt.label}
                  </button>

                  {/* Option text */}
                  {isEditor ? (
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleUpdateOption(opt.id, { text: e.target.value })}
                      placeholder="Texto de la alternativa... (ej: 3 1/2)"
                      className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5"
                    />
                  ) : (
                    <div className="flex-1">
                      <FormattedMathText text={opt.text} />
                    </div>
                  )}

                  {/* Delete option in editor */}
                  {isEditor && (block.options?.length || 0) > 2 && (
                    <button
                      onClick={() => handleDeleteOption(opt.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option button */}
            {isEditor && (
              <button
                onClick={handleAddOption}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir alternativa</span>
              </button>
            )}
          </div>
        )}

        {/* 2. True / False Proportions */}
        {block.type === 'true_false' && (
          <div className="mt-1 space-y-2">
            {(block.trueFalseOptions || []).map((tf) => (
              <div 
                key={tf.id}
                className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
              >
                {isEditor ? (
                  <input
                    type="text"
                    value={tf.statement}
                    onChange={(e) => handleUpdateTrueFalse(tf.id, e.target.value, tf.isTrue)}
                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden"
                  />
                ) : (
                  <span className="flex-1">{tf.statement}</span>
                )}

                {/* ( V ) ( F ) Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => isEditor && handleUpdateTrueFalse(tf.id, tf.statement, true)}
                    className={`w-7 h-6 rounded flex items-center justify-center font-bold text-xs border ${
                      (isSolutionKey || isEditor) && tf.isTrue
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    V
                  </button>
                  <button
                    onClick={() => isEditor && handleUpdateTrueFalse(tf.id, tf.statement, false)}
                    className={`w-7 h-6 rounded flex items-center justify-center font-bold text-xs border ${
                      (isSolutionKey || isEditor) && !tf.isTrue
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    F
                  </button>

                  {isEditor && (
                    <button
                      onClick={() => handleDeleteTrueFalse(tf.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isEditor && (
              <button
                onClick={handleAddTrueFalse}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir proposición V/F</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Open Development / Grid lines Box */}
        {block.type === 'open_development' && (
          <div className="mt-1 flex flex-col">
            {/* Visual Development Area */}
            <div 
              className={`w-full rounded-lg border border-slate-300 relative overflow-hidden bg-white ${
                block.developmentConfig?.style === 'grid' 
                  ? 'bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:16px_16px]'
                  : block.developmentConfig?.style === 'lines'
                  ? 'bg-[linear-gradient(transparent_23px,#e2e8f0_24px)] bg-[size:100%_24px]'
                  : block.developmentConfig?.style === 'dotted'
                  ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:12px_12px]'
                  : ''
              }`}
              style={{ height: `${block.developmentConfig?.heightPx || 120}px` }}
            />

            {/* Direct Editor Controls to easily increase/decrease height & change style */}
            {isEditor && (
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs print:hidden select-none">
                {/* Background style */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-600">Estilo:</span>
                  <select
                    value={block.developmentConfig?.style || 'grid'}
                    onChange={(e) => onUpdateBlock({
                      developmentConfig: {
                        style: e.target.value as DevelopmentBoxStyle,
                        heightPx: block.developmentConfig?.heightPx || 120,
                        promptHint: ''
                      }
                    })}
                    className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
                  >
                    <option value="grid">Cuadrícula matemática</option>
                    <option value="lines">Líneas de cuaderno</option>
                    <option value="blank">En blanco (liso)</option>
                    <option value="dotted">Puntos guía</option>
                  </select>
                </div>

                {/* Direct Height adjustment controls: minus, plus, slider */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-600">Alto:</span>
                  
                  {/* Reduce height */}
                  <button
                    type="button"
                    onClick={() => {
                      const currentH = block.developmentConfig?.heightPx || 120;
                      onUpdateBlock({
                        developmentConfig: {
                          style: block.developmentConfig?.style || 'grid',
                          heightPx: Math.max(50, currentH - 30),
                          promptHint: ''
                        }
                      });
                    }}
                    title="Reducir altura (-30px)"
                    className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-800 font-bold text-xs shadow-2xs active:scale-95 cursor-pointer"
                  >
                    −
                  </button>

                  {/* Height display */}
                  <span className="font-bold text-[11px] text-indigo-900 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded min-w-[48px] text-center font-mono">
                    {block.developmentConfig?.heightPx || 120}px
                  </span>

                  {/* Enlarge height */}
                  <button
                    type="button"
                    onClick={() => {
                      const currentH = block.developmentConfig?.heightPx || 120;
                      onUpdateBlock({
                        developmentConfig: {
                          style: block.developmentConfig?.style || 'grid',
                          heightPx: Math.min(600, currentH + 30),
                          promptHint: ''
                        }
                      });
                    }}
                    title="Agrandar altura (+30px)"
                    className="w-6 h-6 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white rounded font-bold text-xs shadow-2xs active:scale-95 cursor-pointer"
                  >
                    +
                  </button>

                  {/* Height Slider */}
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="10"
                    value={block.developmentConfig?.heightPx || 120}
                    onChange={(e) => onUpdateBlock({
                      developmentConfig: {
                        style: block.developmentConfig?.style || 'grid',
                        heightPx: Number(e.target.value),
                        promptHint: ''
                      }
                    })}
                    className="w-24 accent-indigo-600 cursor-pointer"
                    title="Deslizar para cambiar el alto del recuadro"
                  />
                </div>

                {/* Drag Handle Button */}
                <div 
                  onMouseDown={handleResizeMouseDown}
                  title="Haz clic y arrastra verticalmente para cambiar la altura libremente"
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-indigo-700 cursor-ns-resize px-2 py-0.5 bg-white border border-slate-200 rounded hover:border-indigo-300 transition-colors shadow-2xs"
                >
                  <Move className="w-3 h-3 text-indigo-500" />
                  <span>↕ Arrastrar para agrandar</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Matching Columns */}
        {block.type === 'matching' && (
          <div className="mt-1 space-y-2">
            {(block.matchingPairs || []).map((pair, pIdx) => (
              <div key={pair.id} className="grid grid-cols-2 gap-3 items-center text-xs">
                {/* Left item */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-500 w-4">{pIdx + 1}.</span>
                  {isEditor ? (
                    <input
                      type="text"
                      value={pair.leftText}
                      onChange={(e) => handleUpdateMatchingPair(pair.id, e.target.value, pair.rightText)}
                      className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-hidden"
                    />
                  ) : (
                    <span>{pair.leftText}</span>
                  )}
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 shrink-0 ml-auto"></div>
                </div>

                {/* Right item */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 shrink-0"></div>
                  {isEditor ? (
                    <input
                      type="text"
                      value={pair.rightText}
                      onChange={(e) => handleUpdateMatchingPair(pair.id, pair.leftText, e.target.value)}
                      className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-hidden"
                    />
                  ) : (
                    <span>{pair.rightText}</span>
                  )}

                  {isEditor && (
                    <button
                      onClick={() => handleDeleteMatchingPair(pair.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isEditor && (
              <button
                onClick={handleAddMatchingPair}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir fila de emparejamiento</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
