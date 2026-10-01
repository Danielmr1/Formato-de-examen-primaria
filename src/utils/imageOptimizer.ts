/**
 * Guardrail de optimización y compresión de imágenes
 * Protege contra desbordamiento de cuota de Firestore (límite de 1 MB por documento)
 * y garantiza carga fluida en computadoras y celulares.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeKb: number;
  optimizedSizeKb: number;
  wasCompressed: boolean;
}

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
export const MIN_IMAGE_DIMENSION = 60; // 60px
export const MIN_ASPECT_RATIO = 0.33; // 1:3 (máximo vertical)
export const MAX_ASPECT_RATIO = 3.0; // 3:1 (máximo horizontal)

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AspectMeasureResult {
  width: number;
  height: number;
  aspectRatio: number;
  isExtreme: boolean;
  extremeType?: 'too_wide' | 'too_tall' | 'too_small';
  warning?: string;
}

/**
 * Valida el tamaño y formato del archivo antes de subirlo
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `El archivo pesa ${sizeMb} MB y supera el límite de 5 MB. Selecciona una imagen más liviana.`
    };
  }

  // Permitir SVG y tipos de imagen reconocidos
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.svg')) {
    return {
      isValid: false,
      error: 'Formato no compatible. Por favor sube una imagen en formato JPG, PNG, WebP o SVG.'
    };
  }

  return { isValid: true };
}

/**
 * Mide el tamaño y relación de aspecto de la imagen para alertar desbordes
 */
export async function measureImageAspect(fileOrDataUrl: File | string): Promise<AspectMeasureResult> {
  return new Promise((resolve) => {
    // Si es SVG no tenemos ratio píxel fijo forzado
    if (fileOrDataUrl instanceof File && fileOrDataUrl.type === 'image/svg+xml') {
      resolve({ width: 400, height: 300, aspectRatio: 1.33, isExtreme: false });
      return;
    }
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/svg+xml')) {
      resolve({ width: 400, height: 300, aspectRatio: 1.33, isExtreme: false });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width || 100;
      const height = img.naturalHeight || img.height || 100;
      const ratio = width / Math.max(1, height);

      if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
        resolve({
          width,
          height,
          aspectRatio: ratio,
          isExtreme: true,
          extremeType: 'too_small',
          warning: `La imagen es muy pequeña (${width}×${height}px). Podría verse borrosa o pixelada al imprimir.`
        });
        return;
      }

      if (ratio > MAX_ASPECT_RATIO) {
        resolve({
          width,
          height,
          aspectRatio: ratio,
          isExtreme: true,
          extremeType: 'too_wide',
          warning: `La imagen es muy alargada horizontalmente (proporción ${ratio.toFixed(1)}:1). Al reducirse a la columna del examen se verá muy pequeña.`
        });
        return;
      }

      if (ratio < MIN_ASPECT_RATIO) {
        resolve({
          width,
          height,
          aspectRatio: ratio,
          isExtreme: true,
          extremeType: 'too_tall',
          warning: `La imagen es muy alargada verticalmente (proporción 1:${(1 / ratio).toFixed(1)}). Podría empujar la pregunta hacia abajo y desbordar la página A4.`
        });
        return;
      }

      resolve({
        width,
        height,
        aspectRatio: ratio,
        isExtreme: false
      });
    };

    img.onerror = () => {
      resolve({ width: 100, height: 100, aspectRatio: 1.0, isExtreme: false });
    };

    if (fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      img.src = fileOrDataUrl;
    }
  });
}

/**
 * Centra una imagen de proporción extrema en un lienzo cuadrado o 4:3 con fondo blanco
 * para evitar deformaciones en la hoja de examen.
 */
export async function padImageToSafeRatio(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;
      const maxSide = Math.max(origW, origH, 600);

      const canvas = document.createElement('canvas');
      canvas.width = maxSide;
      canvas.height = maxSide;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Fondo blanco limpio
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, maxSide, maxSide);

      // Centrar imagen
      const offsetX = Math.round((maxSide - origW) / 2);
      const offsetY = Math.round((maxSide - origH) / 2);
      ctx.drawImage(img, offsetX, offsetY, origW, origH);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
