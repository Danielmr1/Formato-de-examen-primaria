import React from 'react';
import { School, User, Calendar, Award, FileText, Settings, BookOpen } from 'lucide-react';
import { ExamHeaderConfig } from '../types';

interface HeaderEditorProps {
  header: ExamHeaderConfig;
  onUpdateHeader: (updated: Partial<ExamHeaderConfig>) => void;
  isPrintMode?: boolean;
  totalScore?: number;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  header,
  onUpdateHeader,
  isPrintMode = false,
  totalScore = 20,
}) => {
  const scoreBoxDimensions = {
    normal: 'min-w-[95px] sm:min-w-[110px] h-16 sm:h-18',
    large: 'min-w-[115px] sm:min-w-[135px] h-20 sm:h-24',
    xlarge: 'min-w-[135px] sm:min-w-[160px] h-24 sm:h-28'
  }[header.scoreBoxSize || 'large'];

  return (
    <div className="w-full mb-4 sm:mb-5 text-slate-800 transition-all group relative">
      
      {/* Boxed Style (Standard Classic Exam) */}
      {header.headerStyle === 'boxed' && (
        <div className="border border-slate-700/90 rounded-lg p-3 sm:p-4 bg-white">
          {/* Top row: Institution and Exam title */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-400/70 pb-2.5 gap-3">
            <div className="flex items-center gap-3 text-center sm:left flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <input
                  type="text"
                  value={header.institutionName}
                  onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                  placeholder="NOMBRE DE LA INSTITUCIÓN EDUCATIVA"
                  className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900 w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent"
                />
                <input
                  type="text"
                  value={header.examTitle}
                  onChange={(e) => onUpdateHeader({ examTitle: e.target.value })}
                  placeholder="TÍTULO DE LA EVALUACIÓN"
                  className="font-bold text-xs sm:text-sm text-indigo-900 w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent mt-0.5"
                />
              </div>
            </div>

            {/* Score Box */}
            {header.showScoreBox && (
              <div 
                className={`border-2 border-slate-900 rounded-lg px-3 py-2 text-center bg-slate-50/50 shrink-0 flex items-center justify-center transition-all ${scoreBoxDimensions}`}
                title="Espacio para calificar la evaluación"
              />
            )}
          </div>

          {/* Middle metadata row: Subject, Teacher, Grade, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 py-2 text-xs border-b border-slate-300/80">
            <div>
              <span className="font-bold text-slate-600">Área/Asignatura: </span>
              <input
                type="text"
                value={header.subject}
                onChange={(e) => onUpdateHeader({ subject: e.target.value })}
                placeholder="Matemática / Ciencias"
                className="font-semibold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent"
              />
            </div>
            <div>
              <span className="font-bold text-slate-600">Docente: </span>
              <input
                type="text"
                value={header.teacherName}
                onChange={(e) => onUpdateHeader({ teacherName: e.target.value })}
                placeholder="Nombre del Docente"
                className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent"
              />
            </div>
            <div>
              <span className="font-bold text-slate-600">Grado/Sección: </span>
              <input
                type="text"
                value={header.gradeLevel}
                onChange={(e) => onUpdateHeader({ gradeLevel: e.target.value })}
                placeholder="4to Secundaria - A"
                className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent"
              />
            </div>
            {header.showDateField && (
              <div>
                <span className="font-bold text-slate-600">Fecha: </span>
                <input
                  type="text"
                  value={header.dateStr || ''}
                  onChange={(e) => onUpdateHeader({ dateStr: e.target.value })}
                  placeholder=""
                  className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent min-w-[70px]"
                />
              </div>
            )}
          </div>

          {/* Student Name Field - Spacious for easy handwritten name */}
          {header.showStudentNameField && (
            <div className="pt-2.5 pb-1 flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wide shrink-0">
                Apellidos y Nombres:
              </span>
              <div className="flex-1 border-b-2 border-dotted border-slate-400 h-8 sm:h-9"></div>
            </div>
          )}

          {/* Instructions Box */}
          {header.generalInstructions && (
            <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-600 italic">
              <span className="font-bold not-italic text-slate-700">Instrucciones: </span>
              <input
                type="text"
                value={header.generalInstructions}
                onChange={(e) => onUpdateHeader({ generalInstructions: e.target.value })}
                className="w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent not-italic"
              />
            </div>
          )}
        </div>
      )}

      {/* Modern Style Header */}
      {header.headerStyle === 'modern' && (
        <div className="border-b border-indigo-500/80 pb-2.5 mb-3 bg-white">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={header.institutionName}
                onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                className="text-xs font-black tracking-widest text-indigo-700 uppercase w-full border-b border-transparent focus:border-indigo-600 focus:outline-hidden bg-transparent"
              />
              <input
                type="text"
                value={header.examTitle}
                onChange={(e) => onUpdateHeader({ examTitle: e.target.value })}
                className="text-base sm:text-lg font-black text-slate-900 tracking-tight w-full border-b border-transparent focus:border-indigo-600 focus:outline-hidden bg-transparent mt-0.5"
              />
              <div className="flex items-center gap-2.5 text-xs text-slate-600 mt-1 font-medium flex-wrap">
                <span>{header.subject}</span>
                <span>•</span>
                <span>{header.gradeLevel}</span>
                {header.dateStr && (
                  <>
                    <span>•</span>
                    <span>{header.dateStr}</span>
                  </>
                )}
              </div>
            </div>
            {header.showScoreBox && (
              <div 
                className={`border-2 border-indigo-500 rounded-lg bg-indigo-50/20 text-center shrink-0 transition-all ${scoreBoxDimensions}`}
                title="Espacio para calificar la evaluación"
              />
            )}
          </div>

          {header.showStudentNameField && (
            <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 shrink-0">Estudiante:</span>
              <div className="flex-1 border-b border-slate-300 h-8 sm:h-9"></div>
            </div>
          )}
        </div>
      )}

      {/* Header Style & Score Box Size Toolbar on hover */}
      {!isPrintMode && (
        <div className="absolute -top-3.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg border border-slate-200 rounded-lg px-2.5 py-1 text-xs flex items-center gap-2.5 z-10 print:hidden">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Estilo:</span>
          <button
            onClick={() => onUpdateHeader({ headerStyle: 'boxed' })}
            className={`px-2 py-0.5 rounded text-[11px] ${header.headerStyle === 'boxed' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Institucional
          </button>
          <button
            onClick={() => onUpdateHeader({ headerStyle: 'modern' })}
            className={`px-2 py-0.5 rounded text-[11px] ${header.headerStyle === 'modern' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Moderno
          </button>
          
          <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
          
          <span className="text-[10px] font-bold text-slate-500 uppercase">Tamaño Recuadro Nota:</span>
          <button
            onClick={() => onUpdateHeader({ scoreBoxSize: 'normal' })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${(header.scoreBoxSize === 'normal') ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Normal
          </button>
          <button
            onClick={() => onUpdateHeader({ scoreBoxSize: 'large' })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${(!header.scoreBoxSize || header.scoreBoxSize === 'large') ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Grande
          </button>
          <button
            onClick={() => onUpdateHeader({ scoreBoxSize: 'xlarge' })}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${(header.scoreBoxSize === 'xlarge') ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Extra Grande
          </button>
        </div>
      )}

    </div>
  );
};
