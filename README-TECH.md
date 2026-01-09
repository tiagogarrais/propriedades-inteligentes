# Propriedades Inteligentes - Documentação Técnica

Sistema web para gerenciamento inteligente de propriedades rurais, desenvolvido com stack moderna e focado em escalabilidade e segurança.

## Stack Tecnológica

### Frontend

- **Next.js 16.1.1**: Framework React com renderização no servidor e otimizações automáticas
- **React 19.2.3**: Biblioteca para construção de interfaces de usuário
- **Tailwind CSS 4.1.18**: Framework CSS utility-first para estilização
- **Chart.js 4.5.1 + react-chartjs-2 5.3.1**: Visualização de dados e gráficos

### Backend

- **Next.js API Routes**: Endpoints RESTful integrados ao framework
- **NextAuth.js**: Autenticação com suporte a múltiplos providers
  - Google OAuth
  - Magic Links via e-mail (Nodemailer)
- **Prisma 7.2.0**: ORM moderno para Node.js e TypeScript
  - Driver: @prisma/adapter-pg para PostgreSQL

### Banco de Dados

- **PostgreSQL**: Banco relacional hospedado no Neon
- **Migrações**: Gerenciadas via Prisma Migrate

### Infraestrutura

- **Node.js**: Runtime JavaScript
- **Neon PostgreSQL**: Banco de dados serverless com conexão pooling

## Arquitetura do Sistema

### Estrutura de Diretórios

```
propriedades-inteligentes/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── migrations/            # Histórico de migrações
│   └── seed.js                # Script de população inicial
├── src/
│   ├── app/                   # App Router do Next.js
│   │   ├── api/               # Endpoints da API
│   │   │   ├── auth/          # Rotas de autenticação
│   │   │   ├── racas/         # API de raças
│   │   │   ├── propriedades/  # API de propriedades
│   │   │   └── perfil/        # API de perfil
│   │   ├── admin/             # Área administrativa
│   │   ├── painel/            # Dashboard do usuário
│   │   ├── propriedades/      # Gestão de propriedades
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── layout.js          # Layout raiz
│   │   └── page.js            # Página inicial
│   └── lib/
│       ├── auth.js            # Configuração NextAuth
│       ├── prisma.js          # Cliente Prisma com adapter
│       └── email.js           # Configuração de envio de e-mail
├── public/                    # Arquivos estáticos
├── .env                       # Variáveis de ambiente (não versionado)
└── next.config.js             # Configuração do Next.js
```

### Modelo de Dados

#### Entidades Principais

**User** (Usuário)

- Autenticação via NextAuth
- Relação com perfil (Usuario)
- Proprietário de múltiplas propriedades

**Propriedade**

- Informações básicas (nome, localização, área)
- Coordenadas GPS
- Slug único para URLs amigáveis
- Soft delete (deletedAt)

**Rebanho**

- Pertence a uma propriedade
- Tipo (Caprino, Ovino, Bovino, Suíno, Equino)
- Raça com características específicas

**Animal**

- Identificação única
- Data de nascimento e sexo
- Histórico de pesos (PesoHistorico)
- Soft delete

**RacaCaracteristicas**

- Informações zootécnicas por raça
- Fases de vida com pesos médios (JSON)
- Dados reprodutivos e produtivos

**PesoHistorico**

- Registro temporal de peso
- Vinculado ao animal

### APIs Implementadas

#### `/api/racas`

- **GET**: Lista raças por tipo de animal
- Query params: `tipo` (Caprino, Ovino, Bovino, Suíno, Equino)
- Retorna array de nomes de raças

#### `/api/raca-caracteristicas`

- **GET**: Busca características de uma raça específica
- **PUT**: Atualiza características (admin only)
- Query params: `tipo`, `raca`

#### `/api/propriedades`

- **GET**: Lista propriedades do usuário autenticado
- **POST**: Cria nova propriedade
- Validação de slug único

