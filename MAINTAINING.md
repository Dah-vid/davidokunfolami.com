# Maintaining this site

Recipes for every change you're likely to make. The golden rule: content
changes are data-file edits (`projects.json`, `blog/posts.json`, Markdown
files) — you should almost never need to touch HTML.

Every change follows the same loop:

```sh
cd ~/portfolio
# ...edit files...
python3 -m http.server 8000        # check it at http://localhost:8000
git add -A && git commit -m "what you changed" && git push
```

Pushing to `main` deploys automatically. Live in ~1 minute; your own
browser may show the old version for up to 10 minutes (see Gotchas).

---

## Write a blog post

1. Create `blog/posts/<slug>.md` — e.g. `blog/posts/why-i-built-joblens.md`.
2. Add an entry to `blog/posts.json` (slug must match the filename):

```json
{
  "slug": "why-i-built-joblens",
  "title": "Why I built JobLens",
  "date": "2026-07-06",
  "summary": "One or two sentences shown on the blog list."
}
```

3. Push. Newest `date` sorts first.

Markdown supported: `#`–`####` headings, paragraphs, `-` / `1.` lists,
`> quotes`, ``` fenced code blocks, `inline code`, `**bold**`, `*italic*`,
`[links](https://…)`, images, `---` rules. Anything fancier: extend
`renderMarkdown` in `blog/blog.js`.

## Add a project

Add an object to `projects.json`:

```json
{
  "title": "My New Project",
  "flagship": false,
  "description": "One paragraph on what it is and what you built.",
  "stack": ["Python", "FastAPI"],
  "github": "https://github.com/Dah-vid/my-new-project",
  "demo": null
}
```

- `flagship: true` gives the big top-of-list treatment — one project at a time.
- `github` not ready? Use `null` or `"pending"` — the title renders unlinked.
- Order in the file is display order (flagship always jumps first).

## A project goes live (hosted on a domain)

1. Set its `demo` in `projects.json` to the live URL — a small "Live ↗"
   link appears next to "Code ↗".
2. When you want titles/rows to open the live site instead of the code:
   in `main.js`, first line, change

```js
const TITLE_LINKS_TO = "code";   →   const TITLE_LINKS_TO = "live";
```

   Titles then prefer the live URL and fall back to the repo for
   projects that don't have one. Flip it once, it handles a mixed list.

## Update the CV

Overwrite `David-Okunfolami-CV.pdf` with the new file (keep the same
name — the site links to it) and push.

**Before pushing, check the PDF for your phone number or home address** —
everything in this repo is public and gets scraped. The published CV
deliberately has no phone number on it.

## Edit bio / about / contact text

The only content that lives in HTML: hero one-liner and bio, about
paragraph, and footer email are in `index.html` — edit the text in place.
If you ever change your email, it appears three times in `index.html`
(hero link, footer display link, footer link row).

## Change colors or fonts

All design tokens are the first thing in `styles.css`:

```css
:root {
  --carbon: #101214;   /* background */
  --graphite: #26292c; /* hairline rules */
  --smoke: #878d93;    /* secondary text */
  --paper: #eae7e1;    /* primary text + hover inversion */
}
```

Change a value there and it applies site-wide, blog included. The heading
font is one self-hosted file (`fonts/archivo-expanded-black.woff2`) wired
up in the `@font-face` block just below the tokens; body text is the
system font stack (no file to manage).

## Comments

Post comments are GitHub Discussions, embedded via [giscus](https://giscus.app).
Each post's thread is a discussion in the repo's **Announcements** category,
titled `blog/<slug>` — created automatically the first time someone comments.

- **Moderate / delete comments**: repo → Discussions on GitHub.
- **Turn comments off entirely**: remove the `loadComments(post.slug)` call
  in `blog/blog.js`.
- Commenters need a GitHub account; reactions (👍 etc.) work too.
- The giscus IDs (`data-repo-id`, `data-category-id`) in `blog.js` are tied
  to this repo — regenerate at giscus.app if the repo is ever recreated.

## Add a new section to the homepage

Copy an existing `<section>` block in `index.html` (the CV one is the
simplest), give it a new `id`, add a matching `<a href="#your-id">` to the
nav in `index.html`. Use the existing classes (`section-label`, etc.) so
it inherits the styling.

---

## Gotchas (read when something "doesn't work")

- **"My change isn't showing"** — GitHub Pages tells browsers to cache
  files for 10 minutes. Hard refresh (Cmd+Shift+R) or check in incognito
  before assuming it's broken. New posts and project edits are exempt —
  those data files revalidate on every load — so this mainly bites
  HTML/CSS/JS changes.
- **Push deployed but site never updates** — check the build:
  `gh api repos/Dah-vid/davidokunfolami.com/pages/builds/latest --jq .status`.
  If it says `building` for more than ~2 minutes it's stuck (happened
  2026-07-05). Kick it:
  `gh api repos/Dah-vid/davidokunfolami.com/pages/builds -X POST`
  — or just push any small commit.
- **Blog/projects blank locally** — you opened the file directly
  (`file://`). `fetch()` needs a server: `python3 -m http.server 8000`.
- **Post 404s** — the `slug` in `posts.json` doesn't match the `.md`
  filename exactly.
- **Work landed on a branch, site unchanged** — GitHub Pages only serves
  `main`. Merge the PR, then check the build as above.
- **Don't delete** `CNAME` (custom domain) or `.nojekyll` (skips Jekyll
  processing). Both are load-bearing.
