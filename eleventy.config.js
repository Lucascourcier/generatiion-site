export default function (eleventyConfig) {
  const pathPrefix = process.env.PATH_PREFIX || "/generatiion-site/";
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(pathPrefix)) {
    throw new Error("PATH_PREFIX doit commencer et finir par / (ex. /generatiion-site/).");
  }
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });
  eleventyConfig.addFilter("frenchDate", (value) =>
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeZone: "UTC"
    }).format(new Date(value))
  );
  eleventyConfig.addShortcode("currentYear", () => String(new Date().getFullYear()));
  eleventyConfig.addCollection("news", (collection) => {
    const articles = collection.getFilteredByTag("news");
    for (const article of articles) {
      for (const field of ["title", "description", "image", "imageAlt"]) {
        if (typeof article.data[field] !== "string" || !article.data[field].trim()) {
          throw new Error(`${article.inputPath} : le champ "${field}" est obligatoire.`);
        }
      }
      if (article.data.published && Number.isNaN(new Date(article.data.published).getTime())) {
        throw new Error(`${article.inputPath} : la date "published" doit être au format AAAA-MM-JJ.`);
      }
    }
    return articles.sort((a, b) =>
      (a.data.order ?? 100) - (b.data.order ?? 100) ||
      new Date(b.data.published || 0) - new Date(a.data.published || 0) ||
      a.fileSlug.localeCompare(b.fileSlug)
    );
  });
  return {
    pathPrefix,
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
