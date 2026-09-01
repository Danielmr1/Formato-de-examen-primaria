import React, { useState } from 'react';
import { 
  Square, 
  RectangleHorizontal, 
  RectangleVertical, 
  Columns2, 
  Image as ImageIcon, 
  BookOpen, 
  Plus, 
  Type, 
  Calculator, 
  CheckSquare, 
  SlidersHorizontal,
  FileQuestion,
  HelpCircle,
  Shapes,
  Grid,
  CheckCircle,
  Hash
} from 'lucide-react';
import { BlockWidth, ExamDocument, QuestionType } from '../types';

interface WordToolbarProps {
  exam: ExamDocument;
  onAddBlock: (width: BlockWidth, type: QuestionType, withFigure?: boolean) => void;
  onOpenDiagramModal: () => void;
  onInsertMathSymbol: (symbol: string) => void;
  onUpdateSettings: (settings: Partial<ExamDocument['settings']>) => void;
}

export const WordToolbar: React.FC<WordToolbarProps> = ({
  exam,
  onAddBlock,
  onOpenDiagramModal,
  onInsertMathSymbol,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'math' | 'layout'>('blocks');

  const mathSymbols = ['π', '√', '²', '³', '±', '∑', '∫', 'θ', 'α', 'β', 'γ', 'Δ', 'λ', 'μ', 'Ω', '°', '≠', '≤', '≥', '≈', '∞', '→', '↔', '∈', '⊂'];

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs print:hidden">
      {/* Ribbon Tab Headers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-b border-slate-100 text-xs">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'blocks'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shapes className="w-3.5 h-3.5" />
          <span>Insertar Bloques Dinámicos</span>
        </button>

        <button
          onClick={() => setActiveTab('math')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'math'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Fórmulas & Símbolos</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'layout'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Diseño de Hoja & Tipografía</span>
        </button>
      </div>

      {/* Ribbon Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        {activeTab === 'blocks' && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            
            {/* Block Shapes section */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden md:inline">
                Formas:
              </span>

              {/* Square / Half Width */}
              <button
                onClick={() => onAddBlock(6, 'multiple_choice', false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition-all group"
                title="Bloque cuadrado o medio ancho (6 columnas de 12)"
              >
                <Square className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>Cuadrado (1/2)</span>
              </button>

              {/* Horizontal Rectangle / Full Width */}
              <button
                onClick={() => onAddBlock(12, 'multiple_choice', false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition-all group"
                title="Rectángulo horizontal ancho (12 columnas de 12)"
              >
                <RectangleHorizontal className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>Rectángulo Ancho (12/12)</span>
              </button>

              {/* Vertical Rectangle / 1/3 Width */}
              <button
                onClick={() => onAddBlock(4, 'multiple_choice', false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition-all group"
                title="Rectángulo vertical o columna estrecha (4 columnas de 12)"
              >
                <RectangleVertical className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>Columna Estrecha (1/3)</span>
              </button>

              {/* 2/3 Width */}
              <button
                onClick={() => onAddBlock(8, 'multiple_choice', false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition-all group"
                title="Bloque ancho principal (8 columnas de 12)"
              >
                <Columns2 className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>Principal (2/3)</span>
              </button>
            </div>

            {/* Special Content Blocks */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden md:inline">
                Especiales:
              </span>

              {/* Question with Figure */}
              <button
                onClick={() => onAddBlock(6, 'multiple_choice', true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 rounded-lg font-semibold transition-all shadow-2xs"
                title="Pregunta con figura gráfica integrada"
              >
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Pregunta + Figura</span>
              </button>

              {/* Math Open Development Box */}
              <button
                onClick={() => onAddBlock(12, 'open_development', false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all"
                title="Bloque con recuadro para desarrollo o líneas"
              >
                <Grid className="w-4 h-4 text-emerald-600" />
                <span>Desarrollo / Cálculo</span>
              </button>

              {/* Reading Passage */}
              <button
                onClick={() => onAddBlock(8, 'reading_passage', false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-700 font-medium transition-all"
                title="Bloque de texto de lectura o comprensión"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Texto Lectura</span>
              </button>
            </div>

            {/* Diagram Library Launcher */}
            <div>
              <button
                onClick={onOpenDiagramModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 rounded-lg font-semibold shadow-xs transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galería de Figuras Educativas</span>
              </button>
            </div>

          </div>
        )}

        {activeTab === 'math' && (
          <div className="flex flex-col gap-2.5 text-xs py-1">
            {/* Top row: Symbols and Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                Símbolos:
              </span>
              <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
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

              {/* Quick Mixed Numbers and Fractions */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mr-1">
                  Números Mixtos Rápidos:
                </span>
                <div className="flex items-center gap-1 bg-indigo-50/60 p-1 rounded-lg border border-indigo-200">
                  {['1 ½', '2 ¼', '3 ½', '2 ¾', '1 ⅓', '2 ⅔', '3 ⅖', '4 ⅛'].map((mix) => (
                    <button
                      key={mix}
                      onClick={() => onInsertMathSymbol(mix)}
                      className="px-2 py-1 flex items-center justify-center font-bold text-indigo-900 bg-white hover:bg-indigo-600 hover:text-white rounded text-xs transition-colors shadow-2xs border border-indigo-100 cursor-pointer"
                      title={`Insertar número mixto ${mix}`}
                    >
                      {mix}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row: Mixed Number Builder & Helper tips */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-900 text-xs">
                  Constructor de Número Mixto:
                </span>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
                  <input
                    id="mixed-whole"
                    type="number"
                    defaultValue="3"
                    className="w-8 text-center font-bold text-slate-900 border-b border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                    placeholder="Ent."
                    title="Parte entera"
                  />
                  <div className="flex flex-col items-center">
                    <input
                      id="mixed-num"
                      type="number"
                      defaultValue="1"
                      className="w-7 text-center font-bold text-slate-900 border-b border-slate-400 focus:border-indigo-600 focus:outline-hidden text-[10px] pb-0.5"
                      placeholder="Num"
                      title="Numerador"
                    />
                    <input
                      id="mixed-den"
                      type="number"
                      defaultValue="2"
                      className="w-7 text-center font-bold text-slate-900 focus:border-indigo-600 focus:outline-hidden text-[10px] pt-0.5"
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
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Insertar en Enunciado
                </button>
              </div>

              <div className="ml-auto text-[11px] text-slate-600 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Sintaxis directa:
                </span>
                <span>
                  Escribe en el enunciado <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono font-bold text-indigo-700">3 1/2</code> o <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono font-bold text-indigo-700">3\frac&#123;1&#125;&#123;2&#125;</code> y se formateará automáticamente con barra de fracción.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Font Family */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Tipografía:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => onUpdateSettings({ fontFamily: 'sans' })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    exam.settings.fontFamily === 'sans' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Moderna (Sans)
                </button>
                <button
                  onClick={() => onUpdateSettings({ fontFamily: 'serif' })}
                  className={`px-2.5 py-1 rounded text-xs font-serif font-medium transition-colors ${
                    exam.settings.fontFamily === 'serif' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Académica (Serif)
                </button>
                <button
                  onClick={() => onUpdateSettings({ fontFamily: 'mono' })}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    exam.settings.fontFamily === 'mono' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Técnica (Mono)
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Tamaño Texto:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ baseFontSize: size })}
                    className={`px-2.5 py-1 rounded text-xs uppercase font-medium transition-colors ${
                      exam.settings.baseFontSize === size ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    {size === 'sm' ? 'Compacto' : size === 'md' ? 'Normal' : 'Grande'}
                  </button>
                ))}
              </div>
            </div>

            {/* Borders Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={exam.settings.showBorders}
                  onChange={(e) => onUpdateSettings({ showBorders: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Bordes en Bloques</span>
              </label>
            </div>

            {/* Justify text toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700" title="Justificar texto de los enunciados de las preguntas">
                <input
                  type="checkbox"
                  checked={!!exam.settings.statementJustify}
                  onChange={(e) => onUpdateSettings({ statementJustify: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-indigo-900">Justificar Enunciados</span>
              </label>
            </div>

            {/* Show points */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={exam.settings.showPointsInPrint}
                  onChange={(e) => onUpdateSettings({ showPointsInPrint: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Mostrar Puntajes en Impresión</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
