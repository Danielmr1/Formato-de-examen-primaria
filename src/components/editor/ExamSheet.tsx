import React, { useRef, useState, useEffect } from 'react';
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
  CheckSquare
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
  onAddBlock
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState<number>(0);

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

  // Medir altura física de la hoja para advertir desborde de página
  useEffect(() => {
    if (!sheetRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSheetHeight(entry.contentRect.height);
      }
    });
    observer.observe(sheetRef.current);
    return () => observer.disconnect();
  }, [exam.blocks, exam.header, exam.settings]);

  return (
    <div 
      ref={sheetRef}
      className={`page-sheet relative w-full max-w-4xl bg-white shadow-xl rounded-xl border border-slate-300/80 p-3.5 sm:p-5 md:p-6 transition-all ${
        activeView === 'preview_a4' ? 'shadow-2xl ring-1 ring-indigo-500/20' : ''
      }`}
    >


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

      {/* Institutional Header */}
      <HeaderEditor
        header={exam.header}
        onUpdateHeader={onUpdateHeader}
        isPrintMode={activeView === 'preview_a4'}
        totalScore={totalPoints}
      />

      {/* Dynamic Tetris / Masonry Bento Grid of Question Blocks */}
      <div className="flex flex-col gap-3.5 sm:gap-4.5">
        {buildMasonrySegments(exam.blocks).map((segment, segIdx) => {
          if (segment.type === 'full' && segment.fullBlock) {
            const { block, index: idx } = segment.fullBlock;
            return (
              <div key={block.id} className="w-full">
                <BlockItem
                  block={block}
                  index={idx}
                  totalBlocks={exam.blocks.length}
                  rightNeighbor={undefined}
                  onResizeWidthPair={onResizeWidthPair}
                  onUpdateBlock={(updated) => onUpdateBlock(block.id, updated)}
                  onDeleteBlock={() => onDeleteBlock(block.id)}
                  onDuplicateBlock={() => onDuplicateBlock(block.id)}
                  onMoveUp={() => onMoveUp(idx)}
                  onMoveDown={() => onMoveDown(idx)}
                  onOpenFigureModal={() => onOpenFigureModalForBlock(block.id)}
                  viewMode={activeView}
                  showBorders={exam.settings.showBorders}
                  baseFontSize={exam.settings.baseFontSize}
                  statementJustify={exam.settings.statementJustify}
                  lineSpacing={exam.settings.lineSpacing}
                  isMasonryColumn={true}
                />
              </div>
            );
          }

          if (segment.type === 'split') {
            const leftCols = segment.leftWidthCols || 6;
            const rightCols = 12 - leftCols;
            const firstRight = segment.rightColumn?.[0];

            return (
              <div key={`split-${segIdx}`} className="grid grid-cols-12 gap-3.5 sm:gap-4.5 items-start">
                {/* Left Column */}
                <div className={`col-span-12 ${getColSpanClassSafe(leftCols)} flex flex-col gap-3.5 sm:gap-4.5`}>
                  {segment.leftColumn?.map(({ block, index: idx }, leftIdx) => {
                    const pairedRight = segment.rightColumn?.[leftIdx] || firstRight;
                    const blockSynced = { ...block, width: leftCols };
                    return (
                      <BlockItem
                        key={block.id}
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
                        onUpdateBlock={(updated) => onUpdateBlock(block.id, updated)}
                        onDeleteBlock={() => onDeleteBlock(block.id)}
                        onDuplicateBlock={() => onDuplicateBlock(block.id)}
                        onMoveUp={() => onMoveUp(idx)}
                        onMoveDown={() => onMoveDown(idx)}
                        onOpenFigureModal={() => onOpenFigureModalForBlock(block.id)}
                        viewMode={activeView}
                        showBorders={exam.settings.showBorders}
                        baseFontSize={exam.settings.baseFontSize}
                        statementJustify={exam.settings.statementJustify}
                        lineSpacing={exam.settings.lineSpacing}
                        isMasonryColumn={true}
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
                          key={block.id}
                          block={blockSynced}
                          index={idx}
                          totalBlocks={exam.blocks.length}
                          rightNeighbor={undefined}
                          onResizeWidthPair={onResizeWidthPair}
                          onUpdateBlock={(updated) => onUpdateBlock(block.id, updated)}
                          onDeleteBlock={() => onDeleteBlock(block.id)}
                          onDuplicateBlock={() => onDuplicateBlock(block.id)}
                          onMoveUp={() => onMoveUp(idx)}
                          onMoveDown={() => onMoveDown(idx)}
                          onOpenFigureModal={() => onOpenFigureModalForBlock(block.id)}
                          viewMode={activeView}
                          showBorders={exam.settings.showBorders}
                          baseFontSize={exam.settings.baseFontSize}
                          statementJustify={exam.settings.statementJustify}
                          lineSpacing={exam.settings.lineSpacing}
                          isMasonryColumn={true}
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
    </div>
  );
};
