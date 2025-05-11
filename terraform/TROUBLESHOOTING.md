# Terraform Deployment Troubleshooting

## Common Issues

### "Error: reading ECS Task Definition: couldn't find resource"

This error occurs when Terraform attempts to manage ECS task definitions that exist in AWS but are causing issues during Terraform operations. This commonly happens after migration from GitHub Secrets to AWS Secrets Manager or other significant infrastructure changes.

#### Root Cause

The root cause is typically state management changes during migration where Terraform lost track of existing resources or their state was reset. This can occur when:

1. Resources were created outside of Terraform
2. Resources were modified outside of Terraform
3. Terraform state was corrupted or lost
4. Resources were marked as "tainted" in Terraform state

#### Solution

1. **Untaint Resources**

   If resources are marked as "tainted" in Terraform state, you can untaint them using the provided script:

   ```bash
   ./scripts/untaint-resources.sh
   ```

   To untaint a specific resource:

   ```bash
   ./scripts/untaint-resources.sh aws_ecs_task_definition.backend
   ```

2. **Add Proper Lifecycle Blocks**

   The Terraform configuration has been updated to include proper lifecycle blocks for ECS task definitions and services:

   ```hcl
   lifecycle {
     ignore_changes = [
       tags,
       container_definitions
     ]
     create_before_destroy = true
   }
   ```
   
   For ECS services:
   
   ```hcl
   lifecycle {
     ignore_changes = [
       task_definition,
       desired_count
     ]
     create_before_destroy = true
   }
   ```

3. **AWS Secrets Manager Configuration**

   AWS Secrets Manager resources also have proper lifecycle blocks to prevent unnecessary updates:

   ```hcl
   lifecycle {
     ignore_changes = [
       secret_string
     ]
     create_before_destroy = true
   }
   ```

### When to Use `terraform refresh`

If you're still encountering issues after untainting resources, you may need to refresh the Terraform state:

```bash
terraform refresh
```

This command will update the state file to match the real-world infrastructure without making changes.

### Manual State Management

In some cases, you may need to manually manage the Terraform state:

```bash
# List all resources in the state
terraform state list

# Show details of a specific resource
terraform state show aws_ecs_task_definition.backend

# Remove a resource from state (use with caution)
terraform state rm aws_ecs_task_definition.backend
```

## Best Practices for Future Deployments

1. Always use the provided lifecycle blocks to ensure smooth updates
2. Avoid making changes to resources outside of Terraform
3. Use the `var.image_tag` variable for container images instead of hardcoding tags
4. Keep your Terraform state in a secure and reliable backend (S3 in this case)
5. Consider using workspaces for different environments 