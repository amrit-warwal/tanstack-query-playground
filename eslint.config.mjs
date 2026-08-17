// ESLint flat config (ESLint 9+).
//
// Next.js 16 REMOVED the `next lint` command, and `next build` no longer lints.
// So linting is driven by the ESLint CLI directly: `pnpm lint`.
//
// Three layers, in order:
//   nextVitals  — Next.js + React + react-hooks rules, with the Core Web Vitals
//                 subset raised from warn to error.
//   nextTs      — typescript-eslint recommended, wired up for this project.
//   pluginQuery — the TanStack Query rules. These are the reason this file is
//                 worth having: they catch Query mistakes that are completely
//                 invisible at runtime (a queryKey that silently misses the
//                 cache still "works", it just refetches forever).
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // 7 rules: exhaustive-deps, no-rest-destructuring (warn), stable-query-client,
  // no-unstable-deps, infinite-query-property-order, no-void-query-fn,
  // mutation-property-order.
  ...pluginQuery.configs['flat/recommended'],

  {
    // The 8th rule. It lives in `flat/recommended-strict`, which sets it to
    // `error` — that is the ONLY difference between the two configs.
    //
    // We opt in at `warn` on purpose. Examples 1-4 deliberately use the naive
    // inline `{ queryKey, queryFn }` form, because the whole lesson of example 5
    // is graduating from that to a shared `queryOptions()` factory. At `error`,
    // a fresh clone would fail `pnpm lint` and the obvious fix would be to make
    // example 1 — the simplest thing in the repo — less simple. At `warn` the
    // findings read as a to-do that example 5 then resolves.
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      '@tanstack/query/prefer-query-options': 'warn',
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
