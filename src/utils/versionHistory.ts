import { ExamDocument } from '../types';

export interface ExamSnapshot {
  id: string;
  examId: string;
  timestamp: number;
  timeFormatted: string;
  title: string;
  questionCount: number;
  totalPoints: number;
  examData: ExamDocument;
}

const MAX_SNAPSHOTS = 5;

/**
 * Guarda una copia de seguridad en el historial local del navegador
 */
export function saveLocalSnapshot(exam: ExamDocument, totalPoints: number): void {
  if (!exam || !exam.id) return;
  try {
    const storageKey = `docu_snapshots_${exam.id}`;
    const raw = localStorage.getItem(storageKey);
    let snapshots: ExamSnapshot[] = raw ? JSON.parse(raw) : [];

    const now = Date.now();
    // Evitar guardar duplicados idénticos en menos de 45 segundos
    if (snapshots.length > 0) {
      const last = snapshots[0];
      if (now - last.timestamp < 45000) {
        return;
      }
    }

    const newSnapshot: ExamSnapshot = {
      id: `snap-${now}`,
      examId: exam.id,
      timestamp: now,
      timeFormatted: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: exam.title || 'Sin título',
      questionCount: exam.blocks?.length || 0,
      totalPoints,
      examData: JSON.parse(JSON.stringify(exam))
    };

    snapshots = [newSnapshot, ...snapshots.slice(0, MAX_SNAPSHOTS - 1)];
    localStorage.setItem(storageKey, JSON.stringify(snapshots));
  } catch (err) {
    console.warn('No se pudo guardar la instantánea local:', err);
  }
}

/**
 * Obtiene las instantáneas locales para un examen
 */
export function getLocalSnapshots(examId: string): ExamSnapshot[] {
  try {
    const raw = localStorage.getItem(`docu_snapshots_${examId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Elimina el historial local de un examen
 */
export function clearLocalSnapshots(examId: string): void {
  try {
    localStorage.removeItem(`docu_snapshots_${examId}`);
  } catch {}
}
