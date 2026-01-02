// Define the accepted content in the Frontmatter of Post Markdown files
//  - Adapted from https://github.com/lumeland/lume/blob/v1.0.0/types.ts
export type YamlData = {
  tags?: string[];
  url?: string;
  draft?: boolean;
  renderOrder?: number;
  content?: unknown;
  layout?: string;
  templateEngine?: string | string[];
  [index: string]: unknown;
};

// Define the accepted content for JSON Feeds
export type JsonFeedData = {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  author?: JsonFeedAuthor;
  language?: string;
  items: JsonFeedItem[];
};

// Define the accepted content for JSON Feed Authors
export type JsonFeedAuthor = {
  name: string;
  url: string;
};

// Define the accepted content for JSON Feed Items
export type JsonFeedItem = {
  id: string;
  url: string;
  title: string;
  date_published: string;
  content_text: string;
};
