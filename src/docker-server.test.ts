import { assertEquals, assertStringIncludes } from "@std/assert";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";

const SERVER_FILE = new URL("./docker-server.ts", import.meta.url).pathname;
const TEST_PORT = 9876;

/**
 * Helper: create a temporary directory with a `public/` subdirectory populated
 * with the supplied fixture files, start the docker-server process from that
 * directory, wait for it to be ready, run the provided test body, then tear
 * everything down.
 */
async function withServer(
  fixtures: Record<string, string>,
  body: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const tmpDir = await Deno.makeTempDir({ prefix: "docker_server_test_" });
  const publicDir = join(tmpDir, "public");

  try {
    // Write fixture files into <tmpDir>/public/…
    for (const [relativePath, content] of Object.entries(fixtures)) {
      const fullPath = join(publicDir, relativePath);
      await ensureDir(join(fullPath, ".."));
      await Deno.writeTextFile(fullPath, content);
    }

    // Start the server subprocess
    const cmd = new Deno.Command("deno", {
      args: ["run", "--allow-net", "--allow-read", "--allow-env", SERVER_FILE],
      env: { PORT: String(TEST_PORT) },
      cwd: tmpDir,
      stdout: "piped",
      stderr: "piped",
    });

    const process = cmd.spawn();

    // Wait for the server to be ready (poll with retries)
    const baseUrl = `http://localhost:${TEST_PORT}`;
    let ready = false;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(baseUrl);
        // consume body so the connection is released
        await res.body?.cancel();
        ready = true;
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    if (!ready) {
      process.kill("SIGTERM");
      throw new Error("Server did not become ready within the timeout period");
    }

    try {
      await body(baseUrl);
    } finally {
      process.kill("SIGTERM");
      // Consume stdout/stderr to avoid resource leaks
      await process.stdout.cancel();
      await process.stderr.cancel();
      // Wait for process to exit so the port is freed
      await process.status;
    }
  } finally {
    await Deno.remove(tmpDir, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

Deno.test("docker-server", async (t) => {
  await t.step({
    name: "serves index.html for root path /",
    fn: async () => {
      await withServer({ "index.html": "<h1>Home</h1>" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(text, "<h1>Home</h1>");
        assertStringIncludes(res.headers.get("content-type") || "", "text/html");
      });
    },
  });

  await t.step({
    name: "serves a static HTML file with correct content type",
    fn: async () => {
      await withServer({ "about.html": "<p>About</p>" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/about.html`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(text, "<p>About</p>");
        assertStringIncludes(res.headers.get("content-type") || "", "text/html");
      });
    },
  });

  await t.step({
    name: "serves CSS files with correct content type",
    fn: async () => {
      await withServer({ "css/styles.css": "body { color: red; }" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/css/styles.css`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(text, "body { color: red; }");
        assertStringIncludes(res.headers.get("content-type") || "", "text/css");
      });
    },
  });

  await t.step({
    name: "serves JS files with correct content type",
    fn: async () => {
      await withServer({ "js/app.js": "console.log('hello');" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/js/app.js`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(text, "console.log('hello');");
        assertStringIncludes(res.headers.get("content-type") || "", "text/javascript");
      });
    },
  });

  await t.step({
    name: "serves JSON files with correct content type",
    fn: async () => {
      await withServer({ "data.json": '{"key":"value"}' }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/data.json`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertEquals(text, '{"key":"value"}');
        assertStringIncludes(res.headers.get("content-type") || "", "application/json");
      });
    },
  });

  await t.step({
    name: "serves SVG files with correct content type",
    fn: async () => {
      await withServer({ "icon.svg": "<svg></svg>" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/icon.svg`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(text, "<svg></svg>");
        assertStringIncludes(res.headers.get("content-type") || "", "image/svg+xml");
      });
    },
  });

  await t.step({
    name: "serves XML files with correct content type",
    fn: async () => {
      await withServer({ "sitemap.xml": "<urlset></urlset>" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/sitemap.xml`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(text, "<urlset></urlset>");
        assertStringIncludes(res.headers.get("content-type") || "", "application/xml");
      });
    },
  });

  await t.step({
    name: "falls back to application/octet-stream for unknown extensions",
    fn: async () => {
      await withServer({ "file.xyz": "binary-ish" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/file.xyz`);
        await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(res.headers.get("content-type") || "", "application/octet-stream");
      });
    },
  });

  await t.step({
    name: "serves index.html for a directory path (trailing slash)",
    fn: async () => {
      await withServer(
        {
          "index.html": "<h1>Root</h1>",
          "sub/index.html": "<h1>Sub</h1>",
        },
        async (baseUrl) => {
          const res = await fetch(`${baseUrl}/sub/`);
          const text = await res.text();

          assertEquals(res.status, 200);
          assertStringIncludes(text, "<h1>Sub</h1>");
          assertStringIncludes(res.headers.get("content-type") || "", "text/html");
        },
      );
    },
  });

  await t.step({
    name: "returns 404 for a file that does not exist",
    fn: async () => {
      await withServer({ "index.html": "<h1>Home</h1>" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/nonexistent.html`);
        await res.text();

        assertEquals(res.status, 404);
      });
    },
  });

  await t.step({
    name: "returns custom 404.html page when it exists",
    fn: async () => {
      await withServer(
        {
          "index.html": "<h1>Home</h1>",
          "404.html": "<h1>Custom Not Found</h1>",
        },
        async (baseUrl) => {
          const res = await fetch(`${baseUrl}/nonexistent.html`);
          const text = await res.text();

          assertEquals(res.status, 404);
          assertStringIncludes(text, "Custom Not Found");
          assertStringIncludes(res.headers.get("content-type") || "", "text/html");
        },
      );
    },
  });

  await t.step({
    name: "returns plain text 404 when 404.html does not exist",
    fn: async () => {
      await withServer({ "index.html": "<h1>Home</h1>" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/missing.html`);
        const text = await res.text();

        assertEquals(res.status, 404);
        assertStringIncludes(text, "404 Not Found");
        assertStringIncludes(res.headers.get("content-type") || "", "text/plain");
      });
    },
  });

  await t.step({
    name: "returns 404 for a directory without index.html",
    fn: async () => {
      await withServer(
        {
          "index.html": "<h1>Root</h1>",
          "emptydir/placeholder.txt": "not index",
        },
        async (baseUrl) => {
          const res = await fetch(`${baseUrl}/emptydir/`);
          await res.text();

          assertEquals(res.status, 404);
        },
      );
    },
  });

  await t.step({
    name: "handles URL-encoded paths",
    fn: async () => {
      await withServer({ "my file.html": "<p>Spaced</p>" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/my%20file.html`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(text, "<p>Spaced</p>");
      });
    },
  });

  await t.step({
    name: "serves plain text files with correct content type",
    fn: async () => {
      await withServer({ "readme.txt": "Hello World" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/readme.txt`);
        const text = await res.text();

        assertEquals(res.status, 200);
        assertEquals(text, "Hello World");
        assertStringIncludes(res.headers.get("content-type") || "", "text/plain");
      });
    },
  });

  await t.step({
    name: "serves PDF files with correct content type",
    fn: async () => {
      await withServer({ "doc.pdf": "%PDF-fake" }, async (baseUrl) => {
        const res = await fetch(`${baseUrl}/doc.pdf`);
        await res.text();

        assertEquals(res.status, 200);
        assertStringIncludes(res.headers.get("content-type") || "", "application/pdf");
      });
    },
  });
});
