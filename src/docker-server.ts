// Simple static file server for serving built site
const port = parseInt(Deno.env.get("PORT") || "8000");

console.log(`HTTP server listening on http://localhost:${port}/`);

Deno.serve({ port }, async (req) => {
  const url = new URL(req.url);
  let filepath = decodeURIComponent(url.pathname);

  // Serve index.html for directory requests
  if (filepath.endsWith("/")) {
    filepath += "index.html";
  }

  const fullPath = `./public${filepath}`;

  try {
    const file = await Deno.open(fullPath, { read: true });
    const stat = await file.stat();

    if (stat.isDirectory) {
      file.close();
      // Try to serve index.html from the directory
      const indexPath = `${fullPath}/index.html`;
      try {
        const indexFile = await Deno.open(indexPath, { read: true });
        return new Response(indexFile.readable, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch {
        // Directory index doesn't exist, return 404
        return new Response("404 Not Found - Directory listing not allowed", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    // Determine content type
    const ext = filepath.split(".").pop() || "";
    const contentTypes: Record<string, string> = {
      "html": "text/html; charset=utf-8",
      "css": "text/css; charset=utf-8",
      "js": "text/javascript; charset=utf-8",
      "json": "application/json",
      "png": "image/png",
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "gif": "image/gif",
      "svg": "image/svg+xml",
      "ico": "image/x-icon",
      "xml": "application/xml",
      "txt": "text/plain; charset=utf-8",
      "pdf": "application/pdf",
      "woff": "font/woff",
      "woff2": "font/woff2",
      "ttf": "font/ttf",
      "otf": "font/otf",
    };

    const contentType = contentTypes[ext.toLowerCase()] || "application/octet-stream";

    // Return response with readable stream - file will be closed when stream is consumed
    return new Response(file.readable, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    // File not found, return 404
    if (error instanceof Deno.errors.NotFound) {
      try {
        // Try to serve 404.html if it exists
        const notFoundFile = await Deno.open("./public/404.html", { read: true });
        return new Response(notFoundFile.readable, {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch {
        return new Response("404 Not Found", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }

    // Other errors
    console.error("Server error:", error);
    return new Response("500 Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
