/**
 * JSON Feed
 *
 * Constructs a JSON Feed of Markdown files in a post directory and saves the output to a JSON file.
 *
 * More information about JSON Feed is available here: https://jsonfeed.org/version/1.1
 *
 * Run this via the "build" script:
 *    deno task build
 */

import { JsonFeedAuthor, JsonFeedData } from "./types.ts";
import { join } from "@std/path";
import { load } from "@std/dotenv";
import { PostsList } from "./posts-list.ts";

// Set feed properties using variables from the ".env" file
await load({ export: true });
const jsonFeedVersion: string = Deno.env.get("JSON_FEED_VERSION_URL") ||
  "https://jsonfeed.org/version/1.1";
const jsonFeedTitle: string = Deno.env.get("JSON_FEED_TITLE") || "";
const jsonFeedDescription: string = Deno.env.get("JSON_FEED_DESCRIPTION") || "";
const jsonFeedLanguage: string = Deno.env.get("JSON_FEED_LANGUAGE") || "en-GB";
const jsonFeedAuthorName: string = Deno.env.get("JSON_FEED_AUTHOR_NAME") || "";
const jsonFeedAuthorUrl: string = Deno.env.get("JSON_FEED_AUTHOR_URL") || "";
const jsonFeedDefaultPostTitle: string = Deno.env.get("JSON_FEED_DEFAULT_POST_TITLE") || "";
const postsDirectory: string = Deno.env.get("BLOG_POSTS_DIR") || "";
const urlPosts: string = Deno.env.get("BLOG_POSTS_URL") || "";
const urlFeed: string = Deno.env.get("JSON_FEED_URL_FEED") || "";
const fileOutput: string = Deno.env.get("JSON_FEED_FILE_OUTPUT") || "";

// Construct the Feed Author object
const jsonFeedAuthor: JsonFeedAuthor = {
  name: jsonFeedAuthorName,
  url: jsonFeedAuthorUrl,
};

// Set absolute paths for the required file-system related variables
const postsDirectoryAbsolute = join(Deno.cwd(), postsDirectory);
const fileOutputAbsolute = join(Deno.cwd(), fileOutput);

// Get an array of all of the valid Markdown files in the posts directory
const jsonFeedItems = await PostsList(
  postsDirectoryAbsolute,
  urlPosts,
  jsonFeedDefaultPostTitle,
);

// Construct the JSON Feed contents
const dataJsonFeed: JsonFeedData = {
  version: jsonFeedVersion,
  title: jsonFeedTitle,
  home_page_url: urlPosts,
  feed_url: urlFeed,
  description: jsonFeedDescription,
  author: jsonFeedAuthor,
  language: jsonFeedLanguage,
  items: jsonFeedItems,
};

// Save the JSON Feed content to the required file
const strJsonFeed: string = JSON.stringify(dataJsonFeed) || "";
Deno.writeTextFileSync(fileOutputAbsolute, strJsonFeed);
