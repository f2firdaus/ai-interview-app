# AI Interview App — Monorepo

This is a **monorepo** — one repository that contains all parts of the AI Interview App.

## 📁 Structure

```
ai-interview-app/
├── package.json              ← Root: declares workspaces
├── tsconfig.json             ← Shared TypeScript base config
├── .gitignore                ← Covers all packages
└── packages/
    ├── backend/              ← Express + TypeScript API
    ├── frontend/             ← Expo React Native app
    └── shared/               ← Shared TypeScript types (used by both)
```

## 🚀 Getting Started

Install all dependencies from the root (run this once):

```bash
npm install
```

## 🧑‍💻 Running the App

From the **root** of the project:

| Command | What it does |
|---|---|
| `npm run dev:backend` | Start the backend API server |
| `npm run dev:frontend` | Start the Expo / React Native app |
| `npm run dev` | Start both at the same time |
| `npm run build` | Build the backend |

## 📦 Packages

### `@ai-interview/shared`
Shared TypeScript types used by both backend and frontend.

**Import them like this:**
```typescript
import { User, Interview, ApiResponse } from '@ai-interview/shared';
```

No npm publishing needed — npm workspaces links this automatically.

### `@ai-interview/backend`
Express API with MongoDB, OpenAI, Twilio, etc.

### `@ai-interview/frontend`
Expo (React Native) mobile app.

## 💡 How npm Workspaces Works

- All packages are inside `packages/`
- The root `package.json` declares `"workspaces": ["packages/*"]`
- When you run `npm install` from root, npm:
  1. Installs all dependencies for all packages
  2. **Hoists** shared deps to the root `node_modules` (saves disk space)
  3. **Symlinks** internal packages (`@ai-interview/shared` → `packages/shared`)
