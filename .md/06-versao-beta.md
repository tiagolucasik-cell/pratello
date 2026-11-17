# Pratello — Versão Beta

Versão estável para demonstração (A3). Tudo funciona sem servidor nem banco de dados: os dados ficam salvos no navegador (`localStorage`).

- **Pasta:** `C:\Users\User\pratello-beta`
- **Endereço:** http://localhost:5173

## Como rodar

```bash
cd C:\Users\User\pratello-beta
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:5173
```

Para gerar os arquivos de produção (pasta `dist/`), use `npm run build`.

## Acessos

| Perfil | Como entrar | Tela |
|---|---|---|
| Cliente | Aba **Cliente**: nome + **Salão (mesa 01–20)** ou **Delivery** (endereço, com busca por CEP). Sem senha. | `/cardapio` |
| Administrador | `admin@pratello.com` / `1234` | `/admin` |
| Cozinha | `cozinha@pratello.com` / `1234` | `/pedidos` |

## O que está incluído

**Cliente**
- Banner promocional, busca por nome/ingrediente.
- Carrossel com 17 categorias visuais (Promoções, Japonesa, Açaí…), com o botão **Limpar filtro**.
- **Destaques do Pratello**: os mais pedidos e as promoções.
- Detalhes do prato com seletor de quantidade.
- Local de atendimento fixo no cabeçalho, editável a qualquer momento.
- Carrinho com observações, taxa de entrega (R$ 7,90, grátis acima de R$ 100) e pagamento:
  - **Cartão:** crédito/débito, com opção de maquininha.
  - **Pix:** QR e chave **simulados**.
  - **Dinheiro:** com troco.
- Acompanhamento do status do pedido.

**Cozinha**
- Quadro com Pendente → Em Preparo → Pronto → Entregue.
- Cada pedido mostra mesa ou endereço, telefone, pagamento (Pago / A receber) e tempo de espera.

**Admin**
- Dashboard: faturamento do dia, pedidos, ticket médio, prato mais vendido, ranking, vendas por categoria.
- Cadastro de pratos: preço promocional, tempo de preparo, categorias da vitrine, disponibilidade.
- Cadastro de funcionários.
- Restaurar os dados de demonstração.

## Roteiro de demonstração

1. **Aba 1:** entre como cliente na Mesa 04, filtre por **Japonesa**, abra um destaque, adicione, pague com **Pix** e finalize.
2. **Aba 2:** entre como `cozinha@pratello.com`. O pedido aparece em segundos. Avance o status e veja-o mudar na aba do cliente.
3. **Aba 3:** entre como `admin@pratello.com`, desative um prato e veja-o sumir do cardápio do cliente.
4. Para ver a versão de celular, aperte **F12** e depois **Ctrl+Shift+M**.

## Limitações da beta

- Os dados ficam **no navegador**. A cozinha só vê pedidos feitos **no mesmo navegador** (em outras abas), não em outro computador ou celular.
- A ligação com o PostgreSQL está **em desenvolvimento** na pasta `C:\Users\User\fork` (API Node/Express pronta, falta a senha correta do banco). Veja `05-conexao-postgres.md` naquela pasta.
