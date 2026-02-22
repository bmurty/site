// Tests for Deno Deploy configuration

import { assertEquals } from "@std/assert";
import { existsSync } from "@std/fs";

const projectRoot = Deno.cwd();

Deno.test("Deno Deploy Configuration", async (test) => {
  await test.step("GitHub Actions workflow exists and is valid", () => {
    const filePath = `${projectRoot}/.github/workflows/deploy-deno.yml`;
    assertEquals(existsSync(filePath), true, "GitHub Actions workflow should exist");

    const content = Deno.readTextFileSync(filePath);
    assertEquals(content.includes("name: Deploy - Deno Deploy"), true, "Workflow should have correct name");
    assertEquals(content.includes("workflow_dispatch"), true, "Workflow should be manually dispatchable");
    assertEquals(content.includes("DENO_DEPLOY_TOKEN"), true, "Workflow should reference DENO_DEPLOY_TOKEN");
    assertEquals(content.includes("deno deploy"), true, "Workflow should use the deno deploy CLI command");
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
});
