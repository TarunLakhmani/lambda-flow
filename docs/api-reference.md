# 📡 API Reference – LambdaFlow Backend

This document provides a detailed reference for the REST API endpoints exposed by the LambdaFlow backend.  
These endpoints are used by the frontend for managing workflows and triggering executions.

---

## 🔐 Authentication

LambdaFlow APIs are currently **unauthenticated** for hackathon/demo purposes.  
In a production setup, you should add an authorizer via **API Gateway** or integrate with **Cognito** or **IAM**.

---

## 📁 Base URL

### For local development:

```
http://localhost:4000/api/
```

### For deployed version (example):

https://0x6mdpe0c7.execute-api.ap-south-1.amazonaws.com/dev/

---

## 📄 Endpoints

---

### 📝 Save Workflow

**POST** `/save-workflow/:workflowId`  
Save a workflow to DynamoDB.

#### Path Parameters:

- `workflowId` – Unique ID for the workflow

#### Request Body:

```json
{
  "nodes": [...],
  "edges": [...]
}
```

#### Response:

```json
{ "message": "Workflow saved successfully." }
```

## 📂 Load Workflow

**GET** `/load-workflow/:workflowId`  
Load an existing workflow.

### Path Parameters

- `workflowId` – ID of the workflow to load

### Response

```json
{
  "workflowId": "sentiment-analysis",
  "nodes": [...],
  "edges": [...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

## 📋 List Workflows

**GET** `/list-workflows`  
List all saved workflows.

### Response

```json
[
  { "workflowId": "image-analysis", "updatedAt": "2025-06-30T18:00:00Z" },
  { "workflowId": "sentiment-analysis", "updatedAt": "2025-06-30T18:05:00Z" }
]
```

## 🚀 Trigger Workflow (API Gateway)

**POST** `/trigger/apigateway/:workflowId`  
Manually trigger a workflow (used in test or real-time automation).

### Path Parameters

- `workflowId` – ID of the workflow to run

### Request Body

```json
{
  "input": {
    "text": "Today is a good day."
  }
}
```

### 📤 Response

```json
{
  "success": true,
  "executionId": "abc123",
  "results": {
    "node1": {
      "summary": "Positive sentiment",
      "output": { "sentiment": "POSITIVE" }
    },
    "node2": {
      ...
    }
  }
}
```

## ⏰ Scheduled Trigger

Scheduled workflows are triggered using **Amazon EventBridge** and follow the same route as API Gateway.

### `serverless.yml` Example

```yaml
functions:
  triggerSchedule:
    handler: triggers/triggerRouter.schedule
    events:
      - schedule: rate(5 minutes)
```

## 🧪 Trigger Flow Locally (Offline Mode)

When `IS_OFFLINE=true`, you can trigger flows locally via:

```bash
curl -X POST http://localhost:4000/trigger/apigateway/test-flow \
  -H "Content-Type: application/json" \
  -d '{ "input": { "text": "Hello world" } }'
```

Useful for local development and debugging.

---

## 🧠 Execution Internals

Each trigger invokes the orchestrator (`runFlow`) which:

- Loads the workflow definition
- Executes each node in **DAG order**
- Collects output (`summary`, `details`, `output`)
- Supports **branching** if a node returns `branches: []`

---

## 📌 Notes

- All payloads are in **JSON**
- Input context is passed **down the workflow chain**
- Results include **success status per node**
- Failures are returned in the node’s `success: false` field

---

## ✅ Summary

LambdaFlow's API is designed for **simplicity** and **modularity**.  
With routes for saving, loading, listing, and triggering workflows, it supports both **frontend integration** and **external automation** use cases like **scheduled jobs** and **webhook-based flows**.
