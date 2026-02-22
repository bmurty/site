# Murty Website

[ ![Deployment Status](https://img.shields.io/github/actions/workflow/status/brendanmurty/site/release.yml?label=Deployment%20Status&style=flat-square&labelColor=%23222222)](https://github.com/bmurty/site/actions/workflows/release.yml)
[ ![Latest Release](https://img.shields.io/github/v/release/brendanmurty/site?label=Latest%20Release&style=flat-square&color=%2323c5b0&labelColor=%23222222)](https://github.com/bmurty/site/releases)
[ ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fmurty.au&up_message=online&down_message=offline&style=flat-square&logo=globe&label=Website%20Status&labelColor=%23222222)](https://murty.au)

## Summary

This repository contains the [murty.au](https://murty.au/) website, which has been built with [Deno](https://deno.land/), [Lume](https://lumeland.github.io/), a commercially licensed version of the [IO font by Mass-Driver](https://io.mass-driver.com/), and the [Font Awesome free icon pack](https://fontawesome.com/).

Tests, build and local server commands are available from local environments.

Remote testing and [GitHub Pages](https://pages.github.com/) deployment can be triggered locally and is then handled remotely by a [GitHub Actions workflow](.github/workflows/release.yml).

## Folder Structure

| Folder / File | Description |
| ---- | ---- |
| [.github/actions](.github/actions/) | Helper actions for GitHub Actions workflows |
| [.github/workflows/release.yml](.github/workflows/release.yml) | Triggers when a release tag is pushed. Runs tests, deploys to [GitHub Pages](https://pages.github.com/) and publishes a new [GitHub release](https://github.com/bmurty/site/releases). |
| [.vscode](.vscode/) | Customised [VS Code](https://code.visualstudio.com/) configuration for this repository. |
| [assets](assets/) | Static files like images and PDFs. |
| [bin](bin/) | Binary files used to ensure environment consistency, managed by Git LFS. |
| [config](config/) | Supporting configuration files. |
| [content](content/) | Website page content in [Markdown](https://daringfireball.net/projects/markdown/syntax) files. |
| [dev](dev/) | Dev helper scripts, refer to the `Commands` section above for more details. |
| [docs](docs/) | Documentation for Docker and ECS deployment. |
| [ecs-autoscaling.*](docs/ECS-AUTOSCALING-README.md) | ECS auto-scaling configuration files (CloudFormation, Terraform). See [docs/ECS-AUTOSCALING-README.md](docs/ECS-AUTOSCALING-README.md) for details. |
| [src](src/) | Source code and related unit tests. |
| [src/layouts](src/layouts/) | Nunjucks page layouts. |
| [src/styles](src/styles/) | CSS styles. |
| [src/templates](src/templates/) | Nunjucks page templates. |
| [deno.json](deno.json) | [Deno](https://deno.land/) imports, tasks and configuration for this repository. |

## Initial setup

1. Fork this repository
2. Make a local clone of that forked repository
3. Install the [latest stable release of Deno](https://deno.com/)
4. Run the setup script: `deno task setup`
5. Update some files in the forked repository

- Update `.github/workflows/release.yml` to use your forked GitHub repository URL
- All files in the `content` directory **must** contain your own content instead
- All files in the `assets` directory **must** contain your own static files instead
- Purchase your own license to use the [Mass-Driver IO font](https://io.mass-driver.com/) or update the CSS to use other fonts

6. Commit and push all of these changes to your forked repository
7. Update the Settings for your forked repository via GitHub:

- Pages > Source: _GitHub Actions_
- Pages > Custom domain: _use your own domain_

8. Update `CNAME` to use the same domain as you configured above
9. Setup [Google Analytics](https://analytics.google.com/):

- Create a new site in your own account
- Update your `.env` file's `GOOGLE_ANALYTICS_SITE_CODE` value to use your new `Measurement ID`

10. **Optional:** Install [VS Code](https://code.visualstudio.com/) and add the [Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) plugin

## Commands

For a full list of the available Deno shortcut commands, run:

```bash
deno task
```

## Docker Usage

For detailed Docker build and deployment instructions, see [docs/DOCKER.md](docs/DOCKER.md).
