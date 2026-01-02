import { load } from "@std/dotenv";
import { assertEquals, assertNotEquals } from "@std/assert";
import { isJSON } from "is_json/mod.ts";
import { join } from "@std/path";

Deno.test("src/json-feed.ts", async (test) => {
  // Attempt to get the values of some variables from the ".env" file
  await load({ export: true });
  const postsJsonFile: string = Deno.env.get("JSON_FEED_FILE_OUTPUT") || "";
  const postsDirectory: string = Deno.env.get("BLOG_POSTS_DIR") || "";

  await test.step({
    name: "required var in env file is set (JSON_FEED_FILE_OUTPUT)",
    fn: () => {
      assertNotEquals(postsJsonFile, "");
    },
  });

  await test.step({
    name: "required var in env file is set (BLOG_POSTS_DIR)",
    fn: () => {
      assertNotEquals(postsDirectory, "");
    },
  });

  await test.step({
    name: "post JSON file exists and is not empty",
    fn: async () => {
      const postsJsonContent: string = await Deno.readTextFile(postsJsonFile);

      assertNotEquals(postsJsonContent, "");
    },
  });

  await test.step({
    name: "post JSON content is valid",
    fn: async () => {
      const postsJsonContent: string = await Deno.readTextFile(postsJsonFile);

      assertEquals(isJSON(postsJsonContent), true);
    },
  });

  await test.step({
    name: "post JSON contains the right number of items",
    fn: async () => {
      const postsDirectoryAbsolute = join(Deno.cwd(), postsDirectory);

      const postsJsonContent: string = await Deno.readTextFile(postsJsonFile);
      const postsJsonObject = JSON.parse(postsJsonContent);
      const countItemsInJSONFile = Object.keys(postsJsonObject.items).length;

      let countValidPostFiles = 0;
      for await (const item of Deno.readDir(postsDirectoryAbsolute)) {
        if (
          item.isFile && item.name != "index.md" && item.name.slice(-3) == ".md"
        ) {
          countValidPostFiles++;
        }
      }

      assertEquals(countValidPostFiles, countItemsInJSONFile);
    },
  });
});
