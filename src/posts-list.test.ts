import { assertEquals, assertNotEquals } from "@std/assert";
import { join } from "@std/path";
import { load } from "@std/dotenv";
import { PostsList } from "./posts-list.ts";

Deno.test("src/posts-list.ts", async (test) => {
  await load({ export: true });

  const postsDirectory: string = Deno.env.get("BLOG_POSTS_DIR") || "";
  const urlPosts: string = Deno.env.get("BLOG_POSTS_URL") || "";
  const jsonFeedDefaultPostTitle: string = Deno.env.get("JSON_FEED_DEFAULT_POST_TITLE") || "";

  await test.step({
    name: "required var in env file is set (BLOG_POSTS_DIR)",
    fn: () => {
      assertNotEquals(postsDirectory, "");
    },
  });

  await test.step({
    name: "required var in env file is set (BLOG_POSTS_URL)",
    fn: () => {
      assertNotEquals(urlPosts, "");
    },
  });

  await test.step({
    name: "required var in env file is set (JSON_FEED_DEFAULT_POST_TITLE)",
    fn: () => {
      assertNotEquals(jsonFeedDefaultPostTitle, "");
    },
  });

  await test.step({
    name: "output array contains the right number of items",
    fn: async () => {
      const postsDirectoryAbsolute = join(Deno.cwd(), postsDirectory);

      const returnedItems = await PostsList(
        postsDirectoryAbsolute,
        urlPosts,
        jsonFeedDefaultPostTitle,
      );
      const returnedItemsCount = returnedItems.length;

      let countValidPostFiles = 0;
      for await (const item of Deno.readDir(postsDirectoryAbsolute)) {
        if (
          item.isFile &&
          item.name != "index.md" &&
          item.name.slice(-3) == ".md"
        ) {
          countValidPostFiles++;
        }
      }

      assertEquals(countValidPostFiles, returnedItemsCount);
    },
  });
});
