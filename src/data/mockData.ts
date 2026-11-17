import type { Category, Order, OrderItem, Product, StaffUser, VisualCategory } from '../types';

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const LOGIN_HERO_IMAGE = img('1504674900247-0877df9cc836', 1400);

/* ---------- Regras do negócio (valores de demonstração) ---------- */

export const DELIVERY_FEE = 7.9;
export const FREE_DELIVERY_FROM = 100;
export const TABLE_COUNT = 20;
export const PIX_KEY = 'pix@pratello.com.br';
export const PIX_MERCHANT = 'PRATELLO RESTAURANTE';

/* ---------- Categorias ---------- */

export const categories: Category[] = [
  { id: 'lanches', name: 'Lanches' },
  { id: 'pratos', name: 'Pratos Principais' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'sobremesas', name: 'Sobremesas' },
];

const PASTEL = ['#FEF08A', '#E4E4E7', '#FDE68A', '#F4F4F5'];

export const visualCategories: VisualCategory[] = (
  [
    ['promocoes', 'Promoções', '1553979459-d2229ba7433b'],
    ['saudavel', 'Saudável', '1546069901-ba9599a7e63c'],
    ['arabe', 'Árabe', '1529006557810-274b9b2fc783'],
    ['acai', 'Açaí', '1615478503562-ec2d8aa0e24e'],
    ['doces', 'Doces & Bolos', '1551024601-bec78aea704b'],
    ['chinesa', 'Chinesa', '1585032226651-759b368d7246'],
    ['pizza', 'Pizza', '1513104890138-7c749659a591'],
    ['lanches', 'Lanches', '1568901346375-23c9450c58cd'],
    ['salgados', 'Salgados', '1606491956689-2ea866880c84'],
    ['sorvetes', 'Sorvetes', '1563805042-7684c019e1cb'],
    ['italiana', 'Italiana', '1621996346565-e3dbc646d9a9'],
    ['padarias', 'Padarias', '1555507036-ab1f4038808a'],
    ['carnes', 'Carnes', '1544025162-d76694265947'],
    ['pastel', 'Pastel', '1601050690597-df0568f70950'],
    ['vegetariana', 'Vegetariana', '1625944230945-1b7dd3b949ab'],
    ['japonesa', 'Japonesa', '1579871494447-9811cf80d66c'],
    ['brasileira', 'Brasileira', '1631515243349-e0cb75fb8d3a'],
  ] as const
).map(([id, name, photo], i) => ({ id, name, image: img(photo, 200), color: PASTEL[i % PASTEL.length] }));

/* ---------- Pratos ---------- */

type Seed = Omit<Product, 'id' | 'image' | 'available'> & { photo: string };

