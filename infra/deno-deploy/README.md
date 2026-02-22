# Deno Deploy

Deploy the murty-site static site to [Deno Deploy](https://deno.com/deploy).

## Overview

Deno Deploy serves the pre-built static site from the `public/` directory using Deno's standard file server.

## Files

- `deploy.sh` - Bash script for manual deployment via `deployctl`
- `README.md` - This file
- `.github/workflows/deploy-deno-deploy.yml` - GitHub Actions workflow

## Prerequisites

- [Deno](https://deno.com/) installed
- [deployctl](https://github.com/denoland/deployctl) installed: `deno install -gArf jsr:@deno/deployctl`
- A [Deno Deploy](https://dash.deno.com/) account and project created
- `DENO_DEPLOY_TOKEN` available (personal access token from Deno Deploy dashboard)

## Quick Start

### Bash Script

```bash
export DENO_DEPLOY_TOKEN=your-token-here
export DENO_DEPLOY_PROJECT=your-project-name
bash ./infra/deno-deploy/deploy-deno.sh
```

### GitHub Actions

1. Go to **Actions** → **Deploy to Deno Deploy**
2. Click **Run workflow**
3. Enter `deploy` to confirm

**Required secret:** `DENO_DEPLOY_TOKEN` — set this in your repository's Settings → Secrets and variables → Actions.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DENO_DEPLOY_TOKEN` | Yes | — | Personal access token from [Deno Deploy dashboard](https://dash.deno.com/account#access-tokens) |
| `DENO_DEPLOY_PROJECT` | Yes | — | Project name on Deno Deploy |
| `DENO_DEPLOY_ORG` | No | — | Organisation name (if project is under an org) |

## How it Works

1. The site is built via `deno task build`, producing static files in `public/`
2. `deployctl` uploads the `public/` directory to Deno Deploy
3. Deno Deploy serves the files using [`@std/http/file-server`](https://jsr.io/@std/http)

## Reference

- [Deno Deploy Documentation](https://docs.deno.com/deploy/manual/)
- [deployctl](https://github.com/denoland/deployctl)
- [Deno Deploy Pricing](https://deno.com/deploy/pricing)
