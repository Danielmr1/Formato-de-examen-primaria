import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  Columns2, 
  RectangleHorizontal, 
  RectangleVertical, 
  Image as ImageIcon,
  Plus,
  FileText,
  Grid,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { BlockWidth, ExamBlock, ExamDocument, QuestionType } from '../../types';
import { HeaderEditor } from '../HeaderEditor';
import { BlockItem } from '../BlockItem';
import { buildMasonrySegments } from '../../utils/masonryLayout';

interface ExamSheetProps {
  exam: ExamDocument;
  activeView: 'editor' | 'preview_a4' | 'student' | 'solution_key';
  totalPoints: number;
  onUpdateHeader: (updated: Partial<ExamDocument['header']>) => void;
  onUpdateBlock: (blockId: string, updated: Partial<ExamBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onResizeWidthPair: (leftBlockId: string, rightBlockId: string, newLeftWidth: number, newRightWidth: number) => void;
  onOpenFigureModalForBlock: (blockId: string) => void;
  onAddBlock: (width?: BlockWidth, type?: QuestionType, withFigure?: boolean) => void;
  onUpdateSettings?: (settings: Partial<ExamDocument['settings']>) => void;
  onPagesCalculated?: (pages: number) => void;
}

export const ExamSheet: React.FC<ExamSheetProps> = ({
  exam,
  activeView,
  totalPoints,
  onUpdateHeader,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveUp,
  onMoveDown,
  onResizeWidthPair,
  onOpenFigureModalForBlock,
  onAddBlock,
  onUpdateSettings,
  onPagesCalculated
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Detección de números de pregunta duplicados
  const duplicateNumbersSet = useMemo(() => {
    const counts = new Map<string, number>();
    exam.blocks.forEach(b => {
      const num = b.titleNumber?.trim();
      if (num) {
        counts.set(num, (counts.get(num) || 0) + 1);
      }
    });
    const dupes = new Set<string>();
    counts.forEach((count, num) => {
      if (count > 1) dupes.add(num);
    });
    return dupes;
  }, [exam.blocks]);

  // Helper para asignar columnas de ancho en CSS grid de 12
  const getColSpanClassSafe = (cols: number) => {
    switch (cols) {
      case 1: return 'sm:col-span-1';
      case 2: return 'sm:col-span-2';
      case 3: return 'sm:col-span-3';
      case 4: return 'sm:col-span-4';
      case 5: return 'sm:col-span-5';
      case 6: return 'sm:col-span-6';
      case 7: return 'sm:col-span-7';
      case 8: return 'sm:col-span-8';
      case 9: return 'sm:col-span-9';
      case 10: return 'sm:col-span-10';
      case 11: return 'sm:col-span-11';
      case 12: return 'sm:col-span-12';
      default: return 'sm:col-span-6';
    }
  };

  // Medir la altura física real de las preguntas y encabezado (sin la altura forzada de la hoja)
  useEffect(() => {
    if (!contentRef.current) return;
    
    const updateHeight = () => {
      if (contentRef.current) {
        const h = contentRef.current.getBoundingClientRect().height;
        if (h > 0) setContentHeight(h);
      }
    };

    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);
    const timeoutId = setTimeout(updateHeight, 150);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setContentHeight(entry.contentRect.height);
        }
      }
    });

    observer.observe(contentRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [exam.blocks, exam.header, exam.settings, activeView]);

  const isA5 = exam.settings.paperSize === 'a5_2in1' || exam.settings.paperSize === 'a5_single';
  const is2in1 = exam.settings.paperSize === 'a5_2in1';

  // Guardrail 2: Detección inteligente de páginas y prevención de hojas fantasma
  const targetPageHeightPx = isA5 ? 720 : 1050;
  const estimatedPages = Math.max(1, Math.ceil(contentHeight / targetPageHeightPx));
  const remainderPx = contentHeight % targetPageHeightPx;
  // Solo hay riesgo de desborde si el contenido supera 1 página completa Y el sobrante es pequeño (< 140px)
  const isGhostPageRisk = contentHeight > targetPageHeightPx && remainderPx > 0 && remainderPx < 140;

  useEffect(() => {
    if (onPagesCalculated) {
      onPagesCalculated(estimatedPages);
    }
  }, [estimatedPages, onPagesCalculated]);

  const isPreviewMode = activeView === 'preview_a4' || activeView === 'solution_key';

  const getSheetClasses = () => {
    if (activeView === 'editor') {
      if (isA5) {
        return 'w-full max-w-[620px] shadow-xl rounded-xl border border-slate-300/80 p-3.5 sm:p-5';
      }
      return 'w-full max-w-4xl shadow-xl rounded-xl border border-slate-300/80 p-3.5 sm:p-5 md:p-6';
    }
    // isPreviewMode
    if (is2in1) {
      return 'w-full max-w-[1120px] min-h-[760px] shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-slate-300/90 rounded-none sm:rounded-xs p-4 sm:p-6 my-3';
    }
    if (exam.settings.paperSize === 'a5_single') {
      return 'w-full max-w-[560px] min-h-[780px] shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-slate-300/90 rounded-none sm:rounded-xs p-4 sm:p-6 my-3';
    }
    return 'w-full max-w-[794px] min-h-[1123px] shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-slate-300/90 rounded-none sm:rounded-xs p-5 sm:p-7 md:p-8 my-3';
  };

  interface RenderBodyProps {
    isPrintOnly?: boolean;
    isDuplicateCopy?: boolean;
    forceCleanView?: boolean;
  }

  const renderExamBody = ({
    isPrintOnly = false,
    isDuplicateCopy = false,
    forceCleanView = false,
  }: RenderBodyProps = {}) => {
    const isCleanMode = forceCleanView || isPrintOnly || isPreviewMode || isDuplicateCopy;
    const isInteractive = !isCleanMode && activeView === 'editor';
    const effectiveViewMode = activeView === 'solution_key' 
      ? 'solution_key' 
      : (isInteractive ? 'editor' : 'preview_a4');

    return (
      <div 
        ref={!isDuplicateCopy && !isPrintOnly ? contentRef : undefined} 
        className="w-full flex flex-col bg-white"
        onClick={(e) => {
          if (isInteractive && e.target === e.currentTarget) {
            setSelectedBlockId(null);
          }
        }}
      >
        {/* Institutional Header */}
        <HeaderEditor
          header={exam.header}
          onUpdateHeader={isInteractive ? onUpdateHeader : () => {}}
          isPrintMode={isCleanMode}
          totalScore={totalPoints}
          isA5={isA5}
        />

        {/* Dynamic Tetris / Masonry Bento Grid of Question Blocks */}
        <div className={`flex flex-col gap-3.5 sm:gap-4.5 ${isInteractive ? 'pt-4' : ''}`}>
          {buildMasonrySegments(exam.blocks).map((segment, segIdx) => {
            if (segment.type === 'full' && segment.fullBlock) {
              const { block, index: idx } = segment.fullBlock;
              return (
                <div key={`${block.id}-${isDuplicateCopy ? 'dup' : 'orig'}-${isPrintOnly ? 'print' : 'screen'}`} className="w-full exam-layout-segment">
                  <BlockItem
                    block={block}
                    index={idx}
                    totalBlocks={exam.blocks.length}
                    rightNeighbor={undefined}
                    onResizeWidthPair={onResizeWidthPair}
                    onUpdateBlock={isInteractive ? (updated) => onUpdateBlock(block.id, updated) : () => {}}
                    onDeleteBlock={isInteractive ? () => onDeleteBlock(block.id) : () => {}}
                    onDuplicateBlock={isInteractive ? () => onDuplicateBlock(block.id) : () => {}}
                    onMoveUp={isInteractive ? () => onMoveUp(idx) : () => {}}
                    onMoveDown={isInteractive ? () => onMoveDown(idx) : () => {}}
                    onOpenFigureModal={isInteractive ? () => onOpenFigureModalForBlock(block.id) : () => {}}
                    viewMode={effectiveViewMode}
                    showBorders={exam.settings.showBorders}
                    baseFontSize={exam.settings.baseFontSize}
                    statementJustify={exam.settings.statementJustify}
                    lineSpacing={exam.settings.lineSpacing}
                    isMasonryColumn={true}
                    isSelected={isInteractive && selectedBlockId === block.id}
                    onSelect={isInteractive ? () => setSelectedBlockId(block.id) : undefined}
                    isDuplicateNumber={duplicateNumbersSet.has(block.titleNumber?.trim() || '')}
                    showPoints={exam.settings.showPointsInPrint !== false}
                  />
                </div>
              );
            }

            if (segment.type === 'split') {
              const leftCols = segment.leftWidthCols || 6;
              const rightCols = 12 - leftCols;
              const firstRight = segment.rightColumn?.[0];

              return (
                <div key={`split-${segIdx}-${isDuplicateCopy ? 'dup' : 'orig'}-${isPrintOnly ? 'print' : 'screen'}`} className="grid grid-cols-12 gap-3.5 sm:gap-4.5 items-start exam-layout-segment">
                  {/* Left Column */}
                  <div className={`col-span-12 ${getColSpanClassSafe(leftCols)} flex flex-col gap-3.5 sm:gap-4.5`}>
                    {segment.leftColumn?.map(({ block, index: idx }, leftIdx) => {
                      const pairedRight = segment.rightColumn?.[leftIdx] || firstRight;
                      const blockSynced = { ...block, width: leftCols };
                      return (
                        <BlockItem
                          key={`${block.id}-${isDuplicateCopy ? 'dup' : 'orig'}-${isPrintOnly ? 'print' : 'screen'}`}
                          block={blockSynced}
                          index={idx}
                          totalBlocks={exam.blocks.length}
                          rightNeighbor={
                            pairedRight ? {
                              id: pairedRight.block.id,
                              titleNumber: pairedRight.block.titleNumber,
                              width: rightCols
                            } : undefined
                          }
                          onResizeWidthPair={onResizeWidthPair}
                          onUpdateBlock={isInteractive ? (updated) => onUpdateBlock(block.id, updated) : () => {}}
                          onDeleteBlock={isInteractive ? () => onDeleteBlock(block.id) : () => {}}
                          onDuplicateBlock={isInteractive ? () => onDuplicateBlock(block.id) : () => {}}
                          onMoveUp={isInteractive ? () => onMoveUp(idx) : () => {}}
                          onMoveDown={isInteractive ? () => onMoveDown(idx) : () => {}}
                          onOpenFigureModal={isInteractive ? () => onOpenFigureModalForBlock(block.id) : () => {}}
                          viewMode={effectiveViewMode}
                          showBorders={exam.settings.showBorders}
                          baseFontSize={exam.settings.baseFontSize}
                          statementJustify={exam.settings.statementJustify}
                          lineSpacing={exam.settings.lineSpacing}
                          isMasonryColumn={true}
                          isSelected={isInteractive && selectedBlockId === block.id}
                          onSelect={isInteractive ? () => setSelectedBlockId(block.id) : undefined}
                          isDuplicateNumber={duplicateNumbersSet.has(block.titleNumber?.trim() || '')}
                          showPoints={exam.settings.showPointsInPrint !== false}
                        />
                      );
                    })}
                  </div>

                  {/* Right Column */}
                  {segment.rightColumn && segment.rightColumn.length > 0 && (
                    <div className={`col-span-12 ${getColSpanClassSafe(rightCols)} flex flex-col gap-3.5 sm:gap-4.5`}>
                      {segment.rightColumn.map(({ block, index: idx }) => {
                        const blockSynced = { ...block, width: rightCols };
                        return (
                          <BlockItem
                            key={`${block.id}-${isDuplicateCopy ? 'dup' : 'orig'}-${isPrintOnly ? 'print' : 'screen'}`}
                            block={blockSynced}
                            index={idx}
                            totalBlocks={exam.blocks.length}
                            rightNeighbor={undefined}
                            onResizeWidthPair={onResizeWidthPair}
                            onUpdateBlock={isInteractive ? (updated) => onUpdateBlock(block.id, updated) : () => {}}
                            onDeleteBlock={isInteractive ? () => onDeleteBlock(block.id) : () => {}}
                            onDuplicateBlock={isInteractive ? () => onDuplicateBlock(block.id) : () => {}}
                            onMoveUp={isInteractive ? () => onMoveUp(idx) : () => {}}
                            onMoveDown={isInteractive ? () => onMoveDown(idx) : () => {}}
                            onOpenFigureModal={isInteractive ? () => onOpenFigureModalForBlock(block.id) : () => {}}
                            viewMode={effectiveViewMode}
                            showBorders={exam.settings.showBorders}
                            baseFontSize={exam.settings.baseFontSize}
                            statementJustify={exam.settings.statementJustify}
                            lineSpacing={exam.settings.lineSpacing}
                            isMasonryColumn={true}
                            isSelected={isInteractive && selectedBlockId === block.id}
                            onSelect={isInteractive ? () => setSelectedBlockId(block.id) : undefined}
                            isDuplicateNumber={duplicateNumbersSet.has(block.titleNumber?.trim() || '')}
                            showPoints={exam.settings.showPointsInPrint !== false}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={sheetRef}
      className={`page-sheet relative bg-white transition-all ${getSheetClasses()} ${exam.settings.colorMode === 'grayscale' ? 'exam-grayscale-mode' : ''}`}
    >
      {/* Indicadores visuales de corte de página A4/A5 (Solo en pantalla en modo Vista Previa) */}
      {isPreviewMode && estimatedPages > 1 && (
        <div className="pointer-events-none select-none print:hidden">
          {Array.from({ length: estimatedPages - 1 }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <div 
                key={`page-break-${pageNum}`}
                className="absolute inset-x-0 z-20 flex items-center justify-center pointer-events-none"
                style={{ top: `${pageNum * targetPageHeightPx}px` }}
              >
                <div className="w-full border-b-2 border-dashed border-indigo-400/80 relative flex items-center justify-center">
                  <span className="bg-indigo-50 text-indigo-800 font-black text-[10px] px-3 py-0.5 rounded-full border border-indigo-300 shadow-xs tracking-wide">
                    📄 Fin de Página {pageNum} — Inicio de Página {pageNum + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Línea guía tenue de fin de página en Modo Edición (sutil, sin textos ni insignias) */}
      {activeView === 'editor' && estimatedPages > 1 && (
        <div className="pointer-events-none select-none print:hidden">
          {Array.from({ length: estimatedPages - 1 }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <div 
                key={`editor-page-break-${pageNum}`}
                className="absolute inset-x-0 z-10 pointer-events-none"
                style={{ top: `${pageNum * targetPageHeightPx}px` }}
              >
                <div className="w-full border-b border-dashed border-slate-300/80" />
              </div>
            );
          })}
        </div>
      )}

      {/* Header Banner Mode Indicator in Solution Mode */}
      {activeView === 'solution_key' && (
        <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-900 flex items-center justify-between text-xs print:hidden">
          <div className="flex items-center gap-2 font-extrabold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>MODO CLAVE DE RESPUESTAS PARA EL DOCENTE ACTIVO</span>
          </div>
          <span className="text-[11px] font-medium text-emerald-700">Las alternativas correctas se resaltan en verde</span>
        </div>
      )}

      {/* Contenido del Examen */}
      {is2in1 ? (
        activeView === 'editor' ? (
          <>
            {/* Vista edición en pantalla: solo una columna interactiva */}
            <div className="print:hidden w-full">{renderExamBody({ isInteractive: true })}</div>
            {/* Vista impresión directa desde editor: dos columnas 100% sincronizadas e idénticas */}
            <div className="hidden print:grid grid-cols-2 gap-0 relative w-full bg-white print:divide-x print:divide-dashed print:divide-slate-400">
              <div className="pr-3.5 print:pr-4 bg-white">
                {renderExamBody({ isPrintOnly: true, isDuplicateCopy: false, forceCleanView: true })}
              </div>
              <div className="pl-3.5 print:pl-4 bg-white">
                {renderExamBody({ isPrintOnly: true, isDuplicateCopy: true, forceCleanView: true })}
              </div>
            </div>
          </>
        ) : (
          /* Vista Previa o Clave Docente: dos columnas 100% sincronizadas e idénticas en pantalla y papel */
          <div className="grid grid-cols-2 gap-0 relative w-full bg-white divide-x divide-dashed divide-slate-300 print:divide-slate-400">
            <div className="pr-3.5 sm:pr-4 bg-white">
              {renderExamBody({ isPrintOnly: false, isDuplicateCopy: false, forceCleanView: true })}
            </div>
            <div className="pl-3.5 sm:pl-4 bg-white">
              {renderExamBody({ isPrintOnly: false, isDuplicateCopy: true, forceCleanView: true })}
            </div>
          </div>
        )
      ) : (
        renderExamBody({ isInteractive: activeView === 'editor' })
      )}

      {/* Guardrail 2: Alerta de riesgo de hoja fantasma / desborde mínimo */}
      {isGhostPageRisk && activeView !== 'student' && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 print:hidden shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Aviso de impresión (Hoja extra detectada): </span>
              <span>El examen se pasa a la página {estimatedPages} por muy poco contenido ({Math.round(remainderPx)}px).</span>
            </div>
          </div>
          {onUpdateSettings && exam.settings.lineSpacing !== 'compact' && (
            <button
              type="button"
              onClick={() => onUpdateSettings({ lineSpacing: 'compact' })}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-2xs cursor-pointer"
              title="Ajustar interlineado a compacto para que quepa en menos páginas"
            >
              Ajustar a {estimatedPages - 1} página{estimatedPages - 1 > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Empty State / Limpio sin botones duplicados */}
      {exam.blocks.length === 0 && (
        <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl p-6 my-4 select-none">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">
            Este examen aún no tiene preguntas.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Haz clic en los botones de la barra superior (+ Opción Múltiple, Verdadero/Falso, etc.) para comenzar a agregar ejercicios.
          </p>
        </div>
      )}

      {/* Pie de página A4 informativo en modo Vista Previa */}
      {isPreviewMode && (
        <div className="mt-8 pt-3 border-t border-slate-200/90 flex items-center justify-between text-[11px] text-slate-400 select-none print:hidden">
          <span>{exam.header.institutionName || 'Evaluación Escolar'}</span>
          <span className="font-semibold text-slate-500">
            {is2in1 
              ? 'Formato A5 (2 en 1)' 
              : exam.settings.paperSize === 'a5_single' 
              ? 'Formato A5 Individual' 
              : 'Formato A4'} • {estimatedPages} {estimatedPages === 1 ? 'página' : 'páginas'}
          </span>
        </div>
      )}
    </div>
  );
};
