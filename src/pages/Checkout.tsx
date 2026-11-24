import { AlertCircle, Armchair, ArrowLeft, Bike, Check, ChevronRight, MapPin, MessageCircle, PiggyBank, ShoppingBag, Ticket, Truck, X, Zap } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { draftToLocation, toDraft, AddressFields, TableSelect } from '../components/LocationForm';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import PaymentSelector, { draftToPayment, emptyPayment, type PaymentDraft } from '../components/PaymentSelector';
import ProductImage from '../components/ProductImage';
import { Button, Field, Input, Textarea } from '../components/ui';
import { useApp } from '../context/AppContext';
import { FREE_DELIVERY_FROM } from '../data/mockData';
import type { Address, ShippingId } from '../types';
import { COUPONS, computeCheckout, couponProblem, findCoupon, type CheckoutMode, type Coupon } from '../utils/checkout';
import { formatPrice } from '../utils/format';

const MODES: { id: CheckoutMode; label: string; sub: string; icon: typeof Bike }[] = [
  { id: 'mesa', label: 'Na mesa', sub: 'Receba no salão', icon: Armchair },
  { id: 'delivery', label: 'Delivery', sub: 'Entrega pelo app', icon: Bike },
  { id: 'whatsapp', label: 'WhatsApp', sub: 'Envie o pedido no Zap', icon: MessageCircle },
];

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

/** Borda listrada no topo do bloco de endereço, como um envelope. */
const STRIPES = {
  backgroundImage:
    'repeating-linear-gradient(-45deg, var(--color-yellow-400) 0 14px, transparent 14px 20px, #27272a 20px 34px, transparent 34px 40px)',
};

