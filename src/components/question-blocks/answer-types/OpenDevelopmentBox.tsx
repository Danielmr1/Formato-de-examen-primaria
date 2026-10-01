import React, { useRef, useState } from 'react';
import { MoveVertical, Grid, AlignJustify, Square, CircleDot } from 'lucide-react';
import { DevelopmentBoxStyle, ExamBlock } from '../../../types';

interface OpenDevelopmentBoxProps {
  block: ExamBlock;
  isEditor: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
}

const STYLE_OPTIONS: { id: DevelopmentBoxStyle; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'grid', label: 'Cuadrícula', icon: Grid },
  { id: 'lines', label: 'Rayado', icon: AlignJustify },
  { id: 'blank', label: 'Espacio libre', icon: Square },
  { id: 'dotted', label: 'Punteado', icon: CircleDot },
];

export const OpenDevelopmentBox: React.FC<OpenDevelopmentBoxProps> = ({
  block,
  isEditor,
  onUpdateBlock
}) => {
  const currentStyle: DevelopmentBoxStyle = block.developmentConfig?.style || 'grid';
  const currentHeight = block.developmentConfig?.heightPx || 120;
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = moveEvent.clientY - startYRef.current;
      const newHeight = Math.max(50, Math.min(600, startHeightRef.current + delta));
      onUpdateBlock({
        developmentConfig: {
          style: currentStyle,
          heightPx: newHeight,
        }
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleChangeStyle = (newStyle: DevelopmentBoxStyle) => {
    onUpdateBlock({
      developmentConfig: {
        style: newStyle,
        heightPx: currentHeight,
      }
    });
  };

  const renderBackgroundStyle = () => {
    switch (currentStyle) {
      case 'grid':
        return {
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundColor: '#f8fafc'
        };
      case 'lines':
        return {
          backgroundImage: 'linear-gradient(to bottom, transparent 27px, #cbd5e1 28px)',
          backgroundSize: '100% 28px',
          backgroundColor: '#ffffff'
        };
      case 'dotted':
        return {
          backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
          backgroundColor: '#f8fafc'
        };
      case 'blank':
      default:
        return {
          backgroundColor: '#ffffff'
        };
    }
  };

  return (
    <div className="mt-1 flex flex-col">
      {/* Selector de tipo de espacio (Cuadrícula / Rayado / Espacio libre / Punteado) */}
      {isEditor && (
        <div className="flex items-center justify-between pb-1.5 text-[11px] print:hidden select-none">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {STYLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = currentStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleChangeStyle(opt.id)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Formato: ${opt.label}`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden xs:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] text-slate-400 font-medium">
            {currentHeight}px
          </span>
        </div>
      )}

      {/* Caja de Resolución Limpia (sin marcas de agua) */}
      <div 
        className={`w-full rounded-lg border-2 border-slate-300 relative transition-all overflow-hidden development-grid-box development-grid-${currentStyle}`}
        style={{
          height: `${currentHeight}px`,
          ...renderBackgroundStyle()
        }}
      >
        {/* Resizer Handle */}
        {isEditor && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute bottom-0 inset-x-0 h-3 bg-slate-200/80 hover:bg-indigo-500 hover:text-white flex items-center justify-center cursor-row-resize transition-colors print:hidden ${
              isResizing ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
            title="Arrastra verticalmente para cambiar la altura del espacio de respuesta"
          >
            <MoveVertical className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    </div>
  );
};