export async function optimizeImage(
  fileOrDataUrl: File | string,
  maxDimension: number = 1000,
  quality: number = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // Validar límite de 5 MB y formato si es File
    if (fileOrDataUrl instanceof File) {
      const validation = validateImageFile(fileOrDataUrl);
      if (!validation.isValid) {
        reject(new Error(validation.error || 'Archivo de imagen no válido'));
        return;
      }
    }

    // Si es SVG, no rasterizar: preservar vector original limpio
    if (fileOrDataUrl instanceof File && fileOrDataUrl.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const sizeKb = Math.round(text.length / 1024);
        resolve({
          dataUrl: text,
          originalSizeKb: sizeKb,
          optimizedSizeKb: sizeKb,
          wasCompressed: false
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
      return;
    }

    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/svg+xml')) {
      const sizeKb = Math.round(fileOrDataUrl.length / 1024);
      resolve({
        dataUrl: fileOrDataUrl,
        originalSizeKb: sizeKb,
        optimizedSizeKb: sizeKb,
        wasCompressed: false
      });
      return;
    }

    // Cargar imagen en elemento Image para procesar en Canvas
    const img = new Image();
    if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    // Safety timeout para evitar que se quede colgado indefinidamente
    const timeoutTimer = setTimeout(() => {
      if (fileOrDataUrl instanceof File) {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => {
          const rawUrl = fallbackReader.result as string;
          resolve({
            dataUrl: rawUrl,
            originalSizeKb: Math.round(fileOrDataUrl.size / 1024),
            optimizedSizeKb: Math.round(fileOrDataUrl.size / 1024),
            wasCompressed: false
          });
        };
        fallbackReader.onerror = reject;
        fallbackReader.readAsDataURL(fileOrDataUrl);
      } else {
        resolve({
          dataUrl: fileOrDataUrl,
          originalSizeKb: Math.round(fileOrDataUrl.length / 1024),
          optimizedSizeKb: Math.round(fileOrDataUrl.length / 1024),
          wasCompressed: false
        });
      }
    }, 2500);

    const handleImageLoaded = () => {
      clearTimeout(timeoutTimer);
      let width = img.naturalWidth || img.width || 800;
      let height = img.naturalHeight || img.height || 600;

      // Calcular nuevo tamaño manteniendo relación de aspecto
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback a URL directa si no hay contexto
          resolve({
            dataUrl: img.src,
            originalSizeKb: Math.round(img.src.length / 1024),
            optimizedSizeKb: Math.round(img.src.length / 1024),
            wasCompressed: false
          });
          return;
        }

        // Dibujar fondo blanco por si el PNG tiene transparencia
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar en JPEG optimizado (extremadamente ligero y compatible)
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const originalLen = typeof fileOrDataUrl === 'string' 
          ? fileOrDataUrl.length 
          : (fileOrDataUrl as File).size;

        const originalSizeKb = Math.round(originalLen / 1024);
        const optimizedSizeKb = Math.round(optimizedDataUrl.length / 1024);

        resolve({
          dataUrl: optimizedDataUrl,
          originalSizeKb,
          optimizedSizeKb,
          wasCompressed: optimizedSizeKb < originalSizeKb
        });
      } catch (err) {
        // En caso de cualquier error con canvas (por ej. tainted), usar original
        resolve({
          dataUrl: img.src,
          originalSizeKb: Math.round(img.src.length / 1024),
          optimizedSizeKb: Math.round(img.src.length / 1024),
          wasCompressed: false
        });
      }
    };

    img.onload = handleImageLoaded;
    img.onerror = () => {
      clearTimeout(timeoutTimer);
      // Fallback a FileReader directo
      if (fileOrDataUrl instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          const rawUrl = reader.result as string;
          resolve({
            dataUrl: rawUrl,
            originalSizeKb: Math.round(fileOrDataUrl.size / 1024),
            optimizedSizeKb: Math.round(fileOrDataUrl.size / 1024),
            wasCompressed: false
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      } else {
        reject(new Error('Formato de imagen inválido o corrupto'));
      }
    };

    if (fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      img.src = fileOrDataUrl;
    }
  });
}