#### `/api/propriedades/[id]`

- **GET**: Detalhes de uma propriedade
- **PUT**: Atualiza propriedade
- **DELETE**: Soft delete

## Instalação e Configuração

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL (ou conta no Neon)
- Credenciais do Google OAuth (para login com Google)
- Servidor SMTP (para magic links por e-mail)

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/tiagogarrais/propriedades-inteligentes.git
cd propriedades-inteligentes
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-gerado-com-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# E-mail (para magic links)
EMAIL_SERVER_USER="seu-email@gmail.com"
EMAIL_SERVER_PASSWORD="sua-senha-de-app"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_FROM="noreply@seudominio.com"
```

4. **Configure o banco de dados**

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Popular com dados iniciais (raças)
npx prisma db seed
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse: http://localhost:3000

### Build para Produção

```bash
# Build otimizado
npm run build

# Iniciar em produção
npm start
```

## Funcionalidades Técnicas

### Autenticação

- **NextAuth.js** com múltiplos providers
- Sessões persistentes
- Magic links com expiração configurável
- Middleware de proteção de rotas

### Gerenciamento de Estado

- React Server Components (padrão)
- Client Components quando necessário
- useState/useEffect para estado local
- Fetch nativo para chamadas API

### Validação e Segurança

- Validação de e-mail no backend
- Sanitização de inputs
- Proteção CSRF via NextAuth
- Soft delete para dados sensíveis

### Performance

- Server-Side Rendering (SSR)
- Static Site Generation (SSG) onde aplicável
- Image optimization automática (Next.js)
- Code splitting automático

### Banco de Dados

- Conexão pooling via Neon
- Prisma adapter para PostgreSQL
- Migrations versionadas
- Seeders para dados iniciais

## Scripts Disponíveis

```json
{
  "dev": "prisma generate && next dev -p 3000",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Estrutura de Dados - Fases de Vida

Cada tipo de animal possui fases específicas:

### Caprino

- Cabrito → Jovem → Adulto → Veterano

### Ovino

- Cordeiro → Borrego → Adulto → Veterano

### Bovino

- Bezerro → Desmame → Recria → Engorda → Adulto

### Suíno

- Leitão → Crescimento → Terminação → Adulto

### Equino

- Potro → Doma → Adulto → Veterano

Cada fase armazena:

- `mesInicio` / `mesFim`: Período da fase
- `pesoMedioInicioMacho` / `pesoMedioInicioFemea`: Peso inicial
- `pesoMedioFimMacho` / `pesoMedioFimFemea`: Peso final

## Desenvolvimento

### Adicionar Nova Migração

```bash
npx prisma migrate dev --name descricao_da_mudanca
```

### Resetar Banco de Dados

```bash
npx prisma migrate reset
```

### Acessar Prisma Studio

```bash
npx prisma studio
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use ESLint para linting
- Siga as convenções do Next.js
- Componentes em PascalCase
- Funções utilitárias em camelCase
- Comentários em português

## Troubleshooting

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Erro: "Port 3000 already in use"

```bash
fuser -k 3000/tcp
```

### Erro de migração

```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Roadmap Técnico

- [ ] Testes automatizados (Jest + React Testing Library)
- [ ] CI/CD com GitHub Actions
- [ ] Docker containers
- [ ] API REST documentada (Swagger)
- [ ] WebSockets para atualizações em tempo real
- [ ] PWA (Progressive Web App)
- [ ] Aplicativo mobile (React Native)
- [ ] Suporte a múltiplos idiomas (i18n)

## Licença

Este projeto é proprietário. Todos os direitos reservados.

## Contato

**Desenvolvedor**: Tiago das Graças Arrais  
**GitHub**: [@tiagogarrais](https://github.com/tiagogarrais)  
**Repositório**: [propriedades-inteligentes](https://github.com/tiagogarrais/propriedades-inteligentes)

---

Para informações não técnicas sobre o sistema, veja o [README.md](README.md)
