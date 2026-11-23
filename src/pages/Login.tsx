import { ChefHat, KeyRound, LogIn, Star, User, UtensilsCrossed } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationForm, { draftToLocation, toDraft, type LocationDraft } from '../components/LocationForm';
import Logo from '../components/Logo';
import { Button, Field, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import { LOGIN_HERO_IMAGE } from '../data/mockData';

type Tab = 'cliente' | 'equipe';

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const DEMO_CREDENTIALS = [
  { label: 'Administrador', login: 'admin@pratello.com', password: '1234' },
  { label: 'Cozinha', login: 'cozinha@pratello.com', password: '1234' },
];

export default function Login() {
  const { loginClient, loginStaff } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('cliente');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<LocationDraft>(toDraft());
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
  };

  const submitClient = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Informe seu nome.');
    const loc = draftToLocation(location);
    if (typeof loc === 'string') return setError(loc);
    if (loc.mode === 'delivery' && phone.replace(/\D/g, '').length < 10) return setError('Informe um telefone para contato da entrega.');
    loginClient(name, phone, loc);
    navigate('/cardapio', { state: { welcome: true } });
  };

  const submitStaff = (e: FormEvent) => {
    e.preventDefault();
    const user = loginStaff(login, password);
    if (!user) return setError('Usuário ou senha inválidos.');
    navigate(user.role === 'admin' ? '/admin' : '/pedidos', { state: { welcome: true } });
  };

  return (
    <div className="grid min-h-screen bg-zinc-100 lg:grid-cols-2">
      {/* Coluna da imagem */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={LOGIN_HERO_IMAGE} alt="Mesa com pratos variados" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-zinc-900/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div className="max-w-md">
            <div className="mb-4 flex gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
              Sabor de verdade, <span className="text-yellow-400">direto na sua mesa.</span>
            </h1>
            <p className="mt-4 text-lg text-zinc-300">
              Escolha, peça e acompanhe seu pedido sem esperar pelo garçom.
            </p>
          </div>
        </div>
      </aside>

      {/* Coluna do formulário */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900">Bem-vindo ao Pratello</h2>
          <p className="mt-1 text-zinc-600">Acesse o cardápio ou entre na área da equipe.</p>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-zinc-200/70 p-1" role="tablist">
            {(
              [
                ['cliente', 'Cliente', User],
                ['equipe', 'Equipe', ChefHat],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => switchTab(id)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  tab === id ? 'bg-yellow-400 text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            {tab === 'cliente' ? (
              <form onSubmit={submitClient} className="space-y-4">
                <Field label="Nome">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" />
                </Field>
                <Field label={location.mode === 'delivery' ? 'Telefone' : 'Telefone (opcional)'}>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-0000" autoComplete="tel" />
                </Field>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Onde você está?</span>
                  <LocationForm
                    value={location}
                    onChange={(d) => {
                      setLocation(d);
                      setError('');
                    }}
                  />
                </div>
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                <Button type="submit" size="lg" className="w-full">
                  <UtensilsCrossed size={18} /> Acessar Cardápio
                </Button>
                <p className="text-center text-xs text-zinc-500">Não é preciso senha para fazer pedidos.</p>
              </form>
            ) : (
              <form onSubmit={submitStaff} className="space-y-4">
                <Field label="Usuário / E-mail">
                  <Input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="seu@pratello.com" autoComplete="username" />
                </Field>
                <Field label="Senha">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" autoComplete="current-password" />
                </Field>
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                <Button type="submit" size="lg" className="w-full">
                  <LogIn size={18} /> Entrar
                </Button>

                <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <KeyRound size={14} /> Credenciais de teste
                  </p>
                  <div className="space-y-2">
                    {DEMO_CREDENTIALS.map((c) => (
                      <button
                        type="button"
                        key={c.login}
                        onClick={() => {
                          setLogin(c.login);
                          setPassword(c.password);
                          setError('');
                        }}
                        className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm ring-1 ring-zinc-200 hover:ring-yellow-400"
                      >
                        <span className="font-medium text-zinc-800">{c.label}</span>
                        <code className="text-xs text-zinc-600">
                          {c.login} / {c.password}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
