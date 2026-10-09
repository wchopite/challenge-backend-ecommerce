# Cómo contribuir

Este repositorio es una entrega de challenge, pero sigue convenciones de equipo.
Estas son las reglas para mantener el código y el historial legibles.

## Entorno

- **Node 24** (ver `.nvmrc`), npm.
- Puesta en marcha:

  ```bash
  npm install
  cp .env.example .env
  docker compose up -d      # Postgres + Adminer
  npm run db:setup          # migraciones + seed
  npm run start:dev
  ```

## Antes de commitear

Corré y dejá en verde:

```bash
npm run typecheck
npm run lint
npm test           # unit
npm run test:e2e   # e2e (requiere Postgres)
```

Los hooks de **Husky** ejecutan automáticamente `lint-staged` (ESLint + Prettier)
en el `pre-commit`, `commitlint` en el `commit-msg` y `typecheck` en el `pre-push`.

## Mensajes de commit

Usamos **Conventional Commits** (validado por `commitlint`), en una sola línea:

```
feat(stock): make the idempotency key optional
fix(api): return the request id on validation errors
docs: document observability in the readme
test(observability): cover request id propagation
chore(deps): add helmet
```

Scopes usados: `stock`, `catalog`, `api`, `db`, `observability`, `security`,
`deps`, `tooling`, `docker`, `docs`.

## Ramas y pull requests

En este repositorio el historial vive en `main` **a propósito**, para que se lea
lineal y se siga el paso a paso de la solución. En un equipo, lo correcto es
trabajar con **feature branches** y **pull requests** contra `main`.

Al abrir un PR, completá la plantilla y verificá que los tests pasen.

## Estilo y arquitectura

- **Idioma**: identificadores en inglés; prosa, comentarios y documentación en
  español.
- Respetá la separación por capas (`domain` / `application` / `infrastructure`) y
  la regla de dependencia: el **dominio no conoce** Nest, TypeORM ni HTTP.
- Si agregás una regla de negocio, sumá **test unitario**; si tocás persistencia
  o el pipeline HTTP, sumá/actualizá **e2e**.
