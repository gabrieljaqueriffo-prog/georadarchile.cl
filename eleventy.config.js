import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import site from "./src/_data/site.js";
import schema from "./src/_data/schema.js";

export default function (eleventyConfig) {
  eleventyConfig.addFilter("breadcrumbSchema", (route, title, url) => {
    const origin = site.canonicalOrigin;
    const items = [{ "@type": "ListItem", position: 1, name: "Inicio", item: `${origin}/` }];
    const sectionUrl = route && schema.sections[route.section];
    if (sectionUrl && sectionUrl !== url) {
      const name = ["Categoría", "Etiqueta", "Conocimiento"].includes(route.section) ? "Blog" : route.section;
      items.push({ "@type": "ListItem", position: 2, name, item: `${origin}${sectionUrl}` });
    }
    items.push({ "@type": "ListItem", position: items.length + 1, name: title, item: `${origin}${url}` });
    return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
  });

  // Imágenes responsivas: WebP en 480/960/1600 px (sin ampliar originales pequeños).
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp"],
    widths: [480, 960, 1600],
    urlPath: "/assets/img/",
    outputDir: "./_site/assets/img/",
    failOnError: true,
    htmlOptions: {
      imgAttributes: { decoding: "async", loading: "lazy", sizes: "(min-width: 1440px) 1440px, 100vw" }
    }
  });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
