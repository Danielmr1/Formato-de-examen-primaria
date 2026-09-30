import React, { useState, useEffect } from 'react';
import { 
  FigureData, 
  ExamDocument 
} from './types';
import { useExamState, sanitizeExam } from './hooks/useExamState';
import { useCloudSync } from './hooks/useCloudSync';
import { validateExamJson } from './utils/securitySanitizer';
import { Navbar } from './components/Navbar';
import { WordToolbar } from './components/WordToolbar';
import { ExamSheet } from './components/editor/ExamSheet';
import { UndoToast } from './components/editor/UndoToast';
import { DeviceSyncBanner } from './components/navigation/DeviceSyncBanner';
import { DiagramLibraryModal } from './components/DiagramLibraryModal';
import { StudentExamModal } from './components/StudentExamModal';
import { ExamsManagerModal } from './components/ExamsManagerModal';
import { AuthModal } from './components/AuthModal';

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

  // Guardrail de navegación: Advertir antes de cerrar o recargar si hay guardado en curso
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCloudSaving || cloudSyncStatus === 'saving') {
        e.preventDefault();
        e.returnValue = 'Tienes cambios guardándose en la nube. ¿Seguro que deseas salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCloudSaving, cloudSyncStatus]);

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

  // Importar examen desde archivo JSON con guardrail de validación
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        onPrint={() => window.print()}
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

      {/* Banner de sincronización para invitados o exámenes recientes */}
      <DeviceSyncBanner
        currentUser={currentUser}
        recentCloudExam={recentCloudExam}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLoadRecentCloudExam={(cloudDoc) => {
          setExam(cloudDoc);
          setCurrentExamId(cloudDoc.id);
          clearRecentCloudExam();
          notify(`Examen "${cloudDoc.title}" cargado en pantalla`);
        }}
        onDismissRecentCloudExam={clearRecentCloudExam}
        isExamEmpty={isExamEmpty}
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

      {/* Toast interactivo con Guardrail de Deshacer (Undo) */}
      <UndoToast
        notification={copiedNotification}
        undoItem={undoItem}
        onClearUndo={() => setUndoItem(null)}
      />

      {/* Espacio de trabajo / Hoja de examen A4 */}
      <main className="flex-1 py-3 sm:py-5 px-1 sm:px-3 flex justify-center items-start overflow-y-auto">
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
        />
      </main>

      {/* Modales modulares */}
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

      <StudentExamModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        exam={exam}
        totalPoints={totalPoints}
      />

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessMessage={(msg) => notify(msg, 4000)}
      />
    </div>
  );
};

export default App;
