import type { Session } from '../types';

/** Rota inicial de cada perfil. */
export function homeFor(session: Session | null) {
  if (!session) return '/';
  if (session.type === 'cliente') return '/cardapio';
  return session.role === 'admin' ? '/admin' : '/pedidos';
}
