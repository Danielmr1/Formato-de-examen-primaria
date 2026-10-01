import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ExamBlock } from '../../../types';
import { FormattedMathText } from '../../../utils/mathFormatter';
import { sanitizeTextLength } from '../../../utils/securitySanitizer';

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
  const canAdd = current.length < 5;
  const canDelete = current.length > 2;

  const handleAddTrueFalse = () => {
    if (current.length >= 5) return;
    onUpdateBlock({
      trueFalseOptions: [
        ...current,
        {
          id: `tf-${Date.now()}-${current.length}`,
          statement: 'Nueva afirmación para evaluar',
          isTrue: true
        }
      ]
    });
  };

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
    <div className="mt-1 space-y-2">
      {current.map((tf) => (
        <div 
          key={tf.id}
          className="tf-option-card flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
        >
          {isEditor ? (
            <>
              <input
                type="text"
                value={tf.statement}
                maxLength={maxChars}
                onChange={(e) => handleUpdateTrueFalse(tf.id, e.target.value, tf.isTrue)}
                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5 print:hidden"
                placeholder="Escribe la afirmación..."
                title={`Límite: máx. ${maxChars} caracteres`}
              />
              <span className="flex-1 hidden print:inline">
                <FormattedMathText text={tf.statement} />
              </span>
            </>
          ) : (
            <span className="flex-1">
              <FormattedMathText text={tf.statement} />
            </span>
          )}

          {/* ( V ) ( F ) Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
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

            {isEditor && (
              <button
                type="button"
                onClick={() => handleDeleteTrueFalse(tf.id)}
                disabled={!canDelete}
                className={`p-0.5 ml-1 print:hidden transition-colors ${
                  canDelete
                    ? 'text-slate-400 hover:text-rose-600 cursor-pointer'
                    : 'text-slate-200 cursor-not-allowed opacity-30'
                }`}
                title={canDelete ? 'Eliminar afirmación' : 'Mínimo 2 afirmaciones requeridas'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {isEditor && (
        <div className="flex justify-start print:hidden">
          <button
            type="button"
            onClick={handleAddTrueFalse}
            disabled={!canAdd}
            className={`text-xs font-semibold px-2 py-1 rounded-md border border-dashed flex items-center gap-1 transition-colors ${
              canAdd
                ? 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200 cursor-pointer'
                : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed'
            }`}
            title={canAdd ? 'Añadir afirmación' : 'Límite alcanzado: Máximo 5 afirmaciones'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir afirmación {current.length >= 5 ? '(Máx. 5)' : `(${current.length}/5)`}</span>
          </button>
        </div>
      )}
    </div>
  );
};
