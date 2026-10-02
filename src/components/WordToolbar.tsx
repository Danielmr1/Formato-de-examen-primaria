import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calculator, 
  SlidersHorizontal, 
  Grid, 
  Upload, 
  Trash2, 
  AlignJustify,
  Type,
  Square,
  Check,
  FileText,
  CheckSquare,
  ArrowLeftRight
} from 'lucide-react';
import { BlockWidth, ExamDocument, QuestionType } from '../types';
import { optimizeImage } from '../utils/imageOptimizer';

interface WordToolbarProps {
  exam: ExamDocument;
  onAddBlock: (width: BlockWidth, type: QuestionType, withFigure?: boolean) => void;
  onOpenDiagramModal?: () => void;
  onInsertMathSymbol: (symbol: string) => void;
  onUpdateSettings: (settings: Partial<ExamDocument['settings']>) => void;
  onUpdateHeader?: (header: Partial<ExamDocument['header']>) => void;
}

export const WordToolbar: React.FC<WordToolbarProps> = ({
  exam,
  onAddBlock,
  onOpenDiagramModal,
  onInsertMathSymbol,
  onUpdateSettings,
  onUpdateHeader,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'math' | 'layout'>('blocks');

  const mathSymbols = ['π', '√', '²', '³', '±', '∑', '∫', 'θ', 'α', 'β', 'γ', 'Δ', 'λ', 'μ', 'Ω', '°', '≠', '≤', '≥', '≈', '∞', '→', '↔', '∈', '⊂'];

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs print:hidden">
      {/* Hidden file input for logo */}
      <input
        type="file"
        id="toolbar-logo-file-input"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && onUpdateHeader) {
            try {
              const opt = await optimizeImage(file, 400, 0.85);
              onUpdateHeader({ logoUrl: opt.dataUrl });
            } catch (err) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const result = event.target?.result as string;
                onUpdateHeader({ logoUrl: result });
              };
              reader.readAsDataURL(file);
            }
          }
        }}
      />
      {/* Ribbon Tab Headers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between border-b border-slate-100 text-xs gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'blocks'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insertar Contenido</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'layout'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Diseño de Hoja</span>
          </button>

          <button
            onClick={() => setActiveTab('math')}
            className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'math'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Fórmulas & Símbolos</span>
          </button>
        </div>

        {/* Active Sheet Format Summary Badge */}
        <div className="hidden md:flex items-center gap-2 py-1 text-[11px] text-slate-500 font-medium select-none">
          <span className="px-2 py-0.5 rounded-md bg-indigo-50/80 border border-indigo-200/80 font-bold text-indigo-700 tracking-wide text-[10px]">
            {exam.settings.paperSize === 'a5_2in1'
              ? 'A5 (2 en 1)'
              : exam.settings.paperSize === 'a5_single'
              ? 'A5'
              : 'A4'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">
            {exam.settings.fontFamily === 'serif' ? 'Serif' : exam.settings.fontFamily === 'mono' ? 'Mono' : 'Sans'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">
            {exam.settings.baseFontSize === 'sm' ? '10pt' : exam.settings.baseFontSize === 'lg' ? '12.5pt' : '11pt'}
          </span>
        </div>
      </div>

      {/* Ribbon Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        {activeTab === 'blocks' && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Preguntas */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 hidden sm:inline">
                + Pregunta:
              </span>

              {/* Opción Múltiple */}
              <button
                type="button"
                onClick={() => onAddBlock(6, 'multiple_choice', false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-bold transition-all shadow-2xs cursor-pointer"
                title="Añadir pregunta con alternativas A, B, C, D"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Opción Múltiple</span>
              </button>

              {/* Verdadero / Falso */}
              <button
                type="button"
                onClick={() => onAddBlock(6, 'true_false', false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-all shadow-2xs cursor-pointer"
                title="Añadir afirmaciones para responder V o F"
              >
                <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>Verdadero / Falso</span>
              </button>

              {/* Desarrollo */}
              <button
                type="button"
                onClick={() => onAddBlock(12, 'open_development', false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-all shadow-2xs cursor-pointer"
                title="Espacio para desarrollo (Rayado, Cuadrícula o Libre)"
              >
                <Grid className="w-3.5 h-3.5 text-emerald-600" />
                <span>Desarrollo</span>
              </button>

              {/* Relacionar Columnas */}
              <button
                type="button"
                onClick={() => onAddBlock(12, 'matching', false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-all shadow-2xs cursor-pointer"
                title="Unir conceptos con flechas"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600" />
                <span>Relacionar</span>
              </button>

              {/* Solo Enunciado */}
              <button
                type="button"
                onClick={() => onAddBlock(6, 'statement_only', false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-all shadow-2xs cursor-pointer"
                title="Pregunta con solo enunciado (sin caja de respuesta)"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Solo Enunciado</span>
              </button>
            </div>

            {/* Elementos adicionales */}
            <div className="flex items-center gap-1.5">
              {/* Subir Logo de Colegio */}
              <button
                type="button"
                onClick={() => document.getElementById('toolbar-logo-file-input')?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-all cursor-pointer"
                title="Cargar insignia del colegio"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>{exam.header.logoUrl ? 'Cambiar Logo' : 'Logo Colegio'}</span>
              </button>
              {exam.header.logoUrl && onUpdateHeader && (
                <button
                  type="button"
                  onClick={() => onUpdateHeader({ logoUrl: '' })}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  title="Quitar logo del colegio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'math' && (
          <div className="flex flex-col gap-2 text-xs py-1">
            {/* Fila 1: Símbolos matemáticos */}
            <div className="flex items-center gap-2 overflow-x-auto text-slate-700 pb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 whitespace-nowrap">
                Símbolos:
              </span>
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {mathSymbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => onInsertMathSymbol(sym)}
                    className="w-7 h-7 flex items-center justify-center font-mono font-bold text-slate-800 hover:bg-indigo-600 hover:text-white rounded text-sm transition-colors cursor-pointer"
                    title={`Insertar ${sym}`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Fila 2: Números Mixtos Rápidos a la izquierda y Constructor a la derecha en la misma fila */}
            <div className="flex items-center gap-3 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 overflow-x-auto">
              {/* Izquierda: Números Mixtos Rápidos */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 whitespace-nowrap">
                  Números Mixtos:
                </span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-indigo-100 shadow-2xs">
                  {['1 ½', '2 ¼', '3 ½', '2 ¾', '1 ⅓', '2 ⅔', '3 ⅖', '4 ⅛'].map((mix) => (
                    <button
                      key={mix}
                      type="button"
                      onClick={() => onInsertMathSymbol(mix)}
                      className="px-2 py-0.5 flex items-center justify-center font-bold text-indigo-900 hover:bg-indigo-600 hover:text-white rounded text-xs transition-colors cursor-pointer"
                      title={`Insertar número mixto ${mix}`}
                    >
                      {mix}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separador vertical */}
              <div className="h-6 w-px bg-slate-300/80 shrink-0" />

              {/* Derecha: Constructor de Número Mixto */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                  Constructor:
                </span>
                <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs">
                  <input
                    id="mixed-whole"
                    type="number"
                    defaultValue="3"
                    className="w-7 text-center font-bold text-slate-900 border-b border-slate-300 focus:border-indigo-600 focus:outline-hidden text-xs"
                    placeholder="Ent."
                    title="Parte entera"
                  />
                  <div className="flex flex-col items-center">
                    <input
                      id="mixed-num"
                      type="number"
                      defaultValue="1"
                      className="w-6 text-center font-bold text-slate-900 border-b border-slate-400 focus:border-indigo-600 focus:outline-hidden text-[10px] pb-0.5 leading-none"
                      placeholder="Num"
                      title="Numerador"
                    />
                    <input
                      id="mixed-den"
                      type="number"
                      defaultValue="2"
                      className="w-6 text-center font-bold text-slate-900 focus:border-indigo-600 focus:outline-hidden text-[10px] pt-0.5 leading-none"
                      placeholder="Den"
                      title="Denominador"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const whole = (document.getElementById('mixed-whole') as HTMLInputElement)?.value || '1';
                    const num = (document.getElementById('mixed-num') as HTMLInputElement)?.value || '1';
                    const den = (document.getElementById('mixed-den') as HTMLInputElement)?.value || '2';
                    onInsertMathSymbol(`${whole} ${num}/${den}`);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  title="Insertar en enunciado"
                >
                  Insertar
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="flex flex-col gap-2 text-xs py-1">
            {/* FILA 1: Formato de Hoja + Tipografía */}
            <div className="flex items-stretch gap-3 md:gap-4 flex-wrap">
              {/* GRUPO 0: FORMATO DE HOJA */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-200 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-500" />
                  Formato de Hoja
                </span>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ paperSize: 'a4' })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        exam.settings.paperSize === 'a4' || !exam.settings.paperSize
                          ? 'bg-white text-indigo-700 shadow-2xs ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Hoja A4 estándar completa (210 × 297 mm)"
                    >
                      A4 Estándar
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ paperSize: 'a5_2in1' })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        exam.settings.paperSize === 'a5_2in1'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="A5 (2 en 1 A4 horizontal): Imprime 2 copias con línea de corte en medio. Ahorra 50% de papel."
                    >
                      <span>A5 (2 en 1 A4)</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                        exam.settings.paperSize === 'a5_2in1' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        50% papel
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ paperSize: 'a5_single' })}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        exam.settings.paperSize === 'a5_single'
                          ? 'bg-white text-indigo-700 shadow-2xs ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="A5 Individual (148 × 210 mm) para papel cortado en media hoja"
                    >
                      A5 Individual
                    </button>
                  </div>
                </div>
              </div>

              {/* GRUPO 1: TIPOGRAFÍA */}
              <div className="flex flex-col gap-1 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Type className="w-3 h-3 text-slate-500" />
                  Tipografía
                </span>

                <div className="flex items-center gap-2">
                  {/* Selector de Fuente */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-medium px-1.5 text-[11px]">Fuente:</span>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: 'sans' })}
                      className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                        exam.settings.fontFamily === 'sans'
                          ? 'bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Tipografía Moderna (Sans-Serif)"
                    >
                      Sans
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: 'serif' })}
                      className={`px-2 py-0.5 rounded text-xs font-serif transition-all cursor-pointer ${
                        exam.settings.fontFamily === 'serif'
                          ? 'bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Tipografía Académica (Serif)"
                    >
                      Serif
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: 'mono' })}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition-all cursor-pointer ${
                        exam.settings.fontFamily === 'mono'
                          ? 'bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Tipografía Técnica (Monospace)"
                    >
                      Mono
                    </button>
                  </div>

                  {/* Selector de Tamaño */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-medium px-1.5 text-[11px]">Tamaño:</span>
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => onUpdateSettings({ baseFontSize: size })}
                        className={`px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                          exam.settings.baseFontSize === size
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title={`Tamaño de fuente: ${size === 'sm' ? '10pt (Compacto)' : size === 'md' ? '11pt (Normal)' : '12.5pt (Grande)'}`}
                      >
                        {size === 'sm' ? 'Chico' : size === 'md' ? 'Normal' : 'Grande'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FILA 2: Párrafo + Recuadros + Puntaje + Encabezado */}
            <div className="flex items-stretch gap-3 md:gap-4 flex-wrap pt-1.5 border-t border-slate-100">
              {/* GRUPO 2: PÁRRAFO & ESPACIADO */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-200 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <AlignJustify className="w-3 h-3 text-slate-500" />
                  Párrafo & Espaciado
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-medium px-1.5 text-[11px]">Interlineado:</span>
                    {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
                      <button
                        key={spacing}
                        type="button"
                        onClick={() => onUpdateSettings({ lineSpacing: spacing })}
                        className={`px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                          (exam.settings.lineSpacing || 'normal') === spacing
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title={`Interlineado: ${spacing === 'compact' ? '1.0' : spacing === 'normal' ? '1.2' : '1.5'}`}
                      >
                        {spacing === 'compact' ? '1.0' : spacing === 'normal' ? '1.2' : '1.5'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRUPO 3: RECUADROS */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-200 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Square className="w-3 h-3 text-slate-500" />
                  Recuadros
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ showBorders: !exam.settings.showBorders })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer font-semibold ${
                      exam.settings.showBorders
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title="Mostrar u ocultar los bordes de recuadro alrededor de cada ejercicio"
                  >
                    <Square className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bordes en Bloques</span>
                    {exam.settings.showBorders && <Check className="w-3 h-3 text-indigo-600 ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* GRUPO 3.5: CALIFICACIÓN / PUNTAJE */}
              <div className="flex flex-col gap-1 pr-3 border-r border-slate-200 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-slate-500" />
                  Puntaje
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ showPointsInPrint: exam.settings.showPointsInPrint === false ? true : false })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer font-semibold ${
                      exam.settings.showPointsInPrint !== false
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title="Activar o desactivar puntajes en los enunciados y en el examen"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{exam.settings.showPointsInPrint !== false ? 'Puntaje Activo' : 'Sin Puntaje'}</span>
                    {exam.settings.showPointsInPrint !== false && <Check className="w-3 h-3 text-emerald-600 ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* GRUPO 4: ENCABEZADO */}
              {onUpdateHeader && (
                <div className="flex flex-col gap-1 shrink-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-500" />
                    Encabezado
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 font-medium px-1.5 text-[11px]">Estilo:</span>
                      <button
                        type="button"
                        onClick={() => onUpdateHeader({ headerStyle: 'boxed' })}
                        className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                          exam.header.headerStyle !== 'modern'
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Estilo Clásico Institucional con recuadro"
                      >
                        Institucional
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateHeader({ headerStyle: 'modern' })}
                        className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                          exam.header.headerStyle === 'modern'
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold ring-1 ring-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Estilo Moderno sin recuadro pesado"
                      >
                        Moderno
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
