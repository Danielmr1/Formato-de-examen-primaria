export interface EditableDiagramTemplate {
  id: string;
  name: string;
  category: 'Geometría' | 'Estadística' | 'Diagramas' | 'Física' | 'Ciencias';
  description: string;
  defaultParams: Record<string, string | number | boolean>;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    placeholder?: string;
  }[];
  generateSvg: (params: Record<string, any>) => string;
}

export const EDITABLE_TEMPLATES: EditableDiagramTemplate[] = [
  {
    id: 'triangle-right',
    name: 'Triángulo Rectángulo (Pitágoras / Trigonometría)',
    category: 'Geometría',
    description: 'Edita los catetos, hipotenusa, ángulos y vértices.',
    defaultParams: {
      sideA: 'a = 4 cm',
      sideB: 'b = 3 cm',
      sideC: 'c = ?',
      angleAlpha: 'α',
      angleBeta: '',
      showRightAngle: true,
      vertexA: 'A',
      vertexB: 'B',
      vertexC: 'C',
    },
    fields: [
      { key: 'sideA', label: 'Cateto Base (Horizontal)', type: 'text', placeholder: 'Ej: a = 4 cm o 12' },
      { key: 'sideB', label: 'Cateto Altura (Vertical)', type: 'text', placeholder: 'Ej: b = 3 cm o 5' },
      { key: 'sideC', label: 'Hipotenusa', type: 'text', placeholder: 'Ej: c = ? o 10 cm' },
      { key: 'angleAlpha', label: 'Ángulo Inferior (α)', type: 'text', placeholder: 'Ej: α, 30°, 37°' },
      { key: 'angleBeta', label: 'Ángulo Superior (β)', type: 'text', placeholder: 'Ej: β, 60°, 53°' },
      { key: 'showRightAngle', label: 'Mostrar símbolo de 90°', type: 'boolean' },
    ],
    generateSvg: (p) => {
      const a = p.sideA || '';
      const b = p.sideB || '';
      const c = p.sideC || '';
      const alpha = p.angleAlpha || '';
      const beta = p.angleBeta || '';
      const rightAngle = p.showRightAngle !== false;

      return `<svg viewBox="0 0 220 170" class="w-full h-full stroke-slate-800 fill-none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="35,135 185,135 35,30" class="fill-indigo-50/50 stroke-indigo-700 stroke-2" />
        ${rightAngle ? '<rect x="35" y="119" width="16" height="16" class="stroke-indigo-700 fill-none" stroke-width="1.8" />' : ''}
        ${a ? `<text x="110" y="156" class="text-xs fill-slate-800 font-sans font-bold" text-anchor="middle">${a}</text>` : ''}
        ${b ? `<text x="18" y="86" class="text-xs fill-slate-800 font-sans font-bold" text-anchor="middle">${b}</text>` : ''}
        ${c ? `<text x="120" y="70" class="text-xs fill-indigo-900 font-sans font-extrabold" text-anchor="middle">${c}</text>` : ''}
        <circle cx="185" cy="135" r="3.5" class="fill-indigo-600" />
        <circle cx="35" cy="30" r="3.5" class="fill-indigo-600" />
        <circle cx="35" cy="135" r="3.5" class="fill-indigo-600" />
        ${alpha ? `
          <path d="M 158,135 A 27 27 0 0 0 166,115" class="stroke-slate-500 stroke-1.5 fill-none" />
          <text x="146" y="127" class="text-[11px] fill-slate-700 font-sans font-bold">${alpha}</text>
        ` : ''}
        ${beta ? `
          <path d="M 35,58 A 28 28 0 0 0 54,45" class="stroke-slate-500 stroke-1.5 fill-none" />
          <text x="48" y="65" class="text-[11px] fill-slate-700 font-sans font-bold">${beta}</text>
        ` : ''}
      </svg>`;
    }
  },
  {
    id: 'stats-bar-chart',
    name: 'Gráfico Estadístico de Barras',
    category: 'Estadística',
    description: 'Personaliza los nombres de categorías, porcentajes o cantidades.',
    defaultParams: {
      bar1Label: 'A', bar1Value: '25%', bar1Height: 50,
      bar2Label: 'B', bar2Value: '40%', bar2Height: 80,
      bar3Label: 'C', bar3Value: '32%', bar3Height: 65,
      bar4Label: 'D', bar4Value: '18%', bar4Height: 35,
      yAxisTitle: 'Frecuencia / %',
    },
    fields: [
      { key: 'yAxisTitle', label: 'Título del Eje', type: 'text', placeholder: 'Ej: % o Alumnos' },
      { key: 'bar1Label', label: 'Barra 1: Categoría', type: 'text' },
      { key: 'bar1Value', label: 'Barra 1: Valor / Texto', type: 'text' },
      { key: 'bar2Label', label: 'Barra 2: Categoría', type: 'text' },
      { key: 'bar2Value', label: 'Barra 2: Valor / Texto', type: 'text' },
      { key: 'bar3Label', label: 'Barra 3: Categoría', type: 'text' },
      { key: 'bar3Value', label: 'Barra 3: Valor / Texto', type: 'text' },
      { key: 'bar4Label', label: 'Barra 4: Categoría', type: 'text' },
      { key: 'bar4Value', label: 'Barra 4: Valor / Texto', type: 'text' },
    ],
    generateSvg: (p) => {
      // Calculate heights based on values or defaults
      const getH = (valStr: string, defaultH: number) => {
        const num = parseFloat(String(valStr).replace('%', ''));
        if (!isNaN(num) && num > 0) {
          return Math.min(85, Math.max(15, (num / 50) * 85));
        }
        return defaultH;
      };

      const h1 = getH(p.bar1Value, 50);
      const h2 = getH(p.bar2Value, 80);
      const h3 = getH(p.bar3Value, 65);
      const h4 = getH(p.bar4Value, 35);

      const yBase = 120;

      return `<svg viewBox="0 0 210 155" class="w-full h-full">
        <!-- Axes -->
        <line x1="32" y1="${yBase}" x2="195" y2="${yBase}" stroke="#334155" stroke-width="1.8" />
        <line x1="32" y1="18" x2="32" y2="${yBase}" stroke="#334155" stroke-width="1.8" />
        ${p.yAxisTitle ? `<text x="30" y="12" class="text-[8px] fill-slate-500 font-sans font-bold" text-anchor="start">${p.yAxisTitle}</text>` : ''}
        
        <!-- Bars -->
        <rect x="46" y="${yBase - h1}" width="24" height="${h1}" rx="3" fill="#6366f1" />
        <rect x="82" y="${yBase - h2}" width="24" height="${h2}" rx="3" fill="#3b82f6" />
        <rect x="118" y="${yBase - h3}" width="24" height="${h3}" rx="3" fill="#06b6d4" />
        <rect x="154" y="${yBase - h4}" width="24" height="${h4}" rx="3" fill="#10b981" />

        <!-- Bar Values on top -->
        <text x="58" y="${yBase - h1 - 5}" text-anchor="middle" class="text-[9px] fill-slate-800 font-sans font-bold">${p.bar1Value || ''}</text>
        <text x="94" y="${yBase - h2 - 5}" text-anchor="middle" class="text-[9px] fill-slate-800 font-sans font-bold">${p.bar2Value || ''}</text>
        <text x="130" y="${yBase - h3 - 5}" text-anchor="middle" class="text-[9px] fill-slate-800 font-sans font-bold">${p.bar3Value || ''}</text>
        <text x="166" y="${yBase - h4 - 5}" text-anchor="middle" class="text-[9px] fill-slate-800 font-sans font-bold">${p.bar4Value || ''}</text>

        <!-- Category Labels on X axis -->
        <text x="58" y="135" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">${p.bar1Label || 'A'}</text>
        <text x="94" y="135" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">${p.bar2Label || 'B'}</text>
        <text x="130" y="135" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">${p.bar3Label || 'C'}</text>
        <text x="166" y="135" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">${p.bar4Label || 'D'}</text>
      </svg>`;
    }
  },
  {
    id: 'venn-diagram-2',
    name: 'Diagrama de Venn (Conjuntos A y B)',
    category: 'Diagramas',
    description: 'Edita los nombres de conjuntos y elementos o cardinales de cada zona.',
    defaultParams: {
      setAName: 'A',
      setBName: 'B',
      universeName: 'U',
      onlyA: '1, 3, 5',
      intersection: '2, 4',
      onlyB: '6, 8, 10',
      outside: '7, 9',
    },
    fields: [
      { key: 'setAName', label: 'Nombre Conjunto 1', type: 'text', placeholder: 'A' },
      { key: 'setBName', label: 'Nombre Conjunto 2', type: 'text', placeholder: 'B' },
      { key: 'universeName', label: 'Conjunto Universal', type: 'text', placeholder: 'U' },
      { key: 'onlyA', label: 'Elementos Solo en A (Izquierda)', type: 'text', placeholder: 'Ej: 1, 3, 5 o 12' },
      { key: 'intersection', label: 'Intersección (A ∩ B - Centro)', type: 'text', placeholder: 'Ej: 2, 4 o 8' },
      { key: 'onlyB', label: 'Elementos Solo en B (Derecha)', type: 'text', placeholder: 'Ej: 6, 8, 10 o 15' },
      { key: 'outside', label: 'Elementos Fuera (Universo)', type: 'text', placeholder: 'Ej: 7, 9 (opcional)' },
    ],
    generateSvg: (p) => {
      return `<svg viewBox="0 0 220 160" class="w-full h-full">
        <!-- Universe box -->
        <rect x="15" y="15" width="190" height="130" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.8" />
        ${p.universeName ? `<text x="26" y="32" class="text-[11px] font-extrabold fill-slate-700 font-sans">${p.universeName}</text>` : ''}
        
        <!-- Circles -->
        <circle cx="85" cy="80" r="46" fill="#3b82f6" fill-opacity="0.25" stroke="#2563eb" stroke-width="2.2" />
        <circle cx="135" cy="80" r="46" fill="#ec4899" fill-opacity="0.25" stroke="#db2777" stroke-width="2.2" />
        
        <!-- Set Headers -->
        <text x="65" y="52" class="text-xs font-black fill-blue-950 font-sans" text-anchor="middle">${p.setAName || 'A'}</text>
        <text x="155" y="52" class="text-xs font-black fill-pink-950 font-sans" text-anchor="middle">${p.setBName || 'B'}</text>
        
        <!-- Elements inside regions -->
        <text x="62" y="88" class="text-[10px] font-bold fill-blue-900 font-sans" text-anchor="middle">${p.onlyA || ''}</text>
        <text x="110" y="88" class="text-[10px] font-black fill-purple-950 font-sans" text-anchor="middle">${p.intersection || ''}</text>
        <text x="158" y="88" class="text-[10px] font-bold fill-pink-900 font-sans" text-anchor="middle">${p.onlyB || ''}</text>
        
        <!-- Outside universe elements -->
        ${p.outside ? `<text x="180" y="134" class="text-[9px] font-bold fill-slate-600 font-sans" text-anchor="end">${p.outside}</text>` : ''}
      </svg>`;
    }
  },
  {
    id: 'geometry-rectangle',
    name: 'Rectángulo / Área y Perímetro',
    category: 'Geometría',
    description: 'Edita la base, altura, diagonal o texto central del rectángulo.',
    defaultParams: {
      baseText: 'b = 8 cm',
      heightText: 'h = 5 cm',
      diagonalText: '',
      centerText: 'Área = ?',
      showDiagonal: false,
    },
    fields: [
      { key: 'baseText', label: 'Base (Horizontal)', type: 'text', placeholder: 'Ej: b = 8 cm o 2x + 1' },
      { key: 'heightText', label: 'Altura (Vertical)', type: 'text', placeholder: 'Ej: h = 5 cm o 6' },
      { key: 'centerText', label: 'Texto en el centro (Área/Perímetro)', type: 'text', placeholder: 'Ej: Área = ? o S' },
      { key: 'showDiagonal', label: 'Trazar diagonal', type: 'boolean' },
      { key: 'diagonalText', label: 'Etiqueta de diagonal', type: 'text', placeholder: 'Ej: d = 10 cm (opcional)' },
    ],
    generateSvg: (p) => {
      return `<svg viewBox="0 0 220 160" class="w-full h-full stroke-slate-800 fill-none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="40" y="35" width="140" height="90" rx="3" class="fill-indigo-50/40 stroke-indigo-700 stroke-2" />
        
        <!-- Right angles in corners -->
        <rect x="40" y="113" width="12" height="12" class="stroke-indigo-700 fill-none" stroke-width="1.5" />
        <rect x="168" y="113" width="12" height="12" class="stroke-indigo-700 fill-none" stroke-width="1.5" />
        
        ${p.showDiagonal ? `
          <line x1="40" y1="125" x2="180" y2="35" class="stroke-slate-500 stroke-1.5" stroke-dasharray="4,4" />
          ${p.diagonalText ? `<text x="110" y="70" class="text-[10px] fill-slate-700 font-sans font-bold" text-anchor="middle">${p.diagonalText}</text>` : ''}
        ` : ''}

        ${p.baseText ? `<text x="110" y="145" class="text-xs fill-slate-800 font-sans font-bold" text-anchor="middle">${p.baseText}</text>` : ''}
        ${p.heightText ? `<text x="22" y="83" class="text-xs fill-slate-800 font-sans font-bold" text-anchor="middle">${p.heightText}</text>` : ''}
        ${p.centerText && !p.showDiagonal ? `<text x="110" y="85" class="text-xs fill-indigo-900 font-sans font-extrabold" text-anchor="middle">${p.centerText}</text>` : ''}
      </svg>`;
    }
  },
  {
    id: 'geometry-circle',
    name: 'Círculo / Radio, Diámetro y Sector Circular',
    category: 'Geometría',
    description: 'Edita el radio, ángulo central y etiquetas del arco.',
    defaultParams: {
      radiusText: 'r = 6 cm',
      angleText: '60°',
      centerLabel: 'O',
      arcText: 'L = ?',
      showSector: true,
    },
    fields: [
      { key: 'radiusText', label: 'Radio (r)', type: 'text', placeholder: 'Ej: r = 6 cm o R' },
      { key: 'angleText', label: 'Ángulo Central', type: 'text', placeholder: 'Ej: 60°, α, θ' },
      { key: 'centerLabel', label: 'Etiqueta del Centro', type: 'text', placeholder: 'O' },
      { key: 'arcText', label: 'Texto del Arco', type: 'text', placeholder: 'Ej: L = ? o Arco AB' },
      { key: 'showSector', label: 'Colorear sector circular', type: 'boolean' },
    ],
    generateSvg: (p) => {
      return `<svg viewBox="0 0 200 160" class="w-full h-full">
        <!-- Circle -->
        <circle cx="100" cy="80" r="60" fill="none" stroke="#334155" stroke-width="2" />
        
        ${p.showSector ? `
          <path d="M 100,80 L 160,80 A 60 60 0 0 0 130,28 Z" fill="#6366f1" fill-opacity="0.25" stroke="#4f46e5" stroke-width="2" />
        ` : `
          <line x1="100" y1="80" x2="160" y2="80" stroke="#4f46e5" stroke-width="2" />
          <line x1="100" y1="80" x2="130" y2="28" stroke="#4f46e5" stroke-width="2" />
        `}

        <!-- Center Point -->
        <circle cx="100" cy="80" r="3.5" fill="#1e293b" />
        <text x="90" y="85" class="text-xs font-bold fill-slate-800 font-sans">${p.centerLabel || 'O'}</text>

        <!-- Radius label -->
        <text x="130" y="94" class="text-[10px] font-bold fill-indigo-900 font-sans" text-anchor="middle">${p.radiusText || 'r'}</text>

        <!-- Angle label -->
        <text x="122" y="65" class="text-[10px] font-bold fill-indigo-700 font-sans">${p.angleText || 'θ'}</text>

        <!-- Arc text -->
        ${p.arcText ? `<text x="156" y="44" class="text-[10px] font-extrabold fill-slate-800 font-sans">${p.arcText}</text>` : ''}
      </svg>`;
    }
  },
  {
    id: 'cartesian-plane-editable',
    name: 'Plano Cartesiano con Vértice / Puntos',
    category: 'Geometría',
    description: 'Edita el vértice de la parábola, puntos o ecuaciones.',
    defaultParams: {
      vertexText: 'V(0, 3)',
      point1Text: 'A(3, 0)',
      point2Text: 'B(-3, 0)',
      curveColor: '#4f46e5',
    },
    fields: [
      { key: 'vertexText', label: 'Coordenada del Vértice / Punto Clave', type: 'text', placeholder: 'Ej: V(0, 3) o P(2, 4)' },
      { key: 'point1Text', label: 'Punto Derecho (Eje X)', type: 'text', placeholder: 'Ej: A(3, 0)' },
      { key: 'point2Text', label: 'Punto Izquierdo (Eje X)', type: 'text', placeholder: 'Ej: B(-3, 0)' },
    ],
    generateSvg: (p) => {
      return `<svg viewBox="0 0 210 165" class="w-full h-full stroke-slate-800 fill-none" stroke-width="1.5">
        <!-- Grid -->
        <path d="M 25,40 H 185 M 25,85 H 185 M 25,130 H 185" class="stroke-slate-200" stroke-dasharray="2,2" />
        <path d="M 65,20 V 145 M 105,20 V 145 M 145,20 V 145" class="stroke-slate-200" stroke-dasharray="2,2" />
        <!-- Axes -->
        <line x1="20" y1="85" x2="190" y2="85" class="stroke-slate-800 stroke-2" />
        <line x1="105" y1="150" x2="105" y2="18" class="stroke-slate-800 stroke-2" />
        <text x="193" y="89" class="text-[10px] fill-slate-800 font-sans font-extrabold">X</text>
        <text x="100" y="14" class="text-[10px] fill-slate-800 font-sans font-extrabold">Y</text>
        
        <!-- Parabola -->
        <path d="M 50,135 Q 105,28 160,135" stroke="${p.curveColor || '#4f46e5'}" stroke-width="2.5" class="fill-none" />
        
        <!-- Points -->
        <circle cx="105" cy="55" r="4" class="fill-rose-500 stroke-rose-700" />
        <text x="113" y="52" class="text-[10px] fill-rose-600 font-sans font-extrabold">${p.vertexText || 'V(0, 3)'}</text>
        
        ${p.point1Text ? `
          <circle cx="140" cy="85" r="3" class="fill-indigo-600" />
          <text x="142" y="100" class="text-[9px] fill-slate-700 font-sans font-bold">${p.point1Text}</text>
        ` : ''}
        ${p.point2Text ? `
          <circle cx="70" cy="85" r="3" class="fill-indigo-600" />
          <text x="46" y="100" class="text-[9px] fill-slate-700 font-sans font-bold">${p.point2Text}</text>
        ` : ''}
      </svg>`;
    }
  },
  {
    id: 'physics-pulley-editable',
    name: 'Física - Sistema de Fuerzas y Poleas',
    category: 'Física',
    description: 'Edita la masa suspendida, el vector fuerza y el peso.',
    defaultParams: {
      massText: 'm = 10 kg',
      forceText: 'F = ?',
      weightText: 'W = m·g',
    },
    fields: [
      { key: 'massText', label: 'Masa del bloque (m)', type: 'text', placeholder: 'Ej: m = 10 kg o 50 kg' },
      { key: 'forceText', label: 'Fuerza aplicada (F)', type: 'text', placeholder: 'Ej: F = ? o 100 N' },
      { key: 'weightText', label: 'Peso / Fuerza inferior (W)', type: 'text', placeholder: 'Ej: W = m·g o 98 N' },
    ],
    generateSvg: (p) => {
      return `<svg viewBox="0 0 210 165" class="w-full h-full stroke-slate-800 fill-none" stroke-width="1.5">
        <!-- Ceiling -->
        <line x1="45" y1="20" x2="165" y2="20" stroke-width="3" stroke="#334155" />
        <line x1="55" y1="20" x2="45" y2="10" stroke="#64748b" />
        <line x1="80" y1="20" x2="70" y2="10" stroke="#64748b" />
        <line x1="105" y1="20" x2="95" y2="10" stroke="#64748b" />
        <line x1="130" y1="20" x2="120" y2="10" stroke="#64748b" />
        <line x1="155" y1="20" x2="145" y2="10" stroke="#64748b" />
        
        <!-- Pulley -->
        <line x1="105" y1="20" x2="105" y2="45" stroke="#334155" stroke-width="2" />
        <circle cx="105" cy="55" r="14" fill="#e2e8f0" stroke="#1e293b" stroke-width="2" />
        <circle cx="105" cy="55" r="3" fill="#1e293b" />
        
        <!-- Rope Left with Block -->
        <line x1="91" y1="55" x2="91" y2="100" stroke="#0f172a" stroke-width="1.8" />
        <rect x="73" y="100" width="36" height="30" rx="3" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
        <text x="91" y="119" class="text-[9px] font-bold fill-slate-900 font-sans" text-anchor="middle">${p.massText || 'm'}</text>
        
        <!-- Force Arrow Right -->
        <line x1="119" y1="55" x2="119" y2="95" stroke="#2563eb" stroke-width="2" />
        <polygon points="119,103 114,93 124,93" fill="#2563eb" />
        <text x="133" y="85" class="text-[10px] font-bold fill-blue-700 font-sans">${p.forceText || 'F = ?'}</text>
        
        <!-- Weight Arrow -->
        <text x="91" y="148" class="text-[9px] fill-rose-700 font-sans font-bold" text-anchor="middle">${p.weightText || 'W = m·g'}</text>
      </svg>`;
    }
  }
];
