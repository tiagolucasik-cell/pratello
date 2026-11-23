import { ArrowLeft, CheckCheck, CheckCircle2, Info, MessageCircle, MoreVertical, Phone, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Order } from '../types';
import { formatLocationFull, formatPayment, formatPrice, formatTime } from '../utils/format';

/** Texto do pedido como ficaria na mensagem do WhatsApp (com *negrito* no estilo do app). */
function buildMessage(o: Order): string {
  const lines = [
    `*Novo pedido #${o.number}* 🍽️`,
    '',
    ...o.items.map((it) => `${it.quantity}x ${it.name} — ${formatPrice(it.price * it.quantity)}`),
    '',
    `Subtotal: ${formatPrice(o.subtotal)}`,
    `Frete: ${o.deliveryFee > 0 ? formatPrice(o.deliveryFee) : 'Grátis'}`,
  ];
  if (o.discount) lines.push(`Desconto: -${formatPrice(o.discount)}`);
  if (o.coupons?.length) lines.push(`Cupons: ${o.coupons.join(', ')}`);
  lines.push(`*Total: ${formatPrice(o.total)}*`, '', `👤 ${o.customerName}`, `📍 ${formatLocationFull(o.location)}`, `💳 ${formatPayment(o.payment)}`);
  if (o.notes) lines.push(`📝 ${o.notes}`);
  return lines.join('\n');
}

/** Renderiza *negrito* como no WhatsApp. */
const Rich = ({ text }: { text: string }) => (
  <>
    {text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith('*') && part.endsWith('*') ? <b key={i}>{part.slice(1, -1)}</b> : <span key={i}>{part}</span>,
    )}
  </>
);

type Stage = 'sending' | 'sent' | 'read' | 'typing' | 'replied';

export default function WhatsAppSent() {
  const { id } = useParams();
  const { orders, session } = useApp();
  const order = orders.find((o) => o.id === id);
  const [stage, setStage] = useState<Stage>('sending');

  // Simula envio → entregue → lido → digitando → resposta automática
  useEffect(() => {
    const steps: [Stage, number][] = [
      ['sent', 700],
      ['read', 1600],
      ['typing', 2300],
      ['replied', 4200],
    ];
    const timers = steps.map(([s, ms]) => setTimeout(() => setStage(s), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!order || session?.type !== 'cliente' || order.clientId !== session.clientId) return <Navigate to="/cardapio" replace />;

  const time = formatTime(order.createdAt);
  const firstName = order.customerName.split(' ')[0];
  const eta = order.shipping === 'expressa' ? '20 a 35 minutos' : '40 a 60 minutos';
  const done = stage === 'replied';

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-200 sm:py-6">
      <p className="flex w-full max-w-md items-center justify-center gap-1.5 bg-zinc-900 px-3 py-1.5 text-center text-[11px] font-medium text-zinc-300 sm:mb-2 sm:rounded-full">
        <Info size={12} /> Simulação para demonstração — nenhuma mensagem real foi enviada
      </p>

      <div className="flex w-full max-w-md flex-1 flex-col overflow-hidden bg-[#efeae2] shadow-xl sm:flex-none sm:rounded-2xl">
        {/* Cabeçalho do chat */}
        <header className="flex items-center gap-3 bg-[#008069] px-3 py-2.5 text-white">
          <Link to="/cardapio" className="rounded-full p-1 hover:bg-white/10" aria-label="Voltar ao cardápio">
            <ArrowLeft size={20} />
          </Link>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-yellow-400 text-sm font-extrabold text-zinc-900">P</div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-1 font-semibold">
              Pratello Restaurante <CheckCircle2 size={14} className="fill-white text-[#008069]" />
            </p>
            <p className="text-xs text-white/80">{stage === 'typing' ? 'digitando…' : 'online'}</p>
          </div>
          <Video size={20} className="opacity-90" />
          <Phone size={18} className="opacity-90" />
          <MoreVertical size={18} className="opacity-90" />
        </header>

        {/* Conversa */}
        <div
          className="flex-1 space-y-2 overflow-y-auto px-3 py-4"
          style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '14px 14px' }}
        >
          <p className="mx-auto w-fit rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium uppercase text-zinc-500 shadow-sm">Hoje</p>
          <p className="mx-auto max-w-[85%] rounded-lg bg-[#fff5c4] px-3 py-1.5 text-center text-[11px] text-zinc-600 shadow-sm">
            🔒 Esta é uma conta comercial do Pratello. Pedidos enviados por aqui entram direto na cozinha.
          </p>

          {/* Mensagem do cliente */}
          <div className="flex justify-end">
            <div className="relative max-w-[85%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-2.5 pb-1 pt-1.5 text-sm text-zinc-900 shadow-sm">
              <p className="whitespace-pre-wrap">
                <Rich text={buildMessage(order)} />
              </p>
              <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-zinc-500">
                {time}
                {stage === 'sending' ? (
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-zinc-400" />
                ) : (
                  <CheckCheck size={15} className={stage === 'sent' ? 'text-zinc-400' : 'text-sky-500'} />
                )}
              </p>
            </div>
          </div>

          {stage === 'typing' && (
            <div className="flex">
              <div className="flex gap-1 rounded-lg rounded-tl-none bg-white px-3 py-3 shadow-sm">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {done && (
            <div className="flex">
              <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white px-2.5 pb-1 pt-1.5 text-sm text-zinc-900 shadow-sm">
                <p className="whitespace-pre-wrap">
                  <Rich
                    text={`Olá, ${firstName}! 👋\n\n*Pedido #${order.number} recebido* ✅\nJá foi enviado para a cozinha.\n\n🛵 Previsão de entrega: ${eta}.\n${
                      order.payment.status === 'pago' ? 'Pagamento confirmado. ' : ''
                    }Obrigado por pedir no Pratello! 💛`}
                  />
                </p>
                <p className="mt-0.5 text-right text-[10px] text-zinc-500">{time}</p>
              </div>
            </div>
          )}
        </div>

        {/* Resultado */}
        <div className="border-t border-black/5 bg-white p-4">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={30} />
              </div>
              <p className="text-lg font-extrabold text-zinc-900">Pedido enviado com sucesso!</p>
              <p className="mt-1 text-sm text-zinc-600">
                O restaurante confirmou o pedido <b>#{order.number}</b> de <b>{formatPrice(order.total)}</b>.
              </p>
              <Link
                to="/cardapio"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008069] px-4 py-3 font-semibold text-white hover:bg-[#006e5a]"
              >
                Voltar ao cardápio
              </Link>
            </div>
          ) : (
            <p className="flex items-center justify-center gap-2 py-3 text-sm text-zinc-500">
              <MessageCircle size={16} className="animate-pulse text-[#008069]" /> Enviando pedido pelo WhatsApp…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
