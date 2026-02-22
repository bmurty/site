import { assertEquals, assertNotEquals } from "@std/assert";

Deno.test("build", async (test) => {
  await test.step({
    name: "non-empty file '_site/index.html' was found",
    fn: async () => {
      try {
        const publicIndexFileContents: string = await Deno.readTextFile(
          "_site/index.html",
        );

        assertNotEquals(publicIndexFileContents, "");
      } catch (_) {
        assertEquals("File not found", "");
      }
    },
  });

  await test.step({
    name: "non-empty file '_site/css/styles.min.css' was found",
    fn: async () => {
      try {
        const publicIndexFileContents: string = await Deno.readTextFile(
          "_site/css/styles.min.css",
        );

        assertNotEquals(publicIndexFileContents, "");
      } catch (_) {
        assertEquals("File not found", "");
      }
    },
  });

  await test.step({
    name: "non-empty file '_site/brendan/posts.json' was found",
    fn: async () => {
      try {
        const publicIndexFileContents: string = await Deno.readTextFile(
          "_site/brendan/posts.json",
        );

        assertNotEquals(publicIndexFileContents, "");
      } catch (_) {
        assertEquals("File not found", "");
      }
    },
  });

  await test.step({
    name: "non-empty file '_site/images/brendan/brendan-2024_750.png' was found",
    fn: async () => {
      try {
        const publicIndexFileContents: string = await Deno.readTextFile(
          "_site/images/brendan/brendan-2024_750.png",
        );

        assertNotEquals(publicIndexFileContents, "");
      } catch (_) {
        assertEquals("File not found", "");
      }
    },
  });

  await test.step({
    name: "non-empty file '_site/images/brendan/brendan-2024_150.webp' was found",
    fn: async () => {
      try {
        const publicIndexFileContents: string = await Deno.readTextFile(
          "_site/images/brendan/brendan-2024_150.webp",
        );

        assertNotEquals(publicIndexFileContents, "");
      } catch (_) {
        assertEquals("File not found", "");
      }
    },
  });
});
