import React, { useState, useMemo, useRef } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Upload, 
  Download, 
  Copy, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  FileText, 
  X, 
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Cloud,
  Lock,
  User as UserIcon,
  History,
  RotateCcw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ExamDocument } from '../types';
import { getLocalSnapshots } from '../utils/versionHistory';

interface ExamsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: ExamDocument[];
  currentExamId: string;
  onSelectExam: (examId: string) => void;
  onCreateNewExam: () => void;
  onDuplicateExam: (examId: string) => void;
  onDeleteExam: (examId: string) => void;
  onImportExam: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportExam: (exam: ExamDocument) => void;
  onLoadTemplate: (templateId: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onRestoreSnapshot?: (exam: ExamDocument) => void;
}

export const ExamsManagerModal: React.FC<ExamsManagerModalProps> = ({
  isOpen,
  onClose,
  exams,
  currentExamId,
  onSelectExam,
  onCreateNewExam,
  onDuplicateExam,
  onDeleteExam,
  onImportExam,
  onExportExam,
  onLoadTemplate,
  currentUser,
  onOpenAuth,
  onRestoreSnapshot,
}) => {
  const [activeTab, setActiveTab] = useState<'my_exams' | 'templates' | 'snapshots'>('my_exams');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return exams;
    const query = searchQuery.toLowerCase();
    return exams.filter((ex) => 
      ex.title.toLowerCase().includes(query) ||
      ex.header?.subject?.toLowerCase().includes(query) ||
      ex.header?.gradeLevel?.toLowerCase().includes(query) ||
      ex.header?.institutionName?.toLowerCase().includes(query)
    );
  }, [exams, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden file input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => {
            onImportExam(e);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Mis Exámenes</h2>
                <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2 py-0.5 rounded-full border border-indigo-200">
                  {exams.length} {exams.length === 1 ? 'guardado' : 'guardados'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Organiza, edita, clona o respalda todas tus evaluaciones en un solo lugar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
              title="Cargar un archivo .json desde tu computadora"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onCreateNewExam();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Examen</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header Tabs & Search */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('my_exams')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'my_exams'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mis Evaluaciones</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'my_exams' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {exams.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Plantillas Oficiales</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('snapshots')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'snapshots'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Copias de seguridad locales del examen actual"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Respaldos Automáticos</span>
            </button>
          </div>

          {/* Search bar (only for my exams) */}
          {activeTab === 'my_exams' && (
            <div className="relative min-w-48 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, materia o grado..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          {/* Cloud Account Status Banner */}
          <div className="mb-4">
            {currentUser ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Conectado como <b>{currentUser.displayName || currentUser.email}</b>. Tus evaluaciones se guardan de forma privada en Firebase Firestore.
                  </span>
                </div>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full shrink-0 border border-emerald-300">
                  Base de Datos Segura
                </span>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Estás en <b>modo local (navegador)</b>. Inicia sesión con tu cuenta para respaldar tus exámenes en la nube y acceder desde cualquier lugar.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>

          {activeTab === 'my_exams' ? (
            filteredExams.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">
                  {searchQuery ? 'No se encontraron exámenes para tu búsqueda' : 'No tienes exámenes creados aún'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery 
                    ? 'Intenta con otro término de búsqueda o limpia el filtro.' 
                    : 'Crea tu primer examen en blanco o selecciona una de nuestras plantillas para comenzar.'}
                </p>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Borrar búsqueda
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateNewExam();
                      onClose();
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Nuevo Examen</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredExams.map((ex) => {
                  const isCurrent = ex.id === currentExamId;
                  const isDeleting = deleteConfirmId === ex.id;
                  const questionCount = ex.blocks.length;

                  return (
                    <div
                      key={ex.id}
                      className={`bg-white rounded-xl border transition-all p-4 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                        isCurrent 
                          ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-indigo-50/10' 
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Status badges row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                En edición activa
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Guardado
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                              A4
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
                          {ex.title || 'Examen sin título'}
                        </h4>

                        {/* Subject & Grade Subtitle */}
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                          {ex.header?.subject && ex.header.subject.trim() !== '' && ex.header.subject !== 'Física y Geometría Aplicada' && ex.header.subject !== 'Asignatura / Curso' && (
                            <span className="font-semibold text-slate-700">{ex.header.subject}</span>
                          )}
                          {ex.header?.subject && ex.header.subject.trim() !== '' && ex.header.subject !== 'Física y Geometría Aplicada' && ex.header.subject !== 'Asignatura / Curso' && ex.header?.gradeLevel && (
                            <span className="text-slate-300">•</span>
                          )}
                          {ex.header?.gradeLevel && (
                            <span>{ex.header.gradeLevel}</span>
                          )}
                        </div>

                        {/* Institution or Date */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate max-w-[200px]" title={ex.header?.institutionName || 'Sin institución'}>
                            {ex.header?.institutionName && ex.header.institutionName.trim() !== '' ? ex.header.institutionName : 'Evaluación'}
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {ex.updatedAt ? ex.updatedAt : ex.createdAt || 'Reciente'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {isDeleting ? (
                          <div className="w-full flex items-center justify-between gap-2 bg-rose-50 p-1.5 rounded-lg border border-rose-200 animate-in fade-in">
                            <span className="text-xs text-rose-800 font-bold">¿Eliminar examen?</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteExam(ex.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                              >
                                Sí, borrar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold border border-slate-200 cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              {/* Open Exam */}
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectExam(ex.id);
                                  onClose();
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                }`}
                              >
                                <span>{isCurrent ? 'Continuar Editando' : 'Abrir Examen'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Duplicate / Clone */}
                              <button
                                type="button"
                                onClick={() => onDuplicateExam(ex.id)}
                                className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                                title="Duplicar este examen (ideal para crear Tema A y Tema B)"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {/* Download JSON */}
                              <button
                                type="button"
                                onClick={() => onExportExam(ex)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                                title="Descargar archivo .json a tu computadora"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {/* Delete Exam */}
                              {exams.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(ex.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                                  title="Eliminar del listado"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Tab: Templates */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template 1 */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Ciencias & Matemáticas
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                    Plantilla de Ciencias y Matemáticas
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Plantilla completa con ejercicios de opción múltiple, figuras geométricas vectoriales integradas, bloque de desarrollo para cálculo y emparejamiento.
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>• 5 preguntas</span>
                    <span>• Formato A4</span>
                    <span>• Figuras SVG</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadTemplate('exam-science-bento');
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Cargar esta plantilla</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Template 2 */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold">
                      <FileText className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Lenguaje & Literatura
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                    Plantilla de Comprensión Lectora
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Diseño con lectura amplia en columna izquierda y preguntas de análisis crítico y verdadero/falso alineadas a la derecha sin desperdiciar papel.
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>• Texto de lectura</span>
                    <span>• Preguntas vinculadas</span>
                    <span>• Formato A4</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadTemplate('exam-literature-grid');
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Cargar esta plantilla</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Snapshots / Automatic Backups */}
          {activeTab === 'snapshots' && (
            <div>
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <b>Historial de versiones recientes (Time Machine):</b> El sistema guarda automáticamente copias locales en tu navegador para que puedas retroceder en caso de error accidental.
                  </span>
                </div>
              </div>

              {(() => {
                const snapshots = getLocalSnapshots(currentExamId);
                if (snapshots.length === 0) {
                  return (
                    <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-slate-700">
                        No hay respaldos automáticos previos aún para este examen
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Se generarán automáticamente copias de seguridad locales conforme vayas agregando y editando tus preguntas en la sesión actual.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {snapshots.map((snap) => (
                      <div 
                        key={snap.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200">
                              <Calendar className="w-3 h-3 text-indigo-600" />
                              Hora: {snap.timeFormatted}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {snap.totalPoints} pts
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mb-1 truncate">
                            {snap.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {snap.questionCount} {snap.questionCount === 1 ? 'pregunta' : 'preguntas'} registradas en este punto de restauración.
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (onRestoreSnapshot) {
                                onRestoreSnapshot(snap.examData);
                                onClose();
                              }
                            }}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar esta versión</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tus exámenes se guardan automáticamente en tu navegador. Usa <b>Importar / Descargar</b> para respaldarlos.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
