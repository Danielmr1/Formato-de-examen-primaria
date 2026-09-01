import { ExamDocument } from '../types';
import { PRESET_DIAGRAMS } from './sampleFigures';

export const SAMPLE_EXAMS: ExamDocument[] = [
  {
    id: 'exam-science-bento',
    title: 'Examen Bimestral de Ciencias y Matemáticas',
    createdAt: '2026-08-31',
    header: {
      institutionName: 'INSTITUTO EDUCATIVO NACIONAL',
      examTitle: 'EVALUACIÓN BIMESTRAL DE CIENCIAS Y MATEMÁTICAS',
      subject: 'Física y Geometría Aplicada',
      teacherName: 'Prof. Daniel Antonio Morales',
      gradeLevel: '4to Año de Secundaria - Sección A',
      durationMinutes: 90,
      dateStr: '15 de Septiembre, 2026',
      headerStyle: 'boxed',
      showStudentNameField: true,
      showDateField: true,
      showScoreBox: true,
      generalInstructions: 'Lea atentamente cada pregunta antes de responder. Utilice lapicero azul o negro para las respuestas definitivas. Está prohibido el uso de dispositivos móviles.'
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
        id: 'blk-1',
        titleNumber: '01',
        statement: 'De acuerdo con el siguiente triángulo rectángulo, calcule la longitud de la **hipotenusa (c)** aplicando el teorema de Pitágoras si los catetos miden a = 4 cm y b = 3 cm.',
        type: 'multiple_choice',
        width: 8,
        heightMode: 'auto',
        points: 4,
        blockTheme: 'standard',
        figure: {
          svgData: PRESET_DIAGRAMS[0].svg,
          caption: 'Figura 1: Triángulo rectángulo con catetos dados.',
          position: 'right',
          widthPercent: 45
        },
        options: [
          { id: 'opt-1', label: 'A', text: '4.5 cm' },
          { id: 'opt-2', label: 'B', text: '5.0 cm', isCorrect: true },
          { id: 'opt-3', label: 'C', text: '6.2 cm' },
          { id: 'opt-4', label: 'D', text: '7.0 cm' }
        ]
      },
      {
        id: 'blk-2',
        titleNumber: '02',
        statement: '¿Cuál de las siguientes afirmaciones sobre la función cuadrática f(x) mostrada en la figura es **correcta**?',
        type: 'multiple_choice',
        width: 4,
        heightMode: 'auto',
        points: 3,
        blockTheme: 'standard',
        figure: {
          svgData: PRESET_DIAGRAMS[1].svg,
          caption: 'Figura 2: Vértice en V(0,3)',
          position: 'top',
          widthPercent: 95
        },
        options: [
          { id: 'opt-21', label: 'A', text: 'El vértice es V(0,3) y abre hacia abajo.' },
          { id: 'opt-22', label: 'B', text: 'El vértice es V(0,3) y tiene mínimo local.', isCorrect: true },
          { id: 'opt-23', label: 'C', text: 'La función no corta el eje Y.' },
          { id: 'opt-24', label: 'D', text: 'Su discriminante es menor que cero.' }
        ]
      },
      {
        id: 'blk-3',
        titleNumber: '03',
        statement: 'Indique si las siguientes proposiciones sobre la **Estructura Celular** son Verdaderas (V) o Falsas (F):',
        type: 'true_false',
        width: 6,
        heightMode: 'auto',
        points: 3,
        blockTheme: 'accent',
        figure: {
          svgData: PRESET_DIAGRAMS[4].svg,
          caption: 'Figura 3: Célula eucariota animal',
          position: 'right',
          widthPercent: 40
        },
        trueFalseOptions: [
          { id: 'tf-1', statement: 'El nucléolo se encuentra en el citoplasma celular.', isTrue: false },
          { id: 'tf-2', statement: 'La membrana plasmática regula el paso de sustancias.', isTrue: true },
          { id: 'tf-3', statement: 'Las células eucariotas carecen de núcleo definido.', isTrue: false }
        ]
      },
      {
        id: 'blk-4',
        titleNumber: '04',
        statement: 'Analice el gráfico estadístico de frecuencias y determine qué porcentaje representa la suma de las categorías A y B.',
        type: 'multiple_choice',
        width: 6,
        heightMode: 'auto',
        points: 3,
        blockTheme: 'standard',
        figure: {
          svgData: PRESET_DIAGRAMS[2].svg,
          caption: 'Figura 4: Distribución de porcentajes A, B, C y D',
          position: 'left',
          widthPercent: 48
        },
        options: [
          { id: 'opt-41', label: 'A', text: '55%' },
          { id: 'opt-42', label: 'B', text: '65%', isCorrect: true },
          { id: 'opt-43', label: 'C', text: '70%' },
          { id: 'opt-44', label: 'D', text: '40%' }
        ]
      },
      {
        id: 'blk-5',
        titleNumber: '05',
        statement: 'Desarrollo y Cálculo: En el sistema de poleas de la Figura 5, si la masa suspendida es **m = 10 kg** y la gravedad es **g = 9.8 m/s²**, halle la fuerza F necesaria para mantener el equilibrio estático. Justifique su procedimiento paso a paso.',
        type: 'open_development',
        width: 12,
        heightMode: 'tall',
        points: 7,
        blockTheme: 'highlight',
        figure: {
          svgData: PRESET_DIAGRAMS[5].svg,
          caption: 'Figura 5: Sistema de polea fija y masa m',
          position: 'right',
          widthPercent: 30
        },
        developmentConfig: {
          style: 'grid',
          heightPx: 140,
          promptHint: ''
        }
      }
    ]
  },
  {
    id: 'exam-literature-grid',
    title: 'Evaluación de Comprensión Lectora y Lenguaje',
    createdAt: '2026-08-31',
    header: {
      institutionName: 'COLEGIO INTERNACIONAL LOS ÁNGELES',
      examTitle: 'EVALUACIÓN DE COMPRENSIÓN LECTORA Y RAZONAMIENTO VERBAL',
      subject: 'Lengua y Literatura Castellana',
      teacherName: 'Dra. Amanda Cárdenas',
      gradeLevel: '5to de Secundaria',
      durationMinutes: 60,
      dateStr: '22 de Octubre, 2026',
      headerStyle: 'modern',
      showStudentNameField: true,
      showDateField: true,
      showScoreBox: true,
      generalInstructions: 'Responda en base al texto propuesto. Cuide la ortografía, coherencia y puntuación en sus respuestas.'
    },
    settings: {
      paperSize: 'a4',
      fontFamily: 'serif',
      baseFontSize: 'md',
      gridColumns: 12,
      showPointsInPrint: true,
      showBorders: true,
      twoColumnLayout: false
    },
    blocks: [
      {
        id: 'blk-lit-1',
        titleNumber: 'TEXTO I',
        statement: '«En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda...»\n\nEl resto de ella concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino.',
        type: 'reading_passage',
        width: 8,
        heightMode: 'tall',
        points: 0,
        blockTheme: 'accent'
      },
      {
        id: 'blk-lit-2',
        titleNumber: '01',
        statement: 'A partir del fragmento del Texto I, ¿qué aspecto del protagonista se resalta primordialmente en la descripción de su alimentación y vestimenta?',
        type: 'multiple_choice',
        width: 4,
        heightMode: 'auto',
        points: 5,
        blockTheme: 'standard',
        options: [
          { id: 'opt-l1', label: 'A', text: 'Su opulencia y gran fortuna nobiliaria.' },
          { id: 'opt-l2', label: 'B', text: 'Su condición hidalga modesta pero digna.', isCorrect: true },
          { id: 'opt-l3', label: 'C', text: 'Su afición desmedida por la caballería andante.' },
          { id: 'opt-l4', label: 'D', text: 'Su desinterés absoluto por las costumbres de su época.' }
        ]
      },
      {
        id: 'blk-lit-3',
        titleNumber: '02',
        statement: 'Relacione los términos arcaicos del texto con sus significados contemporáneos:',
        type: 'matching',
        width: 6,
        heightMode: 'auto',
        points: 5,
        blockTheme: 'standard',
        matchingPairs: [
          { id: 'm-1', leftText: 'Adarga', rightText: 'Escudo de cuero de forma ovalada' },
          { id: 'm-2', leftText: 'Rocín', rightText: 'Caballo de trabajo de mala traza' },
          { id: 'm-3', leftText: 'Hacienda', rightText: 'Patrimonio o conjunto de bienes' },
          { id: 'm-4', leftText: 'Vellorí', rightText: 'Paño entrefino de color pardo' }
        ]
      },
      {
        id: 'blk-lit-4',
        titleNumber: '03',
        statement: 'Redacta una breve síntesis (máximo 4 líneas) explicando por qué el autor menciona con tanto detalle los alimentos de los días de la semana.',
        type: 'open_development',
        width: 6,
        heightMode: 'auto',
        points: 10,
        blockTheme: 'standard',
        developmentConfig: {
          style: 'lines',
          heightPx: 120,
          promptHint: ''
        }
      }
    ]
  }
];
