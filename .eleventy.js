const site = require("./src/_data/site.json");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/root": "." });

  eleventyConfig.addWatchTarget("src/assets/");

  /* +7 (908) 819-63-69 -> +79088196369 */
  eleventyConfig.addFilter("telHref", (v) => "tel:" + String(v).replace(/[^\d+]/g, ""));

  /* 50000 -> 50 000 (неразрывные пробелы, чтобы цена не рвалась) */
  eleventyConfig.addFilter("money", (v) =>
    String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  );

  eleventyConfig.addFilter("absUrl", (p) => new URL(p, site.url).href);

  eleventyConfig.addFilter("jsonld", (obj) =>
    JSON.stringify(obj).replace(/</g, "\\u003c")
  );

  eleventyConfig.addFilter("dateISO", (d) => new Date(d).toISOString().slice(0, 10));

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
