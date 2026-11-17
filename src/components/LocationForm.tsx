import { Armchair, Bike, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TABLE_COUNT } from '../data/mockData';
import type { Address, ServiceLocation } from '../types';
import { Field, Input, Select } from './ui';

export interface LocationDraft {
  mode: 'mesa' | 'delivery';
  table: string;
  address: Address;
}

const emptyAddress: Address = { cep: '', street: '', number: '', district: '', complement: '' };

export const toDraft = (loc?: ServiceLocation): LocationDraft => ({
  mode: loc?.mode ?? 'mesa',
  table: loc?.mode === 'mesa' ? loc.table : '',
  address: loc?.mode === 'delivery' ? loc.address : emptyAddress,
});

/** Valida o rascunho e devolve a localização final, ou uma mensagem de erro. */
export function draftToLocation(d: LocationDraft): ServiceLocation | string {
  if (d.mode === 'mesa') return d.table ? { mode: 'mesa', table: d.table } : 'Selecione o número da mesa.';
  const a = d.address;
  if (a.cep.replace(/\D/g, '').length !== 8) return 'Informe um CEP válido.';
  if (!a.street.trim() || !a.number.trim() || !a.district.trim()) return 'Preencha rua, número e bairro.';
  return {
    mode: 'delivery',
    address: { cep: a.cep, street: a.street.trim(), number: a.number.trim(), district: a.district.trim(), complement: a.complement.trim() },
  };
}

const maskCep = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const tables = Array.from({ length: TABLE_COUNT }, (_, i) => String(i + 1).padStart(2, '0'));

export default function LocationForm({ value, onChange }: { value: LocationDraft; onChange: (d: LocationDraft) => void }) {
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const setAddr = (patch: Partial<Address>) => onChange({ ...value, address: { ...value.address, ...patch } });

  // Preenche rua e bairro pelo CEP (ViaCEP). Sem internet, o cliente digita manualmente.
  const cepDigits = value.address.cep.replace(/\D/g, '');
  const lastLookup = useRef(cepDigits); // não sobrescreve um endereço já salvo ao abrir o formulário
  useEffect(() => {
    if (value.mode !== 'delivery' || cepDigits.length !== 8) return setCepStatus('idle');
    if (cepDigits === lastLookup.current) return;
    lastLookup.current = cepDigits;
    const ctrl = new AbortController();
    setCepStatus('loading');
    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { erro?: boolean; logradouro?: string; bairro?: string }) => {
        if (data.erro) return setCepStatus('error');
        setCepStatus('idle');
        onChange({
          ...value,
          address: { ...value.address, street: data.logradouro || value.address.street, district: data.bairro || value.address.district },
        });
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setCepStatus('idle');
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepDigits, value.mode]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['mesa', 'Salão / Mesa', Armchair],
            ['delivery', 'Delivery', Bike],
          ] as const
        ).map(([mode, label, Icon]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ ...value, mode })}
            aria-pressed={value.mode === mode}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
              value.mode === mode ? 'border-yellow-400 bg-yellow-50 text-zinc-900' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {value.mode === 'mesa' ? (
        <Field label="Número da mesa">
          <Select value={value.table} onChange={(e) => onChange({ ...value, table: e.target.value })}>
            <option value="">Selecione a mesa…</option>
            {tables.map((t) => (
              <option key={t} value={t}>
                Mesa {t}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <Field label="CEP" hint={cepStatus === 'error' ? 'CEP não encontrado.' : undefined}>
              <div className="relative">
                <Input inputMode="numeric" value={value.address.cep} onChange={(e) => setAddr({ cep: maskCep(e.target.value) })} placeholder="00000-000" />
                {cepStatus === 'loading' && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-zinc-400" />}
              </div>
            </Field>
          </div>
          <div className="col-span-3">
            <Field label="Número">
              <Input value={value.address.number} onChange={(e) => setAddr({ number: e.target.value })} placeholder="123" />
            </Field>
          </div>
          <div className="col-span-6">
            <Field label="Rua">
              <Input value={value.address.street} onChange={(e) => setAddr({ street: e.target.value })} placeholder="Rua das Flores" />
            </Field>
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Field label="Bairro">
              <Input value={value.address.district} onChange={(e) => setAddr({ district: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Field label="Complemento">
              <Input value={value.address.complement} onChange={(e) => setAddr({ complement: e.target.value })} placeholder="Apto, bloco…" />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
