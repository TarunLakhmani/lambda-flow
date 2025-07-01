# 🧩 Node System in LambdaFlow

LambdaFlow uses a modular, category-based node system that maps each visual node in the UI to an executable function — typically backed by an AWS Lambda. This document explains how the node system is structured, registered, and executed, along with conventions for developers to create new nodes.

---

## 🗂️ Node Categories

Nodes in LambdaFlow are grouped into functional categories. Each category is associated with a dedicated Lambda function that routes node execution to individual logic files.

**Available Categories:**

- `ai`: AI/ML-related tasks using Bedrock, Comprehend, Rekognition
- `data`: Data filtering, transformation, mapping, and merging
- `file`: File handling, encoding, decoding, conversions
- `control`: Branching, conditional logic, looping, delays
- `notifications`: Slack, Twilio, email notifications
- `integrations`: HTTP/GraphQL requests, CRM, Webhooks
- `triggers`: Event initiators (S3, API Gateway, Schedule, SNS, etc.)
- `utility`: Logging, debugging, math, testing helpers

Each category maps to a Lambda function named like `aiCategory`, `fileCategory`, etc.

---

## 📦 Node File Structure

Nodes are stored in the backend repo under:
`/backend/nodes/<category>/<nodeName>.js`


**Example:**
- `/backend/nodes/ai/summarizeText.js`
- `/backend/nodes/data/filterItems.js`
- `/backend/nodes/file/base64Encode.js`

---

## 🧠 Node Specification

Each node module must export a `handler` function with the following signature:

```js
export async function handler(config, input) {
  // config: static configuration defined by the user
  // input: dynamic input data from parent nodes or global input
  return {
    summary: "One-line result summary",
    details: { ...rawResult },
    output: { ...nextInput },
    success: true,
  };
}
```

### ✅ Required Output Format

Each node must return a JSON object structured as follows:

```json
{
  "summary": "Text summary",
  "details": { "fullResult": "..." },
  "output": { "key": "value" },
  "success": true
}
```

This allows the orchestrator to display meaningful UI updates and pass data downstream.

---

### 🧭 Node Execution Flow

The orchestrator determines the next node to run by collecting:

- Previous node outputs
- Static config from the node
- Global input

It resolves the `nodeType` to:

- Category Lambda → Node handler

The node handler is invoked:

- If deployed: via AWS Lambda
- If local: via dynamic `import()` (offline mode)

The result is:

- Stored as node output
- Used to determine next node(s)

---

### 🔁 Branching Support

If a node returns the following structure:

```json
{
  "branches": [{ "region": "us-west-1" }, { "region": "eu-central-1" }]
}
```

The engine executes downstream nodes once per branch, using each branch object as isolated input.

---

### 🔍 Node Metadata & Frontend Integration

The frontend uses `nodeSpecs.js` to define metadata for each node, including:

- Title and description
- Config fields and input fields
- Tooltips, types, categories, default values

This metadata powers:

- Node config modal
- Validation and type hints
- Input/output schema mapping

---

### ➕ To Add a New Node

1. Create a backend handler in `/nodes/<category>/`
2. Add metadata in `nodeSpecs.js`
3. Test locally with `IS_OFFLINE=true` or deploy via Serverless

---

### 🛠️ Adding a New Node – Example

#### Step 1: Create the handler

```js
// /nodes/utility/toUpperCase.js
export async function handler(config, input) {
  const result = input.text?.toUpperCase() || "";
  return {
    summary: "Converted to uppercase",
    details: { original: input.text, upper: result },
    output: { result },
    success: true,
  };
}
```

### Step 2: Register in `nodeSpecs.js`

```js
toUpperCase: {
  category: "utility",
  description: "Converts text to uppercase",
  configFields: [],
  inputFields: [
    { key: "text", type: "string", description: "Text to convert" }
  ]
}
```

That’s it! The node will appear in the frontend editor and be executable in both offline and deployed modes.

---

### ✅ Summary

The node system in **LambdaFlow** is built for **flexibility**, **modularity**, and **ease of use**. Whether you're creating a simple transformer or a complex ML-powered node, developers can integrate and test quickly using consistent patterns, and users can visually connect nodes to form scalable, cloud-native automations.
