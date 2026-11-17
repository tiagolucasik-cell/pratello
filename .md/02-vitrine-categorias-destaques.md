# Especificação 2 — Vitrine estilo marketplace (categorias visuais e destaques)

> Inspirada no layout do iFood. Implementada em `src/components/CategoryCarousel.tsx`, `src/components/FeaturedSection.tsx`, `src/components/HorizontalScroller.tsx` e `src/components/ProductModal.tsx`.

Atualize a página inicial do cliente (`/cardapio`) do sistema **Fork** adicionando duas seções de vitrine e descoberta inspiradas no layout de marketplaces gastronômicos modernos (como o iFood), mantendo nossa paleta principal em **Cinza** (`#F4F4F5`, `#E4E4E7`, `#18181B`) e secundária em **Amarelo** (`#FACC15`, `#EAB308`):

## 1. Carrossel Horizontal de Categorias Visuais (Estilo Cards com Imagem Sobreposta)
Crie um componente `<CategoryCarousel />` logo abaixo do cabeçalho/banner com rolagem horizontal suave e botões circulares cinza (`<` e `>`) nas extremidades:
- **Design de cada item de categoria:**
  - Bloco retangular arredondado no topo (aprox. `96px x 56px`, `rounded-t-xl`) com cores pastéis suaves alternadas (amarelo claro `#FEF08A`, cinza claro `#E4E4E7`, âmbar suave `#FDE68A` e tons neutros).
  - Imagem recortada/ilustração do alimento centralizada sobrepondo ligeiramente a borda inferior do bloco colorido.
  - Nome da categoria centralizado logo abaixo em cinza escuro (`#3F3F46`), fonte limpa e sem serifa.
  - **Estado Ativo / Hover:** Ao passar o mouse, a imagem faz um leve zoom (`scale-105`) e, ao clicar para filtrar o cardápio, o item ganha destaque com borda/indicador inferior em **Amarelo vibrante (`#FACC15`)**.
- **Categorias incluídas:** *Promoções, Saudável, Árabe, Açaí, Doces & Bolos, Chinesa, Pizza, Lanches, Salgados, Sorvetes, Italiana, Padarias, Carnes, Pastel, Vegetariana, Japonesa* e *Brasileira*.

## 2. Seção "Destaques / Mais Pedidos da Casa" (Estilo "Famosos")
Logo abaixo das categorias, crie uma seção horizontal de destaques com:
- **Cabeçalho da seção:** Título principal em negrito (`"Destaques do Fork"` ou `"Combos & Favoritos"`), subtítulo em cinza médio (`"Os mais pedidos pelos nossos clientes"`) à esquerda, e link `"Ver mais"` em destaque à direita.
- **Carrossel de Cards Horizontais:**
  - Cards brancos com borda fina em cinza (`border-zinc-200 rounded-xl p-4`), sombra leve no hover e setas circulares de navegação lateral (`<` e `>`).
  - Cada card contém à esquerda uma miniatura quadrada arredondada (`rounded-lg`) com a foto/ícone do combo ou especialidade da casa, e à direita o nome em destaque e a categoria/tempo estimado.
  - Ao clicar em um card, ele filtra ou abre diretamente os detalhes daquele item/combo para adicionar ao carrinho.

## 3. Integração
- Conecte os cliques das categorias diretamente ao filtro da lista de produtos do cardápio abaixo, incluindo um botão rápido `"Limpar filtro"` quando uma categoria estiver selecionada.
- Garanta que o componente seja totalmente responsivo (suportando arraste/scroll horizontal no celular e setas de navegação no desktop).
