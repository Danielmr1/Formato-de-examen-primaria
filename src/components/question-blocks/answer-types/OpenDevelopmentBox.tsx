import React, { useRef, useState } from 'react';
import { MoveVertical } from 'lucide-react';
import { DevelopmentBoxStyle, ExamBlock } from '../../../types';

interface OpenDevelopmentBoxProps {
  block: ExamBlock;
  isEditor: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
}

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
          promptHint: block.developmentConfig?.promptHint
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
      <div 
        className="w-full rounded-lg border-2 border-slate-300 relative transition-all overflow-hidden"
        style={{
          height: `${currentHeight}px`,
          ...renderBackgroundStyle()
        }}
      >
        {block.developmentConfig?.promptHint && (
          <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-medium select-none pointer-events-none bg-white/80 px-1.5 py-0.5 rounded">
            {block.developmentConfig.promptHint}
          </div>
        )}

        {/* Resizer Handle */}
        {isEditor && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute bottom-0 inset-x-0 h-3 bg-slate-200/80 hover:bg-indigo-500 hover:text-white flex items-center justify-center cursor-row-resize transition-colors print:hidden ${
              isResizing ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
            title="Arrastra para cambiar la altura del espacio de respuesta"
          >
            <MoveVertical className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    </div>
  );
};
