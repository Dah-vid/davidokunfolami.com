# davidokunfolami.com

Personal portfolio. Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step. Project cards are rendered from a single data file.

## Structure

```
index.html      page markup
styles.css      all styling (design tokens at the top)
main.js         renders the project list from projects.json
projects.json   the only file you edit to change projects
fonts/          self-hosted Archivo Expanded Black (headings)
David-Okunfolami-CV.pdf   linked from the CV section
favicon.svg
CNAME           custom domain for GitHub Pages
.nojekyll       tells GitHub Pages to skip Jekyll
```

## Run locally

`fetch()` can't read `projects.json` from `file://`, so serve the folder:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Adding a project

Edit `projects.json` only — never the HTML or CSS. Add an object to the array:

```json
{
  "title": "My New Project",
  "flagship": false,
  "description": "One paragraph on what it is and what you built.",
  "stack": ["Python", "FastAPI"],
  "github": "https://github.com/Dah-vid/my-new-project",
  "demo": "https://my-new-project.example.com"
}
```

Field notes:

- `flagship: true` promotes the project to the top with the large treatment. Use it on one project at a time.
- `github` — full URL. If the repo is private or not ready, set it to `null` (or any non-URL like `"pending"`) and the title renders without a link.
- `demo` — full URL of the live/hosted version, or `null` to omit it. When set, the row shows a "Live ↗" link next to "Code ↗".
- Project titles currently link to the code. When your projects are hosted, open `main.js` and change `TITLE_LINKS_TO = "code"` to `"live"` (first line of the file) — titles will then prefer the live URL, falling back to the repo for projects without one.
- Projects render in file order (flagship first regardless of position).

## Deployment

### GitHub Pages

1. Create a public GitHub repo (e.g. `portfolio`) and push.
2. Repo → Settings → Pages → Source: `main` branch, `/ (root)`.

### Porkbun DNS

At Porkbun → davidokunfolami.com → DNS Records: delete the default parking records, then add:

| Type  | Host  | Answer               |
| ----- | ----- | -------------------- |
| A     | blank | `185.199.108.153`    |
| A     | blank | `185.199.109.153`    |
| A     | blank | `185.199.110.153`    |
| A     | blank | `185.199.111.153`    |
| CNAME | `www` | `USERNAME.github.io` |

(Replace `USERNAME` with your GitHub username.)

### Custom domain

Repo → Settings → Pages → Custom domain: `davidokunfolami.com` → wait for the DNS check → tick **Enforce HTTPS** (may take up to an hour).

The `CNAME` file in this repo keeps the custom domain setting across deploys — don't delete it.
