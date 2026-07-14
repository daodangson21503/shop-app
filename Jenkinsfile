pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Install & Build') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npx prisma generate'
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend - Install & Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t sondd2/shop-backend:$BUILD_NUMBER ./backend'
                sh 'docker build -t sondd2/shop-backend:latest ./backend'
                sh 'docker build -t sondd2/shop-frontend:$BUILD_NUMBER ./frontend'
                sh 'docker build -t sondd2/shop-frontend:latest ./frontend'
            }
        }

        stage('Login Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push sondd2/shop-backend:$BUILD_NUMBER'
                sh 'docker push sondd2/shop-backend:latest'
                sh 'docker push sondd2/shop-frontend:$BUILD_NUMBER'
                sh 'docker push sondd2/shop-frontend:latest'
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
    }
}
