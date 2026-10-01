import React, { useState, useEffect, useRef } from 'react';
import { 
  FigureData, 
  ExamDocument 
} from './types';
import { useExamState, sanitizeExam } from './hooks/useExamState';
import { useCloudSync } from './hooks/useCloudSync';
import { validateExamJson } from './utils/securitySanitizer';
import { Navbar } from './components/Navbar';
import { WordToolbar } from './components/WordToolbar';
import { PreviewToolbar } from './components/preview/PreviewToolbar';
import { ExamSheet } from './components/editor/ExamSheet';
import { UndoToast } from './components/editor/UndoToast';

// Modales cargados bajo demanda para optimizar la velocidad de inicio
const DiagramLibraryModal = React.lazy(() => import('./components/DiagramLibraryModal').then(m => ({ default: m.DiagramLibraryModal })));
const StudentExamModal = React.lazy(() => import('./components/StudentExamModal').then(m => ({ default: m.StudentExamModal })));
const ExamsManagerModal = React.lazy(() => import('./components/ExamsManagerModal').then(m => ({ default: m.ExamsManagerModal })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));

export const App: React.FC = () => {
  // Estado y operaciones del examen
  const {
    exam,
    setExam,
    currentExamId,
    setCurrentExamId,
    examsList,
    setExamsList,
    totalPoints,
    questionsWithoutKeyCount,
    copiedNotification,
    setCopiedNotification,
    undoItem,
    setUndoItem,
    notify,
    handleAddBlock,
    handleUpdateBlock,
    handleDeleteBlock,
    handleDuplicateBlock,
    handleMoveUp,
    handleMoveDown,
    handleResizeWidthPair,
    handleUpdateExamTitle,
    handleUpdateHeader,
    handleUpdateSettings,
    handleLoadTemplate,
    handleNewBlankExam,
    handleSelectExam,
    handleDeleteExam,
    handleDuplicateExam,
    handleRestoreSnapshot
  } = useExamState();

  // Sincronización en la nube con Firebase
  const {
    currentUser,
    cloudSyncStatus,
    isCloudSaving,
    recentCloudExam,
    clearRecentCloudExam,
    manualSaveCloud,
    logout
  } = useCloudSync(exam, setExam, setExamsList, sanitizeExam, notify);

  // Vistas activas y modales
  const [activeView, setActiveView] = useState<'editor' | 'preview_a4' | 'solution_key' | 'student'>('editor');
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [targetBlockIdForFigure, setTargetBlockIdForFigure] = useState<string | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isExamsManagerOpen, setIsExamsManagerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewPages, setPreviewPages] = useState(1);
  const lastAddBlockTimeRef = useRef(0);
  const lastManualSaveTimeRef = useRef(0);

  // Guardrail contra cierres accidentales: Guarda inmediatamente y previene pérdida de datos
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 1. Guardado de emergencia inmediato y síncrono en localStorage
      try {
        localStorage.setItem('docu_current_exam', JSON.stringify(exam));
      } catch {}

      // 2. Si se está sincronizando en la nube o hay preguntas activas, advertir antes de salir
      if (isCloudSaving || cloudSyncStatus === 'saving') {
        e.preventDefault();
        e.returnValue = 'Tienes cambios guardándose en la nube. ¿Seguro que deseas salir?';
        return e.returnValue;
      }

      if (exam.blocks && exam.blocks.length > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exam, isCloudSaving, cloudSyncStatus]);

  // Guardrail 4: Auditoría de clave docente previa a la impresión
  const handlePrintExam = () => {
    if (activeView === 'solution_key' && questionsWithoutKeyCount > 0) {
      notify(`⚠️ Clave incompleta: Hay ${questionsWithoutKeyCount} pregunta(s) de opción múltiple sin respuesta correcta marcada. Revisa antes de imprimir la pauta.`, 5000);
    }
    window.print();
  };

  // Atajos de teclado para redacción y edición fluida (Mejora 4 & Guardrail 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guardrail 3: Ignorar repeticiones continuas del SO si se mantiene la tecla presionada
      if (e.repeat) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const isAnyModalOpen = isDiagramModalOpen || isStudentModalOpen || isExamsManagerOpen || isAuthModalOpen;

      // Escape: Cerrar cualquier modal que esté en pantalla
      if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          setIsDiagramModalOpen(false);
          setIsStudentModalOpen(false);
          setIsExamsManagerOpen(false);
          setIsAuthModalOpen(false);
          setTargetBlockIdForFigure(null);
        }
        return;
      }

      // Si hay un modal abierto, no ejecutar atajos de edición de fondo
      if (isAnyModalOpen) return;

      // Ctrl + S: Guardar examen manualmente con confirmación y debouncing
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastManualSaveTimeRef.current < 500) return;
        lastManualSaveTimeRef.current = now;

        try {
          localStorage.setItem('docu_current_exam', JSON.stringify(exam));
          if (currentUser) {
            manualSaveCloud(exam);
          } else {
            notify('✓ Examen guardado en tu navegador');
          }
        } catch {
          notify('✓ Examen guardado');
        }
        return;
      }

      // Ctrl + Enter: Añadir nueva pregunta con anti-rebote (máximo 1 cada 400ms)
      if (cmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        const now = Date.now();
        if (now - lastAddBlockTimeRef.current < 400) return;
        lastAddBlockTimeRef.current = now;

        handleAddBlock(6, 'multiple_choice', false);
        notify('✓ Nueva pregunta añadida (Ctrl + Enter)');
        return;
      }

      // Ctrl + P: Imprimir o generar PDF directo con auditoría de clave (Guardrail 4)
      if (cmdOrCtrl && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlePrintExam();
        return;
      }

      // Ctrl + Z: Deshacer eliminación de pregunta si hay acción pendiente fuera de inputs
      const isTyping = document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT';
      if (cmdOrCtrl && (e.key === 'z' || e.key === 'Z') && !e.shiftKey && !isTyping) {
        if (undoItem) {
          e.preventDefault();
          undoItem.onUndo();
          setUndoItem(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    exam,
    currentUser,
    undoItem,
    isDiagramModalOpen,
    isStudentModalOpen,
    isExamsManagerOpen,
    isAuthModalOpen,
    manualSaveCloud,
    notify,
    handleAddBlock,
    setUndoItem
  ]);

  // Selección de diagrama desde la biblioteca modal
  const handleSelectDiagramForBlock = (figure: FigureData) => {
    if (targetBlockIdForFigure) {
      handleUpdateBlock(targetBlockIdForFigure, { figure });
      notify('Figura insertada en la pregunta');
    } else {
      handleAddBlock(6, 'multiple_choice', true);
      notify('Pregunta con figura agregada');
    }
  };

  const handleOpenFigureModalForBlock = (blockId: string) => {
    setTargetBlockIdForFigure(blockId);
    setIsDiagramModalOpen(true);
  };

  // Inserción de símbolos matemáticos
  const handleInsertMathSymbol = (symbol: string) => {
    navigator.clipboard.writeText(symbol);

    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
      const start = activeEl.selectionStart ?? activeEl.value.length;
      const end = activeEl.selectionEnd ?? activeEl.value.length;
      const originalValue = activeEl.value;
      const nextValue = originalValue.slice(0, start) + symbol + originalValue.slice(end);
      activeEl.value = nextValue;
      activeEl.selectionStart = activeEl.selectionEnd = start + symbol.length;
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      notify(`¡"${symbol}" insertado en el texto!`);
    } else {
      notify(`¡"${symbol}" copiado al portapapeles! Pégalo con Ctrl+V`);
    }
  };

  // Exportar examen a JSON
  const handleExportExam = (targetExam: ExamDocument) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetExam, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(targetExam.title || 'examen').replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar examen desde archivo JSON con guardrail de validación y límite de tamaño
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Guardrail 1: Límite de tamaño de archivo (máximo 5 MB para prevenir saturación de memoria)
      const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE_BYTES) {
        notify('❌ Archivo demasiado grande: El límite de seguridad para archivos .json es de 5 MB', 5000);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const validation = validateExamJson(parsed);

          if (!validation.isValid || !validation.sanitizedExam) {
            notify(`❌ Error en archivo: ${validation.error || 'Estructura no válida'}`, 4500);
            return;
          }

          const importedExam = validation.sanitizedExam;
          setExamsList(prev => {
            const filtered = prev.filter(item => item.id !== importedExam.id);
            const next = [importedExam, ...filtered];
            localStorage.setItem('docu_teacher_exams_list', JSON.stringify(next));
            return next;
          });
          setExam(importedExam);
          setCurrentExamId(importedExam.id);
          notify(`✓ Examen "${importedExam.title}" importado y verificado con éxito`);
        } catch (err) {
          notify('❌ Error: El archivo seleccionado no tiene formato JSON válido.', 4000);
        }
      };
      reader.readAsText(file);
    }
  };

  // Estilo de tipografía base
  const getFontClass = () => {
    switch (exam.settings.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const isExamEmpty = exam.blocks.length === 0 && (!exam.header.examTitle || exam.header.examTitle.trim() === '');

  return (
    <div className={`min-h-screen bg-slate-200/70 text-slate-900 ${getFontClass()} flex flex-col`}>
      {/* Barra de navegación principal */}
      <Navbar
        exam={exam}
        onUpdateExamTitle={handleUpdateExamTitle}
        activeView={activeView}
        setActiveView={(v) => {
          if (v === 'student') {
            setIsStudentModalOpen(true);
          } else {
            setActiveView(v);
          }
        }}
        onLoadTemplate={handleLoadTemplate}
        onNewBlankExam={handleNewBlankExam}
        onPrint={handlePrintExam}
        onExportJson={() => handleExportExam(exam)}
        onImportJson={handleImportJson}
        totalPoints={totalPoints}
        onOpenExamsManager={() => setIsExamsManagerOpen(true)}
        examsCount={examsList.length}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={logout}
        isCloudSaving={isCloudSaving}
        cloudSyncStatus={cloudSyncStatus}
        onManualSaveCloud={() => manualSaveCloud(exam)}
        questionsWithoutKeyCount={questionsWithoutKeyCount}
      />



      {/* Barra de herramientas estilo Ribbon Word (solo en modo edición) */}
      {activeView === 'editor' && (
        <WordToolbar
          exam={exam}
          onAddBlock={handleAddBlock}
          onOpenDiagramModal={() => {
            setTargetBlockIdForFigure(null);
            setIsDiagramModalOpen(true);
          }}
          onInsertMathSymbol={handleInsertMathSymbol}
          onUpdateSettings={handleUpdateSettings}
          onUpdateHeader={handleUpdateHeader}
        />
      )}

      {/* Barra de herramientas de Vista Previa A4 con zoom y contador de páginas */}
      {(activeView === 'preview_a4' || activeView === 'solution_key') && (
        <PreviewToolbar
          totalPages={previewPages}
          zoom={previewZoom}
          onZoomChange={setPreviewZoom}
          onReturnToEditor={() => setActiveView('editor')}
          onPrint={handlePrintExam}
          activeView={activeView}
          onSwitchView={setActiveView}
        />
      )}

      {/* Toast interactivo con Guardrail de Deshacer (Undo) */}
      <UndoToast
        notification={copiedNotification}
        undoItem={undoItem}
        onClearUndo={() => setUndoItem(null)}
      />

      {/* Espacio de trabajo / Hoja de examen A4 con soporte de Zoom */}
      <main className="flex-1 py-3 sm:py-6 px-1 sm:px-3 flex justify-center items-start overflow-y-auto">
        <div 
          style={
            (activeView === 'preview_a4' || activeView === 'solution_key') && previewZoom !== 100
              ? { transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }
              : undefined
          }
          className="w-full flex justify-center transition-transform duration-150"
        >
          <ExamSheet
            exam={exam}
            activeView={activeView}
            totalPoints={totalPoints}
            onUpdateHeader={handleUpdateHeader}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onResizeWidthPair={handleResizeWidthPair}
            onOpenFigureModalForBlock={handleOpenFigureModalForBlock}
            onAddBlock={handleAddBlock}
            onUpdateSettings={handleUpdateSettings}
            onPagesCalculated={setPreviewPages}
          />
        </div>
      </main>

      {/* Modales cargados bajo demanda (Lazy Loading) */}
      <React.Suspense fallback={null}>
        {isDiagramModalOpen && (
          <DiagramLibraryModal
            isOpen={isDiagramModalOpen}
            onClose={() => {
              setIsDiagramModalOpen(false);
              setTargetBlockIdForFigure(null);
            }}
            onSelectDiagram={handleSelectDiagramForBlock}
            currentBlockId={targetBlockIdForFigure || undefined}
            currentFigure={targetBlockIdForFigure ? exam.blocks.find(b => b.id === targetBlockIdForFigure)?.figure : undefined}
          />
        )}

        {isStudentModalOpen && (
          <StudentExamModal
            isOpen={isStudentModalOpen}
            onClose={() => setIsStudentModalOpen(false)}
            exam={exam}
            totalPoints={totalPoints}
          />
        )}

        {isExamsManagerOpen && (
          <ExamsManagerModal
            isOpen={isExamsManagerOpen}
            onClose={() => setIsExamsManagerOpen(false)}
            exams={examsList}
            currentExamId={currentExamId}
            onSelectExam={handleSelectExam}
            onCreateNewExam={handleNewBlankExam}
            onDuplicateExam={handleDuplicateExam}
            onDeleteExam={handleDeleteExam}
            onImportExam={handleImportJson}
            onExportExam={handleExportExam}
            onLoadTemplate={handleLoadTemplate}
            currentUser={currentUser}
            onOpenAuth={() => {
              setIsExamsManagerOpen(false);
              setIsAuthModalOpen(true);
            }}
            onRestoreSnapshot={handleRestoreSnapshot}
          />
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccessMessage={(msg) => notify(msg, 4000)}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default App;
