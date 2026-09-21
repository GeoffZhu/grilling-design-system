#!/usr/bin/env node
/** Render agent-authored content inside a neutral, token-aware review shell. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contrast, css, validate } from "./theme.js";

function escape_html(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;",
  })[character]);
}

const get = (object, key, fallback = undefined) => Object.hasOwn(object, key) ? object[key] : fallback;
const py_truthy = (value) => value != null && value !== false && value !== 0 && value !== ""
  && (!Array.isArray(value) || value.length > 0)
  && (typeof value !== "object" || Array.isArray(value) || Object.keys(value).length > 0);

export function render(t, content) {
  validate(t);
  if (!content || typeof content !== "object" || Array.isArray(content) || !["title", "headline", "description"].every((key) => py_truthy(get(content, key)))) {
    throw new Error("Provide image-specific title, headline and description; no default product scene is supplied");
  }
  if (!py_truthy(get(content, "bodyHtml")) && !py_truthy(get(content, "cards"))) throw new Error("Provide bodyHtml or content cards derived from the image");
  const language = get(content, "language");
  if (typeof language !== "string" || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(language)) {
    throw new Error("Set content.language to the user language, e.g. zh-CN or en");
  }
  const title = escape_html(content.title);
  const panels = [];
  for (const card of get(content, "cards", [])) {
    const tone = get(card, "tone", "card");
    const foreground = tone === "background" ? "foreground" : tone + "-foreground";
    if (!(tone in t.colors) || !(foreground in t.colors)) throw new Error("Card tone must have a semantic foreground pair");
    panels.push('<article class="tile" style="background:var(--' + tone + ');color:var(--' + foreground + ')"><h2>' + escape_html(card.title) + "</h2><p>" + escape_html(get(card, "description", "")) + "</p></article>");
  }
  let body = py_truthy(get(content, "bodyHtml")) ? get(content, "bodyHtml") : '<div class="deck">' + panels.join("") + "</div>";
  body += get(content, "extraHtml", "");
  const custom_css = get(content, "css", "");
  if (custom_css.toLowerCase().includes("</style")) throw new Error("Invalid CSS closing tag");
  const style = '\nmain{max-width:1000px;padding:28px;margin:auto}.review-header{display:flex;align-items:center;min-height:56px;margin-bottom:28px;border-bottom:1px solid var(--border);font-size:14px;font-weight:var(--label-weight)}.review-brand{color:var(--foreground);text-decoration:none}.github-link{margin-left:auto;display:grid;width:44px;height:44px;place-items:center;border-radius:var(--control-radius);color:var(--foreground)}.github-link:hover{background:var(--accent);color:var(--accent-foreground)}.github-link svg{width:21px;height:21px}h1{font-size:32px;margin:0 0 16px;max-width:24ch;text-wrap:balance}p{max-width:68ch;font-size:14px}.deck{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:28px}.tile{padding:24px;border-radius:var(--surface-radius)}.tile h2{font-size:22px;margin:0 0 12px}.tile p{margin:0}.review-tokens{margin-top:32px;padding-top:18px;border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;color:var(--muted-foreground);font-size:12px}@media(max-width:600px){main{padding:22px}.deck{grid-template-columns:1fr}h1{font-size:28px}}';
  const github = '<a class="github-link" href="https://github.com/GeoffZhu/grilling-design-system" target="_blank" rel="noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.3 11.3 0 0 0 12 .7Z"/></svg></a>';
  const header = '<header class="review-header"><span class="review-brand">grilling design system</span>' + github + "</header>";
  return '<!doctype html><html lang="' + escape_html(language) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + "</title><style>" + css(t, false) + style + custom_css + "</style></head><body><main>" + header + "<h1>" + escape_html(content.headline) + "</h1><p>" + escape_html(content.description) + "</p>" + body + "</main></body></html>";
}

function parse_args(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write("usage: board.js --tokens TOKENS --content CONTENT --output OUTPUT\n\nRender agent-authored content inside a neutral, token-aware review shell.\n");
    return null;
  }
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    if (!["--tokens", "--content", "--output"].includes(name) || index + 1 >= argv.length) throw new Error("usage: board.js --tokens TOKENS --content CONTENT --output OUTPUT");
    options[name.slice(2)] = argv[index + 1];
  }
  if (!["tokens", "content", "output"].every((name) => options[name])) throw new Error("usage: board.js --tokens TOKENS --content CONTENT --output OUTPUT");
  return options;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parse_args(argv);
  if (!args) return;
  const tokens = JSON.parse(await readFile(args.tokens, "utf8"));
  const result = render(tokens, JSON.parse(await readFile(args.content, "utf8")));
  await mkdir(dirname(args.output), { recursive: true });
  await writeFile(args.output, result);
  process.stdout.write(JSON.stringify({ output: args.output, contrast: contrast(tokens) }, null, 2) + "\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(error.message + "\n");
    process.exitCode = 1;
  });
}

