# Task Management AWS Client

A comprehensive task management application built with AWS cloud services, featuring user authentication, task CRUD operations, file attachments, analytics, and automated email notifications.

## 📋 Project Overview

This project demonstrates a full-stack task management application leveraging multiple AWS services to create a scalable, secure, and feature-rich solution. The application includes:

### Key Features:
- **User Authentication**: Secure sign-up/login with AWS Cognito
- **Task Management**: Full CRUD operations for tasks with priority levels
- **File Attachments**: Upload and manage task-related files via S3
- **Analytics Dashboard**: Visual insights into task completion and priorities
- **Calendar View**: Monthly task overview with due date tracking
- **Email Notifications**: Automated status update notifications via SES
- **Real-time Updates**: Task status changes trigger SQS-based notifications

### AWS Services Used:
- **EC2**: Frontend hosting
- **RDS**: User and task data storage
- **S3**: File attachment storage
- **DynamoDB**: Task metadata storage
- **Lambda**: Serverless backend logic
- **API Gateway**: RESTful API endpoints
- **Cognito**: User authentication and authorization
- **SQS**: Message queuing for notifications
- **SES**: Email notification service
- **VPC**: Network isolation and security

## 🏗️ CloudFormation Templates

The complete AWS infrastructure for this project is available as Infrastructure as Code (IaC) templates:

| Format | File | Description |
|--------|------|-------------|
| **YAML** | [`cloudformation/task-manager-template.yaml`](./cloudformation/task-manager-template.yaml) | Human-readable CloudFormation template |
| **JSON** | [`cloudformation/task-manager-template.json`](./cloudformation/task-manager-template.json) | Machine-readable CloudFormation template |

### Quick Deploy:
```bash
# Deploy using AWS CLI
aws cloudformation create-stack \
  --stack-name task-manager-stack \
  --template-body file://cloudformation/task-manager-template.yaml \
  --capabilities CAPABILITY_IAM
```

## 📹 Video Walkthroughs

| **AWS Console Walkthrough** | **Website Walkthrough** |
|------------------------------|-------------------------|
| [![AWS Console Demo](https://img.shields.io/badge/▶️-AWS%20Console%20Demo-FF9900?style=for-the-badge&logo=amazon-aws)](https://drive.google.com/file/d/1x7kP4g93dNy6AIIJwgzutEc3a0GVkYNi/view?usp=sharing) | [![Website Demo](https://img.shields.io/badge/▶️-Website%20Demo-61DAFB?style=for-the-badge&logo=react)](https://drive.google.com/file/d/1N1_kE7tdh3i6EZBO6vnlTdCoU7jfyp7C/view?usp=sharing) |
| **Complete AWS infrastructure setup** | **End-to-end application features** |
| Shows deployment of all AWS services | Demonstrates user experience & functionality |

---

## 🚀 Getting Started

1. **Clone the repository**
2. **Deploy infrastructure** using the CloudFormation templates above
3. **Follow the AWS Console walkthrough** to understand the setup
4. **Explore the application** using the website walkthrough

For detailed deployment instructions and user guides, refer to the video walkthroughs above.
