import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ExamBlock } from '../../../types';
import { FormattedMathText } from '../../../utils/mathFormatter';

interface MatchingPairsProps {
  block: ExamBlock;
  isEditor: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
}

export const MatchingPairs: React.FC<MatchingPairsProps> = ({
  block,
  isEditor,
  onUpdateBlock
}) => {
  const pairs = block.matchingPairs || [];

  const handleAddPair = () => {
    onUpdateBlock({
      matchingPairs: [
        ...pairs,
        {
          id: `m-${Date.now()}-${pairs.length}`,
          leftText: `Concepto ${pairs.length + 1}`,
          rightText: `Definición ${String.fromCharCode(65 + pairs.length)}`
        }
      ]
    });
  };

  const handleUpdatePair = (pairId: string, updated: { leftText?: string; rightText?: string }) => {
    onUpdateBlock({
      matchingPairs: pairs.map(p => p.id === pairId ? { ...p, ...updated } : p)
    });
  };

  const handleDeletePair = (pairId: string) => {
    onUpdateBlock({
      matchingPairs: pairs.filter(p => p.id !== pairId)
    });
  };

  return (
    <div className="mt-1 space-y-2">
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (Numbered) */}
        <div className="space-y-2">
          {pairs.map((p, idx) => (
            <div key={p.id} className="matching-pair-card flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="matching-pair-badge w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                {idx + 1}
              </span>
              {isEditor ? (
                <input
                  type="text"
                  value={p.leftText}
                  onChange={(e) => handleUpdatePair(p.id, { leftText: e.target.value })}
                  placeholder="Elemento columna izquierda..."
                  className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5 text-xs"
                />
              ) : (
                <span className="flex-1">
                  <FormattedMathText text={p.leftText} />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right Column (Lettered with parenthesis) */}
        <div className="space-y-2">
          {pairs.map((p, idx) => (
            <div key={p.id} className="matching-pair-card flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="matching-paren-box px-1.5 py-0.5 rounded font-bold text-slate-500 text-xs border border-dashed border-slate-300 shrink-0">
                ( &nbsp; )
              </span>
              <span className="font-bold text-slate-700 text-xs shrink-0">
                {String.fromCharCode(65 + idx)}.
              </span>
              {isEditor ? (
                <>
                  <input
                    type="text"
                    value={p.rightText}
                    onChange={(e) => handleUpdatePair(p.id, { rightText: e.target.value })}
                    placeholder="Elemento columna derecha..."
                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePair(p.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded print:hidden cursor-pointer"
                    title="Eliminar este par"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <span className="flex-1">
                  <FormattedMathText text={p.rightText} />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isEditor && (
        <div className="flex justify-start print:hidden">
          <button
            type="button"
            onClick={handleAddPair}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-md border border-dashed border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir par</span>
          </button>
        </div>
      )}
    </div>
  );
};
