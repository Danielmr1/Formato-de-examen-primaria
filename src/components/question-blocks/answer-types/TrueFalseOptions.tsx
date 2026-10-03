import React from 'react';
import { Trash2 } from 'lucide-react';
import { ExamBlock } from '../../../types';
import { FormattedMathText } from '../../../utils/mathFormatter';
import { sanitizeTextLength } from '../../../utils/securitySanitizer';
import { AutoResizingTextarea } from './AutoResizingTextarea';

const getMaxCharsForTF = (cols: number = 12) => {
  if (cols <= 4) return 70;
  if (cols <= 6) return 120;
  return 200;
};

interface TrueFalseOptionsProps {
  block: ExamBlock;
  isEditor: boolean;
  isSolutionKey: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
}

export const TrueFalseOptions: React.FC<TrueFalseOptionsProps> = ({
  block,
  isEditor,
  isSolutionKey,
  onUpdateBlock
}) => {
  const current = block.trueFalseOptions || [];
  const maxChars = getMaxCharsForTF(block.width || 12);
  const canDelete = current.length > 2;

  const handleUpdateTrueFalse = (tfId: string, statement: string, isTrue: boolean) => {
    const sanitized = sanitizeTextLength(statement, maxChars, 25);
    onUpdateBlock({
      trueFalseOptions: current.map(item => item.id === tfId ? { ...item, statement: sanitized, isTrue } : item)
    });
  };

  const handleDeleteTrueFalse = (tfId: string) => {
    if (current.length <= 2) return;
    onUpdateBlock({
      trueFalseOptions: current.filter(item => item.id !== tfId)
    });
  };

  return (
    <div className="mt-1 flex flex-col gap-2">
      {current.map((tf, idx) => {
        const isEmpty = isEditor && (!tf.statement || tf.statement.trim() === '');
        return (
          <div 
            key={tf.id}
            className={`tf-option-card group relative flex items-start justify-between gap-3 p-2 rounded-lg border text-xs overflow-visible transition-colors ${
              isEmpty
                ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-1 ring-amber-300/40 print:bg-white print:border-slate-200 print:ring-0'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {/* Botón flotante para eliminar (Opción A: sólo aparece al pasar el cursor) */}
            {isEditor && canDelete && (
              <button
                type="button"
                onClick={() => handleDeleteTrueFalse(tf.id)}
                className="absolute -top-2 -right-2 z-20 p-1 rounded-full bg-white border border-slate-300 shadow-xs print:hidden transition-all opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                title="Eliminar afirmación"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            {isEditor ? (
              <>
                <div className="flex-1 min-w-0 print:hidden">
                  <AutoResizingTextarea
                    value={tf.statement || ''}
                    maxLength={maxChars}
                    onChange={(val) => handleUpdateTrueFalse(tf.id, val, tf.isTrue)}
                    className={`flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5 ${
                      isEmpty ? 'placeholder:text-amber-700/60' : 'placeholder:text-slate-400'
                    }`}
                    placeholder={`Afirmación ${idx + 1}...`}
                    title={`Límite: máx. ${maxChars} caracteres`}
                  />
                </div>
                <div className="flex-1 min-w-0 hidden print:block break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  <FormattedMathText text={tf.statement} />
                </div>
              </>
            ) : (
              <span className="flex-1 min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <FormattedMathText text={tf.statement} />
              </span>
            )}

            {/* ( V ) ( F ) Badges */}
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <button
                type="button"
                onClick={() => isEditor && handleUpdateTrueFalse(tf.id, tf.statement, true)}
                className={`w-7 h-6 rounded flex items-center justify-center font-bold text-xs border cursor-pointer transition-colors tf-badge-print ${
                  isSolutionKey && tf.isTrue ? 'solution-correct ' : ''
                }${
                  (isSolutionKey || isEditor) && tf.isTrue
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
                title="Marcar como Verdadera"
              >
                V
              </button>
              <button
                type="button"
                onClick={() => isEditor && handleUpdateTrueFalse(tf.id, tf.statement, false)}
                className={`w-7 h-6 rounded flex items-center justify-center font-bold text-xs border cursor-pointer transition-colors tf-badge-print ${
                  isSolutionKey && !tf.isTrue ? 'solution-correct ' : ''
                }${
                  (isSolutionKey || isEditor) && !tf.isTrue
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
                title="Marcar como Falsa"
              >
                F
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
