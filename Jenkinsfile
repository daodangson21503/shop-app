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

        stage('Build Backend') {
            steps {
                sh 'docker build -t sondd2/shop-backend:$BUILD_NUMBER ./backend'
                sh 'docker tag sondd2/shop-backend:$BUILD_NUMBER sondd2/shop-backend:latest'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t sondd2/shop-frontend:$BUILD_NUMBER ./frontend'
                sh 'docker tag sondd2/shop-frontend:$BUILD_NUMBER sondd2/shop-frontend:latest'
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
