import { Banknote, Check, Copy, CreditCard, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import type { PaymentInput } from '../context/AppContext';
import { PIX_KEY, PIX_MERCHANT } from '../data/mockData';
import type { PaymentMethod } from '../types';
import { formatPrice, parsePrice } from '../utils/format';
import { Input } from './ui';

export interface PaymentDraft {
  method: PaymentMethod | null;
  cardType: 'credito' | 'debito';
  needsMachine: boolean;
  changeFor: string;
  pixPaid: boolean;
}

export const emptyPayment: PaymentDraft = { method: null, cardType: 'credito', needsMachine: true, changeFor: '', pixPaid: false };

export function draftToPayment(d: PaymentDraft, total: number): PaymentInput | string {
  if (!d.method) return 'Escolha a forma de pagamento.';
  if (d.method === 'cartao') return { method: 'cartao', cardType: d.cardType, needsMachine: d.needsMachine };
  if (d.method === 'pix') return { method: 'pix', pixPaid: d.pixPaid };
  if (!d.changeFor.trim()) return { method: 'dinheiro' };
  const change = parsePrice(d.changeFor);
  if (!Number.isFinite(change) || change < total) return `O troco deve ser para um valor de pelo menos ${formatPrice(total)}.`;
  return { method: 'dinheiro', changeFor: change };
}

const OPTIONS = [
  { id: 'cartao', label: 'Cartão', sub: 'Crédito ou débito', icon: CreditCard },
  { id: 'pix', label: 'Pix', sub: 'Pague pelo app do banco', icon: QrCode },
  { id: 'dinheiro', label: 'Dinheiro', sub: 'Troco opcional', icon: Banknote },
] as const;

interface Props {
  value: PaymentDraft;
  onChange: (d: PaymentDraft) => void;
  total: number;
  isDelivery: boolean;
}

export default function PaymentSelector({ value, onChange, total, isDelivery }: Props) {
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<PaymentDraft>) => onChange({ ...value, ...patch });

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  // QR propositalmente NÃO segue o padrão BR Code: é só demonstração e não pode gerar um pagamento real.
  const qrValue = `PIX SIMULADO | ${PIX_MERCHANT} | ${formatPrice(total)} | NAO PAGUE - DEMONSTRACAO A3`;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-zinc-800">Forma de Pagamento</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ id, label, sub, icon: Icon }) => {
          const active = value.method === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => set({ method: id })}
              aria-pressed={active}
              className={`relative flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-3 text-center transition-colors ${
                active ? 'border-yellow-400 bg-yellow-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              {active && (
                <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-yellow-400">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
              <Icon size={20} className={active ? 'text-zinc-900' : 'text-zinc-500'} />
              <span className="text-xs font-bold text-zinc-900">{label}</span>
              <span className="hidden text-[10px] leading-tight text-zinc-500 sm:block">{sub}</span>
            </button>
          );
        })}
      </div>

      {value.method === 'cartao' && (
        <div className="mt-3 space-y-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-200/70 p-1">
            {(['credito', 'debito'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ cardType: t })}
                className={`rounded-md py-1.5 text-xs font-semibold ${value.cardType === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'}`}
              >
                {t === 'credito' ? 'Crédito' : 'Débito'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={value.needsMachine} onChange={(e) => set({ needsMachine: e.target.checked })} className="h-4 w-4 accent-yellow-400" />
            {isDelivery ? 'Entregador deve levar a maquininha' : 'Preciso da maquininha na mesa'}
          </label>
        </div>
      )}

      {value.method === 'pix' && (
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <div className="flex gap-3">
            <div className="shrink-0 rounded-lg bg-white p-2 ring-1 ring-zinc-200">
              <QRCodeSVG value={qrValue} size={88} />
            </div>
            <div className="min-w-0 text-xs">
              <p className="font-semibold text-zinc-800">Chave Pix (simulada)</p>
              <div className="mt-1 flex items-center gap-1">
                <code className="truncate rounded bg-white px-1.5 py-1 text-zinc-700 ring-1 ring-zinc-200">{PIX_KEY}</code>
                <button type="button" onClick={copyKey} className="rounded p-1 text-zinc-500 hover:bg-zinc-200" aria-label="Copiar chave Pix">
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="mt-1 text-zinc-500">Valor: <b className="text-zinc-800">{formatPrice(total)}</b></p>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={value.pixPaid} onChange={(e) => set({ pixPaid: e.target.checked })} className="h-4 w-4 accent-yellow-400" />
            Já fiz o pagamento (simulação)
          </label>
        </div>
      )}

      {value.method === 'dinheiro' && (
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-700">Troco para quanto? <span className="text-zinc-400">(opcional)</span></span>
            <Input inputMode="decimal" value={value.changeFor} onChange={(e) => set({ changeFor: e.target.value })} placeholder={`Ex: ${Math.ceil((total + 1) / 50) * 50}`} />
          </label>
        </div>
      )}
    </div>
  );
}
