
# Flor & Cia - E-commerce Floricultura

## Configuração Inicial:
- [x] Criar estrutura inicial do projeto React com Vite
- [x] Configurar Tailwind CSS
- [x] Configurar rotas com React Router
- [x] Configurar projeto com Supabase
- [x] Criar tabelas no Supabase
- [x] Configurar políticas de segurança para acesso (RLS)

## Back-end:
- [x] Implementar APIs para produtos, categorias, pedidos, configurações
- [x] Configurar autenticação para admin_users
- [x] Criar middleware de permissões (master, editor, viewer)
- [ ] Implementar sistema de upload de imagens

## Front-end (Cliente):
- [x] Desenvolver página inicial com menu dinâmico
- [x] Criar componentes de produto e categoria
- [x] Implementar carrinho com pop-up de notificação
- [x] Desenvolver checkout em 4 etapas:
  - [x] Etapa 1: Identificação
  - [x] Etapa 2: Entrega
  - [x] Etapa 3: Personalização
  - [x] Etapa 4: Pagamento
- [x] Adicionar seção de produtos adicionais no carrinho
- [x] Implementar seção de itens especiais no carrinho
- [x] Remover opção de pagamento via PIX
- [x] Integrar pedidos com Supabase
- [x] Implementar auto-preenchimento de endereço por CEP
- [x] Prefixar IDs de itens especiais com "special-" para identificação

## Front-end (Admin):
- [x] Criar dashboard administrativo
- [x] Implementar autenticação e controle de acesso
- [x] Desenvolver páginas de gerenciamento de produtos
- [x] Implementar páginas de pedidos com filtros
- [x] Criar visualização de calendário para entregas
- [x] Desenvolver página de configurações da loja
- [x] Implementar gerenciamento de horários de entrega
- [x] Implementar gerenciamento de itens especiais
- [x] Visualização de itens especiais em detalhes do pedido

## Integrações:
- [x] Configurar busca por CEP com ViaCEP
- [x] Implementar link do WhatsApp
- [x] ~~Criar lógica de PIX copia e cola~~ (Removido - não será mais utilizado)

## Testes:
- [ ] Testar responsividade
- [ ] Validar filtros e relatórios do painel administrativo
- [ ] Testar personalização do catálogo
- [ ] Verificar fluxo completo de compra
- [x] Testar permissões de usuário admin

## Supabase (Concluído):
- [x] Configurar tabelas:
  - [x] store_settings
  - [x] admin_users
  - [x] categories
  - [x] products
  - [x] product_images
  - [x] orders
  - [x] order_items
  - [x] delivery_time_slots
  - [x] special_items
- [x] Configurar políticas de Row Level Security (RLS)
- [x] Modificar estrutura da tabela order_items para permitir product_id nulo (itens especiais)

## Próximos Passos:
- [ ] Implementar sistema de upload de imagens
- [ ] Criar filtros avançados na página de pedidos admin
- [ ] Adicionar estatísticas no dashboard
- [ ] Implementar exportação de relatórios
- [ ] Refatorar OrderDetail.tsx em componentes menores
- [ ] Refatorar api.ts em módulos separados por funcionalidade

## Melhorias técnicas:
- [ ] Otimizar carregamento de imagens
- [ ] Implementar lazy loading para componentes pesados
- [ ] Adicionar testes unitários para componentes críticos
- [ ] Melhorar feedback visual durante carregamento de dados
- [ ] Implementar cache para consultas frequentes
