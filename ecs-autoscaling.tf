# Auto Scaling configuration for murty-site ECS Service using Terraform
# This file provides auto-scaling rules for the ECS service

# Variables for customization
variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "murty-site-cluster"
}

variable "ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
  default     = "murty-site-service"
}

variable "min_task_count" {
  description = "Minimum number of tasks"
  type        = number
  default     = 1
}

variable "max_task_count" {
  description = "Maximum number of tasks"
  type        = number
  default     = 10
}

variable "target_cpu_utilization" {
  description = "Target CPU utilization percentage for scaling"
  type        = number
  default     = 70
}

variable "target_memory_utilization" {
  description = "Target memory utilization percentage for scaling"
  type        = number
  default     = 80
}

variable "scale_out_cooldown" {
  description = "Cooldown period in seconds after scale out"
  type        = number
  default     = 60
}

variable "scale_in_cooldown" {
  description = "Cooldown period in seconds after scale in"
  type        = number
  default     = 300
}

# Data source to get AWS account ID
data "aws_caller_identity" "current" {}

# Data source to get the ECS cluster
data "aws_ecs_cluster" "main" {
  cluster_name = var.ecs_cluster_name
}

# Data source to get the ECS service
data "aws_ecs_service" "main" {
  service_name = var.ecs_service_name
  cluster_arn  = data.aws_ecs_cluster.main.arn
}

# Application Auto Scaling Target
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = var.max_task_count
  min_capacity       = var.min_task_count
  resource_id        = "service/${var.ecs_cluster_name}/${var.ecs_service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CPU-based Auto Scaling Policy
resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "murty-site-cpu-scaling-policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.target_cpu_utilization
    scale_out_cooldown = var.scale_out_cooldown
    scale_in_cooldown  = var.scale_in_cooldown
  }
}

# Memory-based Auto Scaling Policy
resource "aws_appautoscaling_policy" "ecs_policy_memory" {
  name               = "murty-site-memory-scaling-policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = var.target_memory_utilization
    scale_out_cooldown = var.scale_out_cooldown
    scale_in_cooldown  = var.scale_in_cooldown
  }
}

# Step Scaling Policy for CPU (Advanced scaling)
resource "aws_appautoscaling_policy" "ecs_policy_cpu_step" {
  name               = "murty-site-cpu-step-scaling-up"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "PercentChangeInCapacity"
    cooldown                = var.scale_out_cooldown
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_lower_bound = 0
      metric_interval_upper_bound = 10
      scaling_adjustment          = 10
    }

    step_adjustment {
      metric_interval_lower_bound = 10
      metric_interval_upper_bound = 20
      scaling_adjustment          = 20
    }

    step_adjustment {
      metric_interval_lower_bound = 20
      scaling_adjustment          = 30
    }
  }
}

# CloudWatch Alarm for High CPU (triggers step scaling)
resource "aws_cloudwatch_metric_alarm" "ecs_high_cpu" {
  alarm_name          = "murty-site-high-cpu"
  alarm_description   = "Trigger scaling when CPU is high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  treat_missing_data  = "notBreaching"

  dimensions = {
    ServiceName = var.ecs_service_name
    ClusterName = var.ecs_cluster_name
  }

  alarm_actions = [aws_appautoscaling_policy.ecs_policy_cpu_step.arn]
}

# CloudWatch Alarm for High Memory
resource "aws_cloudwatch_metric_alarm" "ecs_high_memory" {
  alarm_name          = "murty-site-high-memory"
  alarm_description   = "Alert when memory utilization is high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 90
  treat_missing_data  = "notBreaching"

  dimensions = {
    ServiceName = var.ecs_service_name
    ClusterName = var.ecs_cluster_name
  }
}

# Outputs
output "scaling_target_id" {
  description = "The Application Auto Scaling Target ID"
  value       = aws_appautoscaling_target.ecs_target.id
}

output "cpu_scaling_policy_arn" {
  description = "ARN of the CPU-based scaling policy"
  value       = aws_appautoscaling_policy.ecs_policy_cpu.arn
}

output "memory_scaling_policy_arn" {
  description = "ARN of the Memory-based scaling policy"
  value       = aws_appautoscaling_policy.ecs_policy_memory.arn
}

output "cpu_step_scaling_policy_arn" {
  description = "ARN of the CPU step scaling policy"
  value       = aws_appautoscaling_policy.ecs_policy_cpu_step.arn
}

output "high_cpu_alarm_arn" {
  description = "ARN of the High CPU CloudWatch Alarm"
  value       = aws_cloudwatch_metric_alarm.ecs_high_cpu.arn
}

output "high_memory_alarm_arn" {
  description = "ARN of the High Memory CloudWatch Alarm"
  value       = aws_cloudwatch_metric_alarm.ecs_high_memory.arn
}
