# Especificação 3 — Localização/Endereço e Formas de Pagamento

> Implementada em `src/components/LocationForm.tsx`, `src/components/PaymentSelector.tsx`, `src/components/Cart.tsx` e `src/components/OrderCard.tsx`.

Adicione os recursos de **Localização/Endereço** e **Formas de Pagamento** no fluxo final do carrinho e do perfil do cliente do sistema **Fork**, mantendo o padrão visual em **Cinza** (`#F4F4F5`, `#E4E4E7`, `#18181B`) e **Amarelo** (`#FACC15`, `#EAB308`):

## 1. Seção de Localização (Identificação do Cliente)
No topo da página do cardápio ou no momento de abrir a sessão sem senha, adicione um seletor claro de localização:
- **Modos de Atendimento:**
  - **Salão / Mesa:** O cliente seleciona o número da mesa (ex: Mesa 01 a 20) através de um dropdown ou modal rápido.
  - **Delivery:** O cliente insere o endereço completo (*CEP, Rua, Número, Bairro e Complemento*).
- **Exibição:** O local escolhido deve ficar fixo e visível no cabeçalho do cardápio para que a cozinha saiba exatamente para onde entregar ou qual mesa atender.

## 2. Etapa de Formas de Pagamento (No Carrinho / Checkout)
No painel lateral do carrinho ("Seu Pedido"), antes do botão final de envio, adicione a seção **"Forma de Pagamento"** com opções em cards selecionáveis com ícones:
- **Opções de Pagamento:**
  - 💳 **Cartão de Crédito / Débito** (com opção de informar se precisa de maquininha).
  - 📱 **Pix** (exibindo uma chave Pix simulada ou QR Code para testes na A3).
  - 💵 **Dinheiro** (com campo opcional para "Troco para quanto?").
- **Resumo Final:** O botão amarelo de confirmação agora exibe o valor total (incluindo taxa de entrega se for delivery) e dispara o pedido para o painel da cozinha/funcionários já com o status do pagamento escolhido.

## 3. Integração com o Painel da Cozinha / Funcionários
- Atualize os cards de pedidos na tela dos funcionários (`/pedidos`) para exibirem claramente a **Localização** (ex: "Mesa 04" ou "Delivery - Rua das Flores, 123") e a **Forma de Pagamento** escolhida pelo cliente.
