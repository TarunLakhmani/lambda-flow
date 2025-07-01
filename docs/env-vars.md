# 🔧 Environment Variables – LambdaFlow

This document outlines the key environment variables used across LambdaFlow's backend and frontend. These variables control behavior such as local development, deployment configuration, and service integrations.

---

## 🧪 Backend – Node.js (AWS Lambda)

| Variable           | Required | Description                                                                                     |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| `IS_OFFLINE`       | No       | Set to `true` during local development to enable dynamic import instead of invoking real Lambda |
| `REGION`           | Yes      | AWS region (e.g., `ap-south-1`) used for service clients                                        |
| `DYNAMODB_TABLE`   | Yes      | Name of the DynamoDB table for storing workflows                                                |
| `LOG_LEVEL`        | No       | Controls logging verbosity (`info`, `debug`, `error`)                                           |
| `S3_BUCKET_NAME`   | Optional | Used by file upload/download nodes                                                              |
| `BEDROCK_MODEL_ID` | Optional | Bedrock model ID used in AI nodes (e.g., `anthropic.claude-3-sonnet-20240229-v1:0`)             |
| `BEDROCK_REGION`   | Optional | Region used for Amazon Bedrock if different from main `REGION`                                  |

---

## 🌐 Frontend – React

| Variable            | Required | Description                                                                             |
| ------------------- | -------- | --------------------------------------------------------------------------------------- |
| `REACT_APP_API_URL` | Yes      | Base URL for backend API (e.g., `https://xyz.execute-api.ap-south-1.amazonaws.com/dev`) |
| `REACT_APP_ENV`     | No       | Custom flag to distinguish between `development`, `staging`, and `production` modes     |

---

## 🛠️ Local Setup (.env)

Example `.env` for local development:

```env
IS_OFFLINE=true
REGION=ap-south-1
DYNAMODB_TABLE=LambdaFlowWorkflows
LOG_LEVEL=debug
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_REGION=us-east-1
```

# 🌐 Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development
```

> 💡 **Tip:** All secrets and production-specific values should be managed using **AWS SSM Parameter Store** or **AWS Secrets Manager**.

---

## ✅ Summary

LambdaFlow supports clean configuration via environment variables,  
making it easy to switch between **local** and **cloud** environments.
