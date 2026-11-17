import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import Modal from '../../components/Modal';
import ProductImage from '../../components/ProductImage';
import { Button, Field, Input, Select, Textarea } from '../../components/ui';
import { useApp, type ProductInput } from '../../context/AppContext';
import type { CategoryId, Product, TagId } from '../../types';
import { discountPercent, formatPrice, parsePrice } from '../../utils/format';

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  prepTime: string;
  category: CategoryId;
  tags: TagId[];
  image: string;
  ingredients: string;
  available: boolean;
  popular: boolean;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  prepTime: '20',
  category: 'lanches',
  tags: [],
  image: '',
  ingredients: '',
  available: true,
  popular: false,
};

const money = (v?: number) => (v ? v.toFixed(2).replace('.', ',') : '');

const toForm = (p: Product): FormState => ({
  ...p,
  price: money(p.price),
  originalPrice: money(p.originalPrice),
  prepTime: String(p.prepTime),
  ingredients: p.ingredients.join(', '),
});

export default function MenuManager() {
  const { products, categories, visualCategories, saveProduct, deleteProduct, toggleProductAvailability } = useApp();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'todas' | CategoryId>('todas');

  const list = useMemo(
    () =>
      products.filter(
        (p) => (cat === 'todas' || p.category === cat) && p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, cat, query],
  );

  const catName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;

  const open = (p?: Product) => {
    setError('');
    setForm(p ? toForm(p) : { ...emptyForm });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const price = parsePrice(form.price);
    const original = form.originalPrice.trim() ? parsePrice(form.originalPrice) : undefined;
    const prepTime = Number(form.prepTime);
    if (!form.name.trim()) return setError('Informe o nome do prato.');
    if (!Number.isFinite(price) || price <= 0) return setError('Informe um preço válido (ex: 29,90).');
    if (original !== undefined && (!Number.isFinite(original) || original <= price))
      return setError('O preço "de" (promoção) deve ser maior que o preço atual.');
    if (!Number.isInteger(prepTime) || prepTime <= 0) return setError('Informe o tempo de preparo em minutos.');
    const input: ProductInput = {
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Math.round(price * 100) / 100,
      originalPrice: original !== undefined ? Math.round(original * 100) / 100 : undefined,
      prepTime,
      tags: form.tags,
      category: form.category,
      image: form.image.trim(),
      ingredients: form.ingredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      available: form.available,
      popular: form.popular,
    };
    setSaving(true);
    const err = await saveProduct(input);
    setSaving(false);
    if (err) return setError(err);
    setForm(null);
  };

  const remove = (p: Product) => {
    if (!confirm(`Excluir "${p.name}" do cardápio?`)) return;
    setListError('');
    deleteProduct(p.id).then((err) => err && setListError(err));
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gerenciar Cardápio</h1>
          <p className="text-sm text-zinc-600">
            {products.length} pratos · {products.filter((p) => p.available).length} disponíveis
          </p>
        </div>
        <Button onClick={() => open()}>
          <Plus size={18} /> Novo prato
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar prato…" className="pl-9" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} className="sm:w-56">
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {listError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{listError}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {list.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">Nenhum prato encontrado.</p>}
        <ul className="divide-y divide-zinc-100">
          {list.map((p) => (
            <li key={p.id} className={`flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap ${p.available ? '' : 'bg-zinc-50'}`}>
              <ProductImage src={p.image} alt={p.name} className={`h-16 w-16 shrink-0 rounded-xl ${p.available ? '' : 'opacity-50 grayscale'}`} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-zinc-900">
                  <span className="truncate">{p.name}</span>
                  {p.popular && <span className="shrink-0 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase">Destaque</span>}
                  {discountPercent(p.price, p.originalPrice) > 0 && (
                    <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-400">-{discountPercent(p.price, p.originalPrice)}%</span>
                  )}
                </p>
                <p className="text-sm text-zinc-500">
                  {catName(p.category)} · <b className="text-zinc-800">{formatPrice(p.price)}</b>
                </p>
              </div>
              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                  <button
                    role="switch"
                    aria-checked={p.available}
                    onClick={() => toggleProductAvailability(p.id).then((err) => err && setListError(err))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${p.available ? 'bg-yellow-400' : 'bg-zinc-300'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.available ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                  <span className="w-20">{p.available ? 'Disponível' : 'Indisponível'}</span>
                </label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => open(p)} aria-label={`Editar ${p.name}`}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(p)} aria-label={`Excluir ${p.name}`}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={!!form} title={form?.id ? 'Editar prato' : 'Novo prato'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Nome">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </Field>
            <Field label="Descrição">
              <Textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço (R$)">
                <Input inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="29,90" />
              </Field>
              <Field label="Categoria">
                <Select value={form.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço “de” (opcional)" hint="Preencha para mostrar como promoção.">
                <Input inputMode="decimal" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} placeholder="34,90" />
              </Field>
              <Field label="Preparo (min)">
                <Input inputMode="numeric" value={form.prepTime} onChange={(e) => set('prepTime', e.target.value.replace(/\D/g, ''))} />
              </Field>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Categorias da vitrine</span>
              <div className="flex flex-wrap gap-1.5">
                {visualCategories.map((c) => {
                  const on = form.tags.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => set('tags', on ? form.tags.filter((t) => t !== c.id) : [...form.tags, c.id])}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        on ? 'bg-yellow-400 text-zinc-900 ring-yellow-400' : 'bg-white text-zinc-600 ring-zinc-200 hover:ring-zinc-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="URL da imagem">
              <div className="flex gap-3">
                <Input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…" />
                <ProductImage src={form.image} alt="Prévia" className="h-11 w-11 shrink-0 rounded-lg" />
              </div>
            </Field>
            <Field label="Ingredientes" hint="Separados por vírgula — usados na busca do cliente.">
              <Input value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} placeholder="queijo, tomate, manjericão" />
            </Field>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} className="h-4 w-4 accent-yellow-400" />
                Disponível
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={form.popular} onChange={(e) => set('popular', e.target.checked)} className="h-4 w-4 accent-yellow-400" />
                Mais pedido (destaque)
              </label>
            </div>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setForm(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
