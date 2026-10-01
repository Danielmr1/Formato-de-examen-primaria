import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Sparkles, 
  RotateCcw,
  BookOpen,
  ChevronDown,
  FolderKanban,
  User as UserIcon,
  LogIn,
  LogOut,
  Cloud,
  CloudCheck,
  AlertTriangle
} from 'lucide-react';
import { User } from 'firebase/auth';
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
  onOpenExamsManager: () => void;
  examsCount: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isCloudSaving?: boolean;
  cloudSyncStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onManualSaveCloud?: () => void;
  questionsWithoutKeyCount?: number;
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
  onOpenExamsManager,
  examsCount,
  currentUser,
  onOpenAuth,
  onLogout,
  isCloudSaving = false,
  cloudSyncStatus = 'idle',
  onManualSaveCloud,
  questionsWithoutKeyCount = 0,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Document Name */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[180px] sm:min-w-[240px] md:min-w-[280px] max-w-xs sm:max-w-md lg:max-w-lg">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs font-bold shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md select-none border border-indigo-200" title="Versión de DocuExam">
              v2.7
            </span>
          </div>
          
          <div className="flex-1 min-w-0 relative flex items-center">
            <input
              type="text"
              value={exam.title}
              onChange={(e) => onUpdateExamTitle(e.target.value)}
              placeholder="Título del Examen..."
              className="w-full font-bold text-slate-900 text-sm sm:text-base border border-transparent hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100/70 bg-transparent px-2 py-1 rounded-lg transition-colors truncate"
              title="Haz clic para editar el nombre del examen"
            />
          </div>
        </div>

        {/* Simplified View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveView('editor')}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'editor'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/70 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Modo Edición del Examen"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Edición</span>
          </button>

          <button
            onClick={() => setActiveView('preview_a4')}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'preview_a4'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/70 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista Previa de Impresión A4"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Vista Previa</span>
          </button>

          <button
            onClick={() => setActiveView('solution_key')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'solution_key'
                ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-300 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Clave de Respuestas para el Docente"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">Clave Docente</span>
            <span className="hidden sm:inline xl:hidden">Clave</span>
          </button>
        </div>

        {/* Pedagogical & Points Guardrail Badges */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <div 
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs select-none ${
              totalPoints === 20 || totalPoints === 100
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
            title={
              totalPoints === 20 
                ? 'Escala vigesimal estándar (20 pts) completa' 
                : totalPoints === 100 
                ? 'Escala centesimal (100 pts) completa' 
                : `Total acumulado: ${totalPoints} puntos (Sugerido estándar: 20 pts)`
            }
          >
            <span className="font-semibold text-slate-500">Puntaje:</span>
            <span className="font-extrabold">{totalPoints} pts</span>
            {totalPoints === 20 && <span className="text-[10px] text-emerald-600 font-extrabold">✓ (20)</span>}
          </div>

          {/* Missing Keys Alert */}
          {questionsWithoutKeyCount > 0 && (
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
              title={`${questionsWithoutKeyCount} pregunta(s) de opción múltiple no tienen la alternativa correcta marcada`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px]">{questionsWithoutKeyCount} sin clave</span>
            </div>
          )}
        </div>

        {/* Right Actions: Mis Exámenes + Plantillas + Imprimir / Exportar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Mis Exámenes Manager Button */}
          <button
            type="button"
            onClick={onOpenExamsManager}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200/90 rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Abrir gestor de todos mis exámenes guardados"
          >
            <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline">Mis Exámenes</span>
            <span className="inline lg:hidden">Exámenes</span>
            <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none">
              {examsCount}
            </span>
          </button>

          {/* Templates Dropdown */}
          <div className="relative group shrink-0">
            <button className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Plantillas</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <div className="absolute right-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 hidden group-hover:block z-50 animate-in fade-in-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cargar Ejemplos
              </div>
              <button
                onClick={() => onLoadTemplate('exam-science-bento')}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex flex-col cursor-pointer"
              >
                <span className="font-semibold">Ciencias & Gráficos</span>
                <span className="text-[11px] text-slate-500">Geometría, física, célula y emparejamiento</span>
              </button>
              <button
                onClick={() => onLoadTemplate('exam-literature-grid')}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex flex-col cursor-pointer"
              >
                <span className="font-semibold">Comprensión Lectora</span>
                <span className="text-[11px] text-slate-500">Lectura amplia + preguntas al lado</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={onNewBlankExam}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Nuevo Examen en Blanco
              </button>
            </div>
          </div>

          {/* Unified Print & Export Menu */}
          <div className="relative shrink-0" ref={exportMenuRef}>
            <div className="flex items-center rounded-lg shadow-xs bg-slate-900 overflow-hidden">
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Imprimir o guardar en PDF"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">Imprimir / PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-1.5 sm:px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-l border-slate-700 text-xs transition-colors cursor-pointer"
                title="Más opciones de guardado y carga"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Archivos & Guardado
                </div>
                <button
                  onClick={() => {
                    onOpenExamsManager();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2 cursor-pointer border-b border-slate-100"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Gestionar Mis Exámenes ({examsCount})</span>
                </button>
                <button
                  onClick={() => {
                    if (onManualSaveCloud) onManualSaveCloud();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2 cursor-pointer border-b border-slate-100"
                >
                  <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Guardar en la nube ahora</span>
                </button>
                <button
                  onClick={() => {
                    onExportJson();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Guardar archivo (.json)</span>
                </button>
                <label className="w-full text-left px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Cargar archivo (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      onImportJson(e);
                      setShowExportMenu(false);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Quick Manual Cloud Save Button for instant feedback */}
          {currentUser && onManualSaveCloud && (
            <button
              type="button"
              onClick={onManualSaveCloud}
              disabled={isCloudSaving}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                cloudSyncStatus === 'saved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : cloudSyncStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
              title="Haz clic para guardar y sincronizar inmediatamente este examen en tu cuenta"
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudSaving ? 'animate-bounce text-indigo-600' : cloudSyncStatus === 'saved' ? 'text-emerald-600' : 'text-indigo-600'}`} />
              <span>
                {isCloudSaving ? 'Guardando...' : cloudSyncStatus === 'saved' ? 'En la nube ✓' : 'Guardar en nube'}
              </span>
            </button>
          )}

          {/* User Account / Cloud Sync Button */}
          <div className="relative ml-0.5 pl-1.5 sm:ml-1 sm:pl-2 border-l border-slate-200 flex items-center gap-1.5 shrink-0" ref={userMenuRef}>
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 py-1 px-1.5 sm:px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 transition-all cursor-pointer text-left"
                  title="Cuenta docente activa (guardado en la nube)"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'D'}
                  </div>
                  <div className="hidden xl:flex flex-col leading-none">
                    <span className="text-[11px] font-bold text-slate-800 truncate max-w-[100px]">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Cloud className="w-2.5 h-2.5 text-emerald-500" />
                      {isCloudSaving ? 'Guardando...' : 'Nube activa'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-indigo-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {currentUser.displayName || 'Docente'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Exámenes sincronizados en tu cuenta</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onManualSaveCloud) onManualSaveCloud();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2 cursor-pointer border-b border-slate-100"
                    >
                      <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Guardar examen actual ahora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenExamsManager();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mis Exámenes Guardados ({examsCount})</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                title="Inicia sesión con tu cuenta para acceder a tus exámenes guardados en la nube"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
