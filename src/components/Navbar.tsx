import React from 'react';
import { 
  Printer, 
  Eye, 
  Edit3, 
  GraduationCap, 
  CheckCircle2, 
  FileText, 
  Download, 
  Upload, 
  Sparkles, 
  Plus, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { ExamDocument } from '../types';

interface NavbarProps {
  exam: ExamDocument;
  onUpdateExamTitle: (title: string) => void;
  activeView: 'editor' | 'preview_a4' | 'student' | 'solution_key';
  setActiveView: (view: 'editor' | 'preview_a4' | 'student' | 'solution_key') => void;
  onLoadTemplate: (templateId: string) => void;
  onNewBlankExam: () => void;
  onPrint: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalPoints: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  exam,
  onUpdateExamTitle,
  activeView,
  setActiveView,
  onLoadTemplate,
  onNewBlankExam,
  onPrint,
  onExportJson,
  onImportJson,
  totalPoints,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand & Document Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xs font-bold text-lg shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={exam.title}
                onChange={(e) => onUpdateExamTitle(e.target.value)}
                placeholder="Título del Documento de Examen..."
                className="font-bold text-slate-800 text-sm sm:text-base border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent px-1 py-0.5 rounded transition-colors truncate w-56 sm:w-80 md:w-96"
                title="Haz clic para editar el nombre del documento"
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                Word-Bento Mode
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveView('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'editor'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor Bloques</span>
          </button>

          <button
            onClick={() => setActiveView('preview_a4')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'preview_a4'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hoja A4 / PDF</span>
          </button>

          <button
            onClick={() => setActiveView('solution_key')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'solution_key'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clave Docente</span>
          </button>

          <button
            onClick={() => setActiveView('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'student'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Modo Alumno</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Points Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-bold">
            <span>Puntaje:</span>
            <span className="text-amber-900 font-extrabold text-sm">{totalPoints} pts</span>
          </div>

          {/* Templates Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Plantillas</span>
            </button>

            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 hidden group-hover:block z-50 animate-in fade-in-50">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Plantillas de Examen
              </div>
              <button
                onClick={() => onLoadTemplate('exam-science-bento')}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex flex-col"
              >
                <span className="font-semibold">Ciencias & Figuras (Bento Grid)</span>
                <span className="text-[11px] text-slate-500">Geometría, física, célula y gráficos</span>
              </button>
              <button
                onClick={() => onLoadTemplate('exam-literature-grid')}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex flex-col"
              >
                <span className="font-semibold">Comprensión Lectora</span>
                <span className="text-[11px] text-slate-500">Lectura amplia + preguntas al costado</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={onNewBlankExam}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Crear Examen en Blanco
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="flex items-center gap-1">
            {/* JSON Backup & Restore */}
            <button
              onClick={onExportJson}
              title="Descargar copia de seguridad en JSON (.json)"
              className="hidden lg:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>
            <label
              title="Cargar archivo de examen (.json)"
              className="hidden lg:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={onImportJson}
                className="hidden"
              />
            </label>
          </div>

          {/* Print Button */}
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
