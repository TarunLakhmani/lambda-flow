import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Collapse,
  Box,
  Tooltip,
  Typography,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import 'reactflow/dist/style.css';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import API_BASE_URL from '../config';

// Palette
const PRIMARY_COLOR = '#214467';
const ACCENT_COLOR = '#F49837';
const SUCCESS_COLOR = '#2E7D32';
const ERROR_COLOR = '#C62828';

// Styled helpers
const ExpandMore = styled(({ expand, ...other }) => <IconButton size="small" {...other} />)(
  ({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  })
);

const StatusChip = ({ success }) => (
  <Chip
    size="small"
    label={success ? 'Success' : 'Error'}
    sx={{
      backgroundColor: success ? '#E8F5E9' : '#FFEBEE',
      color: success ? SUCCESS_COLOR : ERROR_COLOR,
      fontWeight: 600,
    }}
  />
);

const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(0,0,0,0.2); }
  70%  { box-shadow: 0 0 0 6px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
`;

const StyledHandle = styled(Handle, {
  shouldForwardProp: (prop) => !['portcolor', 'connected'].includes(prop),
})(({ portcolor, connected }) => ({
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '2px solid #FFFFFF',
  background: `radial-gradient(circle at 30% 30%, ${portcolor} 0%, ${portcolor} 60%, #00000040 100%)`,
  cursor: 'crosshair',
  transition: 'transform 120ms ease, box-shadow 120ms ease',
  ...(connected
    ? {
      boxShadow: `0 0 0 2px ${portcolor}80, 0 0 10px ${portcolor}`,
    }
    : {
      animation: `${pulse} 2s infinite`,
      boxShadow: `0 0 0 2px ${portcolor}40`,
      '&:hover': {
        animation: 'none',
        transform: 'scale(1.25)',
        boxShadow: `0 0 0 3px ${portcolor}60, 0 0 10px ${portcolor}`,
      },
    }),
}));

// ————————————————————————————————————————————————————————
// Main component
// ————————————————————————————————————————————————————————
export default function DefaultNode({ data, selected, id, type }) {
  const { label, result, onDelete } = data;
  const [expanded, setExpanded] = useState(false);
  const [executing, setExecuting] = useState(false);
  const nodeType = type || data.type || 'default';

  const isError = result?.success === false;
  const isSuccess = result?.success === true;

  const { getEdges } = useReactFlow();
  const edges = getEdges();
  const hasOutgoing = edges.some((e) => e.source === id);
  const hasIncoming = edges.some((e) => e.target === id);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const payload = {
        nodes: [
          {
            id,
            type: nodeType,
            position: { x: 0, y: 0 },
            data: {
              label: data.label,
              config: data.config || {},
              input: data.input || {},
            },
          },
        ],
        edges: [],
      };
      const res = await axios.post(`${API_BASE_URL}/run-flow`, payload);
      const execResult = res.data?.result?.[id];
      if (execResult) data.result = execResult;
    } catch (err) {
      data.result = {
        success: false,
        summary: 'Execution failed',
        details: err.message,
      };
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: 260 }}>
      {selected && (
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: -26, right: 0, zIndex: 10 }}>
          <Tooltip title="Execute Node">
            <IconButton size="small" sx={{ color: SUCCESS_COLOR }} onClick={handleExecute} disabled={executing}>
              <PlayArrowIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Node">
            <IconButton size="small" sx={{ color: ERROR_COLOR }} onClick={onDelete}>
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      <Card
        variant="outlined"
        sx={{
          position: 'relative',
          borderLeft: `4px solid ${ACCENT_COLOR}`,
          transition: 'transform 150ms ease',
          '&:hover': { transform: 'scale(1.02)' },
          cursor: 'pointer',
          ...(selected && { border: `2px dashed ${PRIMARY_COLOR}` }),
        }}
        onClick={(e) => {
          // Only collapse if the click is outside the expanded output
          const path = e.composedPath?.() || [];
          const isInsideEditor = path.some(el =>
            el?.className?.toString?.().includes?.('monaco-editor')
          );
          if (!isInsideEditor) {
            setExpanded(false);
          }
        }}
      >
        <CardHeader
          sx={{
            py: 1,
            textAlign: 'center',
            '& .MuiCardHeader-content': { overflow: 'hidden' },
          }}
          title={
            <Typography variant="subtitle2" sx={{ color: PRIMARY_COLOR, fontWeight: 700, overflowWrap: 'anywhere' }}>
              {label}
            </Typography>
          }
          action={result && <StatusChip success={isSuccess} />}
        />

        {result && (
          <>
            <Divider />
            <CardContent sx={{ pt: 1, pb: 1.5 }}>
              {result.summary && (
                <Typography variant="caption" sx={{ color: isError ? ERROR_COLOR : SUCCESS_COLOR, fontWeight: 500, pl: 1 }}>
                  {result.summary}
                </Typography>
              )}

              {(result.details || result.output) && (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', mt: 1, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => !prev);
                  }}
                >
                  <Typography variant="body2" sx={{ flexGrow: 1, color: PRIMARY_COLOR }}>
                    View Node Output
                  </Typography>
                  <ExpandMore expand={expanded}>
                    <ExpandMoreIcon fontSize="small" />
                  </ExpandMore>
                </Box>
              )}

              {(result.output || result.details) && (
                <Collapse in={expanded} unmountOnExit>
                  <Box
                    sx={{
                      bgcolor: '#FAFAFA',
                      border: '1px solid #E0E0E0',
                      borderRadius: 1,
                      mt: 1,
                      height: 160,
                      overflow: 'hidden',
                    }}
                  >
                    <MonacoEditor
                      language="json"
                      value={JSON.stringify(result.output ?? result.details ?? {}, null, 2)}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineNumbers: 'off',
                        folding: false,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 10 },
                      }}
                      height="100%"
                    />
                  </Box>
                </Collapse>
              )}

              {type?.endsWith('trigger') &&
                data.type !== 'eventbridgetrrigger' &&
                data.type !== 'scheduletrigger' && (
                  <Box
                    mt={1.5}
                    p={1}
                    bgcolor="#FFF7ED"
                    borderRadius={1}
                    border="1px dashed #FFCC80"
                    fontSize={12}
                    fontFamily="monospace"
                  >
                    <strong>Trigger URL:</strong>
                    <br />
                    <br />POST /trigger/{type.replace('trigger', '')}/{data.workflowId}
                  </Box>
                )}

              {data.type === 'scheduletrigger' && data.config?.cron && (
                <Box
                  mt={1.5}
                  p={1}
                  bgcolor="#E8F5E9"
                  borderRadius={1}
                  border="1px dashed #A5D6A7"
                  fontSize={12}
                  fontFamily="monospace"
                >
                  <strong>🕒 Scheduled Run:</strong>
                  <br />
                  <span style={{ color: SUCCESS_COLOR, fontSize: 13 }}>{data.config.cron}</span>
                </Box>
              )}
            </CardContent>
          </>
        )}

        {!type?.endsWith('trigger') && (
          <StyledHandle type="target" position={Position.Left} portcolor={ACCENT_COLOR} connected={hasIncoming} />
        )}
        <StyledHandle type="source" position={Position.Right} portcolor={PRIMARY_COLOR} connected={hasOutgoing} />
      </Card>
    </Box>
  );
}
