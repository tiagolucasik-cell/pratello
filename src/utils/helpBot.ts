/**
 * Assistente de ajuda do Pratello — 100% local, sem IA e sem internet.
 * Entende a pergunta por palavras-chave e responde com os dados do próprio app
 * (pedidos do cliente, cardápio, cupons, regras de frete e pagamento).
 */
import { FREE_DELIVERY_FROM } from '../data/mockData';
import type { Order, Product } from '../types';
import { COUPONS } from './checkout';
import { formatPrice, formatTime, trackingLabel } from './format';

export interface BotContext {
  name: string;
  /** Pedidos do cliente logado. */
  orders: Order[];
  products: Product[];
  restaurantAddress: string;
}

export interface BotReply {
  text: string;
  /** Pratos sugeridos (com botão de adicionar). */
  products?: Product[];
  /** Atalho para outra tela. */
  link?: { to: string; label: string };
  /** Código de entrega para mostrar em destaque. */
  code?: string;
  /** Sugestões de próximas perguntas. */
  chips?: string[];
  /** Simula um atendente humano entrando na conversa. */
  handoff?: boolean;
}

export const QUICK_CHIPS = ['Onde está meu pedido?', 'Código de entrega', 'Cupons', 'Frete', 'Pagamento', 'Falar com atendente'];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const has = (text: string, ...words: string[]) => words.some((w) => (w.includes(' ') ? text.includes(w) : new RegExp(`\\b${w}`).test(text)));

const STOPWORDS = new Set(
  'quero queria tem voces vcs voce algum alguma uma uns umas com sem para pra por que qual quais como quanto custa preco valor me mostra mostre ver gostaria pedir comer beber tomar do da dos das de no na nos nas um o a e os as ai la isso esse essa hoje sugere sugestao recomenda opcao opcoes cardapio prato pratos'.split(' '),
);

/** Palavra do cliente → termos que aparecem no cardápio. */
const SYNONYMS: Record<string, string[]> = {
  hamburguer: ['burger'],
  hamburger: ['burger'],
  lanche: ['lanches', 'burger'],
  refri: ['refrigerante'],
  sushi: ['japonesa', 'combinado'],
  japones: ['japonesa'],
  massa: ['spaghetti', 'italiana', 'pizza'],
  macarrao: ['spaghetti'],
  doce: ['sobremesas', 'doces'],
  sobremesa: ['sobremesas'],
  bebida: ['bebidas'],
  vegetariano: ['vegetariana'],
  vegano: ['vegetariana'],
  carne: ['carnes', 'file'],
  saudavel: ['saudavel', 'salada'],
  chines: ['chinesa'],
}

const ACTIVE = (o: Order) => o.status !== 'entregue';

function latest(orders: Order[]) {
  return [...orders].sort((a, b) => b.createdAt - a.createdAt);
}

function orderStatus(ctx: BotContext): BotReply {
  const active = latest(ctx.orders).filter(ACTIVE);
  if (active.length === 0) {
    const last = latest(ctx.orders)[0];
    if (last)
      return {
        text: `Você não tem pedidos em andamento. O último foi o #${last.number}, ${last.location.mode === 'delivery' ? 'entregue' : 'servido'} às ${formatTime(last.updatedAt)}.`,
        link: { to: '/meus-pedidos', label: 'Ver meus pedidos' },
        chips: ['Mais pedidos', 'Cupons'],
      };
    return { text: 'Você ainda não fez nenhum pedido. Quer uma sugestão do cardápio?', chips: ['Mais pedidos', 'Promoções', 'Opções vegetarianas'] };
  }
  const o = active[0];
  const extra = active.length > 1 ? `\n\nVocê tem mais ${active.length - 1} pedido(s) em andamento em "Meus pedidos".` : '';
  const isDelivery = o.location.mode === 'delivery';
  const [min, max] = isDelivery ? (o.shipping === 'expressa' ? [20, 35] : [40, 60]) : [15, 25];
  const eta = `${formatTime(o.createdAt + min * 60_000)} e ${formatTime(o.createdAt + max * 60_000)}`;
  const hint: Record<Order['status'], string> = {
    pendente: 'O restaurante vai confirmar em instantes.',
    preparo: 'A cozinha já está preparando.',
    pronto: isDelivery ? 'O entregador está a caminho. Tenha o código de entrega em mãos!' : 'O garçom já está levando até você.',
    entregue: '',
  };
  return {
    text: `Pedido #${o.number}: ${trackingLabel(o)}. ${hint[o.status]}\nPrevisão: entre ${eta}.${extra}`,
    link: { to: `/pedido/${o.id}`, label: 'Acompanhar no mapa' },
    chips: isDelivery ? ['Código de entrega', 'Falar com atendente'] : ['Falar com atendente'],
  };
}

