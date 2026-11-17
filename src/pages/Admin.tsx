import { ClipboardList, LayoutDashboard, LogOut, RotateCcw, Users, UtensilsCrossed } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/cardapio', label: 'Gerenciar Cardápio', icon: UtensilsCrossed, end: false },
  { to: '/admin/funcionarios', label: 'Funcionários', icon: Users, end: false },
  { to: '/pedidos', label: 'Painel de Pedidos', icon: ClipboardList, end: false },
];

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
    isActive ? 'bg-yellow-400 text-zinc-900' : 'text-zinc-300 hover:bg-zinc-700/60 hover:text-white'
  }`;

export default function Admin() {
  const { session, logout, resetDemoData } = useApp();

  const reset = () => {
    if (confirm('Restaurar cardápio, pedidos e funcionários para os dados de demonstração?')) resetDemoData();
  };

  return (
    <div className="min-h-screen bg-zinc-100 lg:flex">
      {/* Sidebar desktop / topo mobile */}
      <aside className="sticky top-0 z-30 bg-zinc-800 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-5 lg:py-6">
          <Logo light />
          <button onClick={logout} className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-700 lg:hidden" aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkCls}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 hidden space-y-1 border-t border-zinc-700 p-3 lg:block">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-white">{session?.name}</p>
            <p className="text-xs text-zinc-400">Administrador</p>
          </div>
          <button onClick={reset} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700/60 hover:text-white">
            <RotateCcw size={16} /> Restaurar dados demo
          </button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700/60 hover:text-white">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
        <button onClick={reset} className="mt-10 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 lg:hidden">
          <RotateCcw size={14} /> Restaurar dados demo
        </button>
      </main>
    </div>
  );
}
