export interface PresetDiagram {
  id: string;
  name: string;
  category: 'Geometría' | 'Ciencias' | 'Estadística' | 'Física' | 'Diagramas';
  caption: string;
  svg: string;
}

export const PRESET_DIAGRAMS: PresetDiagram[] = [
  {
    id: 'geom-triangle',
    name: 'Triángulo Rectángulo (Pitágoras)',
    category: 'Geometría',
    caption: 'Figura 1. Triángulo con catetos a, b e hipotenusa c',
    svg: `<svg viewBox="0 0 200 160" class="w-full h-full stroke-slate-800 fill-none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="30,130 170,130 30,30" class="fill-indigo-50/50 stroke-indigo-700 stroke-2" />
      <rect x="30" y="115" width="15" height="15" class="stroke-indigo-700 fill-none" />
      <text x="95" y="148" class="text-xs fill-slate-700 font-sans font-semibold" text-anchor="middle">a = 4 cm</text>
      <text x="18" y="85" class="text-xs fill-slate-700 font-sans font-semibold" text-anchor="middle">b = 3 cm</text>
      <text x="110" y="70" class="text-xs fill-indigo-800 font-sans font-bold" text-anchor="middle">c = ?</text>
      <circle cx="170" cy="130" r="3" class="fill-indigo-600" />
      <circle cx="30" cy="30" r="3" class="fill-indigo-600" />
      <circle cx="30" cy="130" r="3" class="fill-indigo-600" />
      <path d="M 145,130 A 25 25 0 0 0 152,112" class="stroke-slate-500 stroke-1 fill-none" />
      <text x="135" y="122" class="text-[10px] fill-slate-600 font-sans">α</text>
    </svg>`
  },
  {
    id: 'cartesian-plane',
    name: 'Plano Cartesiano con Función',
    category: 'Geometría',
    caption: 'Figura 2. Gráfica de la función f(x)',
    svg: `<svg viewBox="0 0 200 160" class="w-full h-full stroke-slate-800 fill-none" stroke-width="1.5">
      <!-- Grid -->
      <path d="M 20,40 H 180 M 20,80 H 180 M 20,120 H 180" class="stroke-slate-200" stroke-dasharray="2,2" />
      <path d="M 60,20 V 140 M 100,20 V 140 M 140,20 V 140" class="stroke-slate-200" stroke-dasharray="2,2" />
      <!-- Axes -->
      <line x1="20" y1="80" x2="180" y2="80" class="stroke-slate-800 stroke-2" marker-end="url(#arrow)" />
      <line x1="100" y1="140" x2="100" y2="20" class="stroke-slate-800 stroke-2" />
      <!-- Labels -->
      <text x="185" y="84" class="text-[10px] fill-slate-700 font-sans font-bold">X</text>
      <text x="96" y="15" class="text-[10px] fill-slate-700 font-sans font-bold">Y</text>
      <!-- Parabola Curve -->
      <path d="M 50,130 Q 100,20 150,130" class="stroke-indigo-600 stroke-[2.5] fill-none" />
      <!-- Vertex point -->
      <circle cx="100" cy="50" r="4" class="fill-rose-500 stroke-rose-700" />
      <text x="108" y="46" class="text-[10px] fill-rose-600 font-sans font-bold">V(0, 3)</text>
    </svg>`
  },
  {
    id: 'stats-bar-chart',
    name: 'Gráfico Estadístico de Barras',
    category: 'Estadística',
    caption: 'Figura 3. Distribución de frecuencias',
    svg: `<svg viewBox="0 0 200 150" class="w-full h-full">
      <line x1="30" y1="120" x2="185" y2="120" stroke="#475569" stroke-width="1.5" />
      <line x1="30" y1="20" x2="30" y2="120" stroke="#475569" stroke-width="1.5" />
      <!-- Bars -->
      <rect x="45" y="70" width="22" height="50" rx="2" fill="#6366f1" class="hover:opacity-80" />
      <rect x="78" y="40" width="22" height="80" rx="2" fill="#3b82f6" class="hover:opacity-80" />
      <rect x="111" y="55" width="22" height="65" rx="2" fill="#06b6d4" class="hover:opacity-80" />
      <rect x="144" y="85" width="22" height="35" rx="2" fill="#10b981" class="hover:opacity-80" />
      <!-- Bar values -->
      <text x="56" y="65" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">25%</text>
      <text x="89" y="35" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">40%</text>
      <text x="122" y="50" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">32%</text>
      <text x="155" y="80" text-anchor="middle" class="text-[9px] fill-slate-700 font-sans font-bold">18%</text>
      <!-- Categories -->
      <text x="56" y="132" text-anchor="middle" class="text-[8px] fill-slate-600 font-sans">A</text>
      <text x="89" y="132" text-anchor="middle" class="text-[8px] fill-slate-600 font-sans">B</text>
      <text x="122" y="132" text-anchor="middle" class="text-[8px] fill-slate-600 font-sans">C</text>
      <text x="155" y="132" text-anchor="middle" class="text-[8px] fill-slate-600 font-sans">D</text>
    </svg>`
  },
  {
    id: 'venn-diagram',
    name: 'Diagrama de Venn (Conjuntos A y B)',
    category: 'Diagramas',
    caption: 'Figura 4. Intersección de los conjuntos A ∩ B',
    svg: `<svg viewBox="0 0 200 150" class="w-full h-full">
      <rect x="15" y="15" width="170" height="120" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
      <text x="25" y="30" class="text-[10px] font-bold fill-slate-600 font-sans">U</text>
      <circle cx="80" cy="75" r="42" fill="#3b82f6" fill-opacity="0.35" stroke="#2563eb" stroke-width="2" />
      <circle cx="120" cy="75" r="42" fill="#ec4899" fill-opacity="0.35" stroke="#db2777" stroke-width="2" />
      <text x="60" y="78" class="text-xs font-bold fill-blue-900 font-sans" text-anchor="middle">A</text>
      <text x="140" y="78" class="text-xs font-bold fill-pink-900 font-sans" text-anchor="middle">B</text>
      <text x="100" y="78" class="text-[10px] font-extrabold fill-purple-900 font-sans" text-anchor="middle">A ∩ B</text>
    </svg>`
  },
  {
    id: 'biology-cell',
    name: 'Estructura Celular / Biología',
    category: 'Ciencias',
    caption: 'Figura 5. Estructura básica de una célula eucariota',
    svg: `<svg viewBox="0 0 200 160" class="w-full h-full">
      <!-- Outer membrane -->
      <path d="M 40,80 C 40,30 160,30 160,80 C 160,130 40,130 40,80 Z" fill="#ecfdf5" stroke="#059669" stroke-width="2" />
      <!-- Nucleus -->
      <circle cx="100" cy="80" r="28" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
      <circle cx="100" cy="80" r="12" fill="#f59e0b" />
      <text x="100" y="83" class="text-[8px] font-bold fill-white font-sans" text-anchor="middle">Nucléolo</text>
      <!-- Organelles -->
      <ellipse cx="65" cy="65" rx="10" ry="5" fill="#93c5fd" stroke="#2563eb" />
      <ellipse cx="135" cy="95" rx="12" ry="6" fill="#fca5a5" stroke="#dc2626" />
      <text x="65" y="105" class="text-[8px] fill-slate-700 font-sans">Citoplasma</text>
      <text x="100" y="145" class="text-[9px] font-semibold fill-emerald-800 font-sans" text-anchor="middle">Membrana Plasmática</text>
    </svg>`
  },
  {
    id: 'physics-pulley',
    name: 'Física - Sistema de Fuerzas / Polea',
    category: 'Física',
    caption: 'Figura 6. Diagrama de cuerpo libre con masa m = 10 kg',
    svg: `<svg viewBox="0 0 200 160" class="w-full h-full stroke-slate-800 fill-none" stroke-width="1.5">
      <!-- Ceiling -->
      <line x1="40" y1="20" x2="160" y2="20" stroke-width="3" stroke="#334155" />
      <line x1="50" y1="20" x2="40" y2="10" stroke="#64748b" />
      <line x1="75" y1="20" x2="65" y2="10" stroke="#64748b" />
      <line x1="100" y1="20" x2="90" y2="10" stroke="#64748b" />
      <line x1="125" y1="20" x2="115" y2="10" stroke="#64748b" />
      <line x1="150" y1="20" x2="140" y2="10" stroke="#64748b" />
      <!-- Rope and Pulley -->
      <line x1="100" y1="20" x2="100" y2="45" stroke="#334155" stroke-width="2" />
      <circle cx="100" cy="55" r="14" fill="#e2e8f0" stroke="#1e293b" stroke-width="2" />
      <circle cx="100" cy="55" r="3" fill="#1e293b" />
      <!-- Suspended block -->
      <line x1="86" y1="55" x2="86" y2="100" stroke="#0f172a" stroke-width="1.5" />
      <rect x="71" y="100" width="30" height="30" rx="3" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
      <text x="86" y="118" class="text-[9px] font-bold fill-slate-800 font-sans" text-anchor="middle">m</text>
      <!-- Force arrow -->
      <line x1="114" y1="55" x2="114" y2="95" stroke="#2563eb" stroke-width="2" />
      <polygon points="114,102 110,92 118,92" fill="#2563eb" />
      <text x="128" y="85" class="text-[10px] font-bold fill-blue-700 font-sans">F = ?</text>
      <text x="86" y="145" class="text-[9px] fill-rose-700 font-sans font-bold" text-anchor="middle">W = m·g</text>
    </svg>`
  }
];
