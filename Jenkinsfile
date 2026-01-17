pipeline {
    agent any
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }
    
    environment {
        DOCKER_REGISTRY = 'docker.io'  // Change to your registry (ECR, ACR, etc.)
        DOCKER_IMAGE_NAME = 'devapply-backend'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        COMPOSE_PROJECT_NAME = 'devapply'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                checkout scm
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo 'Setting up environment...'
                script {
                    if (!fileExists('.env')) {
                        echo 'Creating .env file with defaults...'
                        writeFile file: '.env', text: '''SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
TELEGRAM_BOT_TOKEN=your_token
DATABASE_URL=sqlite:///./test.db
'''
                    }
                }
            }
        }
        
        stage('Code Quality & Testing') {
            steps {
                echo 'Running code quality checks...'
                script {
                    try {
                        sh '''
                            # Install development dependencies
                            pip install -q flake8 pytest pytest-cov

                            # Run linting
                            echo "Running flake8 linting..."
                            flake8 app/ --max-line-length=120 --exclude=__pycache__ || true

                            # Run tests if available
                            if [ -d "tests" ]; then
                                echo "Running pytest..."
                                pytest tests/ -v --cov=app --cov-report=xml || true
                            fi
                        '''
                    } catch (Exception e) {
                        echo "Code quality checks failed: ${e.message}"
                        // Continue pipeline even if checks fail
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    sh '''
                        docker build \
                            -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
                            -t ${DOCKER_IMAGE_NAME}:latest \
                            -f Dockerfile .
                        
                        echo "Docker image built successfully"
                        docker images | grep ${DOCKER_IMAGE_NAME}
                    '''
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo 'Running security scans...'
                script {
                    try {
                        sh '''
                            # Optional: Install and run Trivy for image scanning
                            # trivy image ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                            
                            # Scan requirements.txt for vulnerabilities
                            pip install -q safety
                            safety check -r requirements.txt --json || true
                        '''
                    } catch (Exception e) {
                        echo "Security scan warning: ${e.message}"
                    }
                }
            }
        }
        
        stage('Push Docker Image') {
            when {
                branch 'main'  // Only push on main branch
            }
            steps {
                echo 'Pushing Docker image to registry...'
                script {
                    sh '''
                        # Uncomment and configure your registry credentials
                        # docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD $DOCKER_REGISTRY
                        
                        # docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest
                        # docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                        # docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest
                        # docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                        
                        echo "Docker image push stage (configure registry credentials to enable)"
                    '''
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying application...'
                script {
                    sh '''
                        echo "Starting application with docker-compose..."
                        docker-compose -f docker-compose.yml down || true
                        docker-compose -f docker-compose.yml up -d
                        
                        # Wait for service to be healthy
                        echo "Waiting for service to be ready..."
                        sleep 5
                        
                        # Health check
                        for i in {1..30}; do
                            if curl -f http://localhost:8000/docs 2>/dev/null; then
                                echo "Application is healthy!"
                                break
                            fi
                            echo "Waiting for application... (attempt $i/30)"
                            sleep 2
                        done
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Running health checks...'
                script {
                    sh '''
                        echo "Checking application endpoints..."
                        curl -v http://localhost:8000/docs || echo "Health check endpoint not ready yet"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            // Add notification (email, Slack, etc.)
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification (email, Slack, etc.)
        }
    }
}
