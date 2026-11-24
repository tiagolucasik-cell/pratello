import {
  Beef,
  CakeSlice,
  Carrot,
  Cherry,
  Coffee,
  CookingPot,
  Croissant,
  Drumstick,
  Fish,
  Pizza,
  Salad,
  Sandwich,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatLocation } from '../utils/format';

/**
 * Ingredientes que caem e se empilham no prato.
 * x/y = posição final em relação ao centro do logo; r0/r = giro na queda e inclinação ao assentar;
 * delay = quando começa a cair (a fileira de baixo cai primeiro para a pilha fazer sentido).
 */
const INGREDIENTS: { Icon: LucideIcon; x: number; y: number; r0: number; r: number; delay: number }[] = [
  // fileira de baixo, apoiada no prato
  { Icon: Pizza, x: -96, y: 30, r0: -220, r: -10, delay: 0 },
  { Icon: Beef, x: -48, y: 30, r0: 160, r: 6, delay: 70 },
  { Icon: Salad, x: 0, y: 30, r0: -140, r: 0, delay: 30 },
  { Icon: Fish, x: 48, y: 30, r0: 200, r: -6, delay: 110 },
  { Icon: Sandwich, x: 96, y: 30, r0: -180, r: 12, delay: 50 },
  // segunda fileira
  { Icon: Drumstick, x: -72, y: -10, r0: 240, r: -14, delay: 300 },
  { Icon: Carrot, x: -24, y: -10, r0: -200, r: 10, delay: 360 },
  { Icon: Croissant, x: 24, y: -10, r0: 180, r: -4, delay: 330 },
  { Icon: Cherry, x: 72, y: -10, r0: -160, r: 14, delay: 390 },
  // topo
  { Icon: CakeSlice, x: -24, y: -50, r0: 210, r: -8, delay: 560 },
  { Icon: Coffee, x: 24, y: -50, r0: -190, r: 8, delay: 610 },
];

const GATHER_AT = 1350; // ingredientes são puxados para o centro
const DURATION = 3200; // tempo na tela antes de sair
const EXIT = 700; // duração da saída

/**
 * Tela de boas-vindas exibida logo após o login: os ingredientes caem do alto, quicam num prato,
 * são puxados para o centro e viram o logo do Pratello, seguido da saudação.
 * O Login navega com `state: { welcome: true }`; a página de destino já carrega por baixo
 * e é revelada quando a animação termina. Clicar pula a animação.
 */
export default function WelcomeSplash() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useApp();
  const show = (location.state as { welcome?: boolean } | null)?.welcome === true;
  const [leaving, setLeaving] = useState(false);

  const finish = () => {
    setLeaving(false);
    navigate(location.pathname, { replace: true, state: null }); // não repete ao recarregar
  };

  useEffect(() => {
    if (!show) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t1 = setTimeout(() => setLeaving(true), reduced ? 900 : DURATION);
    const t2 = setTimeout(finish, (reduced ? 900 : DURATION) + EXIT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, location.key]);

  if (!show || !session) return null;

  const firstName = session.name.split(' ')[0];
  const subtitle =
    session.type === 'cliente'
      ? session.location.mode === 'mesa'
        ? `${formatLocation(session.location)} · seu cardápio está pronto`
        : 'Preparando seu cardápio de delivery'
      : session.role === 'admin'
        ? 'Abrindo o painel de gestão'
        : 'Acendendo o fogão da cozinha';
  const LogoIcon = session.type === 'staff' && session.role !== 'admin' ? CookingPot : Utensils;

  return (
    <div
      className={`splash-root fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-zinc-900 ${leaving ? 'splash-leave' : ''}`}
      onClick={() => {
        setLeaving(true);
        setTimeout(finish, EXIT);
      }}
      role="status"
      aria-live="polite"
      aria-label={`Bem-vindo, ${firstName}`}
    >
      <div className="relative flex flex-col items-center px-6 text-center">
        {/* palco: prato, ingredientes e logo; o centro do palco é o centro do logo */}
        <div className="relative h-48 w-72">
          <span className="absolute left-1/2 top-1/2">
            {/* brilho e ondas de cor que continuam depois do impacto */}
            <span className="splash-glow absolute left-0 top-0 block h-[70vmax] w-[70vmax] rounded-full bg-yellow-400/10 blur-3xl" />
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="splash-ring absolute left-0 top-0 block h-40 w-40 rounded-full border-2 border-yellow-400/60"
                style={{ animationDelay: `${1800 + i * 450}ms` }}
              />
            ))}

            {/* prato */}
            <span className="splash-plate absolute left-0 top-[52px] block h-6 w-64 rounded-[50%] bg-zinc-800 shadow-[0_10px_30px_-8px] shadow-black ring-2 ring-yellow-400/40" />

            {/* ingredientes */}
            {INGREDIENTS.map(({ Icon, x, y, r0, r, delay }, i) => (
              <span
                key={i}
                className="splash-fall absolute left-0 top-0 block"
                style={{ '--x': `${x}px`, '--y': `${y}px`, '--r0': `${r0}deg`, '--r': `${r}deg`, animationDelay: `${delay}ms` } as CSSProperties}
              >
                <span className="splash-gather -ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full bg-zinc-800 text-yellow-400 shadow-lg shadow-black/40 ring-1 ring-zinc-700" style={{ animationDelay: `${GATHER_AT + i * 12}ms` }}>
                  <Icon size={20} />
                </span>
              </span>
            ))}

            {/* impacto */}
            <span className="splash-burst absolute left-0 top-0 block h-32 w-32 rounded-full border-4 border-yellow-400" />
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="absolute left-0 top-0 block" style={{ rotate: `${i * 36}deg` }}>
                <span className="splash-spark -ml-1 -mt-1 block h-2 w-2 rounded-full bg-yellow-400" />
              </span>
            ))}

            {/* logo */}
            <span className="splash-logo absolute -left-12 -top-12 grid h-24 w-24 place-items-center rounded-3xl bg-yellow-400 text-zinc-900 shadow-[0_0_60px_-5px] shadow-yellow-400/60">
              <LogoIcon size={48} strokeWidth={2.5} />
            </span>
          </span>
        </div>

        {/* nome com letras subindo */}
        <h1 className="mt-2 flex overflow-hidden text-5xl font-extrabold tracking-tight text-white sm:text-6xl" aria-hidden="true">
          {'Pratello'.split('').map((ch, i) => (
            <span key={i} className="splash-letter inline-block" style={{ animationDelay: `${1750 + i * 50}ms` }}>
              {ch}
            </span>
          ))}
        </h1>

        <p className="splash-fade mt-4 text-xl font-semibold text-white" style={{ animationDelay: '2150ms' }}>
          Olá, <span className="text-yellow-400">{firstName}</span>! 👋
        </p>
        <p className="splash-fade mt-1 text-sm text-zinc-400" style={{ animationDelay: '2300ms' }}>
          {subtitle}
        </p>

        <div className="splash-fade mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-zinc-800" style={{ animationDelay: '1850ms' }}>
          <span className="splash-bar block h-full rounded-full bg-yellow-400" />
        </div>
        <p className="splash-fade mt-6 text-[11px] text-zinc-500" style={{ animationDelay: '1000ms' }}>
          toque para pular
        </p>
      </div>
    </div>
  );
}
