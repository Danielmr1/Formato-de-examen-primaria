import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  User, 
  saveExamToCloud, 
  fetchTeacherExamsOnce,
  logoutUser 
} from '../lib/firebase';
import { ExamDocument } from '../types';

export interface UseCloudSyncReturn {
  currentUser: User | null;
  cloudSyncStatus: 'idle' | 'saving' | 'saved' | 'error';
  isCloudSaving: boolean;
  recentCloudExam: ExamDocument | null;
  clearRecentCloudExam: () => void;
  manualSaveCloud: (exam: ExamDocument) => Promise<boolean>;
  logout: () => Promise<void>;
  initialSyncDone: boolean;
}

export function useCloudSync(
  exam: ExamDocument,
  setExam: Dispatch<SetStateAction<ExamDocument>>,
  setExamsList: Dispatch<SetStateAction<ExamDocument[]>>,
  sanitizeExamFn: (doc: any) => ExamDocument,
  onNotify: (message: string) => void
): UseCloudSyncReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isCloudSaving, setIsCloudSaving] = useState<boolean>(false);
  const [initialSyncDone, setInitialSyncDone] = useState<boolean>(false);
  const [recentCloudExam, setRecentCloudExam] = useState<ExamDocument | null>(null);

  // Escuchar estado de autenticación y cargar exámenes
  useEffect(() => {
    let isCancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setIsCloudSaving(true);
          const cloudExams = await fetchTeacherExamsOnce(user.uid);
          if (isCancelled) return;

          if (cloudExams && cloudExams.length > 0) {
            const sanitized = cloudExams.map(sanitizeExamFn);
            setExamsList(sanitized);
            localStorage.setItem('docu_teacher_exams_list', JSON.stringify(sanitized));

            setExam((prevExam) => {
              const hasContent = prevExam.blocks.length > 0 || (prevExam.header.examTitle && prevExam.header.examTitle.trim() !== '');
              if (hasContent) {
                saveExamToCloud(user.uid, sanitizeExamFn(prevExam)).catch(console.error);
                return prevExam;
              } else {
                setRecentCloudExam(sanitized[0]);
                return prevExam;
              }
            });
          } else {
            setExam((prevExam) => {
              const hasContent = prevExam.blocks.length > 0 || (prevExam.header.examTitle && prevExam.header.examTitle.trim() !== '');
              if (hasContent) {
                saveExamToCloud(user.uid, sanitizeExamFn(prevExam)).catch(console.error);
              }
              return prevExam;
            });
          }
        } catch (err) {
          console.error('Error al sincronizar exámenes iniciales con Firebase:', err);
        } finally {
          setIsCloudSaving(false);
          setInitialSyncDone(true);
        }
      } else {
        setInitialSyncDone(true);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  // Guardado automático en la nube cuando cambia el examen (debounced 1.2s)
  useEffect(() => {
    if (!currentUser || !initialSyncDone) return;
    const hasMeaningfulContent = exam.blocks.length > 0 || (exam.header.examTitle && exam.header.examTitle.trim() !== '');
    if (!hasMeaningfulContent) return;

    setCloudSyncStatus('saving');
    setIsCloudSaving(true);

    const timer = setTimeout(async () => {
      try {
        await saveExamToCloud(currentUser.uid, sanitizeExamFn(exam));
        setCloudSyncStatus('saved');
        setTimeout(() => setCloudSyncStatus('idle'), 3500);
      } catch (err) {
        console.error('Error al guardar en la nube de Firebase:', err);
        setCloudSyncStatus('error');
      } finally {
        setIsCloudSaving(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [exam, currentUser?.uid, initialSyncDone]);

  // Guardado manual inmediato
  const manualSaveCloud = useCallback(async (currentDoc: ExamDocument): Promise<boolean> => {
    if (!currentUser) return false;
    setIsCloudSaving(true);
    setCloudSyncStatus('saving');
    try {
      await saveExamToCloud(currentUser.uid, sanitizeExamFn(currentDoc));
      setCloudSyncStatus('saved');
      onNotify('☁ ¡Examen guardado exitosamente en tu cuenta en la nube!');
      return true;
    } catch (err) {
      console.error('Error al guardar en la nube:', err);
      setCloudSyncStatus('error');
      onNotify('Error al guardar en la nube. Revisa tu conexión.');
      return false;
    } finally {
      setIsCloudSaving(false);
    }
  }, [currentUser, onNotify, sanitizeExamFn]);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    onNotify('Sesión cerrada');
  }, [onNotify]);

  const clearRecentCloudExam = useCallback(() => {
    setRecentCloudExam(null);
  }, []);

  return {
    currentUser,
    cloudSyncStatus,
    isCloudSaving,
    recentCloudExam,
    clearRecentCloudExam,
    manualSaveCloud,
    logout,
    initialSyncDone
  };
}
