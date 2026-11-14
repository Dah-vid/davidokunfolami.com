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

**From the website (easiest):** open `davidokunfolami.com/write/` (on your
own devices, the blog page also shows "Write a post →"). Write, check the
preview, press Publish. It commits the post and its `posts.json` entry to
`main` in one go, and it's live about a minute later. Edit or delete
existing posts from the list on the same page. A post's address (slug) is
fixed once published, because its comments are tied to it.

- **One-time setup per device:** the page needs a GitHub fine-grained token
  (the steps are on the page): only this repo, **Contents: Read and
  write**, nothing else. It's stored in that browser's localStorage, never
  in the repo. When it expires, make a new one and paste it in; drafts are
  kept on the device meanwhile.
- **Anything you publish from the site** lands on GitHub, so run `git pull`
  before editing posts in VS Code.

**From VS Code:**

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

## Add or change a social link (GitHub / LinkedIn / Twitter / …)

Contact links are deliberately plain HTML (they must work without
JavaScript), so they're duplicated in **five places across four files** —
edit all of them or the site goes inconsistent:

- `index.html` — hero link row *and* footer link row
- `blog/index.html` — footer link row
- `blog/post.html` — footer link row
- `focus/index.html` — footer link row

Quick check that all five match:
`grep -c 'x.com/thatboycodes' index.html blog/index.html blog/post.html focus/index.html`

The header nav is duplicated the same way (seven files: also
`habits/index.html`, `desk/index.html` and `write/index.html`) — add a new
page's link to each.

## Owner mode: what visitors see vs what you see

`desk` and `habits` are in every page's menu, but marked `class="owner-only"`,
so they only show on **your** devices (as do Focus Desk's Desk/Habits
buttons, Habits' Desk button and the blog's "Write a post →"). Visitors get
projects · blog · focus · about · (cv) · contact.

- **Turn it on** for a device: open any page with `?me` on the end
  (e.g. `davidokunfolami.com/?me`). **Off:** `?notme`. It's remembered per
  browser; clearing site data turns it off. `owner.js` does this, loaded in
  `<head>` on every page.
- It's tidiness, not security: the pages still open by URL for anyone.
  Nothing personal is on the server anyway, since Habits and Focus Desk keep
  all data in the visitor's own browser.
- **Phones:** visitors' six links sit in one row from 360px up (three-column
  grid below that); your eight split into two rows of four under 540px.
  These are the `owner` rules near the top of the header section in
  `styles.css`.

## Focus Desk (`focus/`)

A self-contained app in one file, `focus/index.html`: its CSS and
JavaScript are inline, and it borrows only the site header, footer, fonts
and colour tokens from `/styles.css`.

- **Data** lives in each visitor's own browser (localStorage keys starting
  `focusdesk:`). There's no server, and you can't see anyone's data.
- **Export / import** (Settings → Your data): export writes
  `focus-desk-YYYY-MM-DD.json`, readable times and tag labels plus the raw
  state, ready to hand to Claude. Import only adds records whose `id`
  isn't already there, so re-importing a file is harmless. Use it as a
  backup, or to move data between browsers.
- **Colours**: the token block at the top of its `<style>` maps the app's
  names (`--ink`, `--phase`, …) onto the site palette. The break state
  inverts the timer panel; that's the `body[data-phase="break"] .deck`
  rule.
- **Copy** (break ideas, if-then defaults, desk-setup tips) is in plain
  arrays near the top of the script: `BREAKS`, `DEFAULT_RULES`, `SETUP`.
- **Distraction reasons** are the `TAGS` array: `label` shows in the main
  journal, `short` on the mini window's chips. A new reason also wants a
  line in the `advice` map in `renderWeek()`.
- **Focus days** (header button → panel) shows the active-day counts and a
  heatmap from `computeStreak()`, a pure function over `log.blocks`. Streak
  numbers moved to Habits on purpose.
- **Subjects** are each person's own (Settings → Subjects; stored as
  `settings.subjects`). A visitor starts with none, so the Subject row stays
  hidden until they add one. Your four (NeetCode, Build, System design,
  Textbook: `LEGACY_SUBJECTS`) are carried over automatically on your devices
  (owner mode, or any browser whose saved blocks use them). Removing a
  subject only archives it, so old blocks keep their label.
- **Subjects → Habits**: a saved block whose subject is linked to a habit
  (Habits → Settings → Focus Desk subjects) writes into `habits:entries`:
  25+ focused minutes = Full, 10+ = Minimum, less = nothing. See
  `logToHabits()`. Your four stay linked through `DEFAULT_SUBJECT_MAP`; new
  subjects log nothing until linked.
- **Wind-down / morning**: from the wind-down time (Settings, default 21:30)
  until 04:00 the idle view says "Rest now" and caps a block at 25 min;
  05:00–09:00 it leads with the resume note. Labels only, nothing blocked.

## Habits (`habits/`)

In the menu on your devices only (see Owner mode); `noindex` keeps it out
of search results. One self-contained file like Focus Desk, same tokens.
Rule of the page: streaks are a side effect of honest logging, so honest
options are as easy as Full.

- **Example habits** (`SEED`) are what a first-time visitor sees: generic
  on purpose. They're only used when a browser has no habits saved, so your
  own list never changes. On a new device, bring yours over with
  Settings → Export on the old one and Import backup on the new one.
  Keep the ids `neetcode`, `building`, `sysdesign`, `textbook`: Focus Desk's
  subjects log to those.

- **Storage** is shared with Focus Desk under `habits:` keys:
  `habits:habits` (definitions), `habits:entries` (one entry per habit per
  day, best one wins: Full > Minimum > Reserve), `habits:settings` (the
  subject → habit mapping, editable in Settings).
- **Honesty rules**, all in `blockedReason()`: past days need a reason and
  lock 48 hours after they end; Reserves are capped per habit per week;
  Bedtime logs only 9pm–3am (and 1am still counts as the night before);
  habits fed by Focus Desk can't be marked Full by hand.
- **Streak maths** is `computeStreaks()`, pure, between the `streaks:begin`
  / `streaks:end` markers so it can be run in node.
- **Edit habits** in its Settings panel (rename, reorder, archive, targets);
  archiving keeps the history.
- **Weekly review** (header button, or `/habits/#review`): last week's
  numbers, read from `habits:entries` plus Focus Desk's `focusdesk:log` and
  `focusdesk:journal`, and three questions saved per ISO week in
  `habits:reviews`. On Sundays it reviews the week ending that day;
  otherwise the last full week. The button is highlighted on Sundays,
  and on Mondays until all three answers are in. Last week's "one change"
  shows at the top. The maths is `weekReview()` in the pure block, and the
  question wording is `REVIEW_QS` (export) plus the labels in the HTML.
  Reviews are in the export.

## Desk (`desk/`)

A read-only start page: today's date, Focus Desk blocks and minutes, each
habit's status today, last night's Bedtime, and weekly "2 of 4" progress.
Focus Desk is listed first 05:00–09:00 (with the resume note), Habits
first otherwise; a "Weekly review due" link appears Sunday/Monday until
the review is done. It only ever *reads* localStorage. Its date and
entry rules are copied from the pure block in `habits/index.html`, so if
you change those rules there, change them here too. `noindex`, and in
the menu on your devices only (see Owner mode).

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
