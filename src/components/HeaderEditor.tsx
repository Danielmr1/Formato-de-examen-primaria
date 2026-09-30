import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { ExamHeaderConfig } from '../types';

const hasInstitutionName = (name?: string) => {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower === 'nombre de la institución (opcional)' ||
    lower === 'nombre de la institución' ||
    lower === 'nombre de la institucion (opcional)' ||
    lower === 'nombre de la institucion' ||
    lower === 'nombre de tu institución o colegio' ||
    lower === 'nombre de tu institucion o colegio'
  ) {
    return false;
  }
  return true;
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateHeader({ logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onUpdateHeader({ logoUrl: '' });
  };

  const scoreBoxDimensions = {
    normal: 'w-20 sm:w-24 h-[50px] sm:h-[56px]',
    large: 'w-24 sm:w-28 h-[88px] sm:h-[98px]',
    xlarge: 'w-24 sm:w-28 h-[88px] sm:h-[98px]'
  }[header.scoreBoxSize || 'large'];

  const titleAlignClass = header.titleAlignment === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="w-full mb-4 sm:mb-5 text-slate-800 transition-all group relative">
      
      {/* Hidden file input for logo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />


      
      {/* Boxed Style (Standard Classic Exam) */}
      {header.headerStyle === 'boxed' && (
        <div className="border border-slate-700/90 rounded-lg p-3 bg-white">
          <div className="flex items-end gap-3">
            {/* Left Main Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Top row: Institution, Exam title and Optional Logo */}
              <div className="flex items-center gap-3 border-b border-slate-300/80 pb-2">
                
                {/* Logo or Upload button */}
                {header.logoUrl ? (
                  <div className="relative group/logo shrink-0">
                    <img
                      src={header.logoUrl}
                      alt="Logo de la Institución"
                      className="max-h-14 max-w-20 object-contain rounded"
                    />
                    {!isPrintMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 text-white rounded text-[10px] font-bold opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                ) : null}

                <div className="flex-1 min-w-0">
                  {/* Institution Name */}
                  {hasInstitutionName(header.institutionName) ? (
                    isPrintMode ? (
                      <div className={`font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900 w-full mb-0.5 ${titleAlignClass}`}>
                        {header.institutionName}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={header.institutionName || ''}
                          onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                          placeholder="NOMBRE DE LA INSTITUCIÓN (OPCIONAL)"
                          className={`font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal placeholder:text-xs w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent print:hidden ${titleAlignClass}`}
                        />
                        <div className={`hidden print:block font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900 w-full mb-0.5 ${titleAlignClass}`}>
                          {header.institutionName}
                        </div>
                      </>
                    )
                  ) : (
                    !isPrintMode ? (
                      <input
                        type="text"
                        value={header.institutionName || ''}
                        onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                        placeholder="NOMBRE DE LA INSTITUCIÓN (OPCIONAL)"
                        className={`font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal placeholder:text-xs w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent print:hidden ${titleAlignClass}`}
                      />
                    ) : null
                  )}

                  {/* Exam Title */}
                  {isPrintMode ? (
                    <div className={`font-bold text-xs sm:text-sm text-indigo-900 w-full ${titleAlignClass}`}>
                      {header.examTitle}
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={header.examTitle || ''}
                        onChange={(e) => onUpdateHeader({ examTitle: e.target.value })}
                        placeholder="TÍTULO DE LA EVALUACIÓN"
                        className={`font-bold text-xs sm:text-sm text-indigo-900 w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent print:hidden ${hasInstitutionName(header.institutionName) ? 'mt-0.5' : ''} ${titleAlignClass}`}
                      />
                      <div className={`hidden print:block font-bold text-xs sm:text-sm text-indigo-900 w-full ${hasInstitutionName(header.institutionName) ? 'mt-0.5' : ''} ${titleAlignClass}`}>
                        {header.examTitle}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Student Name Field */}
              {header.showStudentNameField && (
                <div className="py-1.5 flex items-center gap-2 text-xs border-b border-slate-300/80">
                  <span className="font-bold text-slate-900 uppercase tracking-wide shrink-0">
                    Apellidos y Nombres:
                  </span>
                  <div className="flex-1 border-b-2 border-dotted border-slate-400 h-5 sm:h-6"></div>
                </div>
              )}

              {/* Secondary metadata row: Docente, Curso, Grado/Sección, Fecha (distribuido a lo largo de toda la fila) */}
              <div className="flex items-center justify-between gap-4 pt-1.5 text-xs w-full">
                {/* Docente */}
                {(!isPrintMode || (header.teacherName && header.teacherName.trim() !== '')) && (
                  <div className={`flex flex-col flex-1 min-w-0 ${!header.teacherName?.trim() ? 'print:hidden' : ''}`}>
                    <span className="font-bold text-slate-600 text-[11px]">Docente:</span>
                    {isPrintMode ? (
                      <span className="font-medium text-slate-900 py-0.5 truncate">{header.teacherName}</span>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={header.teacherName || ''}
                          onChange={(e) => onUpdateHeader({ teacherName: e.target.value })}
                          placeholder=""
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 w-full print:hidden"
                        />
                        <span className="font-medium text-slate-900 py-0.5 truncate hidden print:inline">{header.teacherName}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Curso / Área */}
                {(!isPrintMode || (header.subject && header.subject.trim() !== '')) && (
                  <div className={`flex flex-col flex-1 min-w-0 ${!header.subject?.trim() ? 'print:hidden' : ''}`}>
                    <span className="font-bold text-slate-600 text-[11px]">Curso / Área:</span>
                    {isPrintMode ? (
                      <span className="font-medium text-slate-900 py-0.5 truncate">{header.subject}</span>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={header.subject || ''}
                          onChange={(e) => onUpdateHeader({ subject: e.target.value })}
                          placeholder=""
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 w-full print:hidden"
                        />
                        <span className="font-medium text-slate-900 py-0.5 truncate hidden print:inline">{header.subject}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Grado / Sección */}
                {(!isPrintMode || (header.gradeLevel && header.gradeLevel.trim() !== '')) && (
                  <div className={`flex flex-col flex-1 min-w-0 text-center ${!header.gradeLevel?.trim() ? 'print:hidden' : ''}`}>
                    <span className="font-bold text-slate-600 text-[11px]">Grado/Sección:</span>
                    {isPrintMode ? (
                      <span className="font-medium text-slate-900 py-0.5 truncate">{header.gradeLevel}</span>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={header.gradeLevel || ''}
                          onChange={(e) => onUpdateHeader({ gradeLevel: e.target.value })}
                          placeholder=""
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 text-center w-full print:hidden"
                        />
                        <span className="font-medium text-slate-900 py-0.5 truncate hidden print:inline text-center">{header.gradeLevel}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Fecha */}
                {header.showDateField && (!isPrintMode || (header.dateStr && header.dateStr.trim() !== '')) && (
                  <div className={`flex flex-col flex-1 min-w-0 text-right ${!header.dateStr?.trim() ? 'print:hidden' : ''}`}>
                    <span className="font-bold text-slate-600 text-[11px] text-right">Fecha:</span>
                    {isPrintMode ? (
                      <span className="font-medium text-slate-900 py-0.5 truncate text-right">{header.dateStr}</span>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={header.dateStr || ''}
                          onChange={(e) => onUpdateHeader({ dateStr: e.target.value })}
                          placeholder=""
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 text-right w-full print:hidden"
                        />
                        <span className="font-medium text-slate-900 py-0.5 truncate hidden print:inline text-right">{header.dateStr}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Score Box aligned to bottom */}
            {header.showScoreBox && (
              <div 
                className={`border-2 border-slate-900 rounded-lg px-2 text-center bg-slate-50/50 shrink-0 flex items-center justify-center transition-all ${scoreBoxDimensions} self-end mb-0.5`}
                title="Espacio para calificar la evaluación"
              />
            )}
          </div>
        </div>
      )}

      {/* Modern Style Header */}
      {header.headerStyle === 'modern' && (
        <div className="border-b border-indigo-500/80 pb-2 mb-3 bg-white">
          <div className="flex items-end gap-3">
            {/* Left Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Institution, Title and Optional Logo */}
              <div className="flex items-center gap-3">
                {header.logoUrl ? (
                  <div className="relative group/logo shrink-0">
                    <img
                      src={header.logoUrl}
                      alt="Logo de la Institución"
                      className="max-h-14 max-w-20 object-contain rounded"
                    />
                    {!isPrintMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 text-white rounded text-[10px] font-bold opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                ) : null}

                <div className="flex-1 min-w-0">
                  {/* Institution Name */}
                  {hasInstitutionName(header.institutionName) ? (
                    isPrintMode ? (
                      <div className={`text-xs font-black tracking-widest text-indigo-700 uppercase w-full ${titleAlignClass}`}>
                        {header.institutionName}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={header.institutionName || ''}
                          onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                          placeholder="NOMBRE DE LA INSTITUCIÓN (OPCIONAL)"
                          className={`text-xs font-black tracking-widest text-indigo-700 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal uppercase w-full border-b border-transparent focus:border-indigo-600 focus:outline-hidden bg-transparent print:hidden ${titleAlignClass}`}
                        />
                        <div className={`hidden print:block text-xs font-black tracking-widest text-indigo-700 uppercase w-full ${titleAlignClass}`}>
                          {header.institutionName}
                        </div>
                      </>
                    )
                  ) : (
                    !isPrintMode ? (
                      <input
                        type="text"
                        value={header.institutionName || ''}
                        onChange={(e) => onUpdateHeader({ institutionName: e.target.value })}
                        placeholder="NOMBRE DE LA INSTITUCIÓN (OPCIONAL)"
                        className={`text-xs font-black tracking-widest text-indigo-700 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal uppercase w-full border-b border-transparent focus:border-indigo-600 focus:outline-hidden bg-transparent print:hidden ${titleAlignClass}`}
                      />
                    ) : null
                  )}

                  {/* Exam Title */}
                  {isPrintMode ? (
                    <div className={`text-base sm:text-lg font-black text-slate-900 tracking-tight w-full ${hasInstitutionName(header.institutionName) ? 'mt-0.5' : ''} ${titleAlignClass}`}>
                      {header.examTitle}
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={header.examTitle || ''}
                        onChange={(e) => onUpdateHeader({ examTitle: e.target.value })}
                        placeholder="TÍTULO DE LA EVALUACIÓN"
                        className={`text-base sm:text-lg font-black text-slate-900 tracking-tight w-full border-b border-transparent focus:border-indigo-600 focus:outline-hidden bg-transparent print:hidden ${hasInstitutionName(header.institutionName) ? 'mt-0.5' : ''} ${titleAlignClass}`}
                      />
                      <div className={`hidden print:block text-base sm:text-lg font-black text-slate-900 tracking-tight w-full ${hasInstitutionName(header.institutionName) ? 'mt-0.5' : ''} ${titleAlignClass}`}>
                        {header.examTitle}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Student Name Field on its own clean row */}
              {header.showStudentNameField && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800 uppercase shrink-0">Apellidos y Nombres:</span>
                  <div className="flex-1 border-b border-slate-300 h-5 sm:h-6"></div>
                </div>
              )}

              {/* Bottom metadata row: Docente, Curso, Grado, Fecha */}
              {(!isPrintMode || 
                (header.teacherName && header.teacherName.trim() !== '') || 
                (header.subject && header.subject.trim() !== '') ||
                (header.showDateField && header.dateStr && header.dateStr.trim() !== '') || 
                (header.gradeLevel && header.gradeLevel.trim() !== '')) && (
                <div className="flex items-center justify-between gap-3 text-xs text-slate-600 mt-1.5 font-medium flex-wrap">
                  {/* Docente */}
                  {(!isPrintMode || (header.teacherName && header.teacherName.trim() !== '')) && (
                    <div className={`flex items-center gap-1 min-w-0 ${!header.teacherName?.trim() ? 'print:hidden' : ''}`}>
                      <strong className="text-slate-700 shrink-0">Docente:</strong>
                      {isPrintMode ? (
                        <span className="truncate">{header.teacherName}</span>
                      ) : (
                        <input
                          type="text"
                          value={header.teacherName || ''}
                          onChange={(e) => onUpdateHeader({ teacherName: e.target.value })}
                          placeholder="Nombre del docente"
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 w-32 sm:w-40 print:hidden"
                        />
                      )}
                    </div>
                  )}

                  {/* Curso */}
                  {(!isPrintMode || (header.subject && header.subject.trim() !== '')) && (
                    <div className={`flex items-center gap-1 min-w-0 ${!header.subject?.trim() ? 'print:hidden' : ''}`}>
                      <strong className="text-slate-700 shrink-0">Curso:</strong>
                      {isPrintMode ? (
                        <span className="truncate">{header.subject}</span>
                      ) : (
                        <input
                          type="text"
                          value={header.subject || ''}
                          onChange={(e) => onUpdateHeader({ subject: e.target.value })}
                          placeholder="Asignatura"
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 w-28 sm:w-32 print:hidden"
                        />
                      )}
                    </div>
                  )}

                  {/* Grado */}
                  {(!isPrintMode || (header.gradeLevel && header.gradeLevel.trim() !== '')) && (
                    <div className={`flex items-center gap-1 min-w-0 ${!header.gradeLevel?.trim() ? 'print:hidden' : ''}`}>
                      <strong className="text-slate-700 shrink-0">Grado:</strong>
                      {isPrintMode ? (
                        <span className="truncate">{header.gradeLevel}</span>
                      ) : (
                        <input
                          type="text"
                          value={header.gradeLevel || ''}
                          onChange={(e) => onUpdateHeader({ gradeLevel: e.target.value })}
                          placeholder="Grado/Sec."
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 w-24 sm:w-28 print:hidden"
                        />
                      )}
                    </div>
                  )}

                  {/* Fecha */}
                  {header.showDateField && (!isPrintMode || (header.dateStr && header.dateStr.trim() !== '')) && (
                    <div className={`flex items-center gap-1 min-w-0 ${!header.dateStr?.trim() ? 'print:hidden' : ''}`}>
                      <strong className="text-slate-700 shrink-0">Fecha:</strong>
                      {isPrintMode ? (
                        <span className="truncate">{header.dateStr}</span>
                      ) : (
                        <input
                          type="text"
                          value={header.dateStr || ''}
                          onChange={(e) => onUpdateHeader({ dateStr: e.target.value })}
                          placeholder="Fecha"
                          className="font-medium text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden bg-transparent py-0.5 w-24 sm:w-28 print:hidden"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Score Box */}
            {header.showScoreBox && (
              <div 
                className={`border-2 border-indigo-500 rounded-lg bg-indigo-50/20 text-center shrink-0 transition-all ${scoreBoxDimensions} self-end mb-0.5`}
                title="Espacio para calificar la evaluación"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
