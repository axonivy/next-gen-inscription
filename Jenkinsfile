pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '5'))
  }

  triggers {
    cron '@midnight'
  }

  stages {
    stage('Client') {
      steps {
        script {
          dir ('client') {
            // https://github.com/eclipse-glsp/glsp/blob/master/docker/ci/alpine/Dockerfile
            docker.build('eclipseglsp/ci:alpine').inside {
              sh 'yarn ci'
            }
          }
          archiveArtifacts artifacts: '**/integrations/standalone/build/**', allowEmptyArchive: true
          recordIssues enabledForFailure: true, publishAllIssues: true, aggregatingResults: true, tools: [esLint(pattern: '**/node_modules/**/eslint.xml')], qualityGates: [[threshold: 1, type: 'TOTAL', unstable: true]]
          withChecks('Client Tests') {
            junit testDataPublishers: [[$class: 'AttachmentPublisher'], [$class: 'StabilityTestDataPublisher']], testResults: '**/node_modules/**/junit.xml'
          }
        }
      }
    }
    stage('Integration Tests') {
      steps {
        script {
          dir ('client') {
            docker.image('mcr.microsoft.com/playwright:v1.28.1').inside {
              sh 'yarn standalone webtest:ci'
            }
          }
          archiveArtifacts artifacts: '**/standalone/test-results/**', allowEmptyArchive: true
          withChecks('Integration Tests') {
            junit testDataPublishers: [[$class: 'AttachmentPublisher'], [$class: 'StabilityTestDataPublisher']], testResults: '**/node_modules/**/report.xml'
          }
        }
      }
    }
    stage('Server') {
      steps {
        script {
          dir ('server') {
            docker.image('maven:3.8.6-eclipse-temurin-17').inside {
              maven cmd: 'clean verify'
            }
          }
          withChecks('Server Tests') {
            junit testDataPublishers: [[$class: 'AttachmentPublisher'], [$class: 'StabilityTestDataPublisher']], testResults: '**/target/surefire-reports/**/*.xml'
          }
        }
      }
    }
  }
}