function deliveryCode(ctx: BotContext): BotReply {
  const o = latest(ctx.orders).find((x) => ACTIVE(x) && x.location.mode === 'delivery');
  if (!o) {
    const mesa = ctx.orders.some((x) => ACTIVE(x) && x.location.mode === 'mesa');
    return {
      text: mesa
        ? 'Pedidos na mesa não precisam de código: o garçom leva direto até você.'
        : 'O código de entrega aparece quando você tem um pedido de delivery a caminho. Ele serve para confirmar que o pedido chegou à pessoa certa.',
      chips: ['Onde está meu pedido?'],
    };
  }
  if (!o.deliveryCode) return { text: `O pedido #${o.number} foi feito antes do código de entrega existir, então não precisa de código.` };
  if (o.status !== 'pronto')
    return {
      text: `Seu pedido #${o.number} ainda não saiu para entrega. O código aparece na tela de acompanhamento assim que o entregador sair. 🔒`,
      link: { to: `/pedido/${o.id}`, label: 'Acompanhar pedido' },
    };
  return {
    text: `Seu código de entrega do pedido #${o.number} é:`,
    code: o.deliveryCode,
    chips: ['Onde está meu pedido?'],
  };
}

function coupons(): BotReply {
  const lines = COUPONS.map((c) => `• ${c.code}: ${c.title} (${c.description}), até ${c.validUntil}`);
  return {
    text: `Cupons disponíveis:\n${lines.join('\n')}\n\nVocê pode usar 1 cupom de desconto + 1 de frete no mesmo pedido. Escolha na tela de pagamento.`,
    link: { to: '/checkout', label: 'Ir para o pagamento' },
    chips: ['Frete', 'Pagamento'],
  };
}

function shipping(): BotReply {
  return {
    text:
      `O frete é calculado pela distância do seu CEP: R$ 4,90 + R$ 0,90 por km.\n` +
      `• Padrão: grátis em pedidos acima de ${formatPrice(FREE_DELIVERY_FROM)}\n` +
      `• Expressa: chega mais rápido, por + R$ 6,00\n` +
      `• Na mesa não tem frete.\n\nDica: os cupons FRETEGRATIS e FRETE50 abatem o frete.`,
    chips: ['Cupons', 'Pagamento'],
  };
}

function payment(): BotReply {
  return {
    text:
      'Formas de pagamento:\n' +
      '• Pix: aprovado na hora (cupom PIX7 dá 7% OFF)\n' +
      '• Cartão de crédito: até 3x sem juros (parcela mínima R$ 15)\n' +
      '• Cartão de débito\n' +
      '• Dinheiro: informe se precisa de troco\n\nNo cartão, o entregador ou garçom leva a maquininha.',
    chips: ['Cupons', 'Frete'],
  };
}

