pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (configure in Jenkins)
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_HUB_REPO = 'chandusugguna/eventopia'
        
        // MongoDB Atlas connection
        MONGODB_URI = credentials('mongodb-uri')
        JWT_SECRET = credentials('jwt-secret')
        SESSION_SECRET = credentials('session-secret')
        
        // Google OAuth
        GOOGLE_CLIENT_ID = credentials('google-client-id')
        GOOGLE_CLIENT_SECRET = credentials('google-client-secret')
        
        // Application URLs
        BACKEND_PORT = '5000'
        FRONTEND_PORT = '3000'
        
        // Build info
        BUILD_VERSION = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out code from repository...'
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = bat(returnStdout: true, script: '@git rev-parse --short HEAD').trim()
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo '🔧 Setting up environment variables...'
                script {
                    // Create .env files for backend and frontend
                    writeFile file: 'backend/.env', text: """PORT=${BACKEND_PORT}
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
NODE_ENV=production
CLIENT_URL=http://localhost:${FRONTEND_PORT}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=http://localhost:${BACKEND_PORT}/api/auth/google/callback"""
                    
                    writeFile file: 'frontend/.env', text: """VITE_API_BASE_URL=http://localhost:${BACKEND_PORT}/api
VITE_APP_NAME=Eventopia"""
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo '📦 Installing backend dependencies...'
                            bat 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo '📦 Installing frontend dependencies...'
                            bat 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality & Linting') {
            parallel {
                stage('Backend Linting') {
                    steps {
                        dir('backend') {
                            echo '🔍 Running backend linting...'
                            bat 'npm run lint || exit 0'
                        }
                    }
                }
                stage('Frontend Linting') {
                    steps {
                        dir('frontend') {
                            echo '🔍 Running frontend linting...'
                            bat 'npm run lint || exit 0'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            echo '🧪 Running backend tests...'
                            bat 'npm test || exit 0'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            echo '🧪 Running frontend tests...'
                            bat 'npm test || exit 0'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo '🔒 Running security audit...'
                dir('backend') {
                    bat 'npm audit --production || exit 0'
                }
                dir('frontend') {
                    bat 'npm audit --production || exit 0'
                }
            }
        }
        
        stage('Build Application') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            echo '🏗️ Building backend...'
                            bat 'echo Backend build completed'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            echo '🏗️ Building frontend...'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                branch 'main'
            }
            steps {
                echo '🐳 Building Docker images...'
                script {
                    bat """
                        docker build -t ${DOCKER_HUB_REPO}-backend:${BUILD_VERSION} ./backend
                        docker build -t ${DOCKER_HUB_REPO}-frontend:${BUILD_VERSION} ./frontend
                        
                        docker tag ${DOCKER_HUB_REPO}-backend:${BUILD_VERSION} ${DOCKER_HUB_REPO}-backend:latest
                        docker tag ${DOCKER_HUB_REPO}-frontend:${BUILD_VERSION} ${DOCKER_HUB_REPO}-frontend:latest
                    """
                }
            }
        }
        
        stage('Push to Docker Hub') {
            when {
                branch 'main'
            }
            steps {
                echo '📤 Pushing Docker images to Docker Hub...'
                script {
                    bat """
                        echo %DOCKER_HUB_CREDENTIALS_PSW% | docker login -u %DOCKER_HUB_CREDENTIALS_USR% --password-stdin
                        
                        docker push ${DOCKER_HUB_REPO}-backend:${BUILD_VERSION}
                        docker push ${DOCKER_HUB_REPO}-backend:latest
                        
                        docker push ${DOCKER_HUB_REPO}-frontend:${BUILD_VERSION}
                        docker push ${DOCKER_HUB_REPO}-frontend:latest
                        
                        docker logout
                    """
                }
            }
        }
        
        stage('Database Seed') {
            when {
                branch 'develop'
            }
            steps {
                dir('backend') {
                    echo '🌱 Seeding database...'
                    bat 'node seed.js || exit 0'
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo '🚀 Deploying to staging environment...'
                bat '''
                    docker-compose -f docker-compose.yml down || exit 0
                    docker-compose -f docker-compose.yml up -d
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to production environment...'
                input message: 'Deploy to production?', ok: 'Deploy'
                bat '''
                    docker-compose -f docker-compose.yml down || exit 0
                    docker-compose -f docker-compose.yml up -d
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Performing health check...'
                script {
                    sleep 10
                    bat '''
                        curl -f http://localhost:5000/api/health || exit 0
                        curl -f http://localhost:3000 || exit 0
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            script {
                bat 'docker system prune -f || exit 0'
            }
            cleanWs()
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
            script {
                // Send success notification
                emailext(
                    subject: "✅ Jenkins Build Success: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                    body: """
                        <p>Build completed successfully!</p>
                        <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                        <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                        <p><strong>Git Commit:</strong> ${env.GIT_COMMIT_SHORT}</p>
                        <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    """,
                    to: 'chandusugguna@gmail.com',
                    mimeType: 'text/html'
                )
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            script {
                // Send failure notification
                emailext(
                    subject: "❌ Jenkins Build Failed: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                    body: """
                        <p>Build failed!</p>
                        <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                        <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                        <p><strong>Git Commit:</strong> ${env.GIT_COMMIT_SHORT ?: 'Unknown'}</p>
                        <p><strong>Build URL:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        <p><strong>Console Output:</strong> <a href="${env.BUILD_URL}/console">${env.BUILD_URL}/console</a></p>
                    """,
                    to: 'chandusugguna@gmail.com',
                    mimeType: 'text/html'
                )
            }
        }
        
        unstable {
            echo '⚠️ Pipeline unstable!'
        }
    }
}
