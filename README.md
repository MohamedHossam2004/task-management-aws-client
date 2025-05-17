## Deployment Steps Summary

1. **Set up AWS Infrastructure and Services**
  - Create VPC
  - Create Subnets
  - Create Internet Gateway
  - Create Route Table
  - Create Security Group
  - Create EC2 Instance
  - Create RDS
  - Create S3 Bucket
  - Create DynamoDB
  - Create SQS Queue
  - Create Lambda Function
  - Create API Gateway
  - Create Cognito User Pool

2. **Set up VPC and Subnets**
  - 10.0.0.0/16 CIDR
  - 2 Public Subnets on us-east-1a and us-east-1b
  - 2 Private Subnets on us-east-1a and us-east-1b
  - 5 Private RDS Subnets on us-east-1a, us-east-1b, us-east-1c, us-east-1d, us-east-1e and us-east-1f
  - Connect Public Subnets to Internet Gateway
  - Connect Private Subnets to S3 Bucket

3. **Set up Security Groups**
  - Security Group to Connect EC2 with RDS
  - Security Group to Connect Lambda with RDS

4. **Set up Frontend**
  - SSH into EC2 Instance
  - Run the following:
    `sudo yum update -y`
    `sudo yum install -y git`
    `sudo yum install -y nodejs`
    `sudo npm create vite@latest task-management-client -- --template react`
    `cd task-management-client`
    `npm start`
  - Configure the frontend

5. **Configure Cognito User Pool and Registration**
  - Create User Pool
  - Create App Client (Application Type: SPA)
  - Add return URLs

6. **Configure User Insertion into RDS**
  - Create PostConfirmation Trigger from Cognito and attach to Lambda Function
  - Add Lambda Function to RDS Private Subnets
  - Add below Roles:
    `AmazonRDSDataFullAccess`
    `AWSLambdaBasicExecutionRole`
  - Add below Policy:
    `{
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": [
                  "ec2:CreateNetworkInterface",
                  "ec2:DescribeNetworkInterfaces",
                  "ec2:DeleteNetworkInterface",
                  "ec2:AssignPrivateIpAddresses",
                  "ec2:UnassignPrivateIpAddresses"
              ],
              "Resource": "*"
          }
      ]
  }`
  - Add code to extract user data from event and insert into RDS

7. **Configure API Gateway**
  - Configure API Gateway Routes and integrate with Lambda Function
  - Configure CORS:
    - Access-Control-Allow-Origin: <ec2-instance-ip>
    - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
    - Access-Control-Allow-Headers: Content-Type, Authorization, X-Amz-Date, X-API-Key, X-Amz-Security-Token, X-Amz-Security-Token

8. **Configure Task Operations with DynamoDB and S3 Bucket**
  - Write Code in Lambda Function to handle different CRUD operations for tasks
  - Use `aws-sdk` to interact with DynamoDB and S3 Bucket
  - If task status updated, send message to SQS with user and task data as meesage body

9. **Configure SQS and SES**
  - Create Lambda trigger for SQS (to forward message to the function)
  - Configure Lambda function to extract data from event and send email to user
  - For development environment ensure that:
    - Sender email is verified in SES
    - Receiver Email is verified in SES
  - For production environment:
    - Contact AWS to configure SES to send emails to any user