function Section({ title, icon, action, children }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold text-zinc-900">
          <span className="text-yellow-600">{icon}</span> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Checkout() {
  const { session, cartLines, subtotal, placeOrder } = useApp();
  const navigate = useNavigate();
  const client = session?.type === 'cliente' ? session : null;
  const initial = toDraft(client?.location);

  const [mode, setMode] = useState<CheckoutMode>(initial.mode);
  const [table, setTable] = useState(initial.table);
  const [address, setAddress] = useState<Address>(initial.address);
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [shipping, setShipping] = useState<ShippingId>('padrao');
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [payment, setPayment] = useState<PaymentDraft>(emptyPayment);
  const [notes, setNotes] = useState('');
  const [couponsOpen, setCouponsOpen] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(
    () => computeCheckout({ subtotal, mode, payment: payment.method, cep: address.cep, shipping, couponCodes }),
    [subtotal, mode, payment.method, address.cep, shipping, couponCodes],
  );

  const ctx = { subtotal, mode, payment: payment.method };
  const availableCount = COUPONS.filter((c) => !couponProblem(c, ctx)).length;
  const isShipped = mode !== 'mesa';
  const itemCount = cartLines.reduce((s, l) => s + l.quantity, 0);

  const clearError = () => setError('');

  const toggleCoupon = (c: Coupon) => {
    clearError();
    setCouponCodes((prev) =>
      prev.includes(c.code) ? prev.filter((x) => x !== c.code) : [...prev.filter((x) => findCoupon(x)?.kind !== c.kind), c.code],
    );
  };

  const submit = () => {
    const location = draftToLocation({ mode: mode === 'mesa' ? 'mesa' : 'delivery', table, address });
    if (typeof location === 'string') return setError(location);
    if (isShipped && phone.replace(/\D/g, '').length < 10) return setError('Informe um telefone com DDD para contato.');
    if (summary.invalid.length) return setError('Remova os cupons que não valem para este pedido.');
    const pay = draftToPayment(payment, summary.total);
    if (typeof pay === 'string') return setError(pay);

    const order = placeOrder({
      location,
      channel: mode === 'whatsapp' ? 'whatsapp' : 'app',
      phone,
      notes,
      payment: pay,
      shipping,
      couponCodes,
    });
    if (!order) return setError('Não foi possível enviar o pedido. Tente novamente.');
    if (mode === 'whatsapp') navigate(`/pedido-whatsapp/${order.id}`);
    else navigate(`/pedido/${order.id}`, { state: { placed: true } });
  };

  if (cartLines.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-100 p-4">
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-zinc-100 text-zinc-500">
            <ShoppingBag size={24} />
          </div>
          <p className="font-bold text-zinc-900">Seu carrinho está vazio</p>
          <p className="mt-1 text-sm text-zinc-600">Adicione pratos do cardápio para finalizar um pedido.</p>
          <Link to="/cardapio" className="mt-5 inline-flex rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-yellow-500">
            Ver cardápio
          </Link>
        </div>
      </div>
    );
  }

  const appliedProduct = summary.applied.find((c) => c.kind === 'desconto');
  const appliedShipping = summary.applied.find((c) => c.kind === 'frete');

  const summaryBlock = (
    <div className="space-y-2 text-sm">
      <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'itens'})`} value={formatPrice(summary.subtotal)} />
      {isShipped && (
        <Row
          label="Frete"
          value={summary.km === 0 ? <span className="text-zinc-400">informe o CEP</span> : summary.shippingFee === 0 ? <b className="text-green-600">Grátis</b> : formatPrice(summary.shippingFee)}
        />
      )}
      {summary.shippingDiscount > 0 && <Row label={`Cupom de frete (${appliedShipping?.code})`} value={`- ${formatPrice(summary.shippingDiscount)}`} accent />}
      {summary.discount > 0 && <Row label={`Cupom de desconto (${appliedProduct?.code})`} value={`- ${formatPrice(summary.discount)}`} accent />}
      <div className="flex items-baseline justify-between border-t border-zinc-100 pt-3">
        <span className="font-semibold text-zinc-900">Total</span>
        <span className="text-2xl font-extrabold text-zinc-900">{formatPrice(summary.total)}</span>
      </div>
      {summary.savings > 0 && (
        <p className="flex items-center justify-end gap-1 text-xs font-semibold text-green-700">
          <PiggyBank size={14} /> Você economizou {formatPrice(summary.savings)}
        </p>
      )}
    </div>
  );

  const submitLabel = mode === 'whatsapp' ? 'Enviar pelo WhatsApp' : 'Fazer pedido';

  return (
    <div className="min-h-screen bg-zinc-100 pb-28 lg:pb-10">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/cardapio" className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100" aria-label="Voltar ao cardápio">
            <ArrowLeft size={20} />
          </Link>
          <Logo />
          <span className="h-6 w-px bg-zinc-200" />
          <h1 className="text-lg font-bold text-zinc-900">Finalizar pedido</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <main className="min-w-0 space-y-4">
          {/* Como receber */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
            <div className="h-1.5" style={STRIPES} />
            <div className="p-4 sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-zinc-900">
                <MapPin size={18} className="text-yellow-600" /> Como você quer pedir?
              </h2>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Forma de pedido">
                {MODES.map(({ id, label, sub, icon: Icon }) => {
                  const active = mode === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setMode(id);
                        clearError();
                      }}
                      className={`relative flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-colors ${
                        active ? 'border-yellow-400 bg-yellow-50' : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {active && (
                        <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-yellow-400">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                      <Icon size={22} className={active ? 'text-zinc-900' : 'text-zinc-500'} />
                      <span className="text-sm font-bold text-zinc-900">{label}</span>
                      <span className="hidden text-[11px] leading-tight text-zinc-500 sm:block">{sub}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                {mode === 'mesa' ? (
                  <TableSelect
                    value={table}
                    onChange={(t) => {
                      setTable(t);
                      clearError();
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    {mode === 'whatsapp' && (
                      <p className="flex gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-900 ring-1 ring-green-200">
                        <MessageCircle size={18} className="mt-0.5 shrink-0" />
                        Seu pedido vai pronto para o WhatsApp do restaurante. É só confirmar o envio e acompanhar pela conversa.
                      </p>
                    )}
                    <AddressFields
                      value={address}
                      onChange={(a) => {
                        setAddress(a);
                        clearError();
                      }}
                    />
                    <Field label={mode === 'whatsapp' ? 'Seu WhatsApp' : 'Telefone para contato'}>
                      <Input type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-0000" autoComplete="tel" />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Itens */}
          <Section
            title="Seu pedido"
            icon={<ShoppingBag size={18} />}
            action={
              <Link to="/cardapio" className="text-xs font-bold text-yellow-600 hover:text-yellow-700">
                Editar itens
              </Link>
            }
          >
            <ul className="divide-y divide-zinc-100">
              {cartLines.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <ProductImage src={product.image} alt={product.name} className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{product.name}</p>
                    <p className="text-xs text-zinc-500">
                      {formatPrice(product.price)} <span className="text-zinc-400">× {quantity}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="ml-1.5 text-zinc-400 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">{formatPrice(product.price * quantity)}</span>
                </li>
              ))}
            </ul>
            <label className="mt-2 block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Mensagem para o restaurante</span>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: sem cebola, ponto da carne…" />
            </label>
          </Section>

          {/* Frete */}
          {isShipped && (
            <Section title="Opções de entrega" icon={<Truck size={18} />}>
              {summary.km === 0 ? (
                <p className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600 ring-1 ring-zinc-200">Informe um CEP válido para calcular o frete.</p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-zinc-500">
                    Distância estimada: <b className="text-zinc-700">{summary.km.toLocaleString('pt-BR')} km</b> do restaurante
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Opção de entrega">
                    {summary.options.map((o) => {
                      const active = shipping === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setShipping(o.id)}
                          className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                            active ? 'border-yellow-400 bg-yellow-50' : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? 'bg-yellow-400' : 'bg-zinc-100 text-zinc-500'}`}>
                            {o.id === 'expressa' ? <Zap size={18} /> : <Bike size={18} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-zinc-900">Entrega {o.name}</span>
                            <span className="block text-xs text-zinc-500">Chega em {o.eta}</span>
                          </span>
                          <span className="text-right text-sm font-bold">
                            {o.fee === 0 ? <span className="text-green-600">Grátis</span> : formatPrice(o.fee)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {!summary.options[0].freeByMinimum && (
                    <p className="mt-2 text-xs text-zinc-500">
                      Faltam <b className="text-zinc-700">{formatPrice(FREE_DELIVERY_FROM - subtotal)}</b> para frete grátis na entrega Padrão.
                    </p>
                  )}
                </>
              )}
            </Section>
          )}

          {/* Cupons */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
            <button type="button" onClick={() => setCouponsOpen(true)} className="flex w-full items-center gap-3 p-4 text-left sm:p-5">
              <Ticket size={20} className="shrink-0 text-yellow-600" />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-zinc-900">Cupons Pratello</span>
                {summary.applied.length === 0 ? (
                  <span className="block text-xs text-zinc-500">{availableCount} cupons disponíveis para este pedido</span>
                ) : (
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {summary.applied.map((c) => (
                      <span key={c.code} className="rounded border border-dashed border-yellow-500 bg-yellow-50 px-1.5 py-0.5 text-[11px] font-bold text-yellow-800">
                        {c.code}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              {summary.discount + summary.shippingDiscount > 0 ? (
                <span className="text-sm font-bold text-green-600">- {formatPrice(summary.discount + summary.shippingDiscount)}</span>
              ) : (
                <span className="text-sm text-zinc-500">Selecionar</span>
              )}
              <ChevronRight size={18} className="shrink-0 text-zinc-400" />
            </button>
            {summary.invalid.length > 0 && (
              <div className="space-y-1.5 border-t border-zinc-100 px-4 py-3 sm:px-5">
                {summary.invalid.map(({ coupon, reason }) => (
                  <p key={coupon.code} className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle size={14} className="shrink-0" />
                    <span className="flex-1">
                      <b>{coupon.code}</b> não vale agora: {reason.toLowerCase()}
                    </span>
                    <button type="button" onClick={() => toggleCoupon(coupon)} className="rounded p-0.5 hover:bg-red-50" aria-label={`Remover ${coupon.code}`}>
                      <X size={14} />
                    </button>
                  </p>
                ))}
              </div>
            )}
          </section>

          {/* Pagamento */}
          <Section title="Forma de pagamento" icon={<PiggyBank size={18} />}>
            <PaymentSelector
              value={payment}
              onChange={(d) => {
                setPayment(d);
                clearError();
              }}
              total={summary.total}
              isDelivery={isShipped}
            />
          </Section>

          {/* Resumo (celular) */}
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 lg:hidden">
            <h2 className="mb-3 font-bold text-zinc-900">Detalhes do pagamento</h2>
            {summaryBlock}
          </section>
        </main>

        {/* Resumo (desktop) */}
        <aside className="sticky top-20 hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 lg:block">
          <h2 className="mb-4 font-bold text-zinc-900">Detalhes do pagamento</h2>
          {summaryBlock}
          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          <SubmitButton whatsapp={mode === 'whatsapp'} onClick={submit} className="mt-4 w-full">
            {submitLabel}
          </SubmitButton>
          <p className="mt-2 text-center text-[11px] text-zinc-400">Ambiente de demonstração · nenhum pagamento real é feito</p>
        </aside>
      </div>

      {/* Barra inferior (celular) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white lg:hidden">
        {error && <p className="bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{error}</p>}
        <div className="flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1 text-right leading-tight">
            <p className="text-xs text-zinc-500">
              Total <b className="text-lg text-zinc-900">{formatPrice(summary.total)}</b>
            </p>
            {summary.savings > 0 && <p className="text-[11px] font-semibold text-green-700">Economia de {formatPrice(summary.savings)}</p>}
          </div>
          <SubmitButton whatsapp={mode === 'whatsapp'} onClick={submit}>
            {submitLabel}
          </SubmitButton>
        </div>
      </div>

      <CouponModal
        open={couponsOpen}
        onClose={() => setCouponsOpen(false)}
        selected={couponCodes}
        ctx={ctx}
        onToggle={toggleCoupon}
      />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-zinc-600">{label}</span>
      <span className={accent ? 'font-semibold text-green-600' : 'text-zinc-900'}>{value}</span>
    </div>
  );
}

function SubmitButton({ whatsapp, className = '', ...props }: { whatsapp: boolean; onClick: () => void; className?: string; children: ReactNode }) {
  return whatsapp ? (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700 ${className}`}
      {...props}
    >
      <MessageCircle size={18} /> {props.children}
    </button>
  ) : (
    <Button size="lg" className={className} {...props} />
  );
}

/* ---------- Cupons ---------- */

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  selected: string[];
  ctx: Parameters<typeof couponProblem>[1];
  onToggle: (c: Coupon) => void;
}

function CouponModal({ open, onClose, selected, ctx, onToggle }: CouponModalProps) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = () => {
    const c = findCoupon(code);
    if (!c) return setMsg({ ok: false, text: 'Cupom não encontrado. Confira o código.' });
    const problem = couponProblem(c, ctx);
    if (problem) return setMsg({ ok: false, text: `${c.code}: ${problem}.` });
    if (!selected.includes(c.code)) onToggle(c);
    setMsg({ ok: true, text: `Cupom ${c.code} aplicado!` });
    setCode('');
  };

  const group = (kind: Coupon['kind'], title: string) => (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="-mt-1 mb-2 text-[11px] text-zinc-400">Escolha 1 cupom</p>
      <div className="space-y-2.5">
        {COUPONS.filter((c) => c.kind === kind).map((c) => (
          <VoucherCard key={c.code} coupon={c} active={selected.includes(c.code)} problem={couponProblem(c, ctx)} onClick={() => onToggle(c)} />
        ))}
      </div>
    </div>
  );

  return (
    <Modal open={open} title="Cupons Pratello" onClose={onClose}>
      <div className="space-y-5">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setMsg(null);
            }}
            placeholder="Digite o código do cupom"
            aria-label="Código do cupom"
          />
          <Button type="submit" variant="dark" disabled={!code.trim()}>
            Aplicar
          </Button>
        </form>
        {msg && <p className={`-mt-3 text-sm font-medium ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
        {group('frete', 'Cupons de frete')}
        {group('desconto', 'Cupons de desconto')}
        <Button className="w-full" onClick={onClose}>
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}

function VoucherCard({ coupon, active, problem, onClick }: { coupon: Coupon; active: boolean; problem: string | null; onClick: () => void }) {
  const disabled = !!problem && !active;
  const isShip = coupon.kind === 'frete';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`relative flex w-full overflow-hidden rounded-xl text-left ring-1 transition-shadow ${
        active ? 'ring-2 ring-yellow-500' : 'ring-zinc-200 hover:shadow-md'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      {/* canhoto */}
      <div
        className={`relative flex w-24 shrink-0 flex-col items-center justify-center gap-1 border-r-2 border-dashed border-white px-2 py-3 ${
          disabled ? 'bg-zinc-300 text-zinc-600' : isShip ? 'bg-teal-500 text-white' : 'bg-yellow-400 text-zinc-900'
        }`}
      >
        {isShip ? <Truck size={22} /> : <Ticket size={22} />}
        <span className="text-[10px] font-extrabold uppercase tracking-wide">{isShip ? 'Frete' : 'Pratello'}</span>
        <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-white" />
        <span className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-white" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 bg-white p-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-zinc-900">{coupon.title}</p>
          <p className="text-xs text-zinc-600">{coupon.description}</p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {coupon.minSubtotal > 0 ? `Mín. ${formatPrice(coupon.minSubtotal)} · ` : ''}Válido até {coupon.validUntil} ·{' '}
            <span className="font-mono font-semibold text-zinc-500">{coupon.code}</span>
          </p>
          {problem && <p className="mt-1 text-[11px] font-semibold text-red-600">{problem}</p>}
        </div>
        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-yellow-500 bg-yellow-400' : 'border-zinc-300'}`}>
          {active && <Check size={12} strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}
