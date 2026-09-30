import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc, 
  collection, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ExamDocument } from '../types';

// Inicializar App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Autenticación
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged };
export type { User };

// Base de datos Firestore con ID de base de datos específico provisto
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validar conexión inicial a Firestore según especificación
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface TeacherProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  schoolName?: string;
  createdAt?: string;
}

// Auth Helpers
export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  // Crear o actualizar perfil en Firestore
  const userPath = `users/${result.user.uid}`;
  const userRef = doc(db, 'users', result.user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || 'Docente',
        schoolName: '',
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
  return result.user;
};

export const registerWithEmail = async (
  email: string, 
  pass: string, 
  displayName: string,
  schoolName?: string
): Promise<User> => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(res.user, { displayName });
  }
  // Guardar documento de perfil en Firestore
  const userPath = `users/${res.user.uid}`;
  try {
    await setDoc(doc(db, 'users', res.user.uid), {
      uid: res.user.uid,
      email: res.user.email,
      displayName: displayName || 'Docente',
      schoolName: schoolName || '',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, userPath);
  }
  return res.user;
};

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

// Firestore Exam CRUD Helpers (almacenados en /users/{userId}/exams/{examId})
export const saveExamToCloud = async (userId: string, exam: ExamDocument): Promise<void> => {
  if (!userId || !exam || !exam.id) return;
  const examPath = `users/${userId}/exams/${exam.id}`;
  const examRef = doc(db, 'users', userId, 'exams', exam.id);

  // CRÍTICO: Firestore arroja excepción fatal si cualquier propiedad tiene valor 'undefined'.
  // JSON.parse(JSON.stringify(...)) elimina limpiamente todas las propiedades con valor undefined.
  const rawPayload = {
    ...exam,
    userId,
    updatedAt: new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }),
    savedAtTimestamp: Date.now()
  };
  const cleanPayload = JSON.parse(JSON.stringify(rawPayload));

  try {
    await setDoc(examRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, examPath);
  }
};

export const deleteExamFromCloud = async (userId: string, examId: string): Promise<void> => {
  if (!userId || !examId) return;
  const examPath = `users/${userId}/exams/${examId}`;
  const examRef = doc(db, 'users', userId, 'exams', examId);
  try {
    await deleteDoc(examRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, examPath);
  }
};

export const fetchTeacherExamsOnce = async (userId: string): Promise<ExamDocument[]> => {
  if (!userId) return [];
  const examsPath = `users/${userId}/exams`;
  try {
    const examsCol = collection(db, 'users', userId, 'exams');
    const snapshot = await getDocs(examsCol);
    const list: (ExamDocument & { savedAtTimestamp?: number })[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ExamDocument & { savedAtTimestamp?: number };
      list.push(data);
    });
    list.sort((a, b) => {
      const timeA = a.savedAtTimestamp || 0;
      const timeB = b.savedAtTimestamp || 0;
      if (timeA && timeB) return timeB - timeA;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, examsPath);
  }
};

export const subscribeToTeacherExams = (
  userId: string, 
  onExamsUpdated: (exams: ExamDocument[]) => void,
  onError?: (err: unknown) => void
) => {
  if (!userId) return () => {};
  const examsCol = collection(db, 'users', userId, 'exams');
  
  return onSnapshot(examsCol, (snapshot) => {
    const list: (ExamDocument & { savedAtTimestamp?: number })[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ExamDocument & { savedAtTimestamp?: number };
      list.push(data);
    });
    list.sort((a, b) => {
      const timeA = a.savedAtTimestamp || 0;
      const timeB = b.savedAtTimestamp || 0;
      if (timeA && timeB) return timeB - timeA;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
    onExamsUpdated(list);
  }, (err) => {
    console.error('Error en listener de Firestore:', err);
    if (onError) {
      onError(err);
    }
  });
};
