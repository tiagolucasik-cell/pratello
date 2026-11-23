/**
 * Cor de destaque configurável.
 * Os componentes usam as classes `yellow-*` do Tailwind; aqui redefinimos as variáveis
 * `--color-yellow-*` com a paleta escolhida, então o site inteiro muda de cor sem alterar componentes.
 * A escolha fica salva no navegador e é aplicada em todas as abas abertas.
 */

export type AccentId = 'amarelo' | 'laranja' | 'verde' | 'turquesa' | 'azul' | 'roxo' | 'rosa';

type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface Accent {
  id: AccentId;
  name: string;
  shades: Record<Shade, string>;
}

const palette = (hex: string[]): Record<Shade, string> => {
  const keys: Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return Object.fromEntries(keys.map((k, i) => [k, hex[i]])) as Record<Shade, string>;
};

export const ACCENTS: Accent[] = [
  { id: 'amarelo', name: 'Amarelo', shades: palette(['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12']) },
  { id: 'laranja', name: 'Laranja', shades: palette(['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12']) },
  { id: 'verde', name: 'Verde', shades: palette(['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']) },
  { id: 'turquesa', name: 'Turquesa', shades: palette(['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a']) },
  { id: 'azul', name: 'Azul', shades: palette(['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']) },
  { id: 'roxo', name: 'Roxo', shades: palette(['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']) },
  { id: 'rosa', name: 'Rosa', shades: palette(['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843']) },
];

export const DEFAULT_ACCENT: AccentId = 'amarelo';
const KEY = 'pratello:accent';

const findAccent = (id: string | null) => ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];

export function getAccent(): AccentId {
  try {
    return findAccent(localStorage.getItem(KEY)).id;
  } catch {
    return DEFAULT_ACCENT;
  }
}

function applyAccent(id: AccentId) {
  const accent = findAccent(id);
  const root = document.documentElement;
  for (const [shade, hex] of Object.entries(accent.shades)) root.style.setProperty(`--color-yellow-${shade}`, hex);
  root.dataset.accent = accent.id;

  // ícone da aba do navegador acompanha a cor
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${accent.shades[400]}"/><path d="M11 7v7a3 3 0 0 0 3 3v8M14 7v6M17 7v7a3 3 0 0 1-3 3M21 7v18M21 7c2 1 3 4 3 7h-3" stroke="#18181B" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (link) link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function setAccent(id: AccentId) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* armazenamento indisponível: aplica só nesta aba */
  }
  applyAccent(id);
}

/** Chamar uma vez antes de renderizar o app. */
export function initTheme() {
  applyAccent(getAccent());
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) applyAccent(findAccent(e.newValue).id);
  });
}
