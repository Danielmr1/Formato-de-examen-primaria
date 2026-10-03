import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ChoiceOption, ExamBlock } from '../../../types';
import { FormattedMathText, hasMathContent } from '../../../utils/mathFormatter';
import { sanitizeTextLength } from '../../../utils/securitySanitizer';
import { AutoResizingTextarea } from './AutoResizingTextarea';

// Límites según columnas de ancho para evitar desborde
const getMaxCharsForOption = (cols: number = 12) => {
  if (cols <= 4) return 50;
  if (cols <= 6) return 90;
  return 160;
};

interface MultipleChoiceOptionsProps {
  block: ExamBlock;
  isEditor: boolean;
  isSolutionKey: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
  getOptionSizeClass: () => string;
}

export const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsProps> = ({
  block,
  isEditor,
  isSolutionKey,
  onUpdateBlock,
  getOptionSizeClass
}) => {
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);
  const maxChars = getMaxCharsForOption(block.width || 12);
  const currentOptions = block.options || [];
  const canDelete = currentOptions.length > 2;

  const handleUpdateOption = (optId: string, updated: Partial<ChoiceOption>) => {
    const sanitizedUpdate = { ...updated };
    if (updated.text !== undefined) {
      sanitizedUpdate.text = sanitizeTextLength(updated.text, maxChars, 25);
    }
    onUpdateBlock({
      options: currentOptions.map(o => o.id === optId ? { ...o, ...sanitizedUpdate } : o)
    });
  };

  const handleDeleteOption = (optId: string) => {
    if (currentOptions.length <= 2) return;
    const remaining = currentOptions.filter(o => o.id !== optId);
    const reindexed = remaining.map((opt, idx) => ({
      ...opt,
      label: String.fromCharCode(65 + idx)
    }));
    onUpdateBlock({
      options: reindexed
    });
  };

  const handleSetCorrectOption = (optId: string) => {
    onUpdateBlock({
      options: currentOptions.map(o => ({
        ...o,
        isCorrect: o.id === optId ? !o.isCorrect : false
      }))
    });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 sm:gap-y-3">
        {(block.options || []).map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isEmpty = isEditor && (!opt.text || opt.text.trim() === '');

          return (
            <div 
              key={opt.id}
              className={`choice-option-card group relative flex items-start gap-2 p-1.5 rounded-lg border ${getOptionSizeClass()} overflow-visible transition-colors ${
                isSolutionKey && opt.isCorrect
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                  : isEmpty
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-1 ring-amber-300/40 print:bg-white print:border-slate-200 print:ring-0'
                  : 'bg-slate-50/50 border-slate-200 text-slate-800'
              }`}
            >
              {/* Botón flotante para eliminar (Opción A: sólo aparece al pasar el cursor) */}
              {isEditor && canDelete && (
                <button
                  type="button"
                  onClick={() => handleDeleteOption(opt.id)}
                  className="absolute -top-2 -right-2 z-20 p-1 rounded-full bg-white border border-slate-300 shadow-xs print:hidden transition-all opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                  title="Eliminar alternativa"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              {/* Option Label / Radio Button */}
              <button
                type="button"
                onClick={() => isEditor && handleSetCorrectOption(opt.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all option-badge-print ${
                  isSolutionKey && opt.isCorrect ? 'solution-correct ' : ''
                }${
                  opt.isCorrect && (isSolutionKey || isEditor)
                    ? 'bg-emerald-600 text-white border border-emerald-600 shadow-2xs'
                    : isEmpty
                    ? 'border border-amber-400 bg-amber-100 text-amber-800 hover:border-amber-600'
                    : 'border border-slate-300 bg-white text-slate-700 hover:border-indigo-500'
                }`}
                title={isEditor ? 'Haz clic para marcar como respuesta correcta (clave docente)' : ''}
              >
                {letter}
              </button>

              {/* Option text */}
              {isEditor ? (
                <>
                  <div className="flex-1 min-w-0 print:hidden">
                    {focusedOptionId !== opt.id && opt.text && hasMathContent(opt.text) ? (
                      <div
                        onClick={() => {
                          setFocusedOptionId(opt.id);
                          setTimeout(() => {
                            const textarea = document.querySelector(`textarea[data-block-id="${block.id}"][data-opt-id="${opt.id}"]`) as HTMLTextAreaElement | null;
                            if (textarea) textarea.focus();
                          }, 25);
                        }}
                        className="flex-1 cursor-text hover:bg-slate-50 rounded px-1 py-0.5 border-b border-transparent hover:border-slate-300 text-xs text-slate-900 break-words [overflow-wrap:anywhere] [word-break:break-word]"
                        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                        title="Haz clic para editar la alternativa"
                      >
                        <FormattedMathText text={opt.text} />
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 min-w-0 flex-1">
                        <AutoResizingTextarea
                          dataBlockId={block.id}
                          dataOptId={opt.id}
                          value={opt.text || ''}
                          maxLength={maxChars}
                          onChange={(val) => handleUpdateOption(opt.id, { text: val })}
                          onFocus={() => setFocusedOptionId(opt.id)}
                          onBlur={() => setTimeout(() => setFocusedOptionId(null), 150)}
                          placeholder={`Alternativa ${letter}...`}
                          className={`flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden text-xs py-0.5 ${
                            isEmpty ? 'placeholder:text-amber-700/60' : 'placeholder:text-slate-400'
                          }`}
                          title={`Límite para este ancho: máx. ${maxChars} caracteres (palabras de máx. 25 letras)`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 hidden print:block text-xs break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                    <FormattedMathText text={opt.text} />
                  </div>
                </>
              ) : (
                <span className="flex-1 min-w-0 text-xs break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  <FormattedMathText text={opt.text} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
