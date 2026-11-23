import { Check, Flame, Palette, Plus, RotateCcw, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { ACCENTS, DEFAULT_ACCENT, getAccent, setAccent, type AccentId } from '../../utils/theme';

export default function Settings() {
  const [current, setCurrent] = useState<AccentId>(getAccent);

  const choose = (id: AccentId) => {
    setAccent(id);
    setCurrent(id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Configurações</h1>
      <p className="text-sm text-zinc-600">Personalize a aparência do Pratello.</p>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-zinc-900">
              <Palette size={18} /> Cor de destaque
            </h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-600">
              Usada em botões, abas, selos, carrosséis e no carrinho. Muda na hora em todas as telas abertas neste navegador:
              cardápio, cozinha e admin.
            </p>
          </div>
          {current !== DEFAULT_ACCENT && (
            <Button variant="outline" size="sm" onClick={() => choose(DEFAULT_ACCENT)}>
              <RotateCcw size={14} /> Restaurar padrão
            </Button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7" role="radiogroup" aria-label="Cor de destaque">
          {ACCENTS.map((a) => {
            const active = current === a.id;
            return (
              <button
                key={a.id}
                role="radio"
                aria-checked={active}
                onClick={() => choose(a.id)}
                className={`rounded-xl border-2 p-3 text-left transition-colors ${active ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
              >
                <div className="flex h-10 overflow-hidden rounded-lg">
                  {([200, 400, 600] as const).map((s) => (
                    <span key={s} className="flex-1" style={{ backgroundColor: a.shades[s] }} />
                  ))}
                </div>
                <span className="mt-2 flex items-center justify-between text-sm font-semibold text-zinc-900">
                  {a.name}
                  {active && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-zinc-900 text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prévia com os componentes reais */}
        <div className="mt-6 rounded-xl bg-zinc-100 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Prévia</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Finalizar Pedido</Button>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-zinc-900">
              <Plus size={20} strokeWidth={2.5} />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-zinc-900">
              <Flame size={12} /> Mais pedido
            </span>
            <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-900">Lanches</span>
            <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600">Bebidas</span>
            <span className="flex gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </span>
            <span className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-bold text-white">
              Combo <span className="text-yellow-400">com 15% off</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
