import { Pencil, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Modal from '../../components/Modal';
import { Button, Field, Input, Select } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import type { Role, StaffUser } from '../../types';

interface FormState {
  id?: string;
  name: string;
  role: Role;
  login: string;
  password: string;
}

const ROLE_LABEL: Record<Role, string> = { admin: 'Administrador', funcionario: 'Funcionário' };

export default function StaffManager() {
  const { users, saveUser, deleteUser, session } = useApp();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState('');

  const myId = session?.type === 'staff' ? session.userId : '';

  const open = (u?: StaffUser) => {
    setError('');
    setForm(u ? { ...u, password: '' } : { name: '', role: 'funcionario', login: '', password: '' });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim() || !form.login.trim()) return setError('Preencha nome e login.');
    if (!form.id && form.password.length < 4) return setError('A senha deve ter pelo menos 4 caracteres.');
    setSaving(true);
    const err = await saveUser({ ...form, name: form.name.trim() });
    setSaving(false);
    if (err) return setError(err);
    setForm(null);
  };

  const remove = async (u: StaffUser) => {
    setListError('');
    if (!confirm(`Excluir o acesso de ${u.name}?`)) return;
    const err = await deleteUser(u.id);
    if (err) setListError(err);
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gerenciar Funcionários</h1>
          <p className="text-sm text-zinc-600">{users.length} pessoas com acesso à área da equipe</p>
        </div>
        <Button onClick={() => open()}>
          <Plus size={18} /> Novo funcionário
        </Button>
      </div>

      {listError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{listError}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((u) => (
          <article key={u.id} className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  u.role === 'admin' ? 'bg-zinc-800 text-yellow-400' : 'bg-yellow-400 text-zinc-900'
                }`}
              >
                {u.role === 'admin' ? <ShieldCheck size={20} /> : <UserRound size={20} />}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-900">
                  {u.name} {u.id === myId && <span className="text-xs font-normal text-zinc-500">(você)</span>}
                </p>
                <p className="text-sm text-zinc-600">{ROLE_LABEL[u.role]}</p>
              </div>
            </div>
            <p className="mt-4 truncate rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-700">{u.login}</p>
            <div className="mt-4 flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => open(u)}>
                <Pencil size={16} /> Editar
              </Button>
              <Button variant="danger" size="sm" onClick={() => remove(u)} disabled={u.id === myId}>
                <Trash2 size={16} /> Excluir
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Modal open={!!form} title={form?.id ? 'Editar funcionário' : 'Novo funcionário'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Nome">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </Field>
            <Field label="Cargo">
              <Select value={form.role} onChange={(e) => set('role', e.target.value as Role)}>
                <option value="funcionario">Funcionário</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
            <Field label="Login (usuário ou e-mail)">
              <Input value={form.login} onChange={(e) => set('login', e.target.value)} placeholder="nome@pratello.com" autoComplete="off" />
            </Field>
            <Field label="Senha" hint={form.id ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 4 caracteres. Fica salva com criptografia (bcrypt).'}>
              <Input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
            </Field>
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
