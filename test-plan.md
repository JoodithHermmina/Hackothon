# GitHub Actions Workflow Test Plan

## Test Scenarios

### 1. Pull Request Workflow Test
- Create a minor change in the codebase
- Create a pull request to main branch
- Verify that the test job runs successfully
- Verify that build_and_push job is skipped (as it should only run on main)

### 2. Main Branch Push Test
- Merge the pull request to main
- Verify all jobs run in sequence:
  - test
  - build_and_push
  - terraform
  - notify

### 3. Manual Workflow Trigger Test
- Trigger the workflow manually using workflow_dispatch
- Verify all jobs run successfully

## Test Cases for Each Stage

### Test Job
- [x] Python backend tests run successfully
- [x] Node.js frontend tests run successfully
- [x] All dependencies install correctly
- [x] Test coverage reports generate

### Build and Push Job
- [x] AWS Secrets Manager access works
- [x] AWS credentials are properly masked in logs
- [x] Docker builds complete successfully
- [x] Images push to ECR successfully
- [x] Both latest and SHA tags are applied

### Terraform Job
- [x] AWS credentials from Secrets Manager work
- [x] S3 backend access works
- [x] Terraform init succeeds
- [x] Terraform plan shows expected changes
- [x] Terraform apply succeeds
- [x] Load balancer DNS outputs correctly

### Notification Job
- [x] Success notification works
- [x] Failure notification works

## Test Steps

1. **Preparation**
   ```bash
   # Create test branch
   git checkout -b test/secrets-manager-migration

   # Commit all changes
   git add .
   git commit -m "test: Migrate from GitHub Secrets to AWS Secrets Manager"

   # Push branch
   git push origin test/secrets-manager-migration
   ```

2. **Pull Request Test**
   - Create PR from test/secrets-manager-migration to main
   - Verify test job runs and passes
   - Check logs for proper secret masking
   - Verify build job is skipped

3. **Main Branch Test**
   - Merge PR to main
   - Monitor full workflow execution
   - Verify each job's success
   - Check infrastructure updates
   - Validate application accessibility

4. **Manual Trigger Test**
   - Use GitHub UI to trigger workflow
   - Verify full job sequence
   - Validate all outputs

## Success Criteria

1. All jobs complete successfully
2. No secrets are exposed in logs
3. Application remains accessible
4. Infrastructure updates correctly
5. All test cases pass

## Rollback Plan

If issues are detected:
1. Revert the PR
2. Restore GitHub Secrets
3. Run original workflow to verify system stability

## Monitoring

During tests, monitor:
1. GitHub Actions logs
2. AWS CloudWatch logs
3. Application endpoints
4. Infrastructure state
5. AWS Secrets Manager access logs 