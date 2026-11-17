# Conexão com o PostgreSQL — Banco de dados e API

O Pratello passou a guardar todos os dados num banco **PostgreSQL**. Como o navegador não pode falar direto com o banco, existe uma **API em Node.js + Express** entre os dois.

```
Navegador (React)  ──/api──▶  API Express (porta 3333)  ──SQL──▶  PostgreSQL (porta 5432, banco "pratello")
   porta 5173          proxy do Vite
```

## Como rodar

1. Copie `.env.example` para `.env` e coloque a senha do seu usuário `postgres`:
   ```env
   DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/pratello
   JWT_SECRET=um-texto-longo-e-aleatorio
   PORT=3333
   ```
2. Execute `npm install`.
3. Execute `npm run dev`. Esse comando sobe **a API e o site juntos**.

Na primeira execução, a API **cria o banco `pratello`**, cria as tabelas (`server/schema.sql`) e insere os dados de demonstração. Nas próximas, os dados existentes são mantidos.

| Script | O que faz |
|---|---|
| `npm run dev` | API (`:3333`) + site (`:5173`) juntos |
| `npm run dev:api` | só a API, reiniciando a cada alteração |
| `npm run dev:web` | só o site |
| `npm run typecheck` | checagem TypeScript do front e do servidor |
| `npm run build` | checagem + build de produção do front |

## Modelo de dados

| Tabela | Conteúdo |
|---|---|
| `products` | pratos: preço, preço promocional, categoria, `tags[]` da vitrine, tempo de preparo, `ingredients[]`, disponibilidade |
| `staff_users` | equipe: nome, cargo (`admin`/`funcionario`), login único e **senha com hash bcrypt** |
| `orders` | pedido: cliente, localização (mesa **ou** endereço), valores (subtotal, taxa, total), pagamento e status |
| `order_items` | itens de cada pedido, com **nome e preço gravados no momento da compra** |

Decisões de modelagem:
- **`order_items` copia o nome e o preço.** Se o admin mudar o preço ou excluir o prato, o histórico e o faturamento continuam corretos (`ON DELETE SET NULL`).
- **Restrições `CHECK`** garantem status, categorias e formas de pagamento válidos. A restrição `location_complete` exige a mesa no salão ou o endereço completo no delivery.
- **O número do pedido** vem da sequência `order_number_seq`, que começa em 101.
- **Índices** em `status`, `client_id` e `created_at` aceleram o painel da cozinha e o acompanhamento do cliente.

## Rotas da API

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/health` | público | testa a conexão com o banco |
| POST | `/api/auth/login` | público | login da equipe → token JWT (12h) |
| GET | `/api/products` | público | cardápio |
| POST / PUT / DELETE | `/api/products[/:id]` | admin | cadastro de pratos |
| PATCH | `/api/products/:id/availability` | admin | ativa/desativa o prato |
| GET / POST / PUT / DELETE | `/api/users[/:id]` | admin | cadastro de funcionários |
| POST | `/api/orders` | público (cliente) | cria pedido |
| GET | `/api/orders/client/:clientId` | público (cliente) | pedidos do próprio cliente |
| GET | `/api/orders` | equipe | pedidos das últimas 24h e todos os ainda em aberto |
| PATCH | `/api/orders/:id/advance` | equipe | avança o status |
| PATCH | `/api/orders/:id/pay` | equipe | confirma o pagamento |
| POST | `/api/admin/reset` | admin | restaura cardápio e pedidos de demonstração |

## Segurança

- **Senhas** nunca são salvas em texto puro (bcrypt) e nunca são enviadas ao navegador.
- **Rotas da equipe** exigem token JWT. O cargo é relido do banco a cada requisição, então rebaixar ou excluir um funcionário vale na hora.
- **Preços e taxa de entrega são recalculados no servidor.** O cliente envia apenas `productId` e quantidade, então não consegue alterar o valor do pedido.
- **Todas as consultas são parametrizadas** (`$1, $2…`), o que protege contra SQL injection.
- **Regras de negócio no servidor:**
  - não é possível excluir o próprio usuário nem o último administrador;
  - não se pede um prato indisponível;
  - o troco precisa ser maior que o total.

## Tempo real

O painel da cozinha consulta a API a cada **3 segundos**, o acompanhamento do cliente a cada **4 segundos** e o cardápio a cada **10 segundos**. Por isso, pedidos feitos em **qualquer computador ou celular da mesma rede** aparecem no painel.

Se a API ou o banco caírem, o site mostra uma faixa vermelha avisando que está sem conexão.

## Arquivos

```
server/
  index.ts     rotas da API, validação, autenticação e tratamento de erros
  db.ts        conexão (pool), criação automática do banco e transações
  schema.sql   tabelas, restrições e índices
  seed.ts      dados de demonstração e restauração
  mappers.ts   conversão linha do banco → objeto do front
src/utils/api.ts           cliente HTTP do front (token, erros, modo offline)
src/context/AppContext.tsx estado global, agora carregado da API
```
