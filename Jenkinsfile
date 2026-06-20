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

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t sondd2/shop-backend:latest ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
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
                sh 'docker push sondd2/shop-backend:latest'
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