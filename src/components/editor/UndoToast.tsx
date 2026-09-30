import React from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { UndoAction } from '../../hooks/useExamState';

interface UndoToastProps {
  notification: string | null;
  undoItem: UndoAction | null;
  onClearUndo: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  notification,
  undoItem,
  onClearUndo
}) => {
  if (!notification && !undoItem) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 print:hidden">
      {notification ? (
        <>
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </>
      ) : undoItem ? (
        <>
          <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{undoItem.message}</span>
          <button
            type="button"
            onClick={() => {
              undoItem.onUndo();
              onClearUndo();
            }}
            className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Deshacer</span>
          </button>
          <button
            type="button"
            onClick={onClearUndo}
            className="p-0.5 text-slate-400 hover:text-white rounded cursor-pointer"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
};
