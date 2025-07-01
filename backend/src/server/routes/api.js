// === File: src/server/routes/api.js ===

import express from 'express';
import { runFlow } from '../../core/orchestrator/runFlow.js';
import {
  saveWorkflowToDynamoDB,
  getWorkflowFromDynamoDB, listWorkflowsFromDynamoDB
} from '../../core/store/workflows.js';

import { createScheduleRule } from '../../core/utils/eventBridgeScheduler.js';

const router = express.Router();

/**
 * Execute a workflow directly using provided nodes/edges.
 * Not trigger-based.
 */
router.post('/run-flow', async (req, res) => {
  try {
    const { nodes, edges, input } = req.body;
    const result = await runFlow(nodes, edges, input);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Save workflow to DynamoDB
 */
router.post('/save-workflow/:workflowId', async (req, res) => {
  const { workflowId } = req.params;
  const { nodes, edges } = req.body;

  if (!workflowId || workflowId.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Invalid workflowId (must be at least 3 characters)',
    });
  }

  try {
    await saveWorkflowToDynamoDB(workflowId, nodes, edges);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Load workflow from DynamoDB
 */
router.get('/load-workflow/:workflowId', async (req, res) => {
  const { workflowId } = req.params;

  try {
    const workflow = await getWorkflowFromDynamoDB(workflowId);
    res.json({ success: true, workflow });
  } catch (err) {
    const status = err.message === 'Workflow not found' ? 404 : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

router.get('/list-workflows', async (req, res) => {
  try {
    const workflows = await listWorkflowsFromDynamoDB();
    res.json({ success: true, workflows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/schedule-workflow/:workflowId', async (req, res) => {
  const { workflowId } = req.params;
  const { cron } = req.body;

  if (!cron || !cron.startsWith('cron(')) {
    return res.status(400).json({ success: false, error: 'Invalid cron expression' });
  }

  try {
    const targetUrl = `https://4ebe-103-150-53-176.ngrok-free.app/trigger/schedule/${workflowId}`;
    const result = await createScheduleRule({ workflowId, cronExpression: cron, targetUrl });
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
