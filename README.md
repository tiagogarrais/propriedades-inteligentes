# Propriedades Inteligentes

Este é um sistema web para cadastro e gerenciamento inteligente de propriedades rurais, incluindo registro de animais, máquinas, imóveis, plantações e outras entidades relacionadas. Oferece autenticação segura por e-mail, utilizando magic links, e é baseado em tecnologias populares como Node.js, Next.js, React, NextAuth.js, Nodemailer e Prisma.

## Visão Geral

Um sistema de gerenciamento inteligente de propriedades rurais permite o controle completo das operações agrícolas, desde o cadastro de propriedades até o monitoramento de ativos e produção. Os usuários podem navegar em uma página inicial pública e acessar áreas restritas após autenticação por e-mail, que envolve o envio de um link de acesso único.

## Como o Site Funciona

Qualquer pessoa na internet pode acessar o site e criar sua própria propriedade. Após a criação, o usuário ganha acesso exclusivo para gerenciar essa propriedade, incluindo o registro de ativos e operações. As propriedades podem ser de diversos tipos, como fazendas, terrenos, sítios, chácaras, ranchos, propriedades rurais, glebas, lotes, áreas agrícolas, estâncias, haras, vinícolas ou qualquer outra denominação rural ou agrícola. O sistema é flexível para acomodar diferentes escalas e tipos de exploração.

## Página Inicial

A página inicial é uma landing page atrativa e otimizada para SEO, projetada para chamar a atenção e passar confiança aos visitantes. Inclui:

- **Seção Hero**: Título impactante, descrição do sistema e botões de chamada para ação (login com Google ou e-mail).
- **Funcionalidades**: Destaque visual das principais funcionalidades com ícones e descrições.
- **Status do Desenvolvimento**: Seção que mostra o que já está implementado, como o cadastro de propriedades.
- **Formulário de Login**: Opção para entrar por e-mail com magic link.
- **Para Usuários Logados**: Dashboard simples com links para propriedades, perfil e logout.

A página utiliza Tailwind CSS para design responsivo, cores temáticas verdes (agricultura) e elementos de confiança como ícones de segurança.

## Funcionalidades

O sistema permite o registro e gerenciamento das seguintes entidades:

- **Fazendas**: Informações básicas das propriedades (localização, tamanho, proprietário).
- **Animais**: Cadastro de rebanhos, raças, saúde, produção (ex.: leite, carne).
- **Máquinas e Equipamentos**: Inventário de tratores, colheitadeiras, com manutenção e status.
- **Imóveis**: Construções, galpões, silos e suas condições.
- **Plantações**: Culturas, áreas plantadas, ciclos de crescimento e colheitas.
- **Funcionários/Trabalhadores**: Dados pessoais, funções, salários e atividades.
- **Fornecedores**: Contatos, produtos fornecidos e histórico de compras.
- **Clientes**: Dados para vendas de produtos agrícolas.
- **Produtos Agrícolas**: Itens produzidos, quantidades e rastreamento.
- **Insumos/Estoque**: Materiais como sementes, adubos, com níveis de estoque.
- **Transações Financeiras**: Receitas, despesas e orçamentos.
- **Registros de Saúde**: Vacinas, doenças para animais e plantações.
- **Manutenção**: Agendamentos para máquinas e imóveis.
- **Documentos Legais**: Licenças, contratos e certificados.
- **Dados Meteorológicos**: Registros de clima para planejamento.
- **Relatórios e Análises**: Dashboards com métricas de produtividade.

## Status do Desenvolvimento

O sistema está em desenvolvimento contínuo. Atualmente, as seguintes funcionalidades estão implementadas:

- **Página Inicial Atraente**: Landing page com seções hero, funcionalidades, status e formulário de login, otimizada para SEO.
- **Autenticação Segura**: Login via Google ou magic links por e-mail.
- **Perfis de Usuário**: Cadastro e atualização de informações pessoais.
- **Cadastro de Propriedades**: Usuários podem criar e gerenciar suas próprias propriedades (fazendas, terrenos, sítios, etc.).

Outras funcionalidades estão em planejamento e serão adicionadas em futuras versões.

## Tecnologias Utilizadas

Para começar, você precisará das seguintes tecnologias:

- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Next.js**: Framework React para renderização no lado do servidor.
- **React**: Biblioteca JavaScript para criar interfaces de usuário.
- **NextAuth.js**: Biblioteca para implementar autenticação segura.
  - **Nodemailer**: Para o envio de e-mails.
  - **Credenciais para envio de e-mails no arquivo .env**.
- **Prisma**: ORM para gerenciamento do banco de dados.
- **Banco de dados - PostgreSQL**: Para armazenar dados do sistema.

## Como Usar

1. Clone este repositório: `git clone https://github.com/tiagogarrais/sistema-gerenciamento-fazendas`.
2. Copie o arquivo .env.example e o renomeie para .env.
3. Preencha as informações necessárias no arquivo .env (credenciais de e-mail, banco de dados).
4. Execute `npm install` para instalar as dependências.
5. Execute `npx prisma generate` para gerar o cliente Prisma.
6. Execute `npx prisma db push` ou `npx prisma migrate dev` para sincronizar o schema com o banco de dados.
7. Execute `npm run dev` para iniciar o servidor de desenvolvimento.
8. Personalize a interface do usuário e adicione recursos conforme necessário.
9. Implemente seu sistema e comece a usá-lo.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para fazer melhorias, correções de bugs ou adicionar recursos adicionais a este sistema. Basta abrir uma issue ou enviar um pull request.

---

Criado por Tiago das Graças Arrais - [Perfil no GitHub](https://github.com/tiagogarrais)
