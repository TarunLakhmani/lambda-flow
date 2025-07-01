# 🎨 Frontend Structure – LambdaFlow

The LambdaFlow frontend is built with **React**, powered by **React Flow** for node-based visual editing, and styled using **Material UI (MUI)**. It enables users to visually construct, configure, test, and run cloud workflows without writing code.

---

## 🧱 Tech Stack

- **React** – Component-based UI framework
- **React Flow** – Visual editor for workflows (nodes + edges)
- **Material UI (MUI)** – UI component library
- **Axios** – API communication
- **zustand** – Lightweight state management
- **uuid** – Unique node ID generation

---

## 📁 Folder Structure

/frontend/
├── src/
│ ├── App.js
│ ├── index.js
│ ├── api/ # API wrappers (save, load, trigger)
│ ├── assets/ # Images, icons, logos
│ ├── components/
│ │ ├── FlowEditor.js # Main visual editor (React Flow canvas)
│ │ ├── NodePanel.js # Draggable node list
│ │ ├── ConfigModal.js # Modal to configure a node
│ │ ├── TriggerTestPanel.js # Trigger testing UI
│ │ ├── RunStatusPanel.js # Execution logs and output summary
│ │ ├── WorkflowListModal.js # Modal for loading workflows
│ ├── context/ # Global state store (zustand)
│ ├── hooks/ # Custom React hooks
│ ├── nodeSpecs.js # Node metadata (titles, config, types)
│ ├── utils/ # Utility functions (DAG ops, schema validation)
│ └── styles/ # Custom theme overrides and CSS

---

## 🧩 Key Components

### 1. `FlowEditor.js`

- Visual workflow canvas powered by React Flow
- Manages nodes, edges, zooming, drag-and-drop
- Connects all functional UI panels

### 2. `NodePanel.js`

- Displays categorized node types (AI, File, Control, etc.)
- Drag to canvas to create a node

### 3. `ConfigModal.js`

- Pops up when a node is clicked
- Pulls schema from `nodeSpecs.js`
- Allows configuration of static inputs and field types

### 4. `RunStatusPanel.js`

- Displays output status per node: ✅ success / ❌ error
- Shows:
  - `summary` (1-line result)
  - `details` (full raw result)
  - `output` (JSON passed downstream)

### 5. `TriggerTestPanel.js`

- Enables manual triggering of workflows using dummy input
- Supports API Gateway, Schedule, EventBridge, etc.

### 6. `WorkflowListModal.js`

- Lists all saved workflows
- Pulls from DynamoDB via `GET /list-workflows`
- Allows selecting and loading into canvas

---

## 📦 `nodeSpecs.js` – Node Metadata

Defines specs for all nodes:

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

**Used for:**

- Modal configuration form rendering
- Type hints and validation
- Node panel display and search

---

### 🔁 State Management

Uses **zustand** to manage global workflow state:

- `nodes`, `edges`
- `selectedNode`
- `workflowId`
- `isRunning`, `runResults`, `runLogs`

Local state is **decoupled from the backend** and persisted via API.

---

### 🌐 API Integration

Defined in `/api/` folder and wired to backend routes:

| Action              | Endpoint                               |
| ------------------- | -------------------------------------- |
| Save workflow       | `POST /save-workflow/:workflowId`      |
| Load workflow       | `GET /load-workflow/:workflowId`       |
| List workflows      | `GET /list-workflows`                  |
| Trigger flow (test) | `POST /trigger/apigateway/:workflowId` |

---

### 🧪 Dev Setup

```bash
cd frontend/
npm install
npm start
```

Runs at: [http://localhost:3000](http://localhost:3000)

You can test with dummy workflows or connect to a live backend.

---

### 🧠 UX Principles

- Drag-and-drop first
- Minimal configuration required
- Expandable detail for power users
- JSON-based node input/output
- Status badges for execution clarity

---

### ✅ Summary

The **LambdaFlow frontend** provides a smooth and powerful UX for building cloud workflows.  
With a clean visual editor, dynamic config modals, and live output tracking — it bridges the gap between **low-code usability** and **AWS Lambda power**.
