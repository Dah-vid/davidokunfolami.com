// Blog, same rules as the rest of the site: no frameworks, no build step.
// posts.json is the index; each post is a Markdown file in posts/<slug>.md.
// This one script drives both pages — the list (index.html) and a single
// post (post.html?p=slug) — picking its job from which elements exist.

const OWNER_GITHUB = "https://github.com/Dah-vid/davidokunfolami.com";

function formatDate(iso) {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function loadError(target, message) {
  const note = document.createElement("p");
  note.className = "noscript-note";
  note.append(message + " The source lives in ");
  const link = document.createElement("a");
  link.href = OWNER_GITHUB;
  link.textContent = "the repo";
  note.append(link, ".");
  target.replaceWith(note);
}

async function fetchPosts() {
  const res = await fetch("posts.json");
  if (!res.ok) throw new Error(res.status);
  const posts = await res.json();
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ---------- markdown ----------
   A deliberately small renderer covering what the posts actually use:
   headings, paragraphs, lists, blockquotes, fenced code, inline code,
   bold, italic, links, images, and horizontal rules. All text is
   HTML-escaped before any tags are added. */

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text) {
  // Pull code spans out first so no other formatting applies inside them.
  const codeSpans = [];
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return "\u0000" + (codeSpans.length - 1) + "\u0000";
  });
  out = out
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return out.replace(
    /\u0000(\d+)\u0000/g,
    (_, i) => "<code>" + codeSpans[+i] + "</code>"
  );
}

function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const startsBlock = /^(#{1,4}\s|```|>\s?|[-*]\s|\d+\.\s)/;
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
      continue;
    }

    // Headings shift down one level: the post title is the page's <h1>,
    // so "#" in a post becomes <h2>.
    const heading = line.match(/^(#{1,4})\s+(.*)/);
    if (heading) {
      const level = heading[1].length + 1;
      html.push(`<h${level}>` + inline(heading[2]) + `</h${level}>`);
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      html.push("<hr>");
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoted = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      html.push("<blockquote><p>" + inline(quoted.join(" ")) + "</p></blockquote>");
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push("<li>" + inline(lines[i].replace(/^[-*]\s+/, "")) + "</li>");
        i += 1;
      }
      html.push("<ul>" + items.join("") + "</ul>");
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push("<li>" + inline(lines[i].replace(/^\d+\.\s+/, "")) + "</li>");
        i += 1;
      }
      html.push("<ol>" + items.join("") + "</ol>");
      continue;
    }

    // Paragraph: consecutive plain lines join into one.
    const para = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== "" && !startsBlock.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    html.push("<p>" + inline(para.join(" ")) + "</p>");
  }

  return html.join("\n");
}

/* ---------- list page ---------- */

async function renderList(list) {
  const count = document.getElementById("post-count");

  let posts;
  try {
    posts = await fetchPosts();
  } catch (err) {
    loadError(list, "Couldn't load the post list.");
    return;
  }

  count.textContent = String(posts.length).padStart(2, "0");

  // Rows reuse the project-list classes on purpose — the blog list and the
  // project list are the same component visually, hover inversion and all.
  posts.forEach((post, i) => {
    const item = document.createElement("li");
    item.className = "project";

    const num = document.createElement("span");
    num.className = "project-num";
    num.setAttribute("aria-hidden", "true");
    // Chronological: the oldest post is 01, numbers count up from there,
    // even though the list displays newest first.
    num.textContent = String(posts.length - i).padStart(2, "0");

    const body = document.createElement("div");
    body.className = "project-body";

    const title = document.createElement("h3");
    title.className = "project-title";
    const link = document.createElement("a");
    link.href = "post.html?p=" + encodeURIComponent(post.slug);
    link.textContent = post.title;
    title.append(link);

    const summary = document.createElement("p");
    summary.className = "project-desc";
    summary.textContent = post.summary;

    const meta = document.createElement("p");
    meta.className = "project-meta";
    const date = document.createElement("time");
    date.dateTime = post.date;
    date.textContent = formatDate(post.date);
    meta.append(date);

    body.append(title, summary, meta);

    const arrow = document.createElement("span");
    arrow.className = "project-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    item.append(num, body, arrow);
    list.append(item);
  });
}

/* ---------- post page ---------- */

async function renderPost(bodyEl) {
  const titleEl = document.getElementById("post-title");
  const dateEl = document.getElementById("post-date");
  const slug = new URLSearchParams(location.search).get("p");

  let post;
  try {
    const posts = await fetchPosts();
    // Only slugs listed in posts.json are fetched — the URL parameter
    // never becomes a path on its own.
    post = posts.find((p) => p.slug === slug);
  } catch (err) {
    loadError(bodyEl, "Couldn't load this post.");
    return;
  }

  if (!post) {
    titleEl.textContent = "Post not found";
    loadError(bodyEl, "No post lives at this address.");
    return;
  }

  document.title = post.title + " — David Okunfolami";
  titleEl.textContent = post.title;
  dateEl.textContent = formatDate(post.date);

  try {
    const res = await fetch("posts/" + post.slug + ".md");
    if (!res.ok) throw new Error(res.status);
    bodyEl.innerHTML = renderMarkdown(await res.text());
  } catch (err) {
    loadError(bodyEl, "Couldn't load this post.");
  }
}

const listEl = document.getElementById("post-list");
const postBodyEl = document.getElementById("post-body");
if (listEl) renderList(listEl);
else if (postBodyEl) renderPost(postBodyEl);
