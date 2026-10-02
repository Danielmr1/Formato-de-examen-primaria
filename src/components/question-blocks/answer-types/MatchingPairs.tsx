import React from 'react';
import { Trash2 } from 'lucide-react';
import { ExamBlock } from '../../../types';
import { FormattedMathText } from '../../../utils/mathFormatter';
import { sanitizeTextLength } from '../../../utils/securitySanitizer';

// Límites según columnas de ancho para evitar desborde
const getMaxCharsForMatching = (cols: number = 12) => {
  if (cols <= 4) return 40;
  if (cols <= 6) return 80;
  return 180;
};

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
  const maxChars = getMaxCharsForMatching(block.width || 12);
  const canDelete = pairs.length > 2;

  const handleUpdatePair = (pairId: string, updated: { leftText?: string; rightText?: string }) => {
    const sanitizedUpdate: { leftText?: string; rightText?: string } = {};
    if (updated.leftText !== undefined) {
      sanitizedUpdate.leftText = sanitizeTextLength(updated.leftText, maxChars, 20);
    }
    if (updated.rightText !== undefined) {
      sanitizedUpdate.rightText = sanitizeTextLength(updated.rightText, maxChars, 20);
    }
    onUpdateBlock({
      matchingPairs: pairs.map(p => p.id === pairId ? { ...p, ...sanitizedUpdate } : p)
    });
  };

  const handleDeletePair = (pairId: string) => {
    if (pairs.length <= 2) return;
    onUpdateBlock({
      matchingPairs: pairs.filter(p => p.id !== pairId)
    });
  };

  return (
    <div className="mt-1 space-y-2">
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (Numbered) */}
        <div className="space-y-2">
          {pairs.map((p, idx) => {
            const isLeftEmpty = isEditor && (!p.leftText || p.leftText.trim() === '');
            return (
              <div 
                key={p.id} 
                className={`matching-pair-card flex items-center gap-2 p-1.5 rounded-lg border text-xs break-words overflow-hidden transition-colors ${
                  isLeftEmpty
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-1 ring-amber-300/40 print:bg-white print:border-slate-200 print:ring-0'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className={`matching-pair-badge w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                  isLeftEmpty ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {idx + 1}
                </span>
                {isEditor ? (
                  <input
                    type="text"
                    value={p.leftText}
                    maxLength={maxChars}
                    onChange={(e) => handleUpdatePair(p.id, { leftText: e.target.value })}
                    placeholder={`Elemento ${idx + 1}...`}
                    className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5 text-xs truncate focus:overflow-visible ${
                      isLeftEmpty ? 'placeholder:text-amber-700/60' : 'placeholder:text-slate-400'
                    }`}
                    title={`Límite para este ancho: máx. ${maxChars} caracteres (palabras de máx. 20 letras)`}
                  />
                ) : (
                  <span className="flex-1 break-words overflow-hidden">
                    <FormattedMathText text={p.leftText} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column (Lettered with parenthesis) */}
        <div className="space-y-2">
          {pairs.map((p, idx) => {
            const isRightEmpty = isEditor && (!p.rightText || p.rightText.trim() === '');
            const letter = String.fromCharCode(65 + idx);
            return (
              <div 
                key={p.id} 
                className={`matching-pair-card flex items-center gap-2 p-1.5 rounded-lg border text-xs break-words overflow-hidden transition-colors ${
                  isRightEmpty
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-1 ring-amber-300/40 print:bg-white print:border-slate-200 print:ring-0'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="matching-paren-box px-1.5 py-0.5 rounded font-bold text-slate-500 text-xs border border-dashed border-slate-300 shrink-0">
                  ( &nbsp; )
                </span>
                <span className={`font-bold text-xs shrink-0 ${isRightEmpty ? 'text-amber-900' : 'text-slate-700'}`}>
                  {letter}.
                </span>
                {isEditor ? (
                  <>
                    <input
                      type="text"
                      value={p.rightText}
                      maxLength={maxChars}
                      onChange={(e) => handleUpdatePair(p.id, { rightText: e.target.value })}
                      placeholder={`Definición ${letter}...`}
                      className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden py-0.5 text-xs truncate focus:overflow-visible ${
                        isRightEmpty ? 'placeholder:text-amber-700/60' : 'placeholder:text-slate-400'
                      }`}
                      title={`Límite para este ancho: máx. ${maxChars} caracteres (palabras de máx. 20 letras)`}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePair(p.id)}
                      disabled={!canDelete}
                      className={`p-0.5 rounded print:hidden transition-colors ${
                        canDelete
                          ? 'text-slate-400 hover:text-rose-600 cursor-pointer'
                          : 'text-slate-200 cursor-not-allowed opacity-30'
                      }`}
                      title={canDelete ? 'Eliminar este par' : 'Mínimo 2 pares requeridos'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="flex-1 break-words overflow-hidden">
                    <FormattedMathText text={p.rightText} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
