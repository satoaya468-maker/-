const site = require("./src/_data/site.json");

module.exports = function (eleventyConfig) {
  /* assets/ рядом с src/, копируется в dist/assets как есть */
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addWatchTarget("assets/");

  /* +7 (908) 819-63-69 -> tel:+79088196369 */
  eleventyConfig.addFilter("telHref", (v) => "tel:" + String(v).replace(/[^\d+]/g, ""));

  /* 50000 -> «50 000» неразрывными пробелами, чтобы цена не рвалась */
  eleventyConfig.addFilter("money", (v) =>
    String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  );

  eleventyConfig.addFilter("absUrl", (p) => new URL(p, site.url).href);
  eleventyConfig.addFilter("jsonld", (o) => JSON.stringify(o).replace(/</g, "\\u003c"));

  /* Цена услуги -> Offer. Без подтверждённой суммы возвращаем undefined,
     и ключ offers из разметки выпадает: пустой Offer хуже отсутствия. */
  eleventyConfig.addFilter("priceOffer", (from, s, url) =>
    from
      ? {
          "@type": "Offer",
          url,
          priceCurrency: "RUB",
          price: String(from),
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "RUB",
            minPrice: String(from),
            valueAddedTaxIncluded: true
          },
          availability: "https://schema.org/InStock"
        }
      : undefined
  );

  /* Каталог услуг для карточки организации. Берётся из nav.services,
     поэтому новая услуга в меню попадает в разметку сама. */
  eleventyConfig.addFilter("serviceOffers", (items, s) =>
    (items || []).map((it) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: it.title,
        url: new URL(it.url, s.url).href,
        areaServed: { "@type": "City", name: s.city },
        provider: { "@id": s.url + "/#business" }
      }
    }))
  );

  /* FAQPage: разметка строится из того же массива, что и видимый список,
     чтобы структурированные данные не разошлись с текстом на странице */
  eleventyConfig.addFilter("faqLd", (items) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  }));

  /*
   * Изображение проекта. Четыре файла из брифа лежат в assets/img/.
   * Если файла ещё нет — вместо битой картинки выводится плашка с именем
   * файла: страницу видно целиком, а подстановка ассета не требует правок
   * в вёрстке.
   */
  eleventyConfig.addShortcode("pic", function (name, alt, opts = {}) {
    const m = (this.ctx && this.ctx.images) || {};
    const meta = m[name];
    const cls = opts.class ? ` class="${opts.class}"` : "";
    const style = opts.style ? ` style="${opts.style}"` : "";

    /* Слот, который просто исчезает, пока файла нет: тёмные карточки
       должны выглядеть законченными и без изображения */
    if (!meta && opts.optional) return "";

    if (!meta) {
      /* Файла ещё нет: вместо битой картинки — плашка с именем файла.
         Классы отдаём как есть, чтобы медиазапросы (например, скрытие
         изображения в промо на мобиле) продолжали работать. */
      const ph = opts.phHeight ? ` style="--ph-h:${opts.phHeight}"` : "";
      return `<div class="pic-ph${opts.class ? " " + opts.class : ""}"${ph} role="img" aria-label="${alt}">` +
             `<span class="cap">Изображение <b>assets/img/${name}.png</b><br>положите файл и выполните ` +
             `<code>python3 tools/build-images.py</code></span></div>`;
    }

    const loading = opts.eager ? "" : ' loading="lazy" decoding="async"';
    const fetchp = opts.eager ? ' fetchpriority="high" decoding="async"' : "";
    const sizes = opts.sizes ? ` sizes="${opts.sizes}"` : "";
    return `<picture${cls}${style}>` +
      `<source srcset="/assets/img/${name}.webp" type="image/webp"${sizes}>` +
      `<img src="/assets/img/${meta.fallback}" alt="${alt}" width="${meta.w}" height="${meta.h}"` +
      `${loading}${fetchp}>` +
      `</picture>`;
  });

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
