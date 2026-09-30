import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { ExamBlock, FigureData, FigurePosition } from '../../types';
import { sanitizeSvg } from '../../utils/securitySanitizer';

interface BlockFigureProps {
  block: ExamBlock;
  isEditor: boolean;
  isSide: boolean;
  onUpdateBlock: (updated: Partial<ExamBlock>) => void;
  onOpenDiagramModal?: (blockId: string) => void;
}

export const BlockFigure: React.FC<BlockFigureProps> = ({
  block,
  isEditor,
  isSide,
  onUpdateBlock,
  onOpenDiagramModal
}) => {
  if (!block.figure) return null;

  const currentW = block.figure.widthPercent || (isSide ? 45 : 80);

  const handleUpdateFigure = (updated: Partial<FigureData>) => {
    if (!block.figure) return;
    onUpdateBlock({
      figure: { ...block.figure, ...updated }
    });
  };

  const handleRemoveFigure = () => {
    onUpdateBlock({ figure: undefined });
  };

  return (
    <div
      className={`relative group/figure transition-all flex flex-col items-center select-none ${
        isSide ? 'w-full my-auto' : 'my-1'
      }`}
      style={{
        width: isSide ? '100%' : (block.figure.position === 'full' ? '100%' : `${currentW}%`),
        margin: isSide ? '0' : '0 auto'
      }}
    >
      {/* Visual Render (SVG or Image) */}
      {block.figure.svgData ? (
        <div 
          className="w-full flex items-center justify-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(block.figure.svgData) }}
        />
      ) : block.figure.url ? (
        <img 
          src={block.figure.url} 
          alt={block.figure.caption || ''} 
          className="w-full h-auto object-contain rounded block"
          style={{
            maxHeight: isSide ? '360px' : '480px'
          }}
        />
      ) : null}

      {/* Caption */}
      {block.figure.caption && (
        <span className="text-[10px] text-slate-500 italic mt-0.5 text-center">
          {block.figure.caption}
        </span>
      )}

      {/* Editor Controls Overlay */}
      {isEditor && (
        <div className="absolute top-1 right-1 opacity-0 group-hover/figure:opacity-100 transition-opacity bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-300 shadow-md flex items-center gap-1 z-30 print:hidden">
          {/* Position Selector */}
          <select
            value={block.figure.position || 'right'}
            onChange={(e) => handleUpdateFigure({ position: e.target.value as FigurePosition })}
            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1 py-0.5"
            title="Cambiar posición de la figura"
          >
            <option value="right">Derecha</option>
            <option value="left">Izquierda</option>
            <option value="top">Arriba</option>
            <option value="bottom">Abajo</option>
            <option value="full">Ancho completo</option>
          </select>

          {/* Change Figure Button */}
          {onOpenDiagramModal && (
            <button
              type="button"
              onClick={() => onOpenDiagramModal(block.id)}
              className="p-1 hover:bg-indigo-50 text-indigo-600 rounded cursor-pointer"
              title="Cambiar o editar figura en la biblioteca"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Figure Button */}
          <button
            type="button"
            onClick={handleRemoveFigure}
            className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
            title="Quitar figura"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
