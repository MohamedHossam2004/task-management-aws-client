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
      - `sudo yum update -y`
      - `sudo yum install -y git`
      - `sudo yum install -y nodejs`
      - `sudo npm create vite@latest task-management-client -- --template react`
      - `cd task-management-client`
      - `npm start`
    - Configure the frontend

5. **Configure Cognito User Pool and Registration**
    - Create User Pool
    - Create App Client (Application Type: SPA)
    - Add return URLs

6. **Configure User Insertion into RDS**
    - Create PostConfirmation Trigger from Cognito and attach to Lambda Function
    - Add Lambda Function to RDS Private Subnets
    - Add below Roles:
      - `AmazonRDSDataFullAccess`
      - `AWSLambdaBasicExecutionRole`
    - Add below Policy:
      - `{
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

---

## User Guide 
#### 1. **Sign-Up and Login Process**

* **Sign-Up**: If you are a new user, sign up by providing your email, phone number, and other details like name and password.
* **Login**: Once signed up, you can log in using your credentials to access the task manager system.
<img width="1630" alt="Screenshot 2025-05-17 at 10 41 27 PM" src="https://github.com/user-attachments/assets/b846c4cb-42e6-4bba-adc3-20f82f22b264" />

---

#### 2. **Creating a Task**

* **Title**: Enter a clear title for your task (e.g., "Assignment 2 Cloud").
* **Description**: Provide more details regarding the task.
* **Status**: Choose between "Pending," "In Progress," or "Completed."
* **Priority**: Set the priority level to low, medium, or high.
* **Due Date**: Select the due date for the task.
* **Attachments**: Attach relevant files to tasks to ensure all necessary resources are available (e.g., PDF, Word documents).
<img width="1632" alt="Screenshot 2025-05-17 at 10 43 06 PM" src="https://github.com/user-attachments/assets/4970fd88-76a4-4e12-853b-7b37cd1d83c8" />
<img width="1634" alt="Screenshot 2025-05-17 at 10 44 44 PM" src="https://github.com/user-attachments/assets/9a67e06c-7adb-4ce8-87e8-7e21b379b289" />

---

#### 3. **Viewing and Updating Tasks** 

* **View Task**: You can view the details of a task by selecting it from the list. This shows the title, description, priority, due date, and attachment.
* **Edit Task**: You can update any task by clicking the edit button to modify details such as priority, description, status, or due date.
<img width="1634" alt="Screenshot 2025-05-17 at 10 45 31 PM" src="https://github.com/user-attachments/assets/07b9c5be-9899-4817-90a7-093559554cb9" />
<img width="1641" alt="Screenshot 2025-05-17 at 10 45 40 PM" src="https://github.com/user-attachments/assets/25986900-53fb-467a-9a5b-4abcf021f265" />
<img width="1636" alt="Screenshot 2025-05-17 at 10 46 03 PM" src="https://github.com/user-attachments/assets/e4c2ad9a-bef1-4662-9532-ccb2affccf1a" />
<img width="1635" alt="Screenshot 2025-05-17 at 10 46 11 PM" src="https://github.com/user-attachments/assets/30c2398b-4ce8-4a0f-acce-16ab175e014a" />

---

#### 4. **Task Analytics**

* **Analytics Page**: The analytics page gives you insights into your tasks, including their completion statuses, priorities, and deadlines. It helps track your progress over time and make informed decisions about workload distribution.

<img width="1639" alt="Screenshot 2025-05-17 at 10 46 24 PM" src="https://github.com/user-attachments/assets/c7f0b77a-d147-4587-a89f-af2d7f90cbda" />

---
#### 5. **Task Calendar**
* **Monthly View**: The calendar displays tasks for each day of the month, allowing you to easily spot upcoming deadlines.
* **Task Assignment**: Each task with a set due date will appear on the calendar, marked clearly with its name and due date.
* **Clickable Tasks**: Clicking on a task within the calendar will open its details, where you can view or update the task information, such as status, description, or priority.
* **Quick Navigation**: You can navigate between months to view tasks in the upcoming weeks or months.
   
<img width="1636" alt="Screenshot 2025-05-17 at 10 46 17 PM" src="https://github.com/user-attachments/assets/b7b8028b-36ee-47b3-a0eb-ab0b5a23ccc3" />
