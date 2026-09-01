import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, Check, Sparkles, Folder } from 'lucide-react';
import { PRESET_DIAGRAMS, PresetDiagram } from '../data/sampleFigures';
import { FigureData, FigurePosition } from '../types';

interface DiagramLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDiagram: (figure: FigureData) => void;
  currentBlockId?: string;
  currentFigure?: FigureData;
}

export const DiagramLibraryModal: React.FC<DiagramLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectDiagram,
  currentFigure,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [position, setPosition] = useState<FigurePosition>('right');
  const [widthPercent, setWidthPercent] = useState<number>(45);

  useEffect(() => {
    if (isOpen) {
      if (currentFigure) {
        setCaption(currentFigure.caption || '');
        setPosition(currentFigure.position || 'right');
        setWidthPercent(currentFigure.widthPercent || 50);
        if (currentFigure.url) {
          setCustomImageUrl(currentFigure.url);
        } else {
          setCustomImageUrl('');
        }
      } else {
        setCustomImageUrl('');
        setCaption('');
        setPosition('right');
        setWidthPercent(45);
      }
    }
  }, [isOpen, currentFigure]);

  if (!isOpen) return null;

  const categories = ['Todos', 'Geometría', 'Ciencias', 'Estadística', 'Física', 'Diagramas'];

  const filteredDiagrams = selectedCategory === 'Todos'
    ? PRESET_DIAGRAMS
    : PRESET_DIAGRAMS.filter(d => d.category === selectedCategory);

  const handleApplyPreset = (diagram: PresetDiagram) => {
    onSelectDiagram({
      svgData: diagram.svg,
      caption: caption.trim() || undefined,
      position: position,
      widthPercent: widthPercent
    });
    onClose();
  };

  const handleApplyCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    onSelectDiagram({
      url: customImageUrl.trim(),
      caption: caption.trim() || undefined,
      position: position,
      widthPercent: widthPercent
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onSelectDiagram({
          url: result,
          caption: caption.trim() || undefined,
          position: position,
          widthPercent: widthPercent
        });
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Insertar Figura o Gráfico</h3>
              <p className="text-xs text-slate-500">Selecciona un diagrama vectorial educativo o sube tu propia imagen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Settings & Gallery */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Position & Size Configuration */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Disposición en la pregunta:</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as FigurePosition)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="right">Al lado derecho (Recomendado)</option>
                <option value="left">Al lado izquierdo</option>
                <option value="top">Arriba del texto</option>
                <option value="bottom">Debajo del texto</option>
                <option value="full">Centrado completo</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">
                  Ancho de la figura:
                </label>
                <span className="text-indigo-600 font-extrabold bg-indigo-100 px-1.5 py-0.5 rounded">{widthPercent}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={widthPercent}
                onChange={(e) => setWidthPercent(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-1"
              />
              <div className="flex items-center gap-1 mt-1.5">
                {[30, 45, 60, 80, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setWidthPercent(val)}
                    className={`flex-1 py-0.5 text-[10px] font-bold rounded border ${
                      widthPercent === val 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pie de figura / Leyenda:</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Opcional (dejar vacío para no mostrar leyenda)..."
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              {currentFigure && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectDiagram({
                      ...currentFigure,
                      caption: caption.trim() || undefined,
                      position,
                      widthPercent,
                    });
                    onClose();
                  }}
                  className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar Cambios</span>
                </button>
              )}
            </div>
          </div>

          {/* Option A: Upload Custom Image or URL */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              Opción 1: Subir imagen propia desde el equipo o URL
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 rounded-xl p-4 cursor-pointer transition-all">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">Subir imagen (PNG, JPG, SVG)</span>
                <span className="text-[10px] text-slate-500">Arrastra o haz clic aquí</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex flex-col justify-between">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">O pegar enlace de imagen Web:</label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/grafico.png"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={handleApplyCustomUrl}
                  disabled={!customImageUrl.trim()}
                  className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Usar Imagen desde URL
                </button>
              </div>
            </div>
          </div>

          {/* Option B: Preset Diagram Library */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Opción 2: Galería de Diagramas Educativos
              </h4>

              {/* Category pills */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Diagrams */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredDiagrams.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => handleApplyPreset(diag)}
                  className="border border-slate-200 hover:border-indigo-500 rounded-xl p-3 bg-white hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between"
                >
                  <div className="w-full h-32 flex items-center justify-center bg-slate-50 rounded-lg p-2 overflow-hidden mb-2 group-hover:bg-indigo-50/40 transition-colors">
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: diag.svg }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block">{diag.category}</span>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{diag.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
