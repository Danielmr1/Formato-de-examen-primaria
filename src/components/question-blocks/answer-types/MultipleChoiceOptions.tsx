import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { ChoiceOption, ExamBlock } from '../../../types';
import { FormattedMathText, hasMathContent } from '../../../utils/mathFormatter';
import { sanitizeTextLength } from '../../../utils/securitySanitizer';

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

  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const currentOptions = block.options || [];
    const nextIndex = currentOptions.length;
    const label = letters[nextIndex] || `${nextIndex + 1}`;

    const newOpt: ChoiceOption = {
      id: `opt-${Date.now()}-${nextIndex}`,
      label: label,
      text: `Alternativa ${label}`,
    };

    onUpdateBlock({
      options: [...currentOptions, newOpt]
    });
  };

  const handleUpdateOption = (optId: string, updated: Partial<ChoiceOption>) => {
    const currentOptions = block.options || [];
    const sanitizedUpdate = { ...updated };
    if (updated.text !== undefined) {
      sanitizedUpdate.text = sanitizeTextLength(updated.text, maxChars, 25);
    }
    onUpdateBlock({
      options: currentOptions.map(o => o.id === optId ? { ...o, ...sanitizedUpdate } : o)
    });
  };

  const handleDeleteOption = (optId: string) => {
    const currentOptions = block.options || [];
    onUpdateBlock({
      options: currentOptions.filter(o => o.id !== optId)
    });
  };

  const handleSetCorrectOption = (optId: string) => {
    const currentOptions = block.options || [];
    onUpdateBlock({
      options: currentOptions.map(o => ({
        ...o,
        isCorrect: o.id === optId ? !o.isCorrect : false
      }))
    });
  };

  const hasCorrectChoice = block.options?.some(o => o.isCorrect);

  return (
    <div className="mt-1 space-y-1.5">
      {/* Botón para añadir alternativa */}
      {isEditor && (
        <div className="flex items-center pb-1 print:hidden">
          <button
            type="button"
            onClick={handleAddOption}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-0.5 rounded-md border border-dashed border-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Añadir una nueva alternativa"
          >
            <Plus className="w-3 h-3" />
            <span>+ Alternativa</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(block.options || []).map((opt) => (
          <div 
            key={opt.id}
            className={`flex items-center gap-2 p-1.5 rounded-lg border choice-option-card ${getOptionSizeClass()} transition-colors ${
              isSolutionKey && opt.isCorrect
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                : 'bg-slate-50/50 border-slate-200 text-slate-800'
            }`}
          >
            {/* Option Label / Radio Button */}
            <button
              type="button"
              onClick={() => isEditor && handleSetCorrectOption(opt.id)}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all option-badge-print ${
                isSolutionKey && opt.isCorrect ? 'solution-correct ' : ''
              }${
                opt.isCorrect && (isSolutionKey || isEditor)
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'border border-slate-300 bg-white text-slate-700 hover:border-indigo-500'
              }`}
              title={isEditor ? 'Haz clic para marcar como respuesta correcta (clave docente)' : ''}
            >
              {opt.label}
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
                          const input = document.querySelector(`input[data-block-id="${block.id}"][data-opt-id="${opt.id}"]`) as HTMLInputElement | null;
                          if (input) input.focus();
                        }, 25);
                      }}
                      className="flex-1 cursor-text hover:bg-slate-50 rounded px-1 py-0.5 border-b border-transparent hover:border-slate-300 text-xs text-slate-900"
                      title="Haz clic para editar la alternativa"
                    >
                      <FormattedMathText text={opt.text} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <input
                        type="text"
                        data-block-id={block.id}
                        data-opt-id={opt.id}
                        value={opt.text}
                        maxLength={maxChars}
                        onChange={(e) => handleUpdateOption(opt.id, { text: e.target.value })}
                        onFocus={() => setFocusedOptionId(opt.id)}
                        onBlur={() => setTimeout(() => setFocusedOptionId(null), 150)}
                        placeholder="Texto de la alternativa..."
                        className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden text-xs py-0.5 truncate focus:overflow-visible"
                        title={`Límite para este ancho: máx. ${maxChars} caracteres (palabras de máx. 25 letras)`}
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 hidden print:block text-xs break-words overflow-hidden">
                  <FormattedMathText text={opt.text} />
                </div>
              </>
            ) : (
              <span className="flex-1 text-xs break-words overflow-hidden">
                <FormattedMathText text={opt.text} />
              </span>
            )}

            {/* Delete option */}
            {isEditor && (
              <button
                type="button"
                onClick={() => handleDeleteOption(opt.id)}
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded print:hidden transition-colors cursor-pointer"
                title="Eliminar alternativa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
