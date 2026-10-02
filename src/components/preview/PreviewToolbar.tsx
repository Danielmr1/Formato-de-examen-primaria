import React from 'react';
import { 
  Printer, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface PreviewToolbarProps {
  totalPages: number;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onReturnToEditor: () => void;
  onPrint: () => void;
  activeView: 'preview_a4' | 'solution_key';
  onSwitchView: (view: 'preview_a4' | 'solution_key') => void;
  paperSize?: string;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  totalPages,
  zoom,
  onZoomChange,
  onReturnToEditor,
  onPrint,
  activeView,
  onSwitchView,
  paperSize = 'a4',
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(130, zoom + 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(50, zoom - 10));
  };

  const handleResetZoom = () => {
    onZoomChange(100);
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-14 z-20 print:hidden transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 flex items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Left: Document Info & Page Count */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold text-slate-200">
              {paperSize === 'a5_2in1' 
                ? 'A5 (2 en 1 A4)' 
                : paperSize === 'a5_single'
                ? 'A5 Individual'
                : 'A4'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {paperSize === 'a5_2in1' 
                ? '(297 × 210 mm)' 
                : paperSize === 'a5_single'
                ? '(148 × 210 mm)'
                : '(210 × 297 mm)'}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800/80 text-indigo-200 font-bold">
            <span>{totalPages} {totalPages === 1 ? 'página estimada' : 'páginas estimadas'}</span>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Reducir zoom (-10%)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 text-xs font-bold text-slate-200 hover:bg-slate-700 rounded transition-colors cursor-pointer min-w-[48px] text-center"
            title="Restablecer escala al 100%"
          >
            {zoom}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 130}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Aumentar zoom (+10%)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-0.5"></div>

          {/* Quick Zoom presets */}
          <button
            type="button"
            onClick={() => onZoomChange(70)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer hidden md:inline ${
              zoom === 70 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Vista reducida de página completa"
          >
            70%
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(100)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer hidden md:inline ${
              zoom === 100 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Escala real 1:1"
          >
            100%
          </button>
        </div>

        {/* Right: Mode Toggles & Print Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Solution key quick toggle in preview */}
          <button
            type="button"
            onClick={() => onSwitchView(activeView === 'preview_a4' ? 'solution_key' : 'preview_a4')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer border ${
              activeView === 'solution_key'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-2xs font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Alternar entre examen en blanco y examen resuelto con claves"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Clave Docente</span>
          </button>

          {/* Print button */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-xs cursor-pointer"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>

          {/* Return to editor button */}
          <button
            type="button"
            onClick={onReturnToEditor}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            title="Regresar al modo de edición de preguntas"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Editar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
