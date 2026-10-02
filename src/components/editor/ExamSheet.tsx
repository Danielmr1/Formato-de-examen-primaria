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
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [exam.blocks, exam.header, exam.settings]);

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

  const renderExamBody = (isDuplicateCopy: boolean = false) => (
    <div 
      ref={!isDuplicateCopy ? contentRef : undefined} 
      className="w-full flex flex-col"
      onClick={(e) => {
        if (!isDuplicateCopy && e.target === e.currentTarget) {
          setSelectedBlockId(null);
        }
      }}
    >
      {/* Institutional Header */}
      <HeaderEditor
        header={exam.header}
        onUpdateHeader={!isDuplicateCopy ? onUpdateHeader : () => {}}
        isPrintMode={isPreviewMode || isDuplicateCopy}
        totalScore={totalPoints}
        isA5={isA5}
      />

      {/* Dynamic Tetris / Masonry Bento Grid of Question Blocks */}
      <div className={`flex flex-col gap-3.5 sm:gap-4.5 ${activeView === 'editor' && !isDuplicateCopy ? 'pt-4' : ''}`}>
        {buildMasonrySegments(exam.blocks).map((segment, segIdx) => {
          if (segment.type === 'full' && segment.fullBlock) {
            const { block, index: idx } = segment.fullBlock;
            return (
              <div key={`${block.id}-${isDuplicateCopy ? 'dup' : 'orig'}`} className="w-full">
                <BlockItem
                  block={block}
                  index={idx}
                  totalBlocks={exam.blocks.length}
                  rightNeighbor={undefined}
                  onResizeWidthPair={onResizeWidthPair}
                  onUpdateBlock={!isDuplicateCopy ? (updated) => onUpdateBlock(block.id, updated) : () => {}}
                  onDeleteBlock={!isDuplicateCopy ? () => onDeleteBlock(block.id) : () => {}}
                  onDuplicateBlock={!isDuplicateCopy ? () => onDuplicateBlock(block.id) : () => {}}
                  onMoveUp={!isDuplicateCopy ? () => onMoveUp(idx) : () => {}}
                  onMoveDown={!isDuplicateCopy ? () => onMoveDown(idx) : () => {}}
                  onOpenFigureModal={!isDuplicateCopy ? () => onOpenFigureModalForBlock(block.id) : () => {}}
                  viewMode={isDuplicateCopy ? 'preview_a4' : activeView}
                  showBorders={exam.settings.showBorders}
                  baseFontSize={exam.settings.baseFontSize}
                  statementJustify={exam.settings.statementJustify}
                  lineSpacing={exam.settings.lineSpacing}
                  isMasonryColumn={true}
                  isSelected={!isDuplicateCopy && selectedBlockId === block.id}
                  onSelect={!isDuplicateCopy ? () => setSelectedBlockId(block.id) : undefined}
                  isDuplicateNumber={duplicateNumbersSet.has(block.titleNumber?.trim() || '')}
                />
              </div>
            );
          }

          if (segment.type === 'split') {
            const leftCols = segment.leftWidthCols || 6;
            const rightCols = 12 - leftCols;
            const firstRight = segment.rightColumn?.[0];

            return (
              <div key={`split-${segIdx}-${isDuplicateCopy ? 'dup' : 'orig'}`} className="grid grid-cols-12 gap-3.5 sm:gap-4.5 items-start">
                {/* Left Column */}
                <div className={`col-span-12 ${getColSpanClassSafe(leftCols)} flex flex-col gap-3.5 sm:gap-4.5`}>
                  {segment.leftColumn?.map(({ block, index: idx }, leftIdx) => {
                    const pairedRight = segment.rightColumn?.[leftIdx] || firstRight;
                    const blockSynced = { ...block, width: leftCols };
                    return (
                      <BlockItem
                        key={`${block.id}-${isDuplicateCopy ? 'dup' : 'orig'}`}
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
                        onUpdateBlock={!isDuplicateCopy ? (updated) => onUpdateBlock(block.id, updated) : () => {}}
                        onDeleteBlock={!isDuplicateCopy ? () => onDeleteBlock(block.id) : () => {}}
                        onDuplicateBlock={!isDuplicateCopy ? () => onDuplicateBlock(block.id) : () => {}}
                        onMoveUp={!isDuplicateCopy ? () => onMoveUp(idx) : () => {}}
                        onMoveDown={!isDuplicateCopy ? () => onMoveDown(idx) : () => {}}
                        onOpenFigureModal={!isDuplicateCopy ? () => onOpenFigureModalForBlock(block.id) : () => {}}
                        viewMode={isDuplicateCopy ? 'preview_a4' : activeView}
                        showBorders={exam.settings.showBorders}
                        baseFontSize={exam.settings.baseFontSize}
                        statementJustify={exam.settings.statementJustify}
                        lineSpacing={exam.settings.lineSpacing}
                        isMasonryColumn={true}
                        isSelected={!isDuplicateCopy && selectedBlockId === block.id}
                        onSelect={!isDuplicateCopy ? () => setSelectedBlockId(block.id) : undefined}
                        isDuplicateNumber={duplicateNumbersSet.has(block.titleNumber?.trim() || '')}
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
                          key={`${block.id}-${isDuplicateCopy ? 'dup' : 'orig'}`}
                          block={blockSynced}
                          index={idx}
                          totalBlocks={exam.blocks.length}
                          rightNeighbor={undefined}
                          onResizeWidthPair={onResizeWidthPair}
                          onUpdateBlock={!isDuplicateCopy ? (updated) => onUpdateBlock(block.id, updated) : () => {}}
                          onDeleteBlock={!isDuplicateCopy ? () => onDeleteBlock(block.id) : () => {}}
                          onDuplicateBlock={!isDuplicateCopy ? () => onDuplicateBlock(block.id) : () => {}}
                          onMoveUp={!isDuplicateCopy ? () => onMoveUp(idx) : () => {}}
                          onMoveDown={!isDuplicateCopy ? () => onMoveDown(idx) : () => {}}
                          onOpenFigureModal={!isDuplicateCopy ? () => onOpenFigureModalForBlock(block.id) : () => {}}
                          viewMode={isDuplicateCopy ? 'preview_a4' : activeView}
                          showBorders={exam.settings.showBorders}
                          baseFontSize={exam.settings.baseFontSize}
                          statementJustify={exam.settings.statementJustify}
                          lineSpacing={exam.settings.lineSpacing}
                          isMasonryColumn={true}
                          isSelected={!isDuplicateCopy && selectedBlockId === block.id}
                          onSelect={!isDuplicateCopy ? () => setSelectedBlockId(block.id) : undefined}
                          isDuplicateNumber={duplicateNumbersSet.has(block.titleNumber?.trim() || '')}
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

  return (
    <div 
      ref={sheetRef}
      className={`page-sheet relative bg-white transition-all ${getSheetClasses()}`}
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
            <div className="mb-3 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between shadow-2xs select-none print:hidden">
              <span className="font-semibold">
                📄 Modo A5 (2 exámenes por hoja A4): Aquí editas tu prueba en media hoja. Al previsualizar o imprimir se duplicará lado a lado con línea de corte.
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded">
                Ahorro 50%
              </span>
            </div>
            <div className="print:hidden w-full">{renderExamBody(false)}</div>
            {/* Modo Impresión directa desde editor */}
            <div className="hidden print:grid grid-cols-2 gap-6 relative w-full">
              <div className="pr-3">{renderExamBody(false)}</div>
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-slate-400 select-none pointer-events-none py-2 flex flex-col justify-between items-center text-[10px] text-slate-500">
                <span className="bg-white px-1">✂ corte</span>
                <span className="bg-white px-1">✂ corte</span>
              </div>
              <div className="pl-3">{renderExamBody(true)}</div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-6 relative w-full">
            <div className="pr-3">{renderExamBody(false)}</div>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-slate-400 select-none pointer-events-none py-2 flex flex-col justify-between items-center text-[10px] text-slate-500">
              <span className="bg-white px-1 shadow-2xs rounded border border-slate-200">✂ corte</span>
              <span className="bg-white px-1 shadow-2xs rounded border border-slate-200">✂ corte</span>
            </div>
            <div className="pl-3">{renderExamBody(true)}</div>
          </div>
        )
      ) : (
        renderExamBody(false)
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
          <span className="font-semibold text-slate-500">Formato A4 • {estimatedPages} {estimatedPages === 1 ? 'página' : 'páginas'}</span>
        </div>
      )}
    </div>
  );
};
