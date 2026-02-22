/**
 * Tests for ECS Auto-Scaling configuration files
 */

import { assertEquals } from "jsr:@std/assert";
import { existsSync } from "jsr:@std/fs";

const projectRoot = Deno.cwd();

Deno.test("ECS Auto-Scaling Configuration Files", async (test) => {
  await test.step("CloudFormation template exists", () => {
    const filePath = `${projectRoot}/infra/ecs-autoscaling.cloudformation.yaml`;
    assertEquals(
      existsSync(filePath),
      true,
      "CloudFormation template should exist",
    );
  });

  await test.step("Terraform configuration exists", () => {
    const filePath = `${projectRoot}/infra/ecs-autoscaling.tf`;
    assertEquals(
      existsSync(filePath),
      true,
      "Terraform configuration should exist",
    );
  });

  await test.step("Example config JSON exists and is valid", () => {
    const filePath = `${projectRoot}/infra/ecs-autoscaling-config.example.json`;
    assertEquals(
      existsSync(filePath),
      true,
      "Example config JSON should exist",
    );

    // Verify it's valid JSON
    const content = Deno.readTextFileSync(filePath);
    const parsed = JSON.parse(content);
    assertEquals(typeof parsed, "object", "Config should be valid JSON");
    assertEquals(
      parsed.scaling?.min_tasks,
      1,
      "Should have min_tasks configured",
    );
    assertEquals(
      parsed.scaling?.max_tasks,
      10,
      "Should have max_tasks configured",
    );
  });

  await test.step("Documentation exists", () => {
    const filePath = `${projectRoot}/infra/README.md`;
    assertEquals(
      existsSync(filePath),
      true,
      "Auto-scaling documentation should exist",
    );
  });

  await test.step("Deployment script exists and is executable", () => {
    const filePath = `${projectRoot}/infra/deploy-aws.sh`;
    assertEquals(
      existsSync(filePath),
      true,
      "Deployment script should exist",
    );

    // Check if file is executable
    const fileInfo = Deno.statSync(filePath);
    const isExecutable = (fileInfo.mode! & 0o111) !== 0;
    assertEquals(
      isExecutable,
      true,
      "Deployment script should be executable",
    );
  });

  await test.step("GitHub Actions workflow exists and is valid YAML", () => {
    const filePath = `${projectRoot}/.github/workflows/deploy-ecs-autoscaling.yml`;
    assertEquals(
      existsSync(filePath),
      true,
      "GitHub Actions workflow should exist",
    );

    // Basic YAML validation - check it can be read and has expected structure
    const content = Deno.readTextFileSync(filePath);
    assertEquals(
      content.includes("name: Deploy ECS Auto Scaling"),
      true,
      "Workflow should have correct name",
    );
    assertEquals(
      content.includes("workflow_dispatch"),
      true,
      "Workflow should be manually dispatchable",
    );
  });

  await test.step("CloudFormation template has required parameters", () => {
    const filePath = `${projectRoot}/infra/ecs-autoscaling.cloudformation.yaml`;
    const content = Deno.readTextFileSync(filePath);

    // Check for key parameters
    assertEquals(
      content.includes("ECSClusterName"),
      true,
      "Should have ECSClusterName parameter",
    );
    assertEquals(
      content.includes("ECSServiceName"),
      true,
      "Should have ECSServiceName parameter",
    );
    assertEquals(
      content.includes("MinTaskCount"),
      true,
      "Should have MinTaskCount parameter",
    );
    assertEquals(
      content.includes("MaxTaskCount"),
      true,
      "Should have MaxTaskCount parameter",
    );
  });

  await test.step("CloudFormation template has scaling resources", () => {
    const filePath = `${projectRoot}/infra/ecs-autoscaling.cloudformation.yaml`;
    const content = Deno.readTextFileSync(filePath);

    // Check for required resources
    assertEquals(
      content.includes("AWS::ApplicationAutoScaling::ScalableTarget"),
      true,
      "Should have ScalableTarget resource",
    );
    assertEquals(
      content.includes("AWS::ApplicationAutoScaling::ScalingPolicy"),
      true,
      "Should have ScalingPolicy resources",
    );
    assertEquals(
      content.includes("AWS::CloudWatch::Alarm"),
      true,
      "Should have CloudWatch Alarm resources",
    );
    assertEquals(
      content.includes("ECSServiceAverageCPUUtilization"),
      true,
      "Should have CPU utilization metric",
    );
    assertEquals(
      content.includes("ECSServiceAverageMemoryUtilization"),
      true,
      "Should have Memory utilization metric",
    );
  });

  await test.step("Terraform configuration has required resources", () => {
    const filePath = `${projectRoot}/infra/ecs-autoscaling.tf`;
    const content = Deno.readTextFileSync(filePath);

    // Check for key resources
    assertEquals(
      content.includes("aws_appautoscaling_target"),
      true,
      "Should have autoscaling target",
    );
    assertEquals(
      content.includes("aws_appautoscaling_policy"),
      true,
      "Should have autoscaling policies",
    );
    assertEquals(
      content.includes("aws_cloudwatch_metric_alarm"),
      true,
      "Should have CloudWatch alarms",
    );
    assertEquals(
      content.includes("ECSServiceAverageCPUUtilization"),
      true,
      "Should have CPU utilization metric",
    );
    assertEquals(
      content.includes("ECSServiceAverageMemoryUtilization"),
      true,
      "Should have Memory utilization metric",
    );
  });
});
