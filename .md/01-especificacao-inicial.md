# Especificação 1 — Aplicação base (cardápio digital e gestão de pedidos)

> Prompt original do projeto. O app foi renomeado de **Fork** para **Pratello** depois desta especificação.

Crie uma aplicação web completa e responsiva de cardápio digital e gestão de pedidos chamada **"Fork"**, seguindo o estilo visual moderno e limpo (cards com fotos, categorias horizontais, carrinho lateral fixo e tela de login dividida em duas colunas).

## 1. Stack e Arquitetura Sugerida
- **Framework:** React com Vite + TypeScript (ou Next.js App Router, conforme o projeto atual).
- **Estilização:** Tailwind CSS + Lucide React para ícones.
- **Persistência (para funcionar pronto para apresentação da A3):** Utilize `localStorage` com dados iniciais pré-populados (seed data) de pratos, categorias, usuários (admin e funcionários) e pedidos de exemplo, permitindo testar todo o fluxo sem depender de backend externo imediato.

## 2. Identidade Visual e Paleta de Cores
- **Cor Principal (Cinza):**
  - Fundo da aplicação: `#F4F4F5` (zinc-100)
  - Cards e superfícies: `#FFFFFF` com bordas `#E4E4E7` (zinc-200)
  - Textos principais e cabeçalhos: `#18181B` (zinc-900) e `#52525B` (zinc-600)
  - Sidebar administrativa: `#27272A` (zinc-800)
- **Cor Secundária (Amarelo):**
  - Botões de ação primária, badges de destaque, abas ativas e ícones de estrela: `#FACC15` (yellow-400) com hover `#EAB308` (yellow-500) e texto escuro `#18181B` para alto contraste e acessibilidade.

## 3. Regras de Autenticação e Perfis de Acesso
Crie uma tela inicial de **Login Unificado** (layout split-screen: foto gastronômica com frase de impacto à esquerda; formulário com abas à direita):
1. **Aba Cliente (Sem Senha):**
   - Campos: `Nome` e `Telefone ou Número da Mesa`.
   - Ao clicar em "Acessar Cardápio", salva a sessão do cliente e redireciona direto para `/cardapio` sem exigir senha.
2. **Aba Equipe (Funcionários e Administradores):**
   - Campos: `Usuário/E-mail` e `Senha`.
   - Inclua credenciais de teste visíveis na tela (ex: `admin@fork.com / 1234` e `cozinha@fork.com / 1234`) para facilitar a demonstração.
   - Redireciona para `/admin` se for administrador ou `/pedidos` se for funcionário.

## 4. Módulos e Telas Obrigatórias

### A. Visão do Cliente (`/cardapio`)
- **Header:** Logo "Fork", barra de busca em tempo real por nome/ingrediente, identificação do cliente/mesa logado e botão de sair.
- **Banner Promocional:** Destaque em cinza escuro e amarelo.
- **Filtro de Categorias:** Barra horizontal clicável (Todos, Mais Pedidos, Lanches, Pratos Principais, Bebidas, Sobremesas).
- **Grid de Produtos:** Cards com imagem, título, descrição curta, preço formatado (R$) e botão amarelo `+`.
- **Carrinho Lateral Fixo ("Seu Pedido"):** Lista de itens adicionados, controle de quantidade (`-` / `+`), campo de observação do pedido, cálculo de subtotal/total e botão amarelo **"Finalizar Pedido"** que envia o pedido diretamente para a fila da cozinha.

### B. Painel dos Funcionários (`/pedidos`)
- Quadro estilo Kanban ou colunas de status em tempo real: **Pendente**, **Em Preparo**, **Pronto** e **Entregue**.
- Cada card exibe o número do pedido, nome/mesa do cliente, itens, observações e horário.
- Botão amarelo de ação rápida para avançar o status do pedido.

### C. Aba/Painel dos Administradores (`/admin`)
- Navegação lateral escura com abas internas:
  1. **Dashboard:** Cards de resumo (Faturamento do dia, Total de pedidos, Ticket médio e Prato mais vendido).
  2. **Gerenciar Cardápio:** CRUD completo (criar, editar, ativar/desativar disponibilidade e excluir pratos com nome, descrição, preço, categoria e URL da imagem). As alterações devem refletir imediatamente na tela do cliente.
  3. **Gerenciar Funcionários:** CRUD para cadastrar novos funcionários com `Nome`, `Cargo` (Funcionário ou Admin), `Login` e `Senha`.

## 5. Instruções de Execução
- Estruture os componentes de forma modular (`src/components`, `src/pages`, `src/context/AppContext.tsx`, `src/data/mockData.ts`).
- Garanta que a navegação entre os perfis funcione sem erros e que a interface seja 100% responsiva (desktop e mobile).
- Após criar os arquivos, rode o servidor de desenvolvimento e verifique se não há erros de compilação TypeScript.
