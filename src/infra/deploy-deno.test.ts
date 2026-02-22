/**
 * Tests for Deno Deploy configuration and credentials
 *
 * Network steps are skipped automatically when DENO_DEPLOY_TOKEN or
 * DENO_DEPLOY_PROJECT are not set, so the suite always passes in CI
 * environments that don't have Deno Deploy configured.
 */

import { assertEquals, assertMatch } from "@std/assert";
import { existsSync } from "@std/fs";

const projectRoot = Deno.cwd();

const DENO_DEPLOY_TOKEN = Deno.env.get("DENO_DEPLOY_TOKEN");
const DENO_DEPLOY_PROJECT = Deno.env.get("DENO_DEPLOY_PROJECT");
const credentialsAvailable = !!(DENO_DEPLOY_TOKEN && DENO_DEPLOY_PROJECT);

Deno.test("Deno Deploy Configuration", async (test) => {
  await test.step("deploy script exists and is executable", () => {
    const filePath = `${projectRoot}/infra/deno-deploy/deploy-deno.sh`;
    assertEquals(existsSync(filePath), true, "Deploy script should exist");

    const fileInfo = Deno.statSync(filePath);
    const isExecutable = (fileInfo.mode! & 0o111) !== 0;
    assertEquals(isExecutable, true, "Deploy script should be executable");
  });

  await test.step("documentation exists", () => {
    const filePath = `${projectRoot}/infra/deno-deploy/README.md`;
    assertEquals(existsSync(filePath), true, "README should exist");
  });

  await test.step("GitHub Actions workflow exists and is valid", () => {
    const filePath = `${projectRoot}/.github/workflows/deploy-deno.yml`;
    assertEquals(existsSync(filePath), true, "GitHub Actions workflow should exist");

    const content = Deno.readTextFileSync(filePath);
    assertEquals(content.includes("name: Deploy - Deno Deploy"), true, "Workflow should have correct name");
    assertEquals(content.includes("workflow_dispatch"), true, "Workflow should be manually dispatchable");
    assertEquals(content.includes("DENO_DEPLOY_PROJECT"), true, "Workflow should reference DENO_DEPLOY_PROJECT");
  });

  await test.step("deploy script references correct env vars", () => {
    const filePath = `${projectRoot}/infra/deno-deploy/deploy-deno.sh`;
    const content = Deno.readTextFileSync(filePath);

    assertEquals(content.includes("DENO_DEPLOY_TOKEN"), true, "Script should reference DENO_DEPLOY_TOKEN");
    assertEquals(content.includes("DENO_DEPLOY_PROJECT"), true, "Script should reference DENO_DEPLOY_PROJECT");
  });

  await test.step("DENO_DEPLOY_TOKEN is set", () => {
    if (!credentialsAvailable) {
      console.log("      skipped — DENO_DEPLOY_TOKEN / DENO_DEPLOY_PROJECT not set");
      return;
    }

    assertEquals(typeof DENO_DEPLOY_TOKEN, "string", "DENO_DEPLOY_TOKEN should be a string");
    assertEquals(DENO_DEPLOY_TOKEN!.length > 0, true, "DENO_DEPLOY_TOKEN should not be empty");
  });

  await test.step("DENO_DEPLOY_PROJECT is set", () => {
    if (!credentialsAvailable) {
      console.log("      skipped — DENO_DEPLOY_TOKEN / DENO_DEPLOY_PROJECT not set");
      return;
    }

    assertEquals(typeof DENO_DEPLOY_PROJECT, "string", "DENO_DEPLOY_PROJECT should be a string");
    assertMatch(
      DENO_DEPLOY_PROJECT!,
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "DENO_DEPLOY_PROJECT should be a valid project name (lowercase alphanumeric with hyphens)",
    );
  });

  await test.step("token authenticates successfully against Deno Deploy API", async () => {
    if (!credentialsAvailable) {
      console.log("      skipped — DENO_DEPLOY_TOKEN / DENO_DEPLOY_PROJECT not set");
      return;
    }

    const response = await fetch(
      `https://api.deno.com/v1/projects/${DENO_DEPLOY_PROJECT}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${DENO_DEPLOY_TOKEN}`,
        },
      },
    );

    assertEquals(
      response.status !== 401,
      true,
      `DENO_DEPLOY_TOKEN was rejected by the API (401 Unauthorized)`,
    );

    assertEquals(
      response.status !== 403,
      true,
      `DENO_DEPLOY_TOKEN does not have permission to access project "${DENO_DEPLOY_PROJECT}" (403 Forbidden)`,
    );

    assertEquals(
      response.status === 200,
      true,
      `Project "${DENO_DEPLOY_PROJECT}" was not found on Deno Deploy (status ${response.status})`,
    );

    // Drain the body to avoid resource leaks
    await response.body?.cancel();
  });

  await test.step("project name matches API response", async () => {
    if (!credentialsAvailable) {
      console.log("      skipped — DENO_DEPLOY_TOKEN / DENO_DEPLOY_PROJECT not set");
      return;
    }

    const response = await fetch(
      `https://api.deno.com/v1/projects/${DENO_DEPLOY_PROJECT}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${DENO_DEPLOY_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      await response.body?.cancel();
      return;
    }

    const project = await response.json();
    assertEquals(
      project.name,
      DENO_DEPLOY_PROJECT,
      `API project name "${project.name}" should match DENO_DEPLOY_PROJECT "${DENO_DEPLOY_PROJECT}"`,
    );
  });
});
