// Where a project's title links: "code" or "live".
// "live" prefers the demo URL when one exists, falling back to the repo.
const TITLE_LINKS_TO = "code";

(async function renderProjects() {
  const list = document.getElementById("project-list");
  const count = document.getElementById("project-count");
  if (!list) return;

  const isUrl = (value) => typeof value === "string" && /^https?:\/\//.test(value);

  let projects;
  try {
    const res = await fetch("projects.json");
    if (!res.ok) throw new Error(res.status);
    projects = await res.json();
  } catch (err) {
    const note = document.createElement("p");
    note.className = "noscript-note";
    note.append("Couldn't load the project list. Everything is on ");
    const link = document.createElement("a");
    link.href = "https://github.com/Dah-vid";
    link.textContent = "my GitHub";
    note.append(link, ".");
    list.replaceWith(note);
    return;
  }

  const ordered = [...projects].sort(
    (a, b) => (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0)
  );

  count.textContent = String(ordered.length).padStart(2, "0");

  ordered.forEach((project, i) => {
    const item = document.createElement("li");
    item.className = project.flagship ? "project flagship" : "project";

    const num = document.createElement("span");
    num.className = "project-num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(i + 1).padStart(2, "0");

    const body = document.createElement("div");
    body.className = "project-body";

    const title = document.createElement("h3");
    title.className = "project-title";
    const codeUrl = isUrl(project.github) ? project.github : null;
    const liveUrl = isUrl(project.demo) ? project.demo : null;
    const primaryUrl =
      TITLE_LINKS_TO === "live" ? liveUrl || codeUrl : codeUrl || liveUrl;
    if (primaryUrl) {
      const link = document.createElement("a");
      link.href = primaryUrl;
      link.textContent = project.title;
      title.append(link);
    } else {
      title.append(project.title);
    }
    if (project.flagship) {
      const tag = document.createElement("span");
      tag.className = "flag-tag";
      tag.textContent = "Flagship";
      title.append(" ", tag);
    }

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = project.description;

    const meta = document.createElement("p");
    meta.className = "project-meta";
    const stack = document.createElement("span");
    stack.textContent = (project.stack || []).join(" / ");
    meta.append(stack);
    if (isUrl(project.demo)) {
      const demo = document.createElement("a");
      demo.href = project.demo;
      demo.textContent = "Live ↗";
      meta.append(demo);
    }
    if (isUrl(project.github)) {
      const code = document.createElement("a");
      code.href = project.github;
      code.textContent = "Code ↗";
      meta.append(code);
    }

    body.append(title, desc, meta);

    const arrow = document.createElement("span");
    arrow.className = "project-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    item.append(num, body, arrow);
    list.append(item);
  });
})();
