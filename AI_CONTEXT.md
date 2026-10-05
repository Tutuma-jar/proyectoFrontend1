# Project Context

## Stack
- Frontend: Next.js 16.3.8 App Router + React 19.2.8; Tailwind CSS 4 configurado en postcss.config.mjs.
- Backend: Capa server-side Next.js para sesión y proxy HTTP; API de negocio externa en BackendProyecto1 (NestJS 11).
- Database: Sin conexión directa verificada aquí; MongoDB configurado en el repositorio BackendProyecto1.
- ORM: Ninguno declarado aquí; Mongoose 8 verificado en el backend externo.
- Package manager: npm; README.md documenta npm install y existe package-lock.json; packageManager no declarado.
- Testing: Unknown; package.json no declara script test ni dependencias de testing.

## Project Areas
- Frontend: src/app/, src/components/, src/lib/; pantallas en src/app/(app)/admin/, docente/, estudiante/, cuenta/ y notificaciones/; login en src/app/login/.
- Backend: src/app/api/ (auth/ y [...path]/); utilidades server-side en src/lib/server.ts y sesión en src/lib/session.ts. API de negocio fuera de este repositorio.
- Database: Unknown dentro de este repositorio; schemas, scripts y datos están en BackendProyecto1.
- Tests: Unknown; no se identificaron carpetas de tests en las áreas listadas.

## Important Commands
Todos desde la raíz de este repositorio. Solo documentados; no ejecutados.
- install: npm install (documentado en README.md).
- dev: npm run dev → next dev -p 3001.
- build: npm run build → next build.
- lint: npm run lint → eslint.
- test: Unknown.
- database: migrations: Unknown; seed: Unknown.
- production: npm run start → next start -p 3001.
- external backend: README.md indica db:up, db:import y start en el backend; sus comandos y directorio real están documentados en el AI_CONTEXT.md de BackendProyecto1.

## Architecture
- Dos repositorios Git independientes conectados por HTTP, no un monorepo.
- Navegador → src/lib/api.ts → /api del mismo sitio → src/app/api/[...path]/route.ts → backend NestJS → Mongoose → MongoDB.
- El proxy agrega Authorization Bearer desde la cookie de sesión y conserva método, cuerpo y query string.
- src/lib/server.ts permite acceso directo server-side al backend con el token de cookie y cache no-store.
- BACKEND_URL se obtiene del entorno en src/lib/server.ts; por defecto apunta al backend local en puerto 3000. Ambas vías agregan /api al destino.
- src/lib/session.ts decodifica JWT y expone roles admin/docente/estudiante; no verifica firma. El proxy actualiza cookie httpOnly al cambiar contraseña.
- README.md describe protección de páginas en src/proxy.ts; el archivo existe, pero su implementación no se inspeccionó.

## Important Files
- package.json
- next.config.ts
- tsconfig.json
- eslint.config.mjs
- postcss.config.mjs
- src/app/layout.tsx
- src/app/page.tsx
- src/app/(app)/layout.tsx
- src/app/globals.css
- src/app/api/[...path]/route.ts
- src/proxy.ts
- src/lib/api.ts
- src/lib/server.ts
- src/lib/session.ts
- src/lib/types.ts
- README.md

## Notes
- Languages: TypeScript/TSX; configuración JavaScript MJS; CSS en src/app/globals.css.
- Repository layout (monorepo/single project): Proyecto único según package.json sin workspaces; repositorio hermano independiente BackendProyecto1.
- Alias @/* → ./src/*; TypeScript strict habilitado en tsconfig.json.
- Integración: cliente server-side y proxy construyen /api, pero BackendProyecto1/src/main.ts configura api/v1. Compatibilidad efectiva: Unknown; no se ejecutaron solicitudes.
- Puertos: frontend fijo en 3001; backend usa APP_PORT con fallback 3001, aunque valida PORT con fallback 3000. Puede haber conflicto sin configuración adicional; no se leyó .env.
- README.md llama al backend proyecto1; la carpeta Git existente es BackendProyecto1. No usar el nombre antiguo como ruta de ejecución.
- Ausencia de script test comprobada; ausencia total de suites no demostrada por la inspección limitada.
- Inspección selectiva de raíz y áreas concretas, hasta tres niveles; clientes y proxy leídos para verificar el enlace entre repositorios, sin revisar pantallas o lógica de autenticación completa.
- No se leyeron secretos ni lockfiles completos o directorios excluidos; no se instalaron dependencias ni ejecutaron tareas.
- Para investigar bugs, leer este documento primero y comprobar solo las configuraciones y áreas pertinentes; no es un diagnóstico funcional.
