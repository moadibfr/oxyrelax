# OxyRelax

A coherent breathing web app with animated bubble guide, optional sound cues, and customizable presets.

**Live:** [www.moadib.fr/oxyrelax](https://www.moadib.fr/oxyrelax)

## Features

- 5 built-in breathing presets (Coherent, Box, 4-7-8, Pacify, Reinforce)
- Custom presets with local storage persistence
- Animated bubble in a vertical bar + progress fill
- 5 sound themes (Classic, Soft Pad, Singing Bowl, Ocean Drift, Wind Chime) — all Web Audio synthesis
- 3-2-1 countdown before sessions
- Session by duration or cycle count
- Dark/light theme (follows system preference)
- English & French

## Development

```sh
npm install
npm run dev
```

## Testing

```sh
npx vitest run
```

## Build & Deploy

Deployed automatically via GitHub Actions on push to `master`.

```sh
npm run build   # outputs to build/
```