const seeds: Seed[] = [
  { name: 'Pratello Burger Clássico', description: 'Blend bovino de 180g, cheddar derretido, alface, tomate e molho da casa no pão brioche.', price: 32.9, originalPrice: 38.9, category: 'lanches', tags: ['lanches', 'promocoes'], prepTime: 20, popular: true, ingredients: ['pão brioche', 'carne', 'cheddar', 'alface', 'tomate'], photo: '1568901346375-23c9450c58cd' },
  { name: 'Smash Duplo Bacon', description: 'Dois smash burgers, bacon crocante, queijo prato e cebola caramelizada.', price: 38.9, category: 'lanches', tags: ['lanches', 'carnes'], prepTime: 20, popular: true, ingredients: ['carne', 'bacon', 'queijo prato', 'cebola'], photo: '1553979459-d2229ba7433b' },
  { name: 'Sanduíche Natural de Frango', description: 'Pão integral, frango desfiado, cenoura, requeijão e folhas verdes.', price: 24.9, category: 'lanches', tags: ['lanches', 'saudavel'], prepTime: 10, popular: false, ingredients: ['pão integral', 'frango', 'cenoura', 'requeijão'], photo: '1528735602780-2552fd46c7af' },
  { name: 'Batata Frita Rústica', description: 'Porção de batatas rústicas com páprica defumada e maionese de alho.', price: 18.9, category: 'lanches', tags: ['lanches', 'salgados', 'vegetariana'], prepTime: 15, popular: true, ingredients: ['batata', 'páprica', 'alho', 'maionese'], photo: '1573080496219-bb080dd4f877' },
  { name: 'Shawarma de Frango', description: 'Pão sírio recheado com frango temperado, legumes frescos e molho de alho.', price: 29.9, category: 'lanches', tags: ['arabe'], prepTime: 15, popular: false, ingredients: ['pão sírio', 'frango', 'alho', 'tomate', 'cebola roxa'], photo: '1529006557810-274b9b2fc783' },
  { name: 'Guioza (6 un.)', description: 'Pastéis chineses grelhados recheados de porco e legumes, com molho shoyu.', price: 24.9, category: 'lanches', tags: ['chinesa'], prepTime: 15, popular: false, ingredients: ['carne de porco', 'repolho', 'shoyu', 'gengibre'], photo: '1496116218417-1a781b1c416c' },
  { name: 'Sanduíche Vegano', description: 'Hambúrguer de grão-de-bico, abacate, pepino, cenoura e pão de fermentação natural.', price: 27.9, category: 'lanches', tags: ['vegetariana', 'saudavel'], prepTime: 15, popular: false, ingredients: ['grão-de-bico', 'abacate', 'pepino', 'cenoura'], photo: '1592415486689-125cbbfcbee2' },
  { name: 'Pão de Queijo (10 un.)', description: 'Pão de queijo mineiro quentinho, crocante por fora e macio por dentro.', price: 14.9, category: 'lanches', tags: ['salgados', 'padarias', 'brasileira'], prepTime: 10, popular: true, ingredients: ['polvilho', 'queijo minas'], photo: '1606491956689-2ea866880c84' },
  { name: 'Frango a Passarinho', description: 'Porção de frango frito crocante com alho e limão.', price: 34.9, category: 'lanches', tags: ['salgados', 'brasileira'], prepTime: 20, popular: false, ingredients: ['frango', 'alho', 'limão'], photo: '1626082927389-6cd097cdc6ec' },
  { name: 'Pastel de Carne (2 un.)', description: 'Massa crocante recheada com carne moída temperada, azeitona e ovo.', price: 16.9, category: 'lanches', tags: ['pastel', 'salgados'], prepTime: 15, popular: false, ingredients: ['carne moída', 'azeitona', 'ovo'], photo: '1601050690597-df0568f70950' },
  { name: 'Croissant de Presunto e Queijo', description: 'Croissant amanteigado recheado com presunto e queijo derretido.', price: 13.9, category: 'lanches', tags: ['padarias'], prepTime: 10, popular: false, ingredients: ['manteiga', 'presunto', 'queijo'], photo: '1555507036-ab1f4038808a' },
  { name: 'Pão Rústico Artesanal', description: 'Pão de fermentação natural com casca crocante. Acompanha manteiga.', price: 18.9, category: 'lanches', tags: ['padarias'], prepTime: 5, popular: false, ingredients: ['farinha integral', 'fermento natural', 'manteiga'], photo: '1509440159596-0249088772ff' },

  { name: 'Filé ao Molho Madeira', description: 'Medalhão de filé mignon ao molho madeira com arroz e batatas sautée.', price: 59.9, category: 'pratos', tags: ['carnes', 'brasileira'], prepTime: 30, popular: true, ingredients: ['filé mignon', 'cogumelos', 'arroz', 'batata'], photo: '1600891964092-4316c288032e' },
  { name: 'Costela Barbecue', description: 'Costela suína assada lentamente com molho barbecue, vinagrete e fritas.', price: 69.9, category: 'pratos', tags: ['carnes'], prepTime: 35, popular: true, ingredients: ['costela suína', 'barbecue', 'batata', 'tomate'], photo: '1544025162-d76694265947' },
  { name: 'Carne de Panela', description: 'Carne cozida lentamente com batata, cenoura e caldo encorpado.', price: 44.9, category: 'pratos', tags: ['brasileira', 'carnes'], prepTime: 25, popular: false, ingredients: ['acém', 'batata', 'cenoura'], photo: '1541518763669-27fef04b14ea' },
  { name: 'Galinhada Mineira', description: 'Arroz cremoso com frango, açafrão, milho e cheiro-verde.', price: 38.9, originalPrice: 44.9, category: 'pratos', tags: ['brasileira', 'promocoes'], prepTime: 25, popular: false, ingredients: ['frango', 'arroz', 'açafrão', 'milho'], photo: '1631515243349-e0cb75fb8d3a' },
  { name: 'Spaghetti à Bolonhesa', description: 'Massa al dente com molho de tomate artesanal e carne moída, finalizada com parmesão.', price: 42.9, category: 'pratos', tags: ['italiana'], prepTime: 25, popular: false, ingredients: ['massa', 'tomate', 'carne moída', 'parmesão'], photo: '1621996346565-e3dbc646d9a9' },
  { name: 'Spaghetti com Camarão', description: 'Spaghetti salteado com camarões, tomate-cereja, alho e salsinha.', price: 58.9, category: 'pratos', tags: ['italiana'], prepTime: 25, popular: false, ingredients: ['massa', 'camarão', 'tomate-cereja', 'alho'], photo: '1563379926898-05f4575a45d8' },
  { name: 'Pizza Margherita', description: 'Massa de fermentação natural, molho de tomate, muçarela de búfala e manjericão.', price: 45.9, category: 'pratos', tags: ['pizza', 'italiana', 'vegetariana'], prepTime: 30, popular: true, ingredients: ['tomate', 'muçarela', 'manjericão'], photo: '1513104890138-7c749659a591' },
  { name: 'Pizza Calabresa', description: 'Calabresa fatiada, cebola, muçarela e orégano.', price: 49.9, category: 'pratos', tags: ['pizza'], prepTime: 30, popular: false, ingredients: ['calabresa', 'cebola', 'muçarela', 'orégano'], photo: '1594007654729-407eedc4be65' },
  { name: 'Combinado Japonês (16 peças)', description: 'Sushis e uramakis variados de salmão, com gengibre e wasabi.', price: 64.9, category: 'pratos', tags: ['japonesa'], prepTime: 25, popular: true, ingredients: ['salmão', 'arroz', 'alga nori', 'cream cheese'], photo: '1579871494447-9811cf80d66c' },
  { name: 'Sushi Variado (10 peças)', description: 'Seleção do chef com nigiris de salmão, atum e peixe branco.', price: 44.9, category: 'pratos', tags: ['japonesa'], prepTime: 20, popular: false, ingredients: ['salmão', 'atum', 'arroz'], photo: '1617196034796-73dfa7b1fd56' },
  { name: 'Bowl de Salmão (Poke)', description: 'Salmão em cubos, arroz, edamame, manga, pepino e molho tarê.', price: 47.9, category: 'pratos', tags: ['saudavel', 'japonesa'], prepTime: 15, popular: false, ingredients: ['salmão', 'arroz', 'manga', 'pepino', 'edamame'], photo: '1546069901-ba9599a7e63c' },
  { name: 'Yakisoba de Legumes', description: 'Macarrão oriental salteado com legumes e molho shoyu.', price: 36.9, category: 'pratos', tags: ['chinesa', 'vegetariana'], prepTime: 20, popular: false, ingredients: ['macarrão', 'brócolis', 'cenoura', 'shoyu'], photo: '1585032226651-759b368d7246' },
  { name: 'Frango Grelhado com Legumes', description: 'Peito de frango grelhado com ervas, legumes salteados e arroz integral.', price: 39.9, category: 'pratos', tags: ['saudavel'], prepTime: 25, popular: false, ingredients: ['frango', 'brócolis', 'cenoura', 'arroz integral'], photo: '1532550907401-a500c9a57435' },
  { name: 'Salada Caesar', description: 'Alface americana, croutons, lascas de parmesão, frango e molho caesar.', price: 29.9, category: 'pratos', tags: ['saudavel'], prepTime: 10, popular: false, ingredients: ['alface', 'croutons', 'parmesão', 'frango'], photo: '1512621776951-a57141f2eefd' },
  { name: 'Salada Grega', description: 'Tomate, pepino, azeitonas, cebola roxa e queijo feta com azeite.', price: 31.9, category: 'pratos', tags: ['vegetariana', 'saudavel'], prepTime: 10, popular: false, ingredients: ['tomate', 'pepino', 'azeitona', 'queijo feta'], photo: '1625944230945-1b7dd3b949ab' },

  { name: 'Suco de Laranja Natural', description: 'Copo de 400ml, espremido na hora.', price: 9.9, category: 'bebidas', tags: ['saudavel'], prepTime: 5, popular: true, ingredients: ['laranja'], photo: '1600271886742-f049cd451bba' },
  { name: 'Suco de Manga', description: 'Manga batida com gelo. 400ml.', price: 10.9, category: 'bebidas', tags: ['saudavel'], prepTime: 5, popular: false, ingredients: ['manga'], photo: '1625938145744-e380515399bf' },
  { name: 'Refrigerante Lata', description: 'Lata de 350ml. Consulte os sabores disponíveis.', price: 6.9, category: 'bebidas', tags: [], prepTime: 2, popular: false, ingredients: [], photo: '1622483767028-3f66f32aef97' },
  { name: 'Café Espresso', description: 'Espresso encorpado de grãos especiais.', price: 6.5, category: 'bebidas', tags: ['padarias'], prepTime: 5, popular: false, ingredients: ['café'], photo: '1509042239860-f550ce710b93' },
  { name: 'Limonada Suíça', description: 'Limão batido com gelo e leite condensado. 400ml.', price: 11.9, category: 'bebidas', tags: [], prepTime: 5, popular: false, ingredients: ['limão', 'leite condensado'], photo: '1556679343-c7306c1976bc' },
  { name: 'Milkshake de Chocolate', description: 'Sorvete de chocolate batido com leite, chantilly e calda. 500ml.', price: 21.9, originalPrice: 25.9, category: 'bebidas', tags: ['sorvetes', 'promocoes'], prepTime: 10, popular: false, ingredients: ['sorvete', 'chocolate', 'chantilly'], photo: '1577805947697-89e18249d767' },

  { name: 'Açaí no Copo 500ml', description: 'Açaí batido com banana, granola e leite em pó. Monte do seu jeito.', price: 19.9, originalPrice: 24.9, category: 'sobremesas', tags: ['acai', 'promocoes', 'saudavel'], prepTime: 5, popular: true, ingredients: ['açaí', 'banana', 'granola', 'leite em pó'], photo: '1615478503562-ec2d8aa0e24e' },
  { name: 'Bolo de Chocolate', description: 'Fatia generosa de bolo de chocolate com ganache meio amargo.', price: 16.9, category: 'sobremesas', tags: ['doces'], prepTime: 5, popular: true, ingredients: ['chocolate', 'ganache'], photo: '1578985545062-69928b1d9587' },
  { name: 'Cheesecake de Frutas Vermelhas', description: 'Base crocante, creme de cream cheese e calda de frutas vermelhas.', price: 18.9, category: 'sobremesas', tags: ['doces'], prepTime: 5, popular: false, ingredients: ['cream cheese', 'frutas vermelhas'], photo: '1533134242443-d4fd215305ad' },
  { name: 'Donuts Recheados (2 un.)', description: 'Donuts com cobertura de chocolate e granulado colorido.', price: 15.9, category: 'sobremesas', tags: ['doces', 'padarias'], prepTime: 5, popular: false, ingredients: ['chocolate', 'granulado'], photo: '1551024601-bec78aea704b' },
  { name: 'Cookies (4 un.)', description: 'Cookies amanteigados com gotas de chocolate.', price: 12.9, category: 'sobremesas', tags: ['doces', 'padarias'], prepTime: 5, popular: false, ingredients: ['chocolate', 'manteiga'], photo: '1558961363-fa8fdf82db35' },
  { name: 'Sorvete Artesanal', description: 'Duas bolas de sorvete artesanal com calda à sua escolha.', price: 14.9, category: 'sobremesas', tags: ['sorvetes'], prepTime: 5, popular: false, ingredients: ['sorvete', 'calda'], photo: '1563805042-7684c019e1cb' },
];

