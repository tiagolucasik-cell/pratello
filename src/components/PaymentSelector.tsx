import { Banknote, Check, Copy, CreditCard, QrCode, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import type { PaymentInput } from '../context/AppContext';
import { PIX_KEY, PIX_MERCHANT } from '../data/mockData';
import type { PaymentMethod } from '../types';
import { maxInstallments } from '../utils/checkout';
import { formatPrice, parsePrice } from '../utils/format';
import { Input } from './ui';

export interface PaymentDraft {
  method: PaymentMethod | null;
  cardType: 'credito' | 'debito';
  installments: number;
  needsMachine: boolean;
  changeFor: string;
  pixPaid: boolean;
}

export const emptyPayment: PaymentDraft = { method: null, cardType: 'credito', installments: 1, needsMachine: true, changeFor: '', pixPaid: false };

export function draftToPayment(d: PaymentDraft, total: number): PaymentInput | string {
  if (!d.method) return 'Escolha a forma de pagamento.';
  if (d.method === 'cartao') {
    const installments = d.cardType === 'credito' ? Math.min(d.installments, maxInstallments(total)) : 1;
    return { method: 'cartao', cardType: d.cardType, installments, needsMachine: d.needsMachine };
  }
  if (d.method === 'pix') return { method: 'pix', pixPaid: d.pixPaid };
  if (!d.changeFor.trim()) return { method: 'dinheiro' };
  const change = parsePrice(d.changeFor);
  if (!Number.isFinite(change) || change < total) return `O troco deve ser para um valor de pelo menos ${formatPrice(total)}.`;
  return { method: 'dinheiro', changeFor: change };
}

type RowId = 'pix' | 'credito' | 'debito' | 'dinheiro';

const ROWS: { id: RowId; label: string; sub: string; icon: typeof QrCode; badge?: string }[] = [
  { id: 'pix', label: 'Pix', sub: 'Aprovação na hora', icon: QrCode, badge: 'Cupom PIX7' },
  { id: 'credito', label: 'Cartão de crédito', sub: 'Até 3x sem juros', icon: CreditCard },
  { id: 'debito', label: 'Cartão de débito', sub: 'Na maquininha', icon: Wallet },
  { id: 'dinheiro', label: 'Dinheiro', sub: 'Troco opcional', icon: Banknote },
];

const rowOf = (d: PaymentDraft): RowId | null => (d.method === 'cartao' ? d.cardType : d.method);

interface Props {
  value: PaymentDraft;
  onChange: (d: PaymentDraft) => void;
  total: number;
  isDelivery: boolean;
}

export default function PaymentSelector({ value, onChange, total, isDelivery }: Props) {
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<PaymentDraft>) => onChange({ ...value, ...patch });
  const current = rowOf(value);
  const maxParc = maxInstallments(total);

  const pick = (id: RowId) =>
    id === 'credito' || id === 'debito' ? set({ method: 'cartao', cardType: id }) : set({ method: id });

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

  const details = (id: RowId) => {
    if (id === 'pix')
      return (
        <div className="flex gap-3">
          <div className="shrink-0 rounded-lg bg-white p-2 ring-1 ring-zinc-200">
            <QRCodeSVG value={qrValue} size={96} />
          </div>
          <div className="min-w-0 text-xs">
            <p className="font-semibold text-zinc-800">Chave Pix (simulada)</p>
            <div className="mt-1 flex items-center gap-1">
              <code className="truncate rounded bg-white px-1.5 py-1 text-zinc-700 ring-1 ring-zinc-200">{PIX_KEY}</code>
              <button type="button" onClick={copyKey} className="rounded p-1 text-zinc-500 hover:bg-zinc-200" aria-label="Copiar chave Pix">
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-1 text-zinc-500">
              Valor: <b className="text-zinc-800">{formatPrice(total)}</b>
            </p>
            <label className="mt-2 flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={value.pixPaid} onChange={(e) => set({ pixPaid: e.target.checked })} className="h-4 w-4 accent-yellow-400" />
              Já fiz o pagamento (simulação)
            </label>
          </div>
        </div>
      );
    if (id === 'credito' || id === 'debito')
      return (
        <div className="space-y-3">
          {id === 'credito' && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-zinc-600">Parcelas</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((n) => {
                  const disabled = n > maxParc;
                  const active = Math.min(value.installments, maxParc) === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={disabled}
                      onClick={() => set({ installments: n })}
                      className={`rounded-lg border px-2 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        active ? 'border-yellow-400 bg-yellow-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <b className="block text-zinc-900">{n}x {formatPrice(total / n)}</b>
                      <span className="text-zinc-500">{n === 1 ? 'à vista' : 'sem juros'}</span>
                    </button>
                  );
                })}
              </div>
              {maxParc < 3 && <p className="mt-1 text-[11px] text-zinc-500">Parcela mínima de R$ 15,00.</p>}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={value.needsMachine} onChange={(e) => set({ needsMachine: e.target.checked })} className="h-4 w-4 accent-yellow-400" />
            {isDelivery ? 'Entregador deve levar a maquininha' : 'Preciso da maquininha na mesa'}
          </label>
        </div>
      );
    return (
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-700">
          Troco para quanto? <span className="text-zinc-400">(opcional)</span>
        </span>
        <Input inputMode="decimal" value={value.changeFor} onChange={(e) => set({ changeFor: e.target.value })} placeholder={`Ex: ${Math.ceil((total + 1) / 50) * 50}`} />
      </label>
    );
  };

  return (
    <div role="radiogroup" aria-label="Forma de pagamento" className="divide-y divide-zinc-100">
      {ROWS.map(({ id, label, sub, icon: Icon, badge }) => {
        const active = current === id;
        return (
          <div key={id}>
            <button type="button" role="radio" aria-checked={active} onClick={() => pick(id)} className="flex w-full items-center gap-3 py-3 text-left">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? 'bg-yellow-400 text-zinc-900' : 'bg-zinc-100 text-zinc-500'}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  {label}
                  {badge && <span className="rounded border border-yellow-500 px-1 text-[10px] font-bold text-yellow-700">{badge}</span>}
                </span>
                <span className="block text-xs text-zinc-500">{sub}</span>
              </span>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-yellow-500 bg-yellow-400' : 'border-zinc-300'}`}>
                {active && <Check size={12} strokeWidth={3} className="text-zinc-900" />}
              </span>
            </button>
            {active && <div className="mb-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">{details(id)}</div>}
          </div>
        );
      })}
    </div>
  );
}