function searchProducts(text: string, products: Product[]): Product[] {
  const available = products.filter((p) => p.available);
  if (has(text, 'promo', 'oferta', 'barato', 'desconto no prato')) {
    const promo = available.filter((p) => p.originalPrice && p.originalPrice > p.price);
    return (promo.length ? promo : [...available].sort((a, b) => a.price - b.price)).slice(0, 4);
  }
  if (has(text, 'mais pedido', 'popular', 'famoso', 'recomend', 'sugest', 'melhor', 'especialidade')) return available.filter((p) => p.popular).slice(0, 4);
  if (has(text, 'rapido', 'pressa')) return [...available].sort((a, b) => a.prepTime - b.prepTime).slice(0, 4);

  const terms = text
    .split(' ')
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .flatMap((w) => [w.replace(/s$/, ''), ...(SYNONYMS[w] ?? SYNONYMS[w.replace(/s$/, '')] ?? [])]);
  if (terms.length === 0) return [];
  return available
    .map((p) => {
      const name = norm(p.name);
      const rest = norm([p.description, p.category, ...p.tags, ...p.ingredients].join(' '));
      const score = terms.reduce((s, t) => s + (name.includes(t) ? 3 : 0) + (rest.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.p.popular) - Number(a.p.popular))
    .slice(0, 4)
    .map((x) => x.p);
}

/** Responde uma mensagem do cliente. */
export function answer(raw: string, ctx: BotContext): BotReply {
  const text = norm(raw);
  const first = ctx.name.split(' ')[0];

  if (!text) return { text: 'Pode escrever sua dúvida ou tocar em um dos atalhos abaixo. 🙂', chips: QUICK_CHIPS };

  if (has(text, 'atendente', 'humano', 'pessoa real', 'falar com alguem', 'gerente', 'reclama', 'problema', 'errado', 'veio errado', 'faltou'))
    return { text: 'Certo! Estou chamando um atendente para você. Aguarde um instante…', handoff: true };

  if (has(text, 'codigo', 'senha', 'token')) return deliveryCode(ctx);

  if (has(text, 'cancel')) {
    const o = latest(ctx.orders).find(ACTIVE);
    if (o && o.status === 'pendente') return { text: `O pedido #${o.number} ainda não foi para a cozinha. Para cancelar, fale com um atendente.`, chips: ['Falar com atendente'] };
    if (o) return { text: `O pedido #${o.number} já está ${o.status === 'preparo' ? 'em preparo' : o.location.mode === 'delivery' ? 'a caminho' : 'pronto'}, então não pode mais ser cancelado pelo app. Se houver algum problema, fale com um atendente.`, chips: ['Falar com atendente'] };
    return { text: 'Você não tem pedidos em andamento para cancelar.' };
  }

  if (has(text, 'frete', 'taxa', 'gratis', 'expressa', 'quanto custa a entrega', 'valor da entrega', 'entregam', 'raio')) return shipping();
  if (has(text, 'cupom', 'cupon', 'cupons', 'desconto', 'voucher')) return coupons();
  if (has(text, 'pagamento', 'pagar', 'pix', 'cartao', 'credito', 'debito', 'dinheiro', 'troco', 'parcel', 'maquininha')) return payment();

  if (has(text, 'mais pedido', 'popular', 'recomend', 'sugest', 'promo', 'oferta')) {
    const top = searchProducts(text, ctx.products);
    if (top.length) return { text: has(text, 'promo', 'oferta') ? 'Olha essas ofertas:' : 'Os queridinhos da casa:', products: top };
  }

  if (has(text, 'meu pedido', 'meus pedidos', 'onde esta', 'cade', 'chega', 'demora', 'status', 'andamento', 'rastre', 'acompanh', 'previs', 'quanto tempo', 'atras', 'entregador', 'pedido'))
    return orderStatus(ctx);

  if (has(text, 'endereco', 'onde fica', 'localiza', 'horario', 'funciona', 'abre', 'fecha', 'aberto'))
    return {
      text: `📍 ${ctx.restaurantAddress}\n🕐 Todos os dias, das 11h às 23h.\nAtendemos no salão e por delivery.`,
      chips: ['Frete', 'Mais pedidos'],
    };

  if (has(text, 'obrigad', 'valeu', 'brigad', 'show', 'perfeito', 'otimo'))
    return { text: `Por nada, ${first}! Se precisar de mais alguma coisa, é só chamar. 😊` };

  const found = searchProducts(text, ctx.products);
  if (found.length)
    return {
      text: has(text, 'promo', 'oferta', 'barato') ? 'Olha essas ofertas:' : has(text, 'mais pedido', 'popular', 'recomend', 'sugest', 'melhor') ? 'Os queridinhos da casa:' : 'Encontrei estes pratos:',
      products: found,
    };

  if (has(text, 'oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'eai', 'hello', 'help', 'ajuda'))
    return { text: `Oi, ${first}! Sou o assistente do Pratello. Posso ver seu pedido, mostrar cupons ou achar um prato. Como posso ajudar?`, chips: QUICK_CHIPS };

  return {
    text: 'Hmm, não entendi. 🤔 Posso ajudar com seu pedido, código de entrega, cupons, frete, pagamento ou encontrar um prato (ex.: "pizza", "vegetariano").',
    chips: QUICK_CHIPS,
  };
}
