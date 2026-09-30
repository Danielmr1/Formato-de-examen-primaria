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

/**
 * Comprime y redimensiona una imagen (File o base64) antes de guardarla en el examen
 * @param fileOrDataUrl Archivo File o cadena Base64 DataURL
 * @param maxDimension Dimensión máxima en píxeles (ancho o alto, defecto 1000px)
 * @param quality Calidad JPEG (0.1 a 1.0, defecto 0.82)
 */
export async function optimizeImage(
  fileOrDataUrl: File | string,
  maxDimension: number = 1000,
  quality: number = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
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
