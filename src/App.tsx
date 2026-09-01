import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Square, 
  RectangleHorizontal, 
  RectangleVertical, 
  Columns2, 
  Image as ImageIcon, 
  Sparkles, 
  FileText, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Info,
  Download,
  Upload,
  BookOpen,
  LayoutGrid,
  Check
} from 'lucide-react';
import { 
  BlockWidth, 
  ExamBlock, 
  ExamDocument, 
  FigureData, 
  QuestionType 
} from './types';
import { SAMPLE_EXAMS } from './data/sampleExams';
import { PRESET_DIAGRAMS } from './data/sampleFigures';
import { Navbar } from './components/Navbar';
import { WordToolbar } from './components/WordToolbar';
import { HeaderEditor } from './components/HeaderEditor';
import { BlockItem } from './components/BlockItem';
import { DiagramLibraryModal } from './components/DiagramLibraryModal';
import { StudentExamModal } from './components/StudentExamModal';

export default function App() {
  // Load initial exam from localStorage or sample
  const [exam, setExam] = useState<ExamDocument>(() => {
    const saved = localStorage.getItem('docu_exam_saved');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved exam', e);
      }
    }
    return SAMPLE_EXAMS[0];
  });

  const [activeView, setActiveView] = useState<'editor' | 'preview_a4' | 'solution_key' | 'student'>('editor');
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState<boolean>(false);
  const [targetBlockIdForFigure, setTargetBlockIdForFigure] = useState<string | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('docu_exam_saved', JSON.stringify(exam));
  }, [exam]);

  // Total Points Calculation
  const totalPoints = useMemo(() => {
    return exam.blocks.reduce((sum, b) => sum + (b.points || 0), 0);
  }, [exam.blocks]);

  // Update Exam Document Title
  const handleUpdateExamTitle = (title: string) => {
    setExam(prev => ({ ...prev, title }));
  };

  // Update Header Config
  const handleUpdateHeader = (updated: Partial<ExamDocument['header']>) => {
    setExam(prev => ({
      ...prev,
      header: { ...prev.header, ...updated }
    }));
  };

  // Update Settings
  const handleUpdateSettings = (settings: Partial<ExamDocument['settings']>) => {
    setExam(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  // Add a new dynamic block with chosen width and question type
  const handleAddBlock = (width: BlockWidth, type: QuestionType, withFigure: boolean = false) => {
    const blockNum = (exam.blocks.length + 1).toString().padStart(2, '0');
    
    let defaultOptions = [
      { id: `opt-1`, label: 'A', text: 'Primera alternativa de respuesta' },
      { id: `opt-2`, label: 'B', text: 'Segunda alternativa de respuesta', isCorrect: true },
      { id: `opt-3`, label: 'C', text: 'Tercera alternativa de respuesta' },
      { id: `opt-4`, label: 'D', text: 'Cuarta alternativa de respuesta' },
    ];

    let figureData: FigureData | undefined = undefined;
    if (withFigure) {
      figureData = {
        svgData: PRESET_DIAGRAMS[0].svg,
        caption: 'Figura: Diagrama ilustrativo',
        position: width === 12 ? 'right' : 'top',
        widthPercent: width === 12 ? 40 : 90
      };
    }

    const newBlock: ExamBlock = {
      id: `blk-${Date.now()}`,
      titleNumber: blockNum,
      statement: type === 'reading_passage' 
        ? 'Escriba aquí el texto de lectura o caso de estudio para el análisis del estudiante...'
        : 'Escriba aquí el enunciado de la pregunta. Puede utilizar **negrita** para resaltar conceptos y añadir figuras.',
      type: type,
      width: width,
      heightMode: type === 'open_development' || type === 'reading_passage' ? 'tall' : 'auto',
      points: type === 'reading_passage' ? 0 : 4,
      blockTheme: 'standard',
      figure: figureData,
      options: type === 'multiple_choice' ? defaultOptions : undefined,
      trueFalseOptions: type === 'true_false' ? [
        { id: `tf-1`, statement: 'Primera afirmación a evaluar (V / F)', isTrue: true },
        { id: `tf-2`, statement: 'Segunda afirmación a evaluar (V / F)', isTrue: false }
      ] : undefined,
      developmentConfig: type === 'open_development' ? {
        style: 'grid',
        heightPx: 120,
        promptHint: ''
      } : undefined,
      matchingPairs: type === 'matching' ? [
        { id: `m-1`, leftText: 'Elemento A', rightText: 'Definición o relación correspondiente' },
        { id: `m-2`, leftText: 'Elemento B', rightText: 'Definición o relación correspondiente' }
      ] : undefined
    };

    setExam(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  // Update specific block
  const handleUpdateBlock = (blockId: string, updated: Partial<ExamBlock>) => {
    setExam(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, ...updated } : b)
    }));
  };

  // Delete block
  const handleDeleteBlock = (blockId: string) => {
    setExam(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }));
  };

  // Duplicate block
  const handleDuplicateBlock = (blockId: string) => {
    const target = exam.blocks.find(b => b.id === blockId);
    if (!target) return;
    const duplicated: ExamBlock = {
      ...target,
      id: `blk-${Date.now()}`,
      titleNumber: `${target.titleNumber || ''} (copia)`,
    };
    const index = exam.blocks.findIndex(b => b.id === blockId);
    const newBlocks = [...exam.blocks];
    newBlocks.splice(index + 1, 0, duplicated);
    setExam(prev => ({ ...prev, blocks: newBlocks }));
  };

  // Move block up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...exam.blocks];
    const temp = newBlocks[index - 1];
    newBlocks[index - 1] = newBlocks[index];
    newBlocks[index] = temp;
    setExam(prev => ({ ...prev, blocks: newBlocks }));
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index === exam.blocks.length - 1) return;
    const newBlocks = [...exam.blocks];
    const temp = newBlocks[index + 1];
    newBlocks[index + 1] = newBlocks[index];
    newBlocks[index] = temp;
    setExam(prev => ({ ...prev, blocks: newBlocks }));
  };

  // Open Figure Modal for specific block
  const handleOpenFigureModalForBlock = (blockId: string) => {
    setTargetBlockIdForFigure(blockId);
    setIsDiagramModalOpen(true);
  };

  // Apply selected figure to target block
  const handleSelectDiagramForBlock = (figure: FigureData) => {
    if (targetBlockIdForFigure) {
      handleUpdateBlock(targetBlockIdForFigure, { figure });
    } else {
      // Add a new block with this figure
      handleAddBlock(6, 'multiple_choice', false);
      // Attach to the newly added block
      setTimeout(() => {
        setExam(prev => {
          const last = prev.blocks[prev.blocks.length - 1];
          if (last) {
            return {
              ...prev,
              blocks: prev.blocks.map((b, idx) => idx === prev.blocks.length - 1 ? { ...b, figure } : b)
            };
          }
          return prev;
        });
      }, 50);
    }
  };

  // Load Template
  const handleLoadTemplate = (templateId: string) => {
    const tmpl = SAMPLE_EXAMS.find(t => t.id === templateId);
    if (tmpl) {
      setExam(JSON.parse(JSON.stringify(tmpl)));
    }
  };

  // Blank Exam
  const handleNewBlankExam = () => {
    setExam({
      id: `exam-${Date.now()}`,
      title: 'Nuevo Examen en Bloques',
      createdAt: new Date().toISOString().split('T')[0],
      header: {
        institutionName: 'NOMBRE DE TU INSTITUCIÓN O COLEGIO',
        examTitle: 'EVALUACIÓN ESCRITA DE PRUEBA',
        subject: 'Asignatura / Curso',
        teacherName: 'Prof. Tu Nombre',
        gradeLevel: 'Año / Grado',
        durationMinutes: 60,
        dateStr: new Date().toLocaleDateString('es-ES'),
        headerStyle: 'boxed',
        showStudentNameField: true,
        showDateField: true,
        showScoreBox: true,
        generalInstructions: 'Lea detenidamente las preguntas antes de responder.'
      },
      settings: {
        paperSize: 'a4',
        fontFamily: 'sans',
        baseFontSize: 'md',
        gridColumns: 12,
        showPointsInPrint: true,
        showBorders: true,
        twoColumnLayout: false
      },
      blocks: [
        {
          id: `blk-1`,
          titleNumber: '01',
          statement: 'Escriba aquí la primera pregunta de su evaluación. Puede modificar el tamaño a cuadrado o rectángulo usando la barra superior.',
          type: 'multiple_choice',
          width: 6,
          heightMode: 'auto',
          points: 5,
          blockTheme: 'standard',
          options: [
            { id: 'opt-1', label: 'A', text: 'Opción 1' },
            { id: 'opt-2', label: 'B', text: 'Opción 2', isCorrect: true },
            { id: 'opt-3', label: 'C', text: 'Opción 3' },
            { id: 'opt-4', label: 'D', text: 'Opción 4' }
          ]
        },
        {
          id: `blk-2`,
          titleNumber: '02',
          statement: 'Segunda pregunta en bloque cuadrado complementario al lado:',
          type: 'multiple_choice',
          width: 6,
          heightMode: 'auto',
          points: 5,
          blockTheme: 'standard',
          options: [
            { id: 'opt-21', label: 'A', text: 'Respuesta A' },
            { id: 'opt-22', label: 'B', text: 'Respuesta B', isCorrect: true }
          ]
        }
      ]
    });
  };

  // Math symbol insertion
  const handleInsertMathSymbol = (symbol: string) => {
    navigator.clipboard.writeText(symbol);
    setCopiedNotification(`¡Símbolo "${symbol}" copiado al portapapeles!`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exam, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${exam.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.blocks && parsed.header) {
            setExam(parsed);
          }
        } catch (err) {
          alert('Error al leer el archivo de examen JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  // Font family css class
  const getFontClass = () => {
    switch (exam.settings.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'sans':
      default: return 'font-sans';
    }
  };

  return (
    <div className={`min-h-screen bg-slate-200/70 text-slate-900 ${getFontClass()} flex flex-col`}>
      
      {/* Top Navbar */}
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
        onPrint={handlePrint}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        totalPoints={totalPoints}
      />

      {/* Word-style Ribbon Toolbar (Visible only in editor view) */}
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
        />
      )}

      {/* Notification Toast */}
      {copiedNotification && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Main Workspace / A4 Sheet View */}
      <main className="flex-1 py-3 sm:py-5 px-1 sm:px-3 flex justify-center items-start overflow-y-auto">
        
        {/* Printable / Visual Paper Sheet Container */}
        <div className={`page-sheet w-full max-w-4xl bg-white shadow-xl rounded-xl border border-slate-300/80 p-3.5 sm:p-5 md:p-6 transition-all ${
          activeView === 'preview_a4' ? 'shadow-2xl ring-1 ring-indigo-500/20' : ''
        }`}>
          
          {/* Header Banner Mode Indicator in Solution Mode */}
          {activeView === 'solution_key' && (
            <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-900 flex items-center justify-between text-xs print:hidden">
              <div className="flex items-center gap-2 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>MODO CLAVE DE RESPUESTAS PARA EL DOCENTE ACTIVO</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700">Las alternativas correctas se resaltan en verde</span>
            </div>
          )}

          {/* Institutional Header */}
          <HeaderEditor
            header={exam.header}
            onUpdateHeader={handleUpdateHeader}
            isPrintMode={activeView === 'preview_a4'}
            totalScore={totalPoints}
          />

          {/* Dynamic Bento Grid of Question Blocks */}
          <div className="grid grid-cols-12 gap-3.5 sm:gap-4.5 items-start">
            {exam.blocks.map((block, idx) => (
              <BlockItem
                key={block.id}
                block={block}
                index={idx}
                totalBlocks={exam.blocks.length}
                onUpdateBlock={(updated) => handleUpdateBlock(block.id, updated)}
                onDeleteBlock={() => handleDeleteBlock(block.id)}
                onDuplicateBlock={() => handleDuplicateBlock(block.id)}
                onMoveUp={() => handleMoveUp(idx)}
                onMoveDown={() => handleMoveDown(idx)}
                onOpenFigureModal={() => handleOpenFigureModalForBlock(block.id)}
                viewMode={activeView}
                showBorders={exam.settings.showBorders}
                baseFontSize={exam.settings.baseFontSize}
                statementJustify={exam.settings.statementJustify}
              />
            ))}
          </div>

          {/* Empty State / Add block helper when empty */}
          {exam.blocks.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl p-6 my-4">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-700 text-sm">No hay preguntas en este examen todavía</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Comienza insertando bloques dinámicos cuadrados, rectangulares o preguntas con figuras desde los botones inferiores.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleAddBlock(6, 'multiple_choice', false)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  + Añadir Bloque Cuadrado (6/12)
                </button>
                <button
                  onClick={() => handleAddBlock(12, 'multiple_choice', true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
                >
                  + Pregunta con Figura (12/12)
                </button>
              </div>
            </div>
          )}

          {/* Quick Add Bar at the bottom of the document */}
          {activeView === 'editor' && (
            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                Añadir nuevo bloque al examen:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleAddBlock(6, 'multiple_choice', false)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-300 rounded-lg font-bold text-slate-700 shadow-2xs transition-all"
                >
                  <Square className="w-3.5 h-3.5 text-indigo-500" />
                  <span>+ Cuadrado (1/2)</span>
                </button>

                <button
                  onClick={() => handleAddBlock(12, 'multiple_choice', false)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-300 rounded-lg font-bold text-slate-700 shadow-2xs transition-all"
                >
                  <RectangleHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                  <span>+ Rectángulo Ancho (12/12)</span>
                </button>

                <button
                  onClick={() => handleAddBlock(4, 'multiple_choice', false)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-300 rounded-lg font-bold text-slate-700 shadow-2xs transition-all"
                >
                  <RectangleVertical className="w-3.5 h-3.5 text-indigo-500" />
                  <span>+ Vertical (1/3)</span>
                </button>

                <button
                  onClick={() => handleAddBlock(6, 'multiple_choice', true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg font-bold shadow-2xs transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Pregunta con Figura</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Diagram Selection / Upload Modal */}
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

      {/* Interactive Student Test-Taking Modal */}
      <StudentExamModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        exam={exam}
        totalPoints={totalPoints}
      />

    </div>
  );
}
