# 🔐 IAM Policy Guide

LambdaFlow uses **modular IAM policies** to ensure each Lambda function has the minimum set of permissions required to perform its task. This follows the principle of **least privilege** and improves security, auditability, and maintainability.

---

## 📂 IAM Policy Structure

IAM policies are organized per **node category**, allowing all nodes within a category (e.g., `ai`, `data`, `file`, `notifications`) to share a single scoped IAM role.

### 📁 Folder Structure

/backend/
├── iam-policies/
│ ├── aiCategory.json
│ ├── dataCategory.json
│ ├── fileCategory.json
│ ├── controlCategory.json
│ ├── utilityCategory.json
│ ├── integrationsCategory.json
│ └── notificationsCategory.json

Each `.json` file contains the policy document for that category.

---

## 📄 Example: `aiCategory.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🏷️ Serverless Framework Integration

IAM policies are linked in `serverless.yml` using the `file()` directive.

---

### 📄 Example Role Declaration

```yaml
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

### 🔗 Assigning Role to Lambda

```yaml
functions:
  aiCategory:
    handler: handler.aiCategory
    role: AiCategoryRole
```

### 🧠 Why Per-Category Roles?

- 🔐 **Security**: Each Lambda function only gets access to what it needs
- 🧩 **Modularity**: Easy to update policies without affecting unrelated nodes
- 🔄 **Reusability**: All nodes of a category share the same role
- 📦 **Separation of concerns**: IAM logic stays clean and organized

---

### ✅ Recommended Best Practices

- Keep policies scoped to specific AWS actions and resources
- Avoid using `"Resource": "*"` unless strictly necessary
- Use multiple policies within a role to group by purpose
- Regularly review and audit IAM permissions
- Prefer specific ARNs over wildcards where possible

---

### 🧪 Local Testing Note

When running in offline mode (`IS_OFFLINE=true`), IAM roles and permissions are **not enforced**.  
However, ensure that local credentials **mimic real AWS access** to avoid surprises during deployment.

---

### 📌 Summary

The IAM strategy in **LambdaFlow** enforces modular, per-category roles for clean separation of privileges.  
Each role is declaratively defined in JSON and wired into the **Serverless Framework** for streamlined deployment.  
This approach makes the platform **secure**, **scalable**, and **easy to maintain**.
