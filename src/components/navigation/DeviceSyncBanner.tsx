import React from 'react';
import { Smartphone, Cloud, ArrowRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { ExamDocument } from '../../types';

interface DeviceSyncBannerProps {
  currentUser: User | null;
  recentCloudExam: ExamDocument | null;
  onOpenAuth: () => void;
  onLoadRecentCloudExam: (exam: ExamDocument) => void;
  onDismissRecentCloudExam: () => void;
  isExamEmpty: boolean;
}

export const DeviceSyncBanner: React.FC<DeviceSyncBannerProps> = ({
  currentUser,
  recentCloudExam,
  onOpenAuth,
  onLoadRecentCloudExam,
  onDismissRecentCloudExam,
  isExamEmpty
}) => {
  return (
    <>
      {/* Device Sync Info Bar for Guests */}
      {!currentUser && (
        <div className="bg-slate-900 text-slate-100 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800 shrink-0 z-20 print:hidden">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <b>¿Creaste un examen en tu computadora?</b> Inicia sesión con tu correo para verlo y sincronizarlo aquí en tu celular.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-md text-white shrink-0 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            Iniciar Sesión
          </button>
        </div>
      )}

      {/* Recent Cloud Exam Prompt from PC for Logged-In Teachers */}
      {currentUser && recentCloudExam && isExamEmpty && (
        <div className="bg-indigo-700 text-white px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-md shrink-0 border-b border-indigo-800 animate-in fade-in z-20 print:hidden">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Cloud className="w-4 h-4 text-indigo-200 shrink-0" />
            <span>
              Tienes tu examen de la computadora disponible: <b>«{recentCloudExam.title || recentCloudExam.header?.examTitle || 'Examen guardado'}»</b>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onLoadRecentCloudExam(recentCloudExam)}
              className="px-3 py-1 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Abrir en pantalla</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDismissRecentCloudExam}
              className="text-xs text-indigo-200 hover:text-white px-2 py-1 cursor-pointer whitespace-nowrap"
            >
              Dejar en blanco
            </button>
          </div>
        </div>
      )}
    </>
  );
};
