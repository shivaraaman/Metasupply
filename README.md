# MetaSupply

A decentralized app on the Internet Computer (ICP) for recording file metadata (model, dataset, prompt) and tracking versions. Users log in with Internet Identity; each version can be shared as a QR code.

- **Backend:** Rust canister (`src/metasupply_backend`) storing metadata per user principal.
- **Frontend:** React + Vite + Tailwind (`src/metasupply_frontend`).
- **Candid bindings:** `src/declarations/metasupply_backend` (committed, so the frontend builds without dfx).

## How the pieces fit

The website (HTML/JS) can be hosted anywhere: GitHub Pages or an ICP asset canister. Either way, it talks to the **backend canister**, which must be deployed to the IC mainnet for the public website to work. GitHub Pages cannot run the backend.

## Run locally (dfx)

Requires [dfx](https://internetcomputer.org/docs/building-apps/getting-started/install) (on Windows, use WSL), Rust with the `wasm32-unknown-unknown` target, and Node 18+.

```bash
npm install
dfx start --clean --background
dfx deploy
```

Open the `metasupply_frontend` URL printed by `dfx deploy`. For hot reload, run `npm start` and open http://localhost:8080.

## Deploy the backend to the IC mainnet

You need an identity with cycles (see [Cycles](https://internetcomputer.org/docs/building-apps/getting-started/tokens-and-cycles)).

```bash
dfx deploy --network ic metasupply_backend
dfx canister --network ic id metasupply_backend
```

To also host the website on ICP itself: `dfx deploy --network ic`.

## Deploy the website to GitHub Pages

`.github/workflows/deploy.yml` builds the frontend on every push to `deployment` and publishes it to the `gh-pages` branch.

1. In the repo, go to **Settings → Secrets and variables → Actions → Variables** and add `CANISTER_ID_METASUPPLY_BACKEND` with the mainnet canister ID from the step above.
2. In **Settings → Pages**, set **Source** to *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`.
3. Push to `deployment` (or run the workflow manually). The site appears at `https://<user>.github.io/Metasupply/`.

## Changing the backend interface

After editing `lib.rs`, update `metasupply_backend.did` to match, then regenerate the bindings:

```bash
npm run generate
```
