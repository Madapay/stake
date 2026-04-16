# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

### Stake Seed Calculator (`artifacts/stake-seeds`)
- **URL**: `/` (root)
- **Type**: React + Vite (frontend-only, no backend)
- **Purpose**: Provably fair seed calculator for Stake.com casino games
- **Features**:
  - HMAC-SHA256 based RNG (Web Crypto API, runs in browser)
  - Supports 18+ games: Dice, Limbo, Crash, Wheel, Roulette, Diamonds, Plinko, Mines, Keno, Blackjack, Hilo, Baccarat, Video Poker, Flip, Snakes, Rock-Paper-Scissors, Chicken, Pump
  - Calculates all spin results for a given server seed + client seed pair
  - Server seed SHA256 hash verifier
  - Turkish language UI

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
