# AWS Lambda Email Sending Setup Guide

## 1. Set Up AWS Lambda

### 1.1 Create a New Lambda Function

1. Log in to the **AWS Management Console**.
2. Navigate to the **AWS Lambda** service.
3. Click **Create function**.
4. **Author from scratch**:
   - **Function name**: `SendEmailFunction`
   - **Runtime**: Node.js 18.x (or latest supported)
   - **Role**:
     - If you already have a role with SES permissions, select it.
     - Otherwise, choose **Create a new role with basic Lambda permissions** (you’ll modify it later for SES).
5. Click **Create Function**.

### 1.2 Add Code to the Lambda Function

1. In the Lambda function editor, replace the default code with the following:

   ```javascript
   const AWS = require('aws-sdk');

   // Configure AWS SES
   AWS.config.update({ region: 'us-east-2' }); // Replace with your SES region

   const ses = new AWS.SES({ apiVersion: '2010-12-01' });

   exports.handler = async (event) => {
       try {
           // Parse the event body
           const { toEmail, subject, message } = JSON.parse(event.body);

           // Set up email parameters
           const params = {
               Source: 'your-verified-email@example.com', // Replace with your SES verified email
               Destination: {
                   ToAddresses: [toEmail],
               },
               Message: {
                   Subject: {
                       Data: subject,
                       Charset: 'UTF-8',
                   },
                   Body: {
                       Text: {
                           Data: message,
                           Charset: 'UTF-8',
                       },
                   },
               },
           };

           // Send email
           const result = await ses.sendEmail(params).promise();
           console.log('Email sent successfully:', result);

           return {
               statusCode: 200,
               body: JSON.stringify({ message: 'Email sent successfully.' }),
           };
       } catch (error) {
           console.error('Error sending email:', error);
           return {
               statusCode: 500,
               body: JSON.stringify({ error: 'Failed to send email.' }),
           };
       }
   };
   ```

2. Replace `your-verified-email@example.com` with a verified email from your AWS SES account.
3. Click **Deploy**.

### 1.3 Add SES Permissions to Lambda's IAM Role

1. Go to the **IAM Console** → **Roles**.
2. Find the IAM role associated with your Lambda function.
3. Click **Add permissions** → **Attach policies**.
4. Attach the `AmazonSESFullAccess` policy (or create and attach a custom policy with more restricted access).

## 2. Set Up AWS SES

### 2.1 Verify an Email Address

1. Go to the **AWS SES Console**.
2. Click **Email Addresses** → **Verify a New Email Address**.
3. Enter the email address you want to use as the sender (**Source**) and click **Verify**.
4. Check your inbox and click the verification link in the email.

### 2.2 Move SES Out of Sandbox Mode

By default, SES accounts are in sandbox mode, meaning you can only send emails to verified addresses. To move out of sandbox mode:

1. Open the **AWS Support Center**.
2. Create a **Service Limit Increase** request.
3. Select **SES Sending Limits** and request production access.

## 3. Set Up API Gateway

### 3.1 Create a New API

1. Go to the **AWS API Gateway Console**.
2. Click **Create API** → Choose **HTTP API**.
3. Click **Build**:
   - **Name**: `SendEmailAPI`

### 3.2 Add a POST Route

1. Under **Routes**, click **Create**:
   - **Method**: `POST`
   - **Resource path**: `/send-email`
2. Under **Integration**, choose **Lambda Function**.
3. Select your `SendEmailFunction`.

### 3.3 Deploy the API

1. Go to **Deployments** → **Deploy API**.
2. Choose **Default Stage**.
3. Copy the **Invoke URL** (e.g., `https://xyz123.execute-api.us-east-2.amazonaws.com/send-email`).

You can now use this endpoint to send emails via your Lambda function and SES!
