# Copilot Instructions for murty.au

This is a static website built with Deno, Lume (static site generator), and deployed to GitHub Pages.

## Build, Test, and Lint Commands

All commands are run via `deno task <command>`:

- **Build**: `deno task build` - Runs the full build pipeline (lint, format, build site, copy assets)
- **Test**: `deno task test` - Run all tests in the `src/` directory
  - Single test: `deno test --allow-run=deno --allow-env --allow-read --allow-net src/<filename>.test.ts`
- **Lint**: `deno task lint` - Run Deno lint and format
- **Local server**: `deno task serve` - Serve built site from `public/` directory on port 8000

Other useful commands:

- `deno task setup` - Initial setup (creates directories, installs dependencies)
- `deno task new-post` - Generate a new blog post Markdown file
- `deno task release` - Create and push a new release tag (triggers CI/CD)

## Architecture

### Build Process

The build is orchestrated by `dev/build.sh` which:

1. Lints and formats code
2. Creates a temporary `build/` directory
3. Copies source files into the build directory structure:
   - `src/styles/` → `build/_styles/`
   - `src/templates/` → `build/_includes/`
   - `src/layouts/` → `build/_includes/layouts/`
   - `content/*` → `build/` (Markdown files with frontmatter)
4. Combines and minifies CSS files into `build/_assets/css/styles.min.css`
5. Runs Lume to generate static HTML from Markdown + Nunjucks templates
6. Copies static assets (fonts, images, config files) to `public/`
7. Generates JSON Feed for blog posts via `src/json-feed.ts`
8. Cleans up `build/` directory

**Important**: Lume config (`config/lume.config.ts`) is temporarily copied to `_config.ts` at the project root during build.

### Directory Structure

- **`content/`**: Markdown files for pages and posts with frontmatter (e.g., `layout: home.njk`)
- **`src/`**: TypeScript source code
  - `src/layouts/`: Nunjucks layout templates (`.njk`)
  - `src/templates/`: Nunjucks component templates
  - `src/styles/`: CSS files (combined and minified during build)
  - `*.ts`: Utility modules (json-feed, posts-list, docker-server)
  - `*.test.ts`: Deno tests (use `Deno.test()` with steps)
- **`assets/`**: Static files (fonts, images, PDFs, favicon, etc.)
- **`config/`**: Configuration files (Lume config, robots.txt, security.txt, keybase.txt)
- **`dev/`**: Bash dev scripts for build automation
- **`infra/`**: Deployment infrastructure
  - `infra/aws-ecs/`: AWS ECS deployment (CloudFormation, Terraform, task definition)
  - `infra/deno-deploy/`: Deno Deploy deployment (deployctl)
- **`public/`**: Built output (generated, not committed)
- **`build/`**: Temporary directory during build (cleaned up after)

### Configuration

Environment variables are loaded from `.env` (use `.env.example` as template):

- `GOOGLE_ANALYTICS_SITE_CODE`: GA4 Measurement ID
- `BLOG_POSTS_DIR`, `BLOG_POSTS_URL`: Blog post paths
- `JSON_FEED_*`: JSON Feed metadata (title, description, author, etc.)

These values are passed to Lume templates via `site.data()` in `config/lume.config.ts`.

### Lume Plugins

The site uses these Lume plugins:

- `nunjucks` - Template engine
- `date` - Date formatting
- `redirects` - URL redirects
- `sitemap` - Generate sitemap.xml

### JSON Feed Generation

Blog posts are published as a JSON Feed at `/brendan/posts.json`:

- Run via `deno run --allow-read --allow-write --allow-env src/json-feed.ts`
- Reads Markdown files from `public/posts/`
- Parses frontmatter and content
- Outputs JSON Feed 1.1 format
- See `src/types.ts` for type definitions

## Key Conventions

### Testing

- Tests use Deno's built-in test framework with `Deno.test()`
- Tests use `test.step()` for sub-tests
- Tests are co-located with source files (e.g., `json-feed.ts` and `json-feed.test.ts`)
- Tests check for file existence and non-empty content in `public/` directory
- Required permissions: `--allow-read --allow-write --allow-env --allow-net --allow-run=deno`

### CSS Organization

CSS is split across multiple files that are concatenated in a specific order:

1. `tools-reset.css` - CSS reset
2. `site.css` - Base styles
3. `media-screen-medium.css` - Medium screen responsive styles
4. `media-screen-small.css` - Small screen responsive styles
5. `media-print.css` - Print styles

The build process concatenates and minifies these into `styles.min.css`.

### Frontmatter in Content Files

Markdown files in `content/` use YAML frontmatter:

```yaml
---
layout: home.njk
tags: [Social, Work]
draft: false
---
```

See `src/types.ts` for the `YamlData` type definition.

### Version Tags

Releases use date-based version tags: `YYYYMMDD.HHMM` (e.g., `20240221.1430`)

- Created via `deno task release` script
- Triggers the `.github/workflows/release.yml` workflow
- Workflow runs tests, deploys to GitHub Pages, and creates a GitHub release

### Docker

Docker support is available via `docker/docker-compose.yaml`:

- `deno task docker-dev` - Development container
- `deno task docker-prod` - Production container

See `docker/README.md` for detailed Docker instructions.

## Code Style

- Formatting configured in `deno.json`:
  - 2 space indentation
  - Line width: 120
  - Semicolons required
  - No tabs
- Linting and formatting scoped to `src/`, `config/lume.config.ts`, and `deno.json`
