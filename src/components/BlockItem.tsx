import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit3, 
  MoveHorizontal 
} from 'lucide-react';
import { 
  BlockWidth, 
  ExamBlock 
} from '../types';
import { FormattedMathText, hasMathContent } from '../utils/mathFormatter';
import { sanitizeTextLength } from '../utils/securitySanitizer';
import { BlockHeader } from './question-blocks/BlockHeader';
import { BlockFigure } from './question-blocks/BlockFigure';
import { MultipleChoiceOptions } from './question-blocks/answer-types/MultipleChoiceOptions';
import { TrueFalseOptions } from './question-blocks/answer-types/TrueFalseOptions';
import { OpenDevelopmentBox } from './question-blocks/answer-types/OpenDevelopmentBox';
import { MatchingPairs } from './question-blocks/answer-types/MatchingPairs';

interface BlockItemProps {
  block: ExamBlock;
  index: number;
  totalBlocks: number;
  rightNeighbor?: {
    id: string;
    titleNumber?: string;
    width: number;
  };
  onResizeWidthPair?: (leftBlockId: string, rightBlockId: string, newLeftWidth: number, newRightWidth: number) => void;
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
  lineSpacing?: 'compact' | 'normal' | 'relaxed';
  isMasonryColumn?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  isDuplicateNumber?: boolean;
  showPoints?: boolean;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  rightNeighbor,
  onResizeWidthPair,
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
  lineSpacing,
  isSelected = false,
  onSelect,
  isDuplicateNumber = false,
  showPoints = true,
}) => {
  const [isStatementFocused, setIsStatementFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleHeightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingHeight(true);
    startYRef.current = e.clientY;
    const currentRenderedHeight = cardRef.current?.getBoundingClientRect().height || block.customMinHeight || 130;
    startHeightRef.current = currentRenderedHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startYRef.current;
      const targetHeight = startHeightRef.current + delta;

      const isClosedQuestion = block.type === 'multiple_choice' || block.type === 'true_false' || block.type === 'matching';
      const maxAllowed = isClosedQuestion 
        ? Math.min(270, Math.max(230, startHeightRef.current + 80))
        : 450;
      const minThreshold = 95;

      if (targetHeight < minThreshold) {
        onUpdateBlock({ customMinHeight: undefined });
      } else {
        const clamped = Math.max(minThreshold, Math.min(maxAllowed, Math.round(targetHeight)));
        onUpdateBlock({ customMinHeight: clamped });
      }
    };

    const handleMouseUp = () => {
      setIsResizingHeight(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const isEditor = viewMode === 'editor';
  const isSolutionKey = viewMode === 'solution_key';
  const maxStatementChars = block.type === 'reading_passage' ? 2000 : 400;

  const getStatementSizeClass = () => {
    switch (baseFontSize) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getOptionSizeClass = () => {
    switch (baseFontSize) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-sm';
      default: return 'text-xs';
    }
  };

  const getLineSpacingClass = () => {
    switch (lineSpacing) {
      case 'compact': return 'leading-tight';
      case 'relaxed': return 'leading-relaxed';
      default: return 'leading-normal';
    }
  };

  const getBlockThemeClasses = () => {
    switch (block.blockTheme) {
      case 'accent':
        return 'bg-sky-50/70 border-sky-300';
      case 'highlight':
        return 'bg-amber-50/70 border-amber-300';
      case 'minimal':
        return 'bg-transparent border-slate-200 border-x-0 border-t-0 rounded-none shadow-none';
      case 'dashed':
        return 'bg-slate-50/40 border-dashed border-slate-300';
      case 'standard':
      default:
        return 'bg-white border-slate-200';
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => {
        if (isEditor && onSelect) {
          onSelect();
        }
      }}
      style={block.customMinHeight ? { minHeight: `${block.customMinHeight}px` } : undefined}
      className={`exam-block-item relative group rounded-xl p-3 sm:p-4 flex flex-col transition-all ${
        showBorders ? 'border' : 'border border-transparent'
      } ${getBlockThemeClasses()} ${
        isEditor 
          ? isSelected
            ? 'ring-2 ring-indigo-400 border-indigo-400 shadow-md'
            : 'hover:border-indigo-300 hover:shadow-2xs cursor-pointer'
          : ''
      }`}
    >
      {/* Floating Header Toolbar: Only visible when clicked / active in editor */}
      {isEditor && isSelected && (
        <div 
          className="absolute -top-11 left-0 right-0 z-30 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <BlockHeader
            block={block}
            index={index}
            totalBlocks={totalBlocks}
            isEditor={isEditor}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onDuplicateBlock={onDuplicateBlock}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onOpenDiagramModal={onOpenFigureModal}
            isDuplicateNumber={isDuplicateNumber}
            showPoints={showPoints}
          />
        </div>
      )}

      {/* Top Figure if position is 'top' */}
      {block.figure && block.figure.position === 'top' && (
        <BlockFigure
          block={block}
          isEditor={isEditor}
          isSide={false}
          onUpdateBlock={onUpdateBlock}
          onOpenDiagramModal={onOpenFigureModal}
        />
      )}

      {/* Main Content Area (Statement + Side Figure) */}
      <div className="flex gap-3 items-start">
        {/* Left Figure if position is 'left' */}
        {block.figure && block.figure.position === 'left' && (
          <div 
            className="shrink-0"
            style={{ width: `${block.figure.widthPercent || 45}%` }}
          >
            <BlockFigure
              block={block}
              isEditor={isEditor}
              isSide={true}
              onUpdateBlock={onUpdateBlock}
              onOpenDiagramModal={onOpenFigureModal}
            />
          </div>
        )}

        {/* Statement area */}
        <div className="exam-statement-area flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {/* Question titleNumber badge */}
            {block.titleNumber && (
              <span 
                className={`font-extrabold text-sm select-none shrink-0 pt-0.5 ${
                  isDuplicateNumber && isEditor ? 'text-amber-700' : 'text-slate-800'
                }`}
                title={isDuplicateNumber && isEditor ? `Aviso: El número "${block.titleNumber}" está repetido en otra pregunta.` : undefined}
              >
                {block.titleNumber}.
              </span>
            )}

            <div className="flex-1 min-w-0">
              {isEditor ? (
                <>
                  <div className="print:hidden">
                    {!isStatementFocused ? (
                      <div
                        onClick={() => {
                          setIsStatementFocused(true);
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                              const len = textareaRef.current.value.length;
                              textareaRef.current.setSelectionRange(len, len);
                            }
                          }, 30);
                        }}
                        className={`w-full cursor-text rounded p-0.5 border border-transparent hover:border-slate-300 transition-all ${getStatementSizeClass()} ${getLineSpacingClass()} text-slate-900 text-justify break-words`}
                      >
                        {block.statement && block.statement.trim() ? (
                          <>
                            <FormattedMathText text={block.statement} />
                            {showPoints && (block.points ?? 0) > 0 && block.type !== 'reading_passage' && (
                              <span className="font-bold text-indigo-700/85 text-xs ml-1 select-none whitespace-nowrap">
                                ({block.points} {block.points === 1 ? 'pt' : 'pts'})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-amber-700/70 italic select-none">
                            {block.type === 'reading_passage'
                              ? 'Escribe aquí el texto de lectura...'
                              : 'Escribe aquí la pregunta...'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={block.statement}
                          maxLength={maxStatementChars}
                          onChange={(e) => {
                            const validated = sanitizeTextLength(e.target.value, maxStatementChars, 25);
                            onUpdateBlock({ statement: validated });
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.max(26, e.target.scrollHeight)}px`;
                          }}
                          onFocus={(e) => {
                            setIsStatementFocused(true);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.max(26, e.target.scrollHeight)}px`;
                          }}
                          onBlur={() => {
                            setTimeout(() => setIsStatementFocused(false), 150);
                          }}
                          placeholder={
                            block.type === 'reading_passage'
                              ? 'Escribe aquí el texto de lectura...'
                              : 'Escribe aquí la pregunta...'
                          }
                          rows={1}
                          className={`w-full ${getStatementSizeClass()} ${getLineSpacingClass()} text-slate-900 p-0.5 bg-transparent rounded border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-slate-50/40 focus:outline-hidden transition-all resize-none overflow-hidden font-normal text-justify break-words ${
                            !block.statement || !block.statement.trim() ? 'placeholder:text-amber-700/60' : 'placeholder:text-slate-400'
                          }`}
                          style={{ minHeight: '26px' }}
                          autoFocus={isStatementFocused}
                          title={`Límite: máx. ${maxStatementChars} caracteres (palabras de máx. 25 letras)`}
                        />

                        {/* Character count warning when reaching 85% of limit */}
                        {isStatementFocused && block.statement.length >= maxStatementChars * 0.85 && (
                          <div className="absolute right-1 bottom-1 text-[10px] text-amber-800 font-bold bg-amber-50/90 border border-amber-300 px-1.5 py-0.2 rounded select-none pointer-events-none shadow-2xs">
                            {block.statement.length}/{maxStatementChars}
                          </div>
                        )}

                        {/* Live Math Preview while typing */}
                        {hasMathContent(block.statement) && (
                          <div className="mt-1 px-2.5 py-1.5 bg-indigo-50/90 border border-indigo-200/90 rounded-lg text-xs flex items-center justify-between gap-2 shadow-2xs animate-in fade-in duration-150">
                            <div className="flex items-center gap-1.5 min-w-0 text-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded shrink-0">
                                Vista matemática:
                              </span>
                              <div className="truncate text-slate-900 font-semibold">
                                <FormattedMathText text={block.statement} />
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold shrink-0">
                              ✓ Formato activo
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={`hidden print:block ${getStatementSizeClass()} ${getLineSpacingClass()} text-slate-900 font-normal text-justify break-words`}>
                    <FormattedMathText text={block.statement} />
                    {showPoints && (block.points ?? 0) > 0 && block.type !== 'reading_passage' && (
                      <span className="font-bold text-black text-xs ml-1 whitespace-nowrap">
                        ({block.points} {block.points === 1 ? 'pt' : 'pts'})
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div 
                  className={`${getStatementSizeClass()} ${getLineSpacingClass()} text-slate-900 ${
                    block.type === 'reading_passage' ? 'p-2 bg-amber-50/40 rounded-lg border-l-4 border-amber-500 italic' : ''
                  } text-justify break-words`}
                >
                  {block.type === 'reading_passage' && (
                    <span className="inline-block mr-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded not-italic">
                      Lectura
                    </span>
                  )}
                  <FormattedMathText text={block.statement} />
                  {showPoints && (block.points ?? 0) > 0 && block.type !== 'reading_passage' && (
                    <span className="font-bold text-slate-800 print:text-black text-xs ml-1 whitespace-nowrap">
                      ({block.points} {block.points === 1 ? 'pt' : 'pts'})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Figure if position is 'right' */}
        {block.figure && block.figure.position === 'right' && (
          <div 
            className="shrink-0"
            style={{ width: `${block.figure.widthPercent || 45}%` }}
          >
            <BlockFigure
              block={block}
              isEditor={isEditor}
              isSide={true}
              onUpdateBlock={onUpdateBlock}
              onOpenDiagramModal={onOpenFigureModal}
            />
          </div>
        )}
      </div>

      {/* Bottom Figure if position is 'bottom' */}
      {block.figure && block.figure.position === 'bottom' && (
        <BlockFigure
          block={block}
          isEditor={isEditor}
          isSide={false}
          onUpdateBlock={onUpdateBlock}
          onOpenDiagramModal={onOpenFigureModal}
        />
      )}

      {/* Full-width Figure if position is 'full' */}
      {block.figure && block.figure.position === 'full' && (
        <BlockFigure
          block={block}
          isEditor={isEditor}
          isSide={false}
          onUpdateBlock={onUpdateBlock}
          onOpenDiagramModal={onOpenFigureModal}
        />
      )}

      {/* Dynamic Answer Format Layouts */}
      <div className="exam-answers-area mt-2.5">
        {block.type === 'multiple_choice' && (
          <MultipleChoiceOptions
            block={block}
            isEditor={isEditor}
            isSolutionKey={isSolutionKey}
            onUpdateBlock={onUpdateBlock}
            getOptionSizeClass={getOptionSizeClass}
          />
        )}

        {block.type === 'true_false' && (
          <TrueFalseOptions
            block={block}
            isEditor={isEditor}
            isSolutionKey={isSolutionKey}
            onUpdateBlock={onUpdateBlock}
          />
        )}

        {block.type === 'open_development' && (
          <OpenDevelopmentBox
            block={block}
            isEditor={isEditor}
            onUpdateBlock={onUpdateBlock}
          />
        )}

        {block.type === 'matching' && (
          <MatchingPairs
            block={block}
            isEditor={isEditor}
            isSolutionKey={isSolutionKey}
            onUpdateBlock={onUpdateBlock}
          />
        )}
      </div>

      {/* Tirador inferior para ajustar altura con el ratón (Opción 1: proporcional con límite) */}
      {isEditor && isSelected && block.type !== 'open_development' && (
        <div
          onMouseDown={handleHeightMouseDown}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onUpdateBlock({ customMinHeight: undefined });
          }}
          className={`absolute -bottom-2 inset-x-0 h-4 flex items-center justify-center cursor-row-resize z-20 print:hidden select-none group/resize-h ${
            isResizingHeight ? 'cursor-row-resize' : ''
          }`}
          title="Arrastra hacia abajo para ajustar la altura de este enunciado (con límite máximo controlado). Doble clic para volver al tamaño automático."
        >
          <div className={`w-14 h-1.5 rounded-full transition-all flex items-center justify-center shadow-2xs ${
            isResizingHeight 
              ? 'bg-indigo-600 w-20 ring-2 ring-indigo-300' 
              : 'bg-slate-300 group-hover/resize-h:bg-indigo-500 group-hover/resize-h:w-18'
          }`}>
            <div className="w-2.5 h-0.5 bg-white/70 rounded-full" />
          </div>
        </div>
      )}

      {/* Tirador para ensanchar o reducir con el ratón (de 1 en 1) */}
      {isEditor && (
        <div 
          className="absolute -right-2.5 top-4 bottom-4 w-5 cursor-ew-resize flex items-center justify-center group/resize z-20 print:hidden select-none"
          title={`Ancho actual: ${block.width || 6}/12 columnas. Arrastra con el ratón a la derecha o izquierda para ensanchar o reducir de 1 en 1.`}
          onClick={(e) => {
            e.stopPropagation();
            if (rightNeighbor && onResizeWidthPair) {
              const currentLeft = block.width || 6;
              const nextLeft: BlockWidth = currentLeft >= 8 ? 4 : (currentLeft + 1);
              const nextRight: BlockWidth = 12 - nextLeft;
              onResizeWidthPair(block.id, rightNeighbor.id, nextLeft, nextRight);
            } else {
              const currentW = block.width || 6;
              const nextW = currentW >= 12 ? 4 : (currentW + 1);
              onUpdateBlock({ width: nextW });
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startWidth = block.width || 6;

            const onMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              // Cada ~40px de movimiento con el ratón suma o resta 1 columna exacta
              const colsDelta = Math.round(deltaX / 40);

              if (rightNeighbor && onResizeWidthPair) {
                const targetLeft = Math.max(4, Math.min(8, startWidth + colsDelta));
                const targetRight = 12 - targetLeft;
                onResizeWidthPair(block.id, rightNeighbor.id, targetLeft, targetRight);
              } else {
                const targetWidth = Math.max(4, Math.min(12, startWidth + colsDelta));
                onUpdateBlock({ width: targetWidth });
              }
            };

            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        >
          <div className="w-1.5 h-12 bg-slate-300 group-hover/resize:bg-indigo-600 rounded-full transition-all shadow-xs" />
        </div>
      )}
    </div>
  );
};
