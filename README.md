# Operation Steel Raven

A browser-playable vertical slice of a fictional first-person tactical game. Mission 1, **Border Crossing**, is packaged as a Unity WebGL build inside a statically exported Next.js portal.

## Play online

After GitHub Pages finishes its first deployment, the game will be available at:

**https://ashutosh973.github.io/Operation-Steel-Raven/**

Use a desktop browser and headphones. The first game load downloads approximately 130 MB.

## Included in this repository

- Mission 1: Border Crossing
- Mission briefing and deployment portal
- First-person movement and combat
- Mountain forest environment
- Mission-ending open-jeep mountain drive, motorboat river crossing, and helicopter pickup
- Compiled Unity WebGL player embedded at `/play`
- Automatic GitHub Pages build and deployment

This repository contains the web portal and the compiled Mission 1 browser package. It does **not** contain the editable Unity project source or the remaining campaign missions.

## Controls

| Action | Input |
| --- | --- |
| Move | W A S D |
| Aim / fire | Right mouse / left mouse |
| Sprint | Shift |
| Crouch / prone | C / P |
| Interact | E |
| Board jeep / boat / helicopter | Hold E |
| Vehicle throttle / steering | W S / A D |
| Reload | R |
| Perspective | V |
| Pause / controls | Escape / F11 |

Click inside the game to capture the pointer. Press Escape to release it.

## Requirements

- Node.js 22.13 or later
- npm
- A modern desktop version of Chrome, Edge, Firefox, or Safari
- WebGL 2 support

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify a production build

```bash
npm run lint
npm test
```

The production-ready static export is written to `out/`.

## Anonymous play funnel

The portal contains an optional, privacy-limited Plausible Analytics bridge for:

1. `page_view`
2. `launch_clicked`
3. `unity_loaded`
4. `mission_started`
5. `mission_completed` (or the diagnostic terminal event `mission_failed`)

Analytics remains fully disabled when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is unset.
To enable it on GitHub Pages, add the public repository Actions variable
`PLAUSIBLE_DOMAIN` with the exact site identifier registered in Plausible, then
redeploy. Create matching custom-event goals for the four mission events plus
`mission_failed`; Plausible supplies page views automatically through its special
`pageview` event. No API key or analytics credential belongs in the repository.

Only the mission identifier and fixed success/failure outcome can accompany an
event. The bridge rejects all other properties and honors Global Privacy Control
and Do Not Track. See the public `/privacy` page for the player-facing disclosure.

## Unity browser package

The compiled game is under `public/game/`. Its large Unity data archive is stored as numbered chunks so every Git object remains safely below common host limits.

`public/game/index.html` downloads and reassembles those chunks in memory before starting Unity. Keep every part together and do not rename them without updating the loader page.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` builds, tests, and deploys the static site whenever `main` is updated.

1. Open **Settings → Pages** in the GitHub repository.
2. Select **GitHub Actions** as the publishing source if GitHub asks for one.
3. Push to `main`, or run the workflow manually from **Actions**.

The workflow supplies the project-page base path automatically, so the Next.js routes and Unity package work below the repository URL.

## Project structure

```text
app/                 Next.js portal and launcher
public/game/         Compiled Unity WebGL build
public/media/        Portal artwork
tests/               Static-export and Unity-package checks
next.config.ts       Export and GitHub Pages path configuration
```

## Fictional content notice

Operation Steel Raven, the Korona Corridor, its personnel, locations, factions, and events are fictional. This project does not portray current operations or provide real-world tactical guidance.

## Rights and third-party assets

Copyright © 2026. All rights reserved.

The repository and hosted demonstration may be shared by link and used for personal, non-commercial evaluation. Public visibility does not make the project open source or permit republishing, modification, commercial use, asset extraction, or separate hosting.

See the [Operation Steel Raven Evaluation License](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md) for the complete repository policy. Unity and other third-party software or assets remain subject to their respective terms and licenses.
