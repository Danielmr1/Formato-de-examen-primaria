import React, { useState, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  Sparkles, 
  Sliders, 
  Eye, 
  Edit3, 
  RefreshCw,
  AlertTriangle,
  Maximize2
} from 'lucide-react';
import { PRESET_DIAGRAMS, PresetDiagram } from '../data/sampleFigures';
import { FigureData, FigurePosition } from '../types';
import { EDITABLE_TEMPLATES, EditableDiagramTemplate } from '../utils/diagramGenerators';
import { 
  optimizeImage, 
  validateImageFile, 
  measureImageAspect, 
  padImageToSafeRatio 
} from '../utils/imageOptimizer';
import { sanitizeSvg } from '../utils/securitySanitizer';

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
  // Main view mode: 'editor' (parametric live editor) | 'gallery' (preset cards) | 'upload' (own image/URL)
  const [activeTab, setActiveTab] = useState<'editor' | 'gallery' | 'upload'>('editor');
  
  // Customization parameters state
  const [selectedTemplate, setSelectedTemplate] = useState<EditableDiagramTemplate>(EDITABLE_TEMPLATES[0]);
  const [templateParams, setTemplateParams] = useState<Record<string, any>>(EDITABLE_TEMPLATES[0].defaultParams);

  // General Figure settings
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [position, setPosition] = useState<FigurePosition>('right');
  const [widthPercent, setWidthPercent] = useState<number>(45);

  // Guardrails de imagen: validación de tamaño (máx 5MB) y proporción
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aspectWarning, setAspectWarning] = useState<{ message: string; extremeType?: 'too_wide' | 'too_tall' | 'too_small' } | null>(null);
  const [isPaddingImage, setIsPaddingImage] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setUploadError(null);
      setAspectWarning(null);
      setIsPaddingImage(false);

      if (currentFigure) {
        setCaption(currentFigure.caption || '');
        setPosition(currentFigure.position || 'right');
        setWidthPercent(currentFigure.widthPercent || 50);
        if (currentFigure.url) {
          setCustomImageUrl(currentFigure.url);
          setUploadedPreviewUrl(currentFigure.url);
          setUploadedFileName('Imagen actual');
          setUploadedFileSize(null);
          setActiveTab('upload');
        } else {
          setUploadedPreviewUrl(null);
          setUploadedFileName(null);
          setUploadedFileSize(null);
          setActiveTab('editor');
        }
      } else {
        setCustomImageUrl('');
        setUploadedPreviewUrl(null);
        setUploadedFileName(null);
        setUploadedFileSize(null);
        setCaption('');
        setPosition('right');
        setWidthPercent(45);
        setActiveTab('editor');
      }
    }
  }, [isOpen, currentFigure]);

  if (!isOpen) return null;

  const categories = ['Todos', 'Geometría', 'Estadística', 'Diagramas', 'Física', 'Ciencias'];

  const handleSelectTemplate = (tpl: EditableDiagramTemplate) => {
    setSelectedTemplate(tpl);
    setTemplateParams({ ...tpl.defaultParams });
  };

  const handleParamChange = (key: string, value: any) => {
    setTemplateParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetParams = () => {
    setTemplateParams({ ...selectedTemplate.defaultParams });
  };

  // Generate the current SVG from the live editor
  const liveSvg = selectedTemplate.generateSvg(templateParams);

  const handleApplyEditedDiagram = () => {
    onSelectDiagram({
      svgData: sanitizeSvg(liveSvg),
      caption: caption.trim() || undefined,
      position: position,
      widthPercent: widthPercent
    });
    onClose();
  };

  const handleApplyPreset = (diagram: PresetDiagram) => {
    // Check if there is an editable template with a matching category/id
    const matched = EDITABLE_TEMPLATES.find(t => t.name.toLowerCase().includes(diagram.name.toLowerCase()) || t.id.includes(diagram.id));
    if (matched) {
      setSelectedTemplate(matched);
      setTemplateParams({ ...matched.defaultParams });
      setActiveTab('editor');
    } else {
      onSelectDiagram({
        svgData: sanitizeSvg(diagram.svg),
        caption: caption.trim() || undefined,
        position: position,
        widthPercent: widthPercent
      });
      onClose();
    }
  };

  const handleUrlChange = async (val: string) => {
    setCustomImageUrl(val);
    setUploadError(null);
    setAspectWarning(null);

    if (val.trim()) {
      setUploadedPreviewUrl(val.trim());
      setUploadedFileName('Enlace Web');
      setUploadedFileSize(null);

      // Evaluar proporción de aspecto si es imagen web
      try {
        const aspect = await measureImageAspect(val.trim());
        if (aspect.warning) {
          setAspectWarning({ message: aspect.warning, extremeType: aspect.extremeType });
        }
      } catch (err) {
        console.warn('No se pudo verificar proporción de la URL:', err);
      }
    } else {
      setUploadedPreviewUrl(null);
      setUploadedFileName(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    setAspectWarning(null);

    if (file) {
      // 1. Guardrail de validación previa: Máximo 5 MB y formato permitido
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'Archivo inválido');
        setUploadedPreviewUrl(null);
        setUploadedFileName(null);
        setUploadedFileSize(null);
        return;
      }

      // 2. Medir relación de aspecto (ancho vs alto)
      measureImageAspect(file).then(aspect => {
        if (aspect.warning) {
          setAspectWarning({ message: aspect.warning, extremeType: aspect.extremeType });
        }
      }).catch(console.warn);

      // 3. Lectura inmediata para miniatura
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawUrl = event.target?.result as string;
        setUploadedPreviewUrl(rawUrl);
        setUploadedFileName(file.name);
        setUploadedFileSize(`${Math.round(file.size / 1024)} KB`);
        setCustomImageUrl('');

        // 4. Optimización y compresión ligera en segundo plano
        try {
          const optimized = await optimizeImage(file, 950, 0.82);
          setUploadedPreviewUrl(optimized.dataUrl);
          setUploadedFileSize(`${optimized.originalSizeKb} KB → ${optimized.optimizedSizeKb} KB optimizado`);
        } catch (err: any) {
          console.warn('Compresión en canvas no requerida o falló:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Ajusta la imagen centrada sobre un lienzo con marco blanco equilibrado
  const handleAutoPadImage = async () => {
    if (!uploadedPreviewUrl) return;
    setIsPaddingImage(true);
    try {
      const padded = await padImageToSafeRatio(uploadedPreviewUrl);
      setUploadedPreviewUrl(padded);
      setAspectWarning(null);
      setUploadedFileName(prev => prev ? `${prev} (ajustada con marco blanco)` : 'Imagen ajustada');
    } catch (err) {
      console.error('Error al centrar imagen:', err);
    } finally {
      setIsPaddingImage(false);
    }
  };

  const handleConfirmUploadImage = () => {
    const finalUrl = uploadedPreviewUrl || customImageUrl.trim();
    if (!finalUrl) return;
    onSelectDiagram({
      url: finalUrl,
      caption: caption.trim() || undefined,
      position: position,
      widthPercent: widthPercent
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Insertar Figura o Imagen
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 px-5 bg-white text-xs font-bold gap-2 pt-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Figuras Editables</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Plantillas</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir Imagen</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          
          {/* Global Layout Options (Always accessible) */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-[11px]">Ubicación en la pregunta:</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as FigurePosition)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="right">Derecha</option>
                <option value="left">Izquierda</option>
                <option value="bottom">Debajo</option>
                <option value="top">Arriba</option>
                <option value="full">Ancho completo</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 text-[11px]">
                  Tamaño de figura:
                </label>
                <span className="text-indigo-600 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">{widthPercent}%</span>
              </div>
              <div className="flex items-center gap-1">
                {[30, 45, 60, 80, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setWidthPercent(val)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded border cursor-pointer ${
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
              <label className="block font-bold text-slate-700 mb-1 text-[11px]">Pie de figura (Opcional):</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ej: Figura 1. Hallar el valor de x"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* TAB 1: LIVE PARAMETRIC EDITOR */}
          {activeTab === 'editor' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Column: Template Selector & Form Fields */}
              <div className="md:col-span-6 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
                
                {/* Select Type of Diagram */}
                <div>
                  <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">
                    Figura:
                  </label>
                  <select
                    value={selectedTemplate.id}
                    onChange={(e) => {
                      const found = EDITABLE_TEMPLATES.find(t => t.id === e.target.value);
                      if (found) handleSelectTemplate(found);
                    }}
                    className="w-full bg-indigo-50/60 border border-indigo-200 rounded-lg px-3 py-2 text-slate-900 font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {EDITABLE_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        [{tpl.category}] {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Fields to Customize Values */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Parámetros:
                    </span>
                    <button
                      type="button"
                      onClick={handleResetParams}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      title="Restaurar valores por defecto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restablecer</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.key} className="text-xs">
                        <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                          {field.label}:
                        </label>
                        {field.type === 'boolean' ? (
                          <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              checked={!!templateParams[field.key]}
                              onChange={(e) => handleParamChange(field.key, e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 accent-indigo-600"
                            />
                            <span className="text-slate-700 text-xs">Activar / Mostrar</span>
                          </label>
                        ) : (
                          <input
                            type="text"
                            value={templateParams[field.key] ?? ''}
                            onChange={(e) => handleParamChange(field.key, e.target.value)}
                            placeholder={field.placeholder || ''}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-colors"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Live SVG Preview & Insert Button */}
              <div className="md:col-span-6 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      Vista Previa:
                    </span>
                  </div>

                  {/* SVG Canvas Box */}
                  <div className="w-full h-56 bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                    <div 
                      className="w-full h-full flex items-center justify-center max-w-[280px]"
                      dangerouslySetInnerHTML={{ __html: liveSvg }}
                    />
                  </div>
                </div>

                {/* Confirm Action Button */}
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={handleApplyEditedDiagram}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Insertar Figura</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GALLERY OF PRESETS */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Seleccionar plantilla:
                </span>

                {/* Category filter pills */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of preset diagrams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(selectedCategory === 'Todos' 
                  ? PRESET_DIAGRAMS 
                  : PRESET_DIAGRAMS.filter(d => d.category === selectedCategory)
                ).map((diag) => {
                  const editableMatch = EDITABLE_TEMPLATES.find(
                    t => t.id === diag.id || t.name.toLowerCase().includes(diag.name.toLowerCase())
                  );

                  return (
                    <div
                      key={diag.id}
                      className="border border-slate-200 hover:border-indigo-500 rounded-xl p-3 bg-white hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="w-full h-32 flex items-center justify-center bg-slate-50 rounded-lg p-2 overflow-hidden mb-2 group-hover:bg-indigo-50/40 transition-colors">
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: diag.svg }}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase block">{diag.category}</span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1 mb-2">{diag.name}</span>
                        
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                          {editableMatch ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTemplate(editableMatch);
                                setTemplateParams({ ...editableMatch.defaultParams });
                                setActiveTab('editor');
                              }}
                              className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar Datos</span>
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleApplyPreset(diag)}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Insertar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD OWN IMAGE OR URL */}
          {activeTab === 'upload' && (
            <div className="border border-slate-200 bg-white rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Cargar archivo o pegar enlace</span>
              </div>

              {/* Upload Input Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 hover:border-indigo-600 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-xl p-5 cursor-pointer transition-all">
                  <Upload className="w-7 h-7 text-indigo-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">
                    Seleccionar imagen
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 text-center">
                    PNG, JPG, SVG o WebP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = '';
                    }}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex flex-col justify-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">O pegar enlace web (URL):</label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/grafico.png"
                    value={customImageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Alerta de Error de Subida (ej. > 5 MB o formato no permitido) */}
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-semibold">{uploadError}</div>
                </div>
              )}

              {/* Alerta de Proporción de Aspecto Excesiva con Botón de Auto-Ajuste */}
              {aspectWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-900">Aviso de formato de imagen:</span>
                      <span className="text-[11px] text-amber-800">{aspectWarning.message}</span>
                    </div>
                  </div>

                  {(aspectWarning.extremeType === 'too_wide' || aspectWarning.extremeType === 'too_tall') && (
                    <button
                      type="button"
                      onClick={handleAutoPadImage}
                      disabled={isPaddingImage}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                      title="Centrar la imagen en un lienzo cuadrado con fondo blanco para que encaje bien en la hoja"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{isPaddingImage ? 'Ajustando...' : 'Ajustar con marco blanco'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* MINIATURA Y VISTA PREVIA DE LA IMAGEN CARGADA */}
              {uploadedPreviewUrl ? (
                <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/80 p-4 rounded-xl border border-slate-200 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      Vista previa:
                    </span>
                    {uploadedFileName && (
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-xs">
                        {uploadedFileName} {uploadedFileSize ? `• ${uploadedFileSize}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Card Preview */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <div className="w-full sm:w-64 h-44 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center p-2 overflow-hidden shrink-0">
                      <img 
                        src={uploadedPreviewUrl} 
                        alt="Miniatura cargada" 
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-end h-full py-1 text-xs space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleConfirmUploadImage}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
                        >
                          <Check className="w-4 h-4" />
                          <span>Insertar imagen</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUploadedPreviewUrl(null);
                            setUploadedFileName(null);
                            setUploadedFileSize(null);
                            setCustomImageUrl('');
                            setUploadError(null);
                            setAspectWarning(null);
                            setIsPaddingImage(false);
                          }}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
