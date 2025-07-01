// === File: src/server/routes/trigger.js ===
import express from 'express';
import { getWorkflowFromDynamoDB } from '../../core/store/workflows.js';
import { runFlow } from '../../core/orchestrator/runFlow.js';

const router = express.Router();

const runTriggeredFlow = (workflowId, triggerType, triggerInput, expectedNodeType) => async () => {
  console.log(`\n🚀 Triggered via ${triggerType} for workflow: ${workflowId}`);
  const { nodes, edges } = await getWorkflowFromDynamoDB(workflowId);
  const triggerNode = nodes.find((n) => n.type === expectedNodeType);
  if (!triggerNode) throw new Error(`${triggerType} trigger node not found`);
  return await runFlow(nodes, edges, triggerInput, triggerNode.id);
}


const handleTrigger = (expectedNodeType) => async (req, res) => {
  const { workflowId } = req.params;
  const input = req.body;

  if (!workflowId) return res.status(400).json({ success: false, error: 'Missing workflowId' });

  try {
    const result = await runTriggeredFlow(workflowId, expectedNodeType, input, expectedNodeType);
    res.json({ success: true, result });
  } catch (err) {
    console.error(`❌ Trigger error for ${workflowId}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

router.post('/apigateway/:workflowId', handleTrigger('apigatewaytrigger'));
router.post('/schedule/:workflowId', handleTrigger('scheduletrigger'));
router.post('/eventbridge/:workflowId', handleTrigger('eventbridgetrigger'));
router.post('/sns/:workflowId', handleTrigger('snstrigger'));
router.post('/s3/:workflowId', handleTrigger('s3trigger'));
router.post('/dynamodb/:workflowId', handleTrigger('dynamodbtrigger'));

export default router;