import { KeyRound, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { Button } from './ui';

interface CodeBoxesProps {
  value: string;
  onChange?: (value: string) => void;
  /** Liga a animação de tremer (código errado). Mude o número para tremer de novo. */
  shake?: number;
  error?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}

/** Quatro caixas de dígito, estilo código de verificação. */
export function CodeBoxes({ value, onChange, shake = 0, error, readOnly, autoFocus }: CodeBoxesProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(4, ' ').slice(0, 4).split('');

  useEffect(() => {
    if (autoFocus && !readOnly) refs.current[0]?.focus();
  }, [autoFocus, readOnly]);

  // depois de tremer, volta o foco para a primeira caixa
  useEffect(() => {
    if (shake && !readOnly) refs.current[0]?.focus();
  }, [shake, readOnly]);

  const set = (i: number, d: string) => {
    const next = digits.map((c, j) => (j === i ? d || ' ' : c)).join('').trimEnd();
    onChange?.(next.replace(/ /g, ''));
  };

  return (
    <div key={shake} className={`flex justify-center gap-2.5 ${shake ? 'code-shake' : ''}`} role="group" aria-label="Código de entrega">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d.trim()}
          readOnly={readOnly}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Dígito ${i + 1}`}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
            if (!pasted) return;
            e.preventDefault();
            onChange?.(pasted);
            refs.current[Math.min(pasted.length, 3)]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d.trim() && i > 0) {
              e.preventDefault();
              set(i - 1, '');
              refs.current[i - 1]?.focus();
            } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === 'ArrowRight' && i < 3) refs.current[i + 1]?.focus();
          }}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, '').slice(-1);
            set(i, digit);
            if (digit && i < 3) refs.current[i + 1]?.focus();
          }}
          className={`h-14 w-12 rounded-xl border-2 bg-white text-center text-2xl font-extrabold text-zinc-900 outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50 text-red-600' : d.trim() ? 'border-zinc-900' : 'border-zinc-200'
          } focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40`}
        />
      ))}
    </div>
  );
}

/** Cozinha: pede o código que o cliente passou ao entregador antes de concluir a entrega. */
export function DeliveryCodeModal({
  orderNumber,
  customerName,
  onConfirm,
  onClose,
}: {
  orderNumber: number;
  customerName: string;
  onConfirm: (code: string) => boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(0);
  const [error, setError] = useState(false);

  const submit = (value = code) => {
    if (value.length < 4) return;
    if (onConfirm(value)) return onClose();
    setError(true);
    setShake((s) => s + 1);
    setTimeout(() => {
      setCode('');
      setError(false);
    }, 650);
  };

  return (
    <Modal open title={`Confirmar entrega · #${orderNumber}`} onClose={onClose}>
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-yellow-100 text-yellow-700">
          <KeyRound size={28} />
        </span>
        <p className="mt-3 text-sm text-zinc-600">
          Peça a <b className="text-zinc-900">{customerName}</b> o código de 4 dígitos que aparece no app.
        </p>
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <CodeBoxes
            value={code}
            autoFocus
            shake={shake}
            error={error}
            onChange={(v) => {
              setCode(v);
              setError(false);
              if (v.length === 4) submit(v);
            }}
          />
          <p className={`mt-3 h-5 text-sm font-semibold ${error ? 'text-red-600' : 'text-transparent'}`} aria-live="polite">
            {error ? 'Código incorreto. Tente de novo.' : '.'}
          </p>
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={code.length < 4}>
            <ShieldCheck size={18} /> Confirmar entrega
          </Button>
        </form>
      </div>
    </Modal>
  );
}
