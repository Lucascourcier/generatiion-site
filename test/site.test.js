import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("_site");
const prefix = process.env.PATH_PREFIX || "/generatiion-site/";

async function htmlFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) return htmlFiles(file);
    return entry.name.endsWith(".html") ? [file] : [];
  }));
  return files.flat();
}

const documents = await Promise.all((await htmlFiles(output)).map(async (file) => ({
  file,
  html: await readFile(file, "utf8")
})));

test("toutes les pages publiques et les articles sont générés", async () => {
  for (const page of ["", "about", "notre-equipe", "actu", "contact", "generatiion-mahay", "presentation", "actualites/concours-mahay", "actualites/nous-soutenir"]) {
    assert.ok((await stat(path.join(output, page, "index.html"))).isFile(), page);
  }
  assert.ok((await stat(path.join(output, "404.html"))).isFile());
  assert.ok((await stat(path.join(output, ".nojekyll"))).isFile());
});

for (const { file, html } of documents) {
  const name = path.relative(output, file);
  test(`${name} : structure française et métadonnées`, () => {
    assert.match(html, /<html lang="fr">/);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, "un seul titre principal");
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.match(html, /<link rel="canonical" href="https:\/\/lucascourcier\.github\.io\//);
    assert.match(html, /<main id="contenu"/);
    assert.doesNotMatch(html, /\b(?:undefined|NaN)\b|\{\{|\{%/);
    assert.doesNotMatch(html, /wp-content|wp-admin|wp-json|<form\b|formspree|Lorem ipsum|Hello world!/i);
    for (const img of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(img[0], /\balt="[^"]*"/, "alternative de chaque image");
      assert.match(img[0], /\bwidth="\d+"/);
      assert.match(img[0], /\bheight="\d+"/);
    }
  });

  test(`${name} : liens et ressources valides sous ${prefix}`, async () => {
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replaceAll("&amp;", "&");
      if (/^(?:https?:|mailto:|data:)/.test(value)) continue;
      if (value.startsWith("#")) {
        assert.ok(html.includes(`id="${value.slice(1)}"`), `${name}: ancre ${value}`);
        continue;
      }
      assert.ok(value.startsWith(prefix), `${name}: préfixe manquant pour ${value}`);
      const relative = decodeURIComponent(value.slice(prefix.length)).split(/[?#]/)[0];
      const destination = path.join(output, relative, relative.endsWith("/") || !relative ? "index.html" : "");
      assert.ok((await stat(destination)).isFile(), `${name}: ressource absente ${value}`);
    }
  });
}

test("CSS et polices sont locales et autonomes", async () => {
  const css = await readFile(path.join(output, "assets", "site.css"), "utf8");
  for (const match of css.matchAll(/url\("([^"]+)"\)/g)) {
    assert.ok(!match[1].startsWith("http"));
    assert.ok((await stat(path.join(output, "assets", match[1]))).isFile());
  }
  assert.match(css, /prefers-reduced-motion/);
});

test("contact : uniquement les adresses publiques autorisées, aucun formulaire factice", async () => {
  const contact = await readFile(path.join(output, "contact", "index.html"), "utf8");
  assert.match(contact, /href="mailto:contact@generatiion\.org"/);
  assert.match(contact, /href="mailto:communication@generatiion\.org"/);
  assert.match(contact, /Aucun message n’est envoyé automatiquement/);
  assert.doesNotMatch(contact, /<form|<input|<textarea|disabled|action=/);
});

test("le dossier Mahay conserve son URL source", async () => {
  const content = await readFile(path.join(output, "generatiion-mahay", "index.html"), "utf8");
  assert.match(content, /https:\/\/drive\.google\.com\/file\/d\/1k3ob92ifNQ9b3mgX8y7GRnMgnBGilZbc\/view\?usp=drive_link/);
});

test("actualités : contenus Markdown repris, dates inconnues non inventées", async () => {
  const journal = await readFile(path.join(output, "actu", "index.html"), "utf8");
  assert.match(journal, /Concours « mahay »/);
  assert.match(journal, /Nous soutenir/);
  assert.match(journal, /Présentation/);
  for (const slug of ["concours-mahay", "nous-soutenir"]) {
    const html = await readFile(path.join(output, "actualites", slug, "index.html"), "utf8");
    assert.doesNotMatch(html, /<time/);
  }
  const presentation = await readFile(path.join(output, "presentation", "index.html"), "utf8");
  assert.match(presentation, /<time datetime="2026-03-11">11 mars 2026<\/time>/);
});
