# Finance Hub - Controle Financeiro

Aplicação de controle financeiro empresarial (PWA).

## Como editar o código

### Ambiente local

Requisitos: Node.js e npm — [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Clonar o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instalar dependências
npm i

# Subir o servidor de desenvolvimento
npm run dev
```

### Scripts disponíveis

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run build:dev` — build em modo development
- `npm run lint` — ESLint
- `npm run preview` — preview do build
- `npm run generate:icons` — geração de ícones PWA
- `npm run validate:pwa` — validação da PWA

## Tecnologias

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- PWA (Vite Plugin PWA)

## Deploy

Faça o build e publique os arquivos da pasta `dist` no seu provedor de hospedagem estática (Vercel, Netlify, GitHub Pages, etc.).
