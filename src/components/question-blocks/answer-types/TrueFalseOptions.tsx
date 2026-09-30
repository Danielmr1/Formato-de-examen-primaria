import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ExamBlock } from '../../../types';
import { FormattedMathText } from '../../../utils/mathFormatter';

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
  const handleAddTrueFalse = () => {
    const current = block.trueFalseOptions || [];
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
    const current = block.trueFalseOptions || [];
    onUpdateBlock({
      trueFalseOptions: current.map(item => item.id === tfId ? { ...item, statement, isTrue } : item)
    });
  };

  const handleDeleteTrueFalse = (tfId: string) => {
    const current = block.trueFalseOptions || [];
    onUpdateBlock({
      trueFalseOptions: current.filter(item => item.id !== tfId)
    });
  };

  return (
    <div className="mt-1 space-y-2">
      {(block.trueFalseOptions || []).map((tf) => (
        <div 
          key={tf.id}
          className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
        >
          {isEditor ? (
            <>
              <input
                type="text"
                value={tf.statement}
                onChange={(e) => handleUpdateTrueFalse(tf.id, e.target.value, tf.isTrue)}
                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden print:hidden"
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
              className={`w-7 h-6 rounded flex items-center justify-center font-bold text-xs border cursor-pointer transition-colors ${
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
              className={`w-7 h-6 rounded flex items-center justify-center font-bold text-xs border cursor-pointer transition-colors ${
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
                className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 print:hidden cursor-pointer"
                title="Eliminar afirmación"
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
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-md border border-dashed border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Añadir afirmación V/F</span>
          </button>
        </div>
      )}
    </div>
  );
};
