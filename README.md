# Pratello — Cardápio Digital e Gestão de Pedidos

React + Vite + TypeScript + Tailwind CSS v4 + Lucide. Dados persistidos em `localStorage` (seed automático no primeiro acesso).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # checagem TypeScript + build de produção
```

## Acessos de teste

| Perfil | Como entrar | Destino |
|---|---|---|
| Cliente | Aba **Cliente**: nome + **Salão (mesa 01–20)** ou **Delivery (endereço com busca por CEP)**, sem senha | `/cardapio` |
| Administrador | `admin@pratello.com` / `1234` | `/admin` |
| Funcionário | `cozinha@pratello.com` / `1234` | `/pedidos` |

## Dica para a apresentação

O login fica salvo **por aba** (`sessionStorage`), e cardápio, pedidos e funcionários ficam no `localStorage`, que é **sincronizado entre abas**.
Abra o cliente numa aba e a cozinha em outra: o pedido finalizado aparece na hora no painel, e o cliente vê o status mudar.
Para voltar ao estado inicial: **Admin → Restaurar dados demo**.

## Funcionalidades estilo marketplace

- **Vitrine:** carrossel com 17 categorias visuais (Promoções, Japonesa, Açaí…) que filtram o cardápio, com o botão "Limpar filtro".
- **Destaques do Pratello:** carrossel com os mais pedidos e as promoções. Clicar abre os detalhes do prato com seletor de quantidade.
- **Local de atendimento:** mesa ou endereço de entrega, sempre visível no cabeçalho e editável a qualquer momento.
- **Pagamento:** cartão (crédito/débito + maquininha), Pix (QR e chave **simulados**, não pagam nada de verdade) ou dinheiro (troco).
- **Taxa de entrega** de R$ 7,90 no delivery, grátis a partir de R$ 100.
- **Cozinha:** cada pedido mostra a mesa ou o endereço completo, a forma de pagamento e se já foi pago. A equipe pode confirmar o recebimento.

As especificações usadas para construir o app estão em [`.md/`](.md/).

## Estrutura

```
src/
  context/AppContext.tsx   estado global, persistência, regras de negócio
  data/mockData.ts         categorias, pratos, usuários e pedidos de exemplo
  components/              Logo, ProductCard, Cart, OrderCard, Modal, ui (Button/Input/...)
  pages/                   Login, Menu (/cardapio), Orders (/pedidos), Admin (layout)
  pages/admin/             Dashboard, MenuManager, StaffManager
  utils/                   formatação (R$, horários, status) e rotas por perfil
```
