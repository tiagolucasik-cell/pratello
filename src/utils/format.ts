import type { OrderStatus, Payment, ServiceLocation } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPrice = (value: number) => brl.format(value);

/** Converte "29,90" / "1.234,50" / "29.9" em número. */
export const parsePrice = (raw: string) => {
  const s = raw.trim();
  if (!s) return NaN;
  return Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s);
};

export const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const minutesSince = (timestamp: number) => Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

export const isToday = (timestamp: number) => new Date(timestamp).toDateString() === new Date().toDateString();

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const discountPercent = (price: number, original?: number) =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

export const prepRange = (minutes: number) => `${minutes}-${minutes + 10} min`;

/* ---------- Localização ---------- */

export function formatLocation(loc: ServiceLocation): string {
  if (loc.mode === 'mesa') return `Mesa ${loc.table}`;
  const a = loc.address;
  return `${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ''}`;
}

export function formatLocationFull(loc: ServiceLocation): string {
  if (loc.mode === 'mesa') return `Mesa ${loc.table}`;
  const a = loc.address;
  return `${formatLocation(loc)} · ${a.district} · CEP ${a.cep}`;
}

/* ---------- Pagamento ---------- */

export const PAYMENT_LABEL = { cartao: 'Cartão', pix: 'Pix', dinheiro: 'Dinheiro' } as const;

export function formatPayment(p: Payment): string {
  if (p.method === 'cartao') {
    const type = p.cardType === 'debito' ? 'Débito' : 'Crédito';
    const parcelas = p.cardType !== 'debito' && p.installments && p.installments > 1 ? ` ${p.installments}x` : '';
    return `Cartão de ${type}${parcelas}${p.needsMachine ? ' · levar maquininha' : ''}`;
  }
  if (p.method === 'dinheiro') return p.changeFor ? `Dinheiro · troco para ${formatPrice(p.changeFor)}` : 'Dinheiro · sem troco';
  return 'Pix';
}

/* ---------- Status dos pedidos ---------- */

export const STATUS_FLOW: OrderStatus[] = ['pendente', 'preparo', 'pronto', 'entregue'];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: 'Pendente',
  preparo: 'Em Preparo',
  pronto: 'Pronto',
  entregue: 'Entregue',
};

export const NEXT_ACTION_LABEL: Record<OrderStatus, string | null> = {
  pendente: 'Iniciar preparo',
  preparo: 'Marcar como pronto',
  pronto: 'Marcar como entregue',
  entregue: null,
};
