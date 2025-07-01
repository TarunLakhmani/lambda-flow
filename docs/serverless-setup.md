# 🚀 Serverless Setup Guide

LambdaFlow uses the **Serverless Framework** with **esbuild** to deploy a modular, efficient, and production-grade serverless backend on AWS.

This guide outlines how to configure, deploy, and manage the Lambda functions that power LambdaFlow’s backend.

---

## 📦 Tools & Technologies

- **Serverless Framework** – Infrastructure-as-Code to define and deploy Lambda functions and resources
- **serverless-esbuild** – Fast bundler with native support for ES Modules
- **AWS Lambda** – Stateless compute engine for running per-node logic
- **IAM Roles** – Scoped permission sets per function category
- **DynamoDB** – Stores workflow definitions
- **Event sources** – API Gateway, EventBridge, S3, SNS, DynamoDB, Schedule

---

## 📁 Folder Structure

/backend/
├── handler.js # Entry point for category Lambda functions
├── orchestrator/
│ └── runFlow.js # DAG execution engine
├── executor/
│ └── executeNode.js # Node-level Lambda routing
├── nodes/
│ └── <category>/<node>.js # Individual node implementations
├── triggers/
│ └── triggerRouter.js # Trigger entrypoint
├── iam-policies/
│ └── <category>.json # IAM permissions per node category
├── serverless.yml # Main deployment config
└── ...

---

## 🧱 Key Serverless Concepts

### Functions

Each major node category (e.g., `ai`, `file`, `data`) is deployed as a separate Lambda function to support per-category routing and IAM scoping.

```yaml
functions:
  aiCategory:
    handler: handler.aiCategory
    role: AiCategoryRole
    timeout: 30
    memorySize: 1024
    environment:
      NODE_ENV: production
```

### Triggers

Event-based trigger functions are exposed separately for automation entrypoints:

```yaml
functions:
  triggerApiGateway:
    handler: triggers/triggerRouter.apiGateway
    events:
      - http:
          path: trigger/apigateway/{workflowId}
          method: post

  triggerSchedule:
    handler: triggers/triggerRouter.schedule
    events:
      - schedule: rate(5 minutes)
```

### 🔐 IAM Roles

Each function category has its own scoped IAM role defined via JSON in `iam-policies/`.

```yaml
resources:
  Resources:
    AiCategoryRole:
      Type: AWS::IAM::Role
      Properties:
        RoleName: ai-category-role
        AssumeRolePolicyDocument:
          Statement:
            - Effect: Allow
              Principal:
                Service: lambda.amazonaws.com
              Action: sts:AssumeRole
        Policies:
          - PolicyName: ai-category-policy
            PolicyDocument: ${file(./iam-policies/aiCategory.json)}
```

### ⚙️ ESBuild Configuration

Serverless uses `serverless-esbuild` to bundle ES Modules quickly:

```yaml
plugins:
  - serverless-esbuild

custom:
  esbuild:
    bundle: true
    format: esm
    target: node20
    platform: node
    sourcemap: true
    external: []
    concurrency: 10
```

This ensures compatibility with `"type": "module"` and enables fast deploys.

---

### 🌐 Environment Variables

Common environment variables defined under each function:

```yaml
environment:
  IS_OFFLINE: ${env:IS_OFFLINE, 'false'}
  WORKFLOWS_TABLE: LambdaFlowWorkflows
```

See [`env-vars.md`](./env-vars.md) for the complete list.

---

### 📤 Deploying to AWS

#### Prerequisites

- AWS credentials configured via `aws configure`
- Serverless Framework installed globally:

```bash
npm install -g serverless
```

### 🛠️ Commands

```bash
# Deploy all functions
sls deploy

# Deploy a single function
sls deploy function -f aiCategory

# Invoke function locally
sls invoke local -f aiCategory --path event.json
```

### ✅ Summary

LambdaFlow’s serverless backend is built with **clean modularity** in mind — each function maps to a category, with its own **IAM policy** and **deployable handler**.  
**Serverless Framework** and **esbuild** make it easy to manage, deploy, and scale cloud-native workflows on AWS.
