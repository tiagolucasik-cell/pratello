import { ChefHat, Coffee, CookingPot, IceCreamCone, Pizza, Sandwich, Soup, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatLocation } from '../utils/format';

/** Ícones que orbitam o logo. */
const ORBIT = [Pizza, Coffee, Sandwich, IceCreamCone, Soup, ChefHat];

const DURATION = 2600; // tempo na tela antes de sair
const EXIT = 700; // duração da saída

/**
 * Tela de boas-vindas exibida logo após o login.
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
  const StaffIcon = session.type === 'staff' && session.role !== 'admin' ? CookingPot : Utensils;

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
      {/* ondas de cor */}
      {[0, 1, 2].map((i) => (
        <span key={i} className="splash-ring absolute left-1/2 top-1/2 h-40 w-40 rounded-full border-2 border-yellow-400/60" style={{ animationDelay: `${i * 450}ms` }} />
      ))}
      <span className="splash-glow absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative flex flex-col items-center px-6 text-center">
        {/* logo + órbita */}
        <div className="relative grid h-48 w-48 place-items-center">
          <div className="splash-orbit absolute inset-0">
            {ORBIT.map((Icon, i) => {
              const angle = (i / ORBIT.length) * 360;
              return (
                <span key={i} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg) translateY(-92px) rotate(${-angle}deg)` }}>
                  <span
                    className="splash-pop -ml-4 -mt-4 grid h-8 w-8 place-items-center rounded-full bg-zinc-800 text-yellow-400 ring-1 ring-zinc-700"
                    style={{ animationDelay: `${500 + i * 90}ms` }}
                  >
                    <Icon size={16} />
                  </span>
                </span>
              );
            })}
          </div>
          <span className="splash-logo grid h-24 w-24 place-items-center rounded-3xl bg-yellow-400 text-zinc-900 shadow-[0_0_60px_-5px] shadow-yellow-400/60">
            <StaffIcon size={48} strokeWidth={2.5} />
          </span>
        </div>

        {/* nome com letras subindo */}
        <h1 className="mt-6 flex overflow-hidden text-5xl font-extrabold tracking-tight text-white sm:text-6xl" aria-hidden="true">
          {'Pratello'.split('').map((ch, i) => (
            <span key={i} className="splash-letter inline-block" style={{ animationDelay: `${350 + i * 55}ms` }}>
              {ch}
            </span>
          ))}
        </h1>

        <p className="splash-fade mt-4 text-xl font-semibold text-white" style={{ animationDelay: '950ms' }}>
          Olá, <span className="text-yellow-400">{firstName}</span>! 👋
        </p>
        <p className="splash-fade mt-1 text-sm text-zinc-400" style={{ animationDelay: '1150ms' }}>
          {subtitle}
        </p>

        <div className="splash-fade mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-zinc-800" style={{ animationDelay: '1100ms' }}>
          <span className="splash-bar block h-full rounded-full bg-yellow-400" />
        </div>
        <p className="splash-fade mt-6 text-[11px] text-zinc-500" style={{ animationDelay: '1500ms' }}>
          toque para pular
        </p>
      </div>
    </div>
  );
}
