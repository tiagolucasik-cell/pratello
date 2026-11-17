import { DollarSign, Receipt, ShoppingBag, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { StatusBadge } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { formatPrice, formatTime, isToday } from '../../utils/format';

export default function Dashboard() {
  const { orders, products, categories } = useApp();

  const stats = useMemo(() => {
    const today = orders.filter((o) => isToday(o.createdAt));
    const revenue = today.reduce((s, o) => s + o.total, 0);

    const qtyByProduct = new Map<string, { name: string; qty: number }>();
    const revenueByCategory = new Map<string, number>();
    for (const o of today) {
      for (const it of o.items) {
        const cur = qtyByProduct.get(it.productId) ?? { name: it.name, qty: 0 };
        cur.qty += it.quantity;
        qtyByProduct.set(it.productId, cur);
        const cat = products.find((p) => p.id === it.productId)?.category ?? 'outros';
        revenueByCategory.set(cat, (revenueByCategory.get(cat) ?? 0) + it.price * it.quantity);
      }
    }
    const ranking = [...qtyByProduct.values()].sort((a, b) => b.qty - a.qty);
    return {
      today,
      revenue,
      count: today.length,
      ticket: today.length ? revenue / today.length : 0,
      top: ranking[0],
      ranking: ranking.slice(0, 5),
      revenueByCategory,
    };
  }, [orders, products]);

  const cards = [
    { label: 'Faturamento do dia', value: formatPrice(stats.revenue), icon: DollarSign },
    { label: 'Total de pedidos', value: String(stats.count), icon: ShoppingBag },
    { label: 'Ticket médio', value: formatPrice(stats.ticket), icon: Receipt },
    { label: 'Prato mais vendido', value: stats.top?.name ?? '—', sub: stats.top ? `${stats.top.qty} unidades` : undefined, icon: Trophy },
  ];

  const maxRank = stats.ranking[0]?.qty ?? 1;
  const maxCat = Math.max(1, ...stats.revenueByCategory.values());

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
      <p className="text-sm text-zinc-600">Resumo das vendas de hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600">{label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-zinc-900">
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-3 truncate text-2xl font-extrabold text-zinc-900" title={value}>
              {value}
            </p>
            {sub && <p className="text-xs text-zinc-500">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-900">Mais vendidos hoje</h2>
          <ul className="mt-4 space-y-3">
            {stats.ranking.length === 0 && <li className="text-sm text-zinc-500">Sem vendas ainda.</li>}
            {stats.ranking.map((r) => (
              <li key={r.name}>
                <div className="flex justify-between text-sm">
                  <span className="truncate text-zinc-700">{r.name}</span>
                  <span className="font-semibold text-zinc-900">{r.qty}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-100">
                  <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${(r.qty / maxRank) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-900">Faturamento por categoria</h2>
          <ul className="mt-4 space-y-3">
            {categories.map((c) => {
              const v = stats.revenueByCategory.get(c.id) ?? 0;
              return (
                <li key={c.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-700">{c.name}</span>
                    <span className="font-semibold text-zinc-900">{formatPrice(v)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-800" style={{ width: `${(v / maxCat) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-900">Últimos pedidos</h2>
          <ul className="mt-4 divide-y divide-zinc-100">
            {[...stats.today]
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 6)
              .map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900">
                      #{o.number} · <span className="font-normal text-zinc-600">{o.customerName}</span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatTime(o.createdAt)} · {formatPrice(o.total)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
