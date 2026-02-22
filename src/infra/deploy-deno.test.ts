/**
 * Tests for Deno Deploy configuration and credentials
 *
 * Credential steps are skipped automatically when DENO_DEPLOY_TOKEN or
 * DENO_DEPLOY_PROJECT are not set, so the suite always passes in CI
 * environments that don't have Deno Deploy configured.
 *
 * Requires Deno >= 2.4.2 (when `deno deploy` subcommand was introduced).
 */

import { load } from "@std/dotenv";
import { assertEquals, assertMatch } from "@std/assert";
import { existsSync } from "@std/fs";

const projectRoot = Deno.cwd();

await load({ export: true });

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
    assertEquals(content.includes("DENO_DEPLOY_TOKEN"), true, "Workflow should reference DENO_DEPLOY_TOKEN");
    assertEquals(content.includes("deno deploy"), true, "Workflow should use the deno deploy CLI command");
  });

  await test.step("deploy script uses deno deploy CLI (not deployctl)", () => {
    const filePath = `${projectRoot}/infra/deno-deploy/deploy-deno.sh`;
    const content = Deno.readTextFileSync(filePath);

    assertEquals(content.includes("deno deploy"), true, "Script should use the deno deploy CLI command");
    assertEquals(content.includes("deployctl"), false, "Script should not reference the deprecated deployctl");
    assertEquals(content.includes("DENO_DEPLOY_TOKEN"), true, "Script should reference DENO_DEPLOY_TOKEN");
    assertEquals(content.includes("DENO_DEPLOY_PROJECT"), true, "Script should reference DENO_DEPLOY_PROJECT");
    assertEquals(content.includes("console.deno.com"), true, "Script should reference the new console URL");
  });

  await test.step("deploy script requires Deno >= 2.4.2", () => {
    const filePath = `${projectRoot}/infra/deno-deploy/deploy-deno.sh`;
    const content = Deno.readTextFileSync(filePath);

    assertEquals(content.includes("2.4.2"), true, "Script should enforce minimum Deno version 2.4.2");
  });

  await test.step("Deno runtime meets minimum version requirement (>= 2.4.2)", async () => {
    const command = new Deno.Command("deno", { args: ["--version"], stdout: "piped" });
    const { stdout } = await command.output();
    const versionOutput = new TextDecoder().decode(stdout);

    // Extract version string, e.g. "deno 2.6.10"
    const match = versionOutput.match(/deno (\d+)\.(\d+)\.(\d+)/);
    assertEquals(match !== null, true, "Should be able to read Deno version");

    const [, major, minor, patch] = match!.map(Number);
    const meetsMinimum = major > 2 ||
      (major === 2 && minor > 4) ||
      (major === 2 && minor === 4 && patch >= 2);

    assertEquals(
      meetsMinimum,
      true,
      `Deno ${major}.${minor}.${patch} does not meet the minimum required version 2.4.2 for deno deploy`,
    );
  });

  await test.step("DENO_DEPLOY_TOKEN is set", () => {
    if (!credentialsAvailable) {
      console.log("      skipped — DENO_DEPLOY_TOKEN / DENO_DEPLOY_PROJECT not set in env or .env file");
      return;
    }

    assertEquals(typeof DENO_DEPLOY_TOKEN, "string", "DENO_DEPLOY_TOKEN should be a string");
    assertEquals(DENO_DEPLOY_TOKEN!.length > 0, true, "DENO_DEPLOY_TOKEN should not be empty");
  });

  await test.step("DENO_DEPLOY_PROJECT is set and valid", () => {
    if (!credentialsAvailable) {
      console.log("      skipped — DENO_DEPLOY_TOKEN / DENO_DEPLOY_PROJECT not set in env or .env file");
      return;
    }

    assertEquals(typeof DENO_DEPLOY_PROJECT, "string", "DENO_DEPLOY_PROJECT should be a string");
    assertMatch(
      DENO_DEPLOY_PROJECT!,
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "DENO_DEPLOY_PROJECT should be a valid app name (lowercase alphanumeric with hyphens)",
    );
  });
});
