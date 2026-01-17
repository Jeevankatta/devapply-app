# Jenkins Pipeline Setup Guide

This document guides you through setting up a complete CI/CD pipeline with Jenkins for the DevApply backend application.

## Prerequisites

- Jenkins 2.361+ installed
- Docker and Docker Compose installed on Jenkins agent/controller
- Git integration configured
- Pipeline plugin installed (usually included)

## Jenkins Setup Steps

### 1. Install Required Jenkins Plugins

Navigate to **Manage Jenkins → Manage Plugins** and install:

- **Pipeline** - For declarative/scripted pipelines
- **Docker Pipeline** - Docker integration
- **Git** - Git integration
- **Email Extension** - Email notifications
- **Slack Notification** - Slack integration (optional)
- **Cobertura Plugin** - Code coverage reports

### 2. Create a New Pipeline Job

1. Click **New Item**
2. Select **Pipeline**
3. Name: `devapply-backend-pipeline`
4. Click **OK**

### 3. Configure Pipeline

In the job configuration:

#### General Settings
- Check: "This project is parameterized"
- Add Parameter:
  - Name: `ENVIRONMENT`
  - Type: Choice
  - Choices: `development`, `staging`, `production`

#### Build Triggers
- Check: "GitHub hook trigger for GITScm polling" (if using GitHub)
- Or: "Poll SCM" with cron: `H H * * *` (daily)

#### Pipeline Definition
- Definition: **Pipeline script from SCM**
- SCM: Git
- Repository URL: `https://github.com/your-org/devapply_backend.git`
- Branch Specifier: `*/main` or `*/develop`
- Script Path: `Jenkinsfile`

### 4. Configure Credentials

**Manage Jenkins → Manage Credentials**

#### Docker Registry Credentials (if using)
- Kind: **Username with password**
- Username: Your Docker Hub username
- Password: Your Docker Hub token
- ID: `docker-registry-credentials`

#### GitHub Credentials (if private repo)
- Kind: **SSH Key** or **Username with password**
- ID: `github-credentials`

#### Email Credentials
- Kind: **Username with password**
- For Gmail: Use app-specific password
- ID: `smtp-credentials`

### 5. Configure Email Notifications

**Manage Jenkins → Configure System → Email Notification**

```
SMTP Server: smtp.gmail.com
SMTP Port: 465
Use SSL: Yes
Authentication:
  User: your-email@gmail.com
  Password: your-app-password
```

### 6. Environment Variables in Jenkins

Add environment variables for your Jenkins configuration:

```
DOCKER_REGISTRY=docker.io
DOCKER_HUB_USER=your-docker-user
DOCKER_HUB_PASS=(set as secret text)
DEPLOY_HOST=your-deploy-server
DEPLOY_USER=your-deploy-user
DEPLOY_KEY=(set as SSH key)
```

## Pipeline Execution Flow

```
┌─────────────────┐
│    Checkout     │ - Clone repository from Git
└────────┬────────┘
         │
┌────────▼────────────────┐
│   Environment Setup      │ - Create .env if missing
└────────┬────────────────┘
         │
┌────────▼──────────────────────┐
│ Code Quality & Testing        │ - Flake8 linting
└────────┬──────────────────────┘  - Pytest with coverage
         │
┌────────▼──────────────────┐
│  Build Docker Image       │ - Build with BuildKit
└────────┬──────────────────┘  - Tag with build number
         │
┌────────▼──────────────────┐
│    Security Scan          │ - Scan vulnerabilities
└────────┬──────────────────┘  - Check dependencies
         │
┌────────▼──────────────────┐
│  Push Docker Image        │ - Only on main branch
└────────┬──────────────────┘  - Push to registry
         │
┌────────▼──────────────────┐
│      Deploy               │ - Pull latest image
└────────┬──────────────────┘  - Run docker-compose
         │
┌────────▼──────────────────┐
│    Health Check           │ - Verify endpoints
└──────────────────────────┘
```

## Running the Pipeline

### Manually
1. Go to your pipeline job
2. Click **Build Now**
3. View logs in **Console Output**

### Automatically
- Pushes to `main` branch trigger the pipeline
- Configure webhook in GitHub/GitLab for instant triggers

## Monitoring and Logs

### View Build Logs
- Click the build number → **Console Output**

### View Build History
- Dashboard shows recent builds with status (✓ success, ✗ failure)

### Pipeline Stages View
- Click **Pipeline** tab to see stage execution timeline

## Troubleshooting

### Docker Build Fails
```bash
# Check Docker daemon is running
docker ps

# Check Dockerfile syntax
docker build --no-cache .
```

### Pipeline Timeout
- Increase timeout in Jenkinsfile: `timeout(time: 60, unit: 'MINUTES')`
- Check health check configuration

### Deployment Issues
- Verify docker-compose.yml syntax
- Check port availability: `netstat -an | grep 8000`
- View container logs: `docker logs devapply-backend`

## Advanced Configuration

### Adding Slack Notifications

1. Install Slack Notification plugin
2. Get Slack webhook URL from your workspace
3. Add to Jenkinsfile:

```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "Build ${env.BUILD_NUMBER} succeeded",
            webhookUrl: '${SLACK_WEBHOOK}'
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "Build ${env.BUILD_NUMBER} failed",
            webhookUrl: '${SLACK_WEBHOOK}'
        )
    }
}
```

### Multi-Environment Deployment

Modify the Jenkinsfile to support dev/staging/prod:

```groovy
stage('Deploy') {
    steps {
        script {
            switch(params.ENVIRONMENT) {
                case 'production':
                    sh 'docker-compose -f docker-compose.prod.yml up -d'
                    break
                case 'staging':
                    sh 'docker-compose -f docker-compose.staging.yml up -d'
                    break
                default:
                    sh 'docker-compose up -d'
            }
        }
    }
}
```

### Artifact Storage

Add to Jenkinsfile post section:

```groovy
post {
    always {
        junit 'test-results/*.xml'
        publishHTML target: [
            reportDir: 'htmlcov',
            reportFiles: 'index.html',
            reportName: 'Coverage Report'
        ]
    }
}
```

## Docker Image Best Practices

✅ **Using Multi-stage Build**
- Reduces final image size
- Separates build dependencies from runtime
- Improves security

✅ **Non-root User**
- Runs container as `appuser` (UID 1000)
- Prevents privilege escalation

✅ **Health Checks**
- Built-in Docker health status
- Kubernetes and Swarm compatibility

✅ **Logging Configuration**
- JSON logging driver
- Log rotation (10MB max, 3 files)

## Maintenance

### Regular Tasks

1. **Weekly**: Review failed builds and fix issues
2. **Monthly**: Update base image (python:3.11-slim)
3. **Monthly**: Update dependencies in requirements.txt
4. **Quarterly**: Review security scanning results

### Cleanup

Remove old images:
```bash
docker image prune -a --force --filter "until=168h"
```

Remove old containers:
```bash
docker container prune --force --filter "until=720h"
```

## Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Build Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

For questions or issues, check the Jenkins logs or refer to the Jenkinsfile comments.
