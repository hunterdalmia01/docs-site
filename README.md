# My Notes — docs site

A small Vue 3 + Vite site that renders the notes under `src/content/notes/`
in a sidebar navigation grouped by folder, exactly mirroring the folder
structure on disk. Each note's original HTML/CSS is inlined into the page
(no iframes) so it keeps its own look, and code blocks are syntax-highlighted
with highlight.js.

## Adding notes

Drop a new `.html` file into a folder under `src/content/notes/<Topic>/`
(create the folder if it's new) and it appears automatically in the sidebar
on the next build/dev run — no code changes needed. Folder and file names
are auto-prettified for display (`nextjs-notes` → "Nextjs Notes",
`crud-api-notes.html` → "Crud Api Notes").

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Deploying to Vercel

This repo needs zero configuration for Vercel — it's a standard Vite app
(`vercel.json` is included for clarity but Vercel would auto-detect it
anyway) using hash-based routing, so no rewrite rules are needed for
client-side routes.

1. Push this folder to a new GitHub repo:
   ```bash
   git remote add origin <your-new-repo-url>
   git branch -M main
   git push -u origin main
   ```
2. Go to https://vercel.com/new, import that GitHub repo, and click Deploy.
   Vercel will run `npm install && npm run build` and serve `dist/`.
3. Every push to `main` after that redeploys automatically.
