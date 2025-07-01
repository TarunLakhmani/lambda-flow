import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import ReactFlow, {
    addEdge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { nodeTypes } from '../utils/nodeTypes';
import ConfigModal from '../components/ConfigModal';
import BottomButtons from '../components/BottomButtons';
import LoadWorkflowModal from '../components/LoadWorkflowModal';
import API_BASE_URL from '../config';

const initialNodes = [];
const initialEdges = [];

function BuilderInner() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [result, setResult] = useState(null);
    const [logsOpen, setLogsOpen] = useState(false);
    const [workflowId, setWorkflowId] = useState('demo-flow');
    const [loadingAction, setLoadingAction] = useState(null);
    const { project } = useReactFlow();

    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    workflowId,
                },
            }))
        );
    }, [workflowId, setNodes]); // ✅ include setNodes

    const handleDeleteNode = useCallback((id) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        if (selectedNode?.id === id) {
            setSelectedNode(null);
        }
    }, [setNodes, setEdges, selectedNode]);

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: 'smoothstep',
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#333',
                        },
                    },
                    eds
                )
            ),
        [setEdges]
    );

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
    }, []);

    const updateNodeConfig = (id, config, input) => {
        setNodes((nds) =>
            nds.map((n) =>
                n.id === id
                    ? {
                        ...n,
                        data: {
                            ...n.data,
                            config,
                            input,
                            workflowId,
                            onDelete: () => handleDeleteNode(id),
                        },
                    }
                    : n
            )
        );
        setSelectedNode(null);
    };

    const handleReset = () => {
        setNodes([]);
        setEdges([]);
    };

    const handleSave = () => {
        const dataStr = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflow.json';
        a.click();
    };

    const handleRun = async () => {
        setLoadingAction('deploy');
        setResult(null);
        if (!workflowId || workflowId.trim().length < 3) {
            alert('Please enter a valid workflow ID (at least 3 characters)');
            setLoadingAction(null);
            return;
        }
        try {
            const cleanNodes = nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    result: undefined,
                },
            }));
            await axios.post(`${API_BASE_URL}/save-workflow/${workflowId}`, {
                nodes: cleanNodes,
                edges,
            });
            const res = await axios.post(`${API_BASE_URL}/run-flow`, {
                nodes: cleanNodes,
                edges,
            });

            const scheduleNode = nodes.find((n) => n.type === 'scheduletrigger');
            if (scheduleNode?.data?.config?.cron) {
                await axios.post(`${API_BASE_URL}/schedule-workflow/${workflowId}`, {
                    cron: scheduleNode.data.config.cron,
                });
            }

            const result = res.data.result;
            setResult(result);

            setNodes((nodes) =>
                nodes.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        result: result[node.id] || null,
                    },
                }))
            );
        } catch (e) {
            alert('Error: ' + e.message);
        }
        setLoadingAction(null);
    };

    const handleTest = async () => {
        setLoadingAction('test');
        setResult(null);
        if (!workflowId || workflowId.trim().length < 3) {
            alert('Please enter a valid workflow ID (at least 3 characters)');
            setLoadingAction(null);
            return;
        }
        try {
            const cleanNodes = nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    result: undefined,
                },
            }));
            const res = await axios.post(`${API_BASE_URL}/run-flow`, {
                nodes: cleanNodes,
                edges,
            });
            const result = res.data.result;
            setResult(result);

            setNodes((nodes) =>
                nodes.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        result: result[node.id] || null,
                    },
                }))
            );
        } catch (e) {
            alert('Error: ' + e.message);
        }
        setLoadingAction(null);
    };

    const handleLoad = () => setShowLoadModal(true);

    const loadWorkflowById = async (workflowId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/load-workflow/${workflowId}`);
            const { nodes, edges } = res.data.workflow;

            const updatedNodes = nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    onDelete: () => handleDeleteNode(node.id),
                    workflowId,
                },
            }));
            setNodes(updatedNodes);
            setEdges(edges);
            setShowLoadModal(false);
            setWorkflowId(workflowId);
        } catch (err) {
            alert('Failed to load workflow');
            setShowLoadModal(false);
        }
    };

    const handleUpload = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data.nodes && data.edges) {
                        const updatedNodes = data.nodes.map((node) => ({
                            ...node,
                            data: {
                                ...node.data,
                                onDelete: () => handleDeleteNode(node.id),
                            },
                        }));
                        setNodes(updatedNodes);
                        setEdges(data.edges);
                    }
                } catch (err) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            if (!data || !data.label) return;

            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const id = uuidv4();
            const newNode = {
                id,
                type: data.type || 'default',
                position,
                data: {
                    label: data.label,
                    type: data.type,
                    config: {},
                    onDelete: () => handleDeleteNode(id),
                    workflowId,
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [project, setNodes, handleDeleteNode, workflowId] // ✅ include missing dependencies
    );

    return (
        <div
            style={{
                flexGrow: 1,
                border: '1px solid #ccc',
                boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
                backgroundColor: '#fdfdfd',
                padding: '8px',
            }}
        >
            <BottomButtons
                onReset={handleReset}
                onSave={handleSave}
                onUpload={handleUpload}
                onLoad={handleLoad}
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                result={result}
                handleRun={handleRun}
                loadingAction={loadingAction}
                logsOpen={logsOpen}
                workflowId={workflowId}
                setWorkflowId={setWorkflowId}
                setLogsOpen={setLogsOpen}
                handleTest={handleTest}
            />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={onNodeClick}
                nodeTypes={nodeTypes}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodesDraggable
                nodesConnectable
                elementsSelectable
                selectionOnDrag
                snapToGrid
                snapGrid={[15, 15]}
                panOnScroll
                panOnDrag
                zoomOnScroll
            >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>

            {selectedNode !== null && (
                <ConfigModal
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    onSave={updateNodeConfig}
                />
            )}
            <LoadWorkflowModal
                open={showLoadModal}
                onClose={() => setShowLoadModal(false)}
                onSelect={loadWorkflowById}
            />
        </div>
    );
}

export default function Builder() {
    return (
        <ReactFlowProvider>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <BuilderInner />
            </div>
        </ReactFlowProvider>
    );
}