export const seedProducts: Product[] = seeds.map(({ photo, ...s }, i) => ({
  ...s,
  id: `p${i + 1}`,
  image: img(photo),
  available: true,
}));

/* ---------- Equipe ---------- */

/** Usados apenas pela API para popular o banco (a senha é gravada com hash bcrypt). */
export const seedUsers: (StaffUser & { password: string })[] = [
  { id: 'u1', name: 'Ana Administradora', role: 'admin', login: 'admin@pratello.com', password: '1234' },
  { id: 'u2', name: 'Carlos Cozinha', role: 'funcionario', login: 'cozinha@pratello.com', password: '1234' },
];

/* ---------- Pedidos de exemplo ---------- */

const line = (name: string, quantity: number): OrderItem => {
  const p = seedProducts.find((x) => x.name === name)!;
  return { productId: p.id, name: p.name, price: p.price, quantity };
};

const mesa = (n: number) => ({ mode: 'mesa' as const, table: String(n).padStart(2, '0') });

/** Pedidos com horários relativos ao primeiro carregamento, para o dashboard ter dados do dia. */
export function createSeedOrders(): Order[] {
  const now = Date.now();
  const raw: Array<Pick<Order, 'customerName' | 'phone' | 'location' | 'items' | 'notes' | 'payment' | 'status'> & { ago: number }> = [
    { customerName: 'Marina', phone: '', location: mesa(4), items: [line('Pratello Burger Clássico', 2), line('Batata Frita Rústica', 1), line('Refrigerante Lata', 2)], notes: '', payment: { method: 'cartao', cardType: 'credito', needsMachine: true, status: 'pago' }, status: 'entregue', ago: 180 },
    { customerName: 'João', phone: '(11) 97777-2020', location: { mode: 'delivery', address: { cep: '01310-100', street: 'Av. Paulista', number: '1000', district: 'Bela Vista', complement: 'Apto 52' } }, items: [line('Filé ao Molho Madeira', 1), line('Suco de Laranja Natural', 1)], notes: 'Filé ao ponto', payment: { method: 'pix', status: 'pago' }, status: 'entregue', ago: 150 },
    { customerName: 'Luiza', phone: '', location: mesa(2), items: [line('Pizza Margherita', 1), line('Limonada Suíça', 2), line('Bolo de Chocolate', 1)], notes: '', payment: { method: 'dinheiro', changeFor: 100, status: 'pago' }, status: 'entregue', ago: 120 },
    { customerName: 'Pedro', phone: '(11) 98888-1234', location: { mode: 'delivery', address: { cep: '04538-132', street: 'Rua das Flores', number: '123', district: 'Itaim Bibi', complement: '' } }, items: [line('Combinado Japonês (16 peças)', 1), line('Açaí no Copo 500ml', 1)], notes: 'Sem wasabi', payment: { method: 'pix', status: 'pago' }, status: 'entregue', ago: 95 },
    { customerName: 'Beatriz', phone: '', location: mesa(9), items: [line('Salada Caesar', 1), line('Café Espresso', 2)], notes: '', payment: { method: 'cartao', cardType: 'debito', needsMachine: true, status: 'pendente' }, status: 'pronto', ago: 25 },
    { customerName: 'Rafael', phone: '(11) 96666-4321', location: { mode: 'delivery', address: { cep: '05407-002', street: 'Rua Cardeal Arcoverde', number: '450', district: 'Pinheiros', complement: 'Casa 2' } }, items: [line('Spaghetti à Bolonhesa', 2), line('Refrigerante Lata', 2)], notes: 'Uma das massas sem parmesão', payment: { method: 'dinheiro', changeFor: 150, status: 'pendente' }, status: 'preparo', ago: 15 },
    { customerName: 'Camila', phone: '', location: mesa(5), items: [line('Pratello Burger Clássico', 1), line('Suco de Laranja Natural', 1), line('Sorvete Artesanal', 1)], notes: 'Hambúrguer bem passado', payment: { method: 'pix', status: 'pendente' }, status: 'pendente', ago: 6 },
    { customerName: 'Gustavo', phone: '', location: mesa(3), items: [line('Yakisoba de Legumes', 1), line('Guioza (6 un.)', 1)], notes: '', payment: { method: 'cartao', cardType: 'credito', needsMachine: false, status: 'pendente' }, status: 'pendente', ago: 2 },
  ];

  return raw.map(({ ago, ...o }, i) => {
    const createdAt = now - ago * 60_000;
    const subtotal = o.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const deliveryFee = o.location.mode === 'delivery' && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
    return {
      ...o,
      id: `o${i + 1}`,
      number: 101 + i,
      clientId: `seed-${i + 1}`,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      createdAt,
      updatedAt: createdAt,
    };
  });
}
