import { CheckCheck, ChefHat, Clock3, Inbox, LayoutDashboard, LogOut, PackageCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import OrderCard from '../components/OrderCard';
import { useApp } from '../context/AppContext';
import type { OrderStatus } from '../types';
import { STATUS_FLOW, STATUS_LABEL, isToday } from '../utils/format';

const COLUMN_META: Record<OrderStatus, { icon: typeof Inbox; accent: string }> = {
  pendente: { icon: Inbox, accent: 'bg-zinc-400' },
  preparo: { icon: ChefHat, accent: 'bg-yellow-400' },
  pronto: { icon: PackageCheck, accent: 'bg-green-500' },
  entregue: { icon: CheckCheck, accent: 'bg-zinc-800' },
};

export default function Orders() {
  const { orders, advanceOrder, markOrderPaid, session, logout } = useApp();
  const [mobileTab, setMobileTab] = useState<OrderStatus>('pendente');
  const [, setTick] = useState(0);

  // Atualiza o tempo de espera exibido a cada 30s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const columns = useMemo(() => {
    const byStatus = Object.fromEntries(STATUS_FLOW.map((s) => [s, [] as typeof orders])) as Record<OrderStatus, typeof orders>;
    for (const o of orders) byStatus[o.status].push(o);
    STATUS_FLOW.forEach((s) => byStatus[s].sort((a, b) => a.createdAt - b.createdAt));
    // Entregues: apenas os de hoje, mais recentes primeiro
    byStatus.entregue = byStatus.entregue.filter((o) => isToday(o.updatedAt)).sort((a, b) => b.updatedAt - a.updatedAt);
    return byStatus;
  }, [orders]);

  const isAdmin = session?.type === 'staff' && session.role === 'admin';

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
          <Logo light />
          <span className="hidden rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-yellow-400 sm:inline">Painel da Cozinha</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-zinc-300 md:inline">{session?.name}</span>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
                <LayoutDashboard size={16} /> <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
              <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Pedidos</h1>
            <p className="flex items-center gap-1.5 text-sm text-zinc-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Atualização em tempo real
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-zinc-600">
            <Clock3 size={16} /> {columns.pendente.length + columns.preparo.length} pedido(s) em aberto
          </p>
        </div>

        {/* Abas no mobile */}
        <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:hidden">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => setMobileTab(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                mobileTab === s ? 'bg-yellow-400 text-zinc-900' : 'border border-zinc-200 bg-white text-zinc-600'
              }`}
            >
              {STATUS_LABEL[s]} ({columns[s].length})
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUS_FLOW.map((status) => {
            const { icon: Icon, accent } = COLUMN_META[status];
            return (
              <section
                key={status}
                className={`flex flex-col rounded-2xl bg-zinc-200/60 p-3 ${mobileTab === status ? '' : 'hidden md:flex'}`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 font-bold text-zinc-900">
                    <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
                    <Icon size={16} /> {STATUS_LABEL[status]}
                  </h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-zinc-700">{columns[status].length}</span>
                </div>
                <div className="space-y-3 xl:max-h-[calc(100vh-15rem)] xl:overflow-y-auto">
                  {columns[status].length === 0 ? (
                    <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">Nenhum pedido</p>
                  ) : (
                    columns[status].map((o) => <OrderCard key={o.id} order={o} onAdvance={() => advanceOrder(o.id)} onMarkPaid={() => markOrderPaid(o.id)} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
