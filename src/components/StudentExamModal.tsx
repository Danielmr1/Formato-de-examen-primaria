import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  GraduationCap, 
  Award, 
  RotateCcw, 
  Send,
  AlertCircle
} from 'lucide-react';
import { ExamDocument, StudentAnswers } from '../types';
import { FormattedMathText } from '../utils/mathFormatter';

interface StudentExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamDocument;
  totalPoints: number;
}

export const StudentExamModal: React.FC<StudentExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  totalPoints,
}) => {
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [studentName, setStudentName] = useState<string>('Estudiante Demo');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [earnedScore, setEarnedScore] = useState<number>(0);

  if (!isOpen) return null;

  const handleSelectChoice = (blockId: string, choiceId: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        selectedChoiceId: choiceId
      }
    }));
  };

  const handleSelectTF = (blockId: string, tfId: string, value: boolean) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        trueFalseAnswers: {
          ...(prev[blockId]?.trueFalseAnswers || {}),
          [tfId]: value
        }
      }
    }));
  };

  const handleOpenTextChange = (blockId: string, text: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        openText: text
      }
    }));
  };

  const handleSubmitExam = () => {
    let score = 0;

    exam.blocks.forEach(block => {
      if (block.type === 'multiple_choice') {
        const correctOpt = block.options?.find(o => o.isCorrect);
        if (correctOpt && answers[block.id]?.selectedChoiceId === correctOpt.id) {
          score += block.points;
        }
      } else if (block.type === 'true_false') {
        const tfItems = block.trueFalseOptions || [];
        if (tfItems.length > 0) {
          let correctCount = 0;
          tfItems.forEach(item => {
            if (answers[block.id]?.trueFalseAnswers?.[item.id] === item.isTrue) {
              correctCount++;
            }
          });
          score += Math.round((correctCount / tfItems.length) * block.points);
        }
      } else if (block.type === 'open_development') {
        // Award full points if student wrote content for demo purposes
        if (answers[block.id]?.openText && answers[block.id]?.openText!.trim().length > 10) {
          score += block.points;
        }
      }
    });

    setEarnedScore(score);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setEarnedScore(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">{exam.header.examTitle || exam.title}</h3>
              <p className="text-xs text-slate-300">
                {exam.header.subject} • Docente: {exam.header.teacherName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student metadata bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Nombre del Alumno:</span>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              disabled={isSubmitted}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500">Puntaje Total: <strong className="text-slate-800">{totalPoints} pts</strong></span>
            {isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-black text-sm">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Nota Obtenida: {earnedScore} / {totalPoints} pts</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Blocks in Student Mode */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-100/60">
          
          {/* Instructions */}
          {exam.header.generalInstructions && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Instrucciones:</strong> {exam.header.generalInstructions}
              </div>
            </div>
          )}

          {/* Interactive Questions Grid */}
          <div className="grid grid-cols-12 gap-4">
            {exam.blocks.map((block, idx) => {
              const blockAns = answers[block.id];
              const isCorrectMC = block.type === 'multiple_choice' && block.options?.find(o => o.isCorrect)?.id === blockAns?.selectedChoiceId;

              return (
                <div 
                  key={block.id}
                  className={`${block.width === 8 ? 'col-span-8' : block.width === 6 ? 'col-span-6' : block.width === 4 ? 'col-span-4' : block.width === 3 ? 'col-span-3' : 'col-span-12'} bg-white rounded-xl p-5 border shadow-2xs ${
                    isSubmitted
                      ? block.type === 'multiple_choice'
                        ? isCorrectMC ? 'border-emerald-300 bg-emerald-50/20' : 'border-rose-300 bg-rose-50/20'
                        : 'border-slate-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-extrabold text-sm px-2.5 py-0.5 bg-slate-900 text-white rounded-md">
                      {block.titleNumber || `${idx + 1}`}
                    </span>
                    {block.type !== 'reading_passage' && (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {block.points} pts
                      </span>
                    )}
                  </div>

                  {/* Figure */}
                  {block.figure && (
                    <div className="mb-3 flex flex-col items-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      {block.figure.svgData ? (
                        <div 
                          className="w-full max-h-48 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: block.figure.svgData }}
                        />
                      ) : block.figure.url ? (
                        <img src={block.figure.url} alt="Figura" className="max-h-48 object-contain rounded" />
                      ) : null}
                      {block.figure.caption && (
                        <span className="text-[11px] text-slate-500 italic mt-1">{block.figure.caption}</span>
                      )}
                    </div>
                  )}

                  {/* Statement */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium mb-3">
                    <FormattedMathText text={block.statement} />
                  </div>

                  {/* Answer Inputs */}
                  {block.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {(block.options || []).map(opt => {
                        const isSelected = blockAns?.selectedChoiceId === opt.id;
                        const isThisCorrect = opt.isCorrect;

                        return (
                          <button
                            key={opt.id}
                            disabled={isSubmitted}
                            onClick={() => handleSelectChoice(block.id, opt.id)}
                            className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border flex items-center gap-3 transition-all ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold'
                                : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                            } ${
                              isSubmitted && isThisCorrect
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                                : ''
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                            }`}>
                              {opt.label}
                            </span>
                            <span className="flex-1">
                              <FormattedMathText text={opt.text} />
                            </span>
                            {isSubmitted && isThisCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {block.type === 'true_false' && (
                    <div className="space-y-2">
                      {(block.trueFalseOptions || []).map(tf => (
                        <div key={tf.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs gap-2">
                          <span className="flex-1 text-slate-700">
                            <FormattedMathText text={tf.statement} />
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={isSubmitted}
                              onClick={() => handleSelectTF(block.id, tf.id, true)}
                              className={`w-8 h-7 rounded font-bold transition-colors ${
                                blockAns?.trueFalseAnswers?.[tf.id] === true
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              V
                            </button>
                            <button
                              disabled={isSubmitted}
                              onClick={() => handleSelectTF(block.id, tf.id, false)}
                              className={`w-8 h-7 rounded font-bold transition-colors ${
                                blockAns?.trueFalseAnswers?.[tf.id] === false
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              F
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {block.type === 'open_development' && (
                    <div>
                      <textarea
                        disabled={isSubmitted}
                        value={blockAns?.openText || ''}
                        onChange={(e) => handleOpenTextChange(block.id, e.target.value)}
                        placeholder="Escribe tu desarrollo, fórmulas o respuesta aquí..."
                        rows={4}
                        className="w-full text-xs text-slate-800 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar Examen</span>
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Entregar y Calificar Examen</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
