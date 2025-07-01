# 🧠 LambdaFlow Execution Engine

The **LambdaFlow Execution Engine** is the core orchestrator that runs workflows node-by-node based on a directed acyclic graph (DAG). It supports per-node Lambda execution, branching, offline mode, and context propagation across the workflow.

---

## 🔄 Core Function: `runFlow()`

The `runFlow()` function orchestrates the entire workflow execution.

### Responsibilities:

- Parses the workflow graph (nodes + edges)
- Identifies start nodes and resolves execution order
- Invokes each node’s logic based on DAG topology
- Propagates input/output and shared context between nodes
- Handles branching (`branches` array) when returned by a node
- Detects termination via `stopFlow` signal
- Stores output and execution results

---

## ⚙️ DAG Execution

Workflows are modeled as a **Directed Acyclic Graph**:

- Nodes represent execution steps
- Edges represent dependencies
- A topological sort determines valid execution order

Each node is executed **only after all its parent nodes have completed**.

---

## 🔁 Branching Support

A node can return a `branches` array like this:

```json
{
  "branches": [{ "region": "us-east-1" }, { "region": "eu-west-1" }]
}
```

## ⚙️ LambdaFlow Execution Engine

The engine will then **fan out and execute** each downstream node **once per branch object**.

- The input to child nodes becomes the **branch object**
- Each branch is processed **independently**
- All results are **merged into a single output array**

---

### 🧩 Node Execution: `executeNode()`

Each node is executed via the `executeNode()` helper.

**Steps:**

1. Resolves `nodeType` → category Lambda function
2. Constructs input by combining:
   - Global input
   - Node static config
   - Outputs of parent nodes
3. If `IS_OFFLINE=true`, dynamically imports the node logic
4. Executes node
5. Wraps output as:

```json
{
  "summary": "Text summary",
  "details": { ...rawResult },
  "output": { ...nextInput },
  "success": true
}
```

### 🧠 Context Propagation

Context is shared across nodes using:

- `globalInput` (from workflow trigger or test)
- `sharedContext` (accumulated outputs of all nodes)
- `previousOutputs` (outputs of immediate parent nodes)

This enables:

- Passing dynamic values between nodes
- Referencing earlier results
- Multi-input aggregation

---

### 🛑 Termination

A node can signal early termination:

```json
{
  "stopFlow": true
}
```

This stops execution of all downstream nodes immediately.

---

### 🧪 Offline Mode

To simulate execution locally:

- Set `IS_OFFLINE=true` in the environment
- The engine dynamically imports the node file via `import()`
- Mimics AWS Lambda behavior
- Allows debugging and testing without deployment

---

### ✅ Output Aggregation

After execution, the engine returns:

```json
{
  "outputs": { "<nodeId>": { ...output } },
  "status": "success",
  "logs": [ ... ],
  "summary": { ... }
}
```

This data is used by the frontend to:

- Show status indicators on nodes
- Display logs and outputs
- Present flow-wide results

---

### 📌 Summary

The **LambdaFlow Execution Engine** is designed for flexible, parallel, and branch-aware flow orchestration. Its **DAG-based logic**, **per-node execution**, **offline simulation**, and **real-time status tracking** make it a robust foundation for automating workflows across a variety of cloud-native tasks.
