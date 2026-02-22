// Lume Configuration - https://lume.land/docs/configuration/config-file/

import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import redirects from "lume/plugins/redirects.ts";
import sitemap from "lume/plugins/sitemap.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import "@std/dotenv/load";

// Build the site using Lume
const site = lume({
  src: "./build",
  dest: "./_site",
  prettyUrls: true,
});

// Enable plugins
site.use(nunjucks());
site.use(date());
site.use(redirects());
site.use(sitemap());

// Load site config values from ".env"
site.data("GOOGLE_ANALYTICS_SITE_CODE", Deno.env.get("GOOGLE_ANALYTICS_SITE_CODE"));
site.data("BLOG_POSTS_DIR", Deno.env.get("BLOG_POSTS_DIR"));
site.data("BLOG_POSTS_URL", Deno.env.get("BLOG_POSTS_URL"));
site.data("JSON_FEED_VERSION_URL", Deno.env.get("JSON_FEED_VERSION_URL"));
site.data("JSON_FEED_TITLE", Deno.env.get("JSON_FEED_TITLE"));
site.data("JSON_FEED_DESCRIPTION", Deno.env.get("JSON_FEED_DESCRIPTION"));
site.data(
  "JSON_FEED_DEFAULT_POST_TITLE",
  Deno.env.get("JSON_FEED_DEFAULT_POST_TITLE"),
);
site.data("JSON_FEED_LANGUAGE", Deno.env.get("JSON_FEED_LANGUAGE"));
site.data("JSON_FEED_AUTHOR_NAME", Deno.env.get("JSON_FEED_AUTHOR_NAME"));
site.data("JSON_FEED_AUTHOR_URL", Deno.env.get("JSON_FEED_AUTHOR_URL"));
site.data("JSON_FEED_FILE_OUTPUT", Deno.env.get("JSON_FEED_FILE_OUTPUT"));
site.data("JSON_FEED_URL_FEED", Deno.env.get("JSON_FEED_URL_FEED"));

export default site;
