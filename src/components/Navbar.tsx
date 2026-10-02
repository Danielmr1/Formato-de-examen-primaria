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
  AlertTriangle,
  AlertCircle
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
  questionsWithEmptyOptionsCount?: number;
  duplicateNumbersList?: string[];
  onUpdateSettings?: (settings: Partial<ExamDocument['settings']>) => void;
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
  questionsWithEmptyOptionsCount = 0,
  duplicateNumbersList = [],
  onUpdateSettings,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
              v6.0
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
          {/* Missing Keys Alert */}
          {questionsWithoutKeyCount > 0 && (
            <button 
              type="button"
              onClick={() => setActiveView('solution_key')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs cursor-pointer transition-colors"
              title={`${questionsWithoutKeyCount} pregunta(s) de opción múltiple no tienen la alternativa correcta marcada. Haz clic para revisar en la Clave Docente.`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px]">{questionsWithoutKeyCount} sin clave</span>
            </button>
          )}

          {/* Empty Options Alert */}
          {questionsWithEmptyOptionsCount > 0 && (
            <button 
              type="button"
              onClick={() => setActiveView('editor')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs cursor-pointer transition-colors"
              title={`${questionsWithEmptyOptionsCount} pregunta(s) tienen alternativas o textos vacíos. Haz clic para revisarlas en el editor antes de imprimir.`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px]">{questionsWithEmptyOptionsCount} con vacías</span>
            </button>
          )}

          {/* Duplicate Question Numbers Alert (Informativo, no bloqueante) */}
          {duplicateNumbersList.length > 0 && (
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs select-none"
              title={`Aviso: Hay preguntas con numeración repetida (N° ${duplicateNumbersList.join(', ')}). Puedes corregirlas en el editor o conservarlas según prefieras.`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px]">N° duplicado: {duplicateNumbersList.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Right Actions: Imprimir / PDF + Menú Circular Docente */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Botón Principal: Imprimir / PDF */}
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            title="Imprimir o guardar en PDF"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Menú Circular Docente (Mis Exámenes, Plantillas, Cuenta y Archivos) */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer relative ring-2 ring-indigo-200/70"
              title="Menú del Docente (Mis exámenes, plantillas y opciones)"
            >
              {currentUser?.displayName ? (
                currentUser.displayName[0].toUpperCase()
              ) : currentUser?.email ? (
                currentUser.email[0].toUpperCase()
              ) : (
                <UserIcon className="w-4 h-4 text-white" />
              )}

              {/* Indicador de sincronización en la nube */}
              {currentUser && (
                <span 
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    isCloudSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                  }`} 
                  title={isCloudSaving ? 'Guardando en la nube...' : 'Sincronizado'}
                />
              )}

              {/* Insignia de cantidad de exámenes guardados */}
              {examsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-700 text-white rounded-full text-[9px] font-extrabold w-4 h-4 flex items-center justify-center border border-white">
                  {examsCount}
                </span>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-xs">
                {/* Header con información de usuario o estado */}
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {currentUser?.displayName || (currentUser ? 'Docente' : 'Docente')}
                    </span>
                    {currentUser && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-md">
                        Nube activa
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {currentUser?.email || 'Modo local (guardado en navegador)'}
                  </div>
                </div>

                {/* Sección: Gestión de Exámenes */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenExamsManager();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-indigo-700 hover:bg-indigo-50 font-bold flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Mis Exámenes Guardados</span>
                    </div>
                    <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {examsCount}
                    </span>
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1"></div>

                {/* Sección: Plantillas */}
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Plantillas de Ejemplo</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadTemplate('exam-science-bento');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-700 flex flex-col cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">Ciencias & Gráficos</span>
                    <span className="text-[10px] text-slate-400">Geometría, física y emparejamiento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadTemplate('exam-literature-grid');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-700 flex flex-col cursor-pointer transition-colors"
                  >
                    <span className="font-semibold">Comprensión Lectora</span>
                    <span className="text-[10px] text-slate-400">Lectura amplia + preguntas al lado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNewBlankExam();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-semibold cursor-pointer transition-colors mt-0.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nuevo examen en blanco</span>
                  </button>
                </div>

                {onUpdateSettings && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    {/* Sección: Puntaje en Enunciados */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ showPointsInPrint: exam.settings.showPointsInPrint === false ? true : false });
                        }}
                        className="w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors font-medium"
                      >
                        <span>Puntaje en enunciados</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          exam.settings.showPointsInPrint !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {exam.settings.showPointsInPrint !== false ? 'Activado ✓' : 'Desactivado'}
                        </span>
                      </button>
                    </div>
                  </>
                )}

                <div className="border-t border-slate-100 my-1"></div>

                {/* Sección: Archivos & Nube */}
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Archivos & Guardado
                  </div>

                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onManualSaveCloud) onManualSaveCloud();
                        setShowUserMenu(false);
                      }}
                      disabled={isCloudSaving}
                      className="w-full text-left px-3.5 py-1.5 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isCloudSaving ? 'Guardando en la nube...' : 'Guardar en la nube ahora'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAuth();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Iniciar Sesión para Nube</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onExportJson();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Descargar archivo (.json)</span>
                  </button>

                  <label className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cargar archivo (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        onImportJson(e);
                        setShowUserMenu(false);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Sección: Cerrar Sesión */}
                {currentUser && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
