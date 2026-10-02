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
  isSolutionKey?: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
}

export const MatchingPairs: React.FC<MatchingPairsProps> = ({
  block,
  isEditor,
  isSolutionKey = false,
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

  const handleSetMatchIndex = (pairId: string, matchIndex: number | undefined) => {
    onUpdateBlock({
      matchingPairs: pairs.map(p => p.id === pairId ? { ...p, correctMatchIndex: matchIndex } : p)
    });
  };

  const handleDeletePair = (pairId: string) => {
    if (pairs.length <= 2) return;
    const remaining = pairs.filter(p => p.id !== pairId);
    // Ajustar o limpiar índices que superen el nuevo límite
    const sanitized = remaining.map(p => {
      if (p.correctMatchIndex && p.correctMatchIndex > remaining.length) {
        return { ...p, correctMatchIndex: undefined };
      }
      return p;
    });
    onUpdateBlock({
      matchingPairs: sanitized
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
            const matchIndex = p.correctMatchIndex;
            const hasMatch = matchIndex !== undefined && matchIndex > 0;

            // Verificar si hay número duplicado
            const allAssigned = pairs.map(item => item.correctMatchIndex).filter(Boolean);
            const isDuplicate = hasMatch && allAssigned.filter(m => m === matchIndex).length > 1;

            return (
              <div 
                key={p.id} 
                className={`matching-pair-card flex items-center gap-2 p-1.5 rounded-lg border text-xs break-words overflow-hidden transition-colors ${
                  isRightEmpty
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-1 ring-amber-300/40 print:bg-white print:border-slate-200 print:ring-0'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {/* Modo Impresión (para alumnos sale vacío; para clave docente sale con el número en verde) */}
                <span className="matching-paren-box hidden print:inline-flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  ( {isSolutionKey && hasMatch ? <strong className="font-extrabold text-emerald-800">{matchIndex}</strong> : <>&nbsp;&nbsp;&nbsp;</>} )
                </span>

                {/* Modo Pantalla: Clave Docente */}
                {isSolutionKey ? (
                  <div 
                    className="print:hidden flex items-center justify-center font-black text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-400 shrink-0 shadow-2xs select-none"
                    title={`Respuesta correcta: Elemento ${matchIndex || 'sin asignar'}`}
                  >
                    ( {hasMatch ? matchIndex : '?'} )
                  </div>
                ) : isEditor ? (
                  /* Modo Pantalla: Editor Interactivo con selector en el paréntesis */
                  <div 
                    className={`print:hidden flex items-center justify-center font-bold text-xs rounded border transition-colors shrink-0 px-1 py-0.5 ${
                      isDuplicate
                        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200'
                        : hasMatch 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs' 
                        : 'bg-white text-slate-400 border-dashed border-slate-300 hover:border-indigo-400'
                    }`}
                    title={
                      isDuplicate 
                        ? '¡Número duplicado! Dos definiciones apuntan al mismo elemento.' 
                        : hasMatch 
                        ? `Elemento ${matchIndex} asignado como clave correcta. Haz clic para cambiarlo.`
                        : 'Haz clic aquí para seleccionar el número de elemento correspondiente (Clave Docente)'
                    }
                  >
                    <span className="text-slate-400 select-none">(</span>
                    <select
                      value={matchIndex || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                        handleSetMatchIndex(p.id, val);
                      }}
                      className={`bg-transparent text-center font-extrabold text-xs cursor-pointer focus:outline-hidden appearance-none px-0.5 ${
                        isDuplicate 
                          ? 'text-rose-700' 
                          : hasMatch 
                          ? 'text-emerald-800' 
                          : 'text-slate-400 hover:text-indigo-600'
                      }`}
                    >
                      <option value="">--</option>
                      {pairs.map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-slate-400 select-none">)</span>
                  </div>
                ) : (
                  /* Modo Pantalla: Estudiante / Lectura */
                  <span className="print:hidden font-bold text-slate-500 text-xs shrink-0 select-none">
                    ( &nbsp;&nbsp;&nbsp; )
                  </span>
                )}

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
