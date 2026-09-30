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

      {/* Empty State / Add block helper when empty */}
      {exam.blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl p-6 my-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-700 text-sm">No hay preguntas en este examen todavía</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Comienza insertando preguntas con o sin alternativas, recuadros de desarrollo o figuras geométricas:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onAddBlock(6, 'multiple_choice', false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Opción Múltiple (1/2)</span>
            </button>

            <button
              type="button"
              onClick={() => onAddBlock(6, 'statement_only', false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Sin Alternativas (1/2)</span>
            </button>

            <button
              type="button"
              onClick={() => onAddBlock(12, 'statement_only', false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer"
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
              <span>+ Ancho Total (12/12)</span>
            </button>

            <button
              type="button"
              onClick={() => onAddBlock(6, 'statement_only', true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg font-bold shadow-2xs transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Con Figura</span>
            </button>

            <button
              type="button"
              onClick={() => onAddBlock(12, 'open_development', false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Desarrollo / Cuadrícula</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Bar at Bottom of Sheet */}
      {activeView === 'editor' && exam.blocks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex flex-wrap items-center justify-center gap-2 print:hidden select-none">
          <span className="text-xs font-bold text-slate-500 mr-1">+ Añadir pregunta al final:</span>
          <button
            type="button"
            onClick={() => onAddBlock(6, 'multiple_choice', false)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Añadir pregunta con alternativas A, B, C, D"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Opción Múltiple</span>
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(6, 'statement_only', false)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Añadir pregunta directa o conceptual SIN alternativas A, B, C, D"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Sin Alternativas</span>
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(6, 'statement_only', true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            title="Añadir pregunta con figura o diagrama"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Con Figura</span>
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(12, 'open_development', false)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            title="Añadir ejercicio con cuadrícula para desarrollo"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-600" />
            <span>Desarrollo</span>
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(6, 'true_false', false)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            title="Añadir afirmaciones de Verdadero o Falso"
          >
            <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
            <span>V / F</span>
          </button>
        </div>
      )}
    </div>
  );
};
