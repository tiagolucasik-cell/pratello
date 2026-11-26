import { ArrowRight, Bot, Check, Headset, MessageCircleQuestion, Plus, SendHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { answer, QUICK_CHIPS, type BotReply } from '../utils/helpBot';
import { formatPrice } from '../utils/format';
import { getRestaurant } from '../utils/geo';
import ProductImage from './ProductImage';

type Msg = { id: number; from: 'user' | 'bot' | 'agent'; reply: BotReply };

/** Páginas do cliente onde o assistente aparece. */
const PAGES = [/^\/cardapio$/, /^\/checkout$/, /^\/pedido\/[^/]+$/, /^\/meus-pedidos$/];

const STORAGE_KEY = 'pratello:v2:helpchat';

let nextId = 1;

/** Assistente de ajuda: botão flutuante + janela de conversa. Regras locais, sem IA. */
export default function HelpChat() {
  const { session, orders, products, addToCart } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<'bot' | 'agent' | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as Msg[];
      nextId = saved.reduce((m, x) => Math.max(m, x.id + 1), 1);
      return saved;
    } catch {
      return [];
    }
  });
  const listRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const client = session?.type === 'cliente' ? session : null;
  const myOrders = useMemo(() => (client ? orders.filter((o) => o.clientId === client.clientId) : []), [orders, client]);
  const hasLiveOrder = myOrders.some((o) => o.status !== 'entregue');

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* sem armazenamento */
    }
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ao trocar de cliente (logout/login), começa uma conversa nova
  const clientId = client?.clientId;
  const lastClient = useRef(clientId);
  useEffect(() => {
    if (lastClient.current !== clientId) {
      setMessages([]);
      setOpen(false);
    }
    lastClient.current = clientId;
  }, [clientId]);

  if (!client || !PAGES.some((r) => r.test(pathname))) return null;

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const push = (from: Msg['from'], reply: BotReply) => setMessages((m) => [...m, { id: nextId++, from, reply }]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setInput('');
    push('user', { text: clean });
    const reply = answer(clean, { name: client.name, orders: myOrders, products, restaurantAddress: getRestaurant().address });
    setTyping('bot');
    later(() => {
      setTyping(null);
      push('bot', reply);
      if (reply.handoff) {
        later(() => setTyping('agent'), 900);
        later(() => {
          setTyping(null);
          const live = [...myOrders].sort((a, b) => b.createdAt - a.createdAt).find((o) => o.status !== 'entregue');
          push('agent', {
            text: `Oi, ${client.name.split(' ')[0]}! Aqui é a Ana, do atendimento do Pratello. ${
              live ? `Já estou com o seu pedido #${live.number} aberto aqui.` : ''
            } Me conta o que aconteceu que eu resolvo para você. 💛`,
          });
        }, 3200);
      }
    }, 550 + Math.min(900, reply.text.length * 6));
  };

  const start = () => {
    setOpen(true);
    if (messages.length === 0)
      push('bot', {
        text: `Oi, ${client.name.split(' ')[0]}! 👋 Sou o assistente do Pratello. Posso ver seu pedido, mostrar o código de entrega, cupons, frete, pagamento ou achar um prato pra você.`,
        chips: QUICK_CHIPS,
      });
  };

  // sobe o botão acima das barras fixas do celular
  const isMenu = pathname === '/cardapio';
  const lift = isMenu ? (hasLiveOrder ? 'bottom-[156px]' : 'bottom-[92px]') : pathname === '/checkout' ? 'bottom-[92px]' : 'bottom-5';
  const lastBot = [...messages].reverse().find((m) => m.from !== 'user');

  return (
    <>
      {!open && (
        <button
          onClick={start}
          className={`help-fab fixed right-4 z-40 flex items-center gap-2 rounded-full bg-zinc-900 p-3.5 text-white shadow-xl ring-4 ring-white transition-transform hover:scale-105 lg:bottom-6 lg:right-6 lg:px-5 ${lift}`}
          aria-label="Abrir ajuda"
        >
          <MessageCircleQuestion size={22} className="text-yellow-400" />
          <span className="hidden text-sm font-bold lg:inline">Ajuda</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Assistente de ajuda"
          className="help-panel fixed inset-0 z-50 flex flex-col bg-zinc-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:overflow-hidden sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-zinc-200"
        >
          <header className="flex items-center gap-3 bg-zinc-900 px-4 py-3 text-white">
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-yellow-400 text-zinc-900">
              <Bot size={22} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-zinc-900" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">Ajuda Pratello</p>
              <p className="text-xs text-zinc-400">{typing === 'agent' ? 'Ana está digitando…' : 'Responde na hora · online'}</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-zinc-300 hover:bg-zinc-800" aria-label="Fechar ajuda">
              <X size={20} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4" aria-live="polite">
            {messages.map((m) => (
              <Bubble
                key={m.id}
                msg={m}
                added={added}
                onAdd={(id) => {
                  addToCart(id);
                  setAdded((a) => ({ ...a, [id]: true }));
                }}
                onLink={() => setOpen(false)}
              />
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <Avatar from={typing} />
                <span className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="help-dot h-2 w-2 rounded-full bg-zinc-400" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </span>
              </div>
            )}
          </div>

          {lastBot?.reply.chips && !typing && (
            <div className="scrollbar-none flex gap-2 overflow-x-auto border-t border-zinc-200 bg-white px-3 py-2">
              {lastBot.reply.chips.map((c) => (
                <button key={c} onClick={() => send(c)} className="shrink-0 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-zinc-800 ring-1 ring-yellow-300 hover:bg-yellow-100">
                  {c}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-zinc-200 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida…"
              aria-label="Mensagem"
              autoFocus
              className="min-w-0 flex-1 rounded-full bg-zinc-100 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
            <button type="submit" disabled={!input.trim() || !!typing} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-yellow-400 text-zinc-900 hover:bg-yellow-500 disabled:opacity-40" aria-label="Enviar">
              <SendHorizontal size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Avatar({ from }: { from: 'bot' | 'agent' }) {
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${from === 'agent' ? 'bg-green-600 text-white' : 'bg-zinc-900 text-yellow-400'}`}>
      {from === 'agent' ? <Headset size={14} /> : <Bot size={15} />}
    </span>
  );
}

function Bubble({ msg, added, onAdd, onLink }: { msg: Msg; added: Record<string, boolean>; onAdd: (id: string) => void; onLink: () => void }) {
  const { from, reply } = msg;
  if (from === 'user')
    return (
      <div className="help-in flex justify-end">
        <p className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-md bg-yellow-400 px-3.5 py-2 text-sm text-zinc-900">{reply.text}</p>
      </div>
    );

  return (
    <div className="help-in flex items-end gap-2">
      <Avatar from={from} />
      <div className="min-w-0 max-w-[85%] space-y-2">
        {from === 'agent' && <p className="text-[11px] font-semibold text-green-700">Ana · Atendimento</p>}
        <div className="whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-zinc-800 shadow-sm ring-1 ring-zinc-200">
          {reply.text}
          {reply.code && (
            <div className="mt-2 flex gap-1.5" aria-label={`Código ${reply.code.split('').join(' ')}`}>
              {reply.code.split('').map((d, i) => (
                <span key={i} className="grid h-11 w-9 place-items-center rounded-lg bg-zinc-900 text-xl font-extrabold text-yellow-400">
                  {d}
                </span>
              ))}
            </div>
          )}
          {reply.code && <p className="mt-2 text-xs text-zinc-500">Só informe ao entregador quando ele chegar. 🔒</p>}
          {reply.link && (
            <Link to={reply.link.to} onClick={onLink} className="mt-2 flex items-center gap-1 font-bold text-zinc-900 underline decoration-yellow-400 decoration-2 underline-offset-4">
              {reply.link.label} <ArrowRight size={14} />
            </Link>
          )}
        </div>
        {reply.products?.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-sm ring-1 ring-zinc-200">
            <ProductImage src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{p.name}</p>
              <p className="text-xs text-zinc-500">
                {formatPrice(p.price)}
                {p.originalPrice && p.originalPrice > p.price && <s className="ml-1 text-zinc-400">{formatPrice(p.originalPrice)}</s>}
              </p>
            </div>
            <button
              onClick={() => onAdd(p.id)}
              disabled={added[p.id]}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${added[p.id] ? 'bg-green-100 text-green-700' : 'bg-yellow-400 text-zinc-900 hover:bg-yellow-500'}`}
              aria-label={added[p.id] ? `${p.name} adicionado` : `Adicionar ${p.name} ao carrinho`}
            >
              {added[p.id] ? <Check size={16} /> : <Plus size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
