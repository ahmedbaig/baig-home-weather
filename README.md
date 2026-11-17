# baig-home-weather

The Weather module of the baig.home dashboard: current conditions, a 7 day forecast and world time zones. It runs on its own at `weather.dashboard.example.com` and can also be mounted inside the dashboard shell.

Started from [svelte-frontend-template](https://github.com/ahmedbaig/svelte-frontend-template).

## Stack

Svelte 5 (runes only), SvelteKit 2 with `adapter-static` in SPA mode, TypeScript strict, Vite, pnpm workspaces. Tests use Vitest, Testing Library and Playwright.

## Layout

```
apps/weather      the Weather module, standalone SPA plus dist/module/module.js
apps/shell        splash, session, nav rail and the module loader, for testing Weather inside the frame
packages/ui       paper glass tokens, fonts and Svelte components
packages/sdk      API client, ApiError, SSE client, session and scopes, module types
packages/mock     Vite plugin with the mock API, used in dev, preview and e2e
e2e/              Playwright specs, run against mock mode
docker/           nginx config used by the Dockerfile
```

Inside `apps/weather/src/lib/weather`:

| File                 | What                                                           |
| -------------------- | -------------------------------------------------------------- |
| `types.ts`           | `Forecast` (Open-Meteo field names), `Place`, `ForecastLoader` |
| `api.ts`             | Loader that calls the backend through the sdk client           |
| `sample.ts`          | Sample forecast and loader for `/lab`                          |
| `forecast.svelte.ts` | `ForecastStore`: load, refresh, keeps last good data on error  |
| `zones.svelte.ts`    | Saved time zones (localStorage for now)                        |
| `time.ts`            | Zone clock maths with `Intl`                                   |
| `WeatherView.svelte` | The screen: header, Now card, radar, forecast strip, zones     |

## Commands

Node 24 and pnpm are required.

| Command                                              | What it does                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `PUBLIC_MOCK=1 pnpm --filter @dashboard/weather dev` | Weather on :5181 with the mock API, `/lab` uses sample data            |
| `pnpm dev`                                           | Shell on :5173 and Weather on :5181, both in mock mode                 |
| `pnpm lint`                                          | Prettier check and ESLint                                              |
| `pnpm check`                                         | svelte-check and tsc, no errors or warnings allowed                    |
| `pnpm test`                                          | Unit and component tests                                               |
| `pnpm build`                                         | Builds both apps, including the module build                           |
| `pnpm e2e`                                           | Playwright against `vite preview` in mock mode. Run `pnpm build` first |

## Backend contract

- `GET /api/v1/weather/forecast?lat=&lon=` needs the `weather:read` scope and returns Open-Meteo's `current` and `daily` fields plus `fetchedAt`.
- Session: `GET /api/v1/session`, `POST /api/v1/session/dev-login` (localhost only), `DELETE /api/v1/session`.
- Every request sends `X-Request-ID` and `X-Correlation-ID`. Errors use the `{ requestId, correlationId, errors: [...] }` envelope and the sdk turns them into `ApiError`.
- The browser never calls Open-Meteo or BOM directly. The Go weather service fetches and caches them.

## Micro frontend contract

`dist/module/module.js` exports `mount(target, ctx)` returning `{ unmount() }`. `ctx` is `{ apiBase, user, navigate, theme }` from `packages/sdk`. The shell reads a manifest of `{ id, title, url, scope }`:

| File                                  | Points at                                                 | Used by             |
| ------------------------------------- | --------------------------------------------------------- | ------------------- |
| `apps/shell/static/manifest.dev.json` | `http://localhost:5181/src/module.ts`                     | `pnpm dev`          |
| `apps/shell/static/manifest.json`     | `http://localhost:4181/module/module.js`                  | preview and e2e     |
| `apps/shell/manifest.example.json`    | `https://weather.dashboard.example.com/module/module.js` | copy for production |

## Design rules

Paper glass, tokens in `packages/ui/src/tokens`: warm paper, ink, one blue accent, no orange, square corners, frosted panels, Archivo + Instrument Serif italic + Inter + Geist Mono. The source design is the Weather screen in baig-home-storybook.

## Docker

```sh
docker build --build-arg APP=weather -t dashboard-weather .
docker run -p 8080:8080 dashboard-weather
```

## License

MIT
