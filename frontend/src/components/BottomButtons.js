// === File: src/components/BottomButtons.js ===

import React, { useState, useMemo } from 'react';
import {
  Box, Button, CircularProgress, Stack, Typography, Drawer,
  IconButton, Divider, Paper, TextField, InputAdornment,
  Tooltip
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/UploadFile';
import CloudIcon from '@mui/icons-material/Cloud';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataGrid } from '@mui/x-data-grid';
import API_BASE_URL from '../config';
import MonacoEditor from '@monaco-editor/react';

const PRIMARY_COLOR = '#214467';
const ACCENT_COLOR = '#F49837';

export default function BottomButtons({
  onReset,
  onSave,
  onLoad,
  onUpload,
  workflowId,
  nodes,
  result,
  handleRun,
  handleTest,
  loadingAction,
  logsOpen,
  setWorkflowId,
  setLogsOpen,
}) {
  // eslint-disable-next-line
  const [copiedText, setCopiedText] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');

  /* —— helpers —— */
  const enrichedLogs = nodes.map((n) => {
    const log = result?.[n.id] || {};
    return {
      nodeId: n.id,
      label: n.data.label || n.type,
      ...log,
    };
  });
  const filteredLogs = useMemo(() => {
    if (!search) return enrichedLogs;
    return enrichedLogs.filter(l =>
      JSON.stringify(l, null, 2).toLowerCase().includes(search.toLowerCase())
    );
  }, [search, enrichedLogs]);

  const downloadJson = () => {
    const blob = new Blob(
      [JSON.stringify(enrichedLogs, null, 2)],
      { type: 'application/json' }
    );
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `execution-logs-${Date.now()}.json`;
    link.click();
  };

  const copyJson = () => handleCopy(JSON.stringify(enrichedLogs, null, 2));


  /* — Renderers — */
  const renderList = () => (
    <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100% - 200px)' }}>
      {filteredLogs.map((log) => (
        <Paper key={log.nodeId} elevation={1}
          sx={{
            p: 2, mb: 2, borderRadius: 2,
            borderLeft: `4px solid ${ACCENT_COLOR}`
          }}>
          <Typography variant="subtitle2" sx={{ color: PRIMARY_COLOR, fontWeight: 600 }}>
            {log.label}{' '}
            <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              ({log.nodeId})
            </Typography>
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1, color: '#333' }}>
            {JSON.stringify(log.output ?? log.details ?? {}, null, 2)}
          </Typography>
        </Paper>
      ))}
    </Box>
  );

const renderPretty = () => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      borderRadius: 2,
      height: 'calc(100vh - 180px)', // full height minus drawer header + spacing
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Box sx={{ flex: 1 }}>
      <MonacoEditor
        language="json"
        value={JSON.stringify(filteredLogs, null, 2)}
        height="100%"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          fontSize: 12,
          lineNumbers: 'off',
          folding: false,
          glyphMargin: false,
          padding: { top: 10 },
        }}
      />
    </Box>
  </Paper>
);


  const renderTable = () => {
    if (!filteredLogs.length) return null;
    const rows = filteredLogs.map((r, i) => ({ id: i, ...r }));
    const cols = Object.keys(rows[0]).filter(k => k !== 'id').map(k => ({
      field: k, headerName: k.toUpperCase(), flex: 1, minWidth: 120,
      renderCell: ({ value }) => (
        <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.2 }}>
          {typeof value === 'object' ? JSON.stringify(value, null, 0) : String(value)}
        </Typography>
      )
    }));
    return (
      <DataGrid
        rows={rows}
        columns={cols}
        autoHeight
        density="compact"
        sx={{ maxHeight: 'calc(100% - 200px)', border: 0 }}
      />
    );
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };



  return (
    <>
      {/* Workflow Controls: Workflow ID, Deploy, View Logs */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 30,
          backgroundColor: '#ffffff',
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          zIndex: 1,
          border: '1px solid #e0e0e0',
          width: 240,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: PRIMARY_COLOR,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 0.5,
          }}
        >
          Workflow ID
        </Typography>

        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={workflowId}
          onChange={(e) => setWorkflowId(e.target.value)}
          placeholder="e.g. data-pipeline"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountTreeIcon sx={{ color: PRIMARY_COLOR }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: PRIMARY_COLOR,
              },
              '&:hover fieldset': {
                borderColor: ACCENT_COLOR,
              },
              '&.Mui-focused fieldset': {
                borderColor: ACCENT_COLOR,
              },
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, mb: result ? 1 : 0 }}>
          <Button
            onClick={handleTest}
            variant="outlined"
            startIcon={
              loadingAction === "test" ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PlayArrowIcon />
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              flex: 1,
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              backgroundColor: '#fff',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#94a3b8',
              },
            }}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'test' ? 'Running' : 'Test'}
          </Button>

          <Button
            onClick={handleRun}
            variant="contained"
            startIcon={
              loadingAction === 'deploy' ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <RocketLaunchIcon />
              )
            }
            disabled={loadingAction !== null}
            sx={{
              backgroundColor: ACCENT_COLOR,
              '&:hover': { backgroundColor: '#FB871B' },
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 2,
              flex: 1,
            }}
          >
            {loadingAction === 'deploy' ? 'Running' : 'Deploy'}
          </Button>
        </Box>

        {result && (
          <Button
            onClick={() => setLogsOpen(true)}
            startIcon={<ListAltIcon />}
            fullWidth
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: '#cbd5e1',
              color: '#374151',
              backgroundColor: '#fff',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#94a3b8',
              },
            }}
          >
            View Logs
          </Button>
        )}
      </Box>

      {/* Trigger URL Info - Moved to Bottom Right */}
      {nodes.some((n) => n.type?.endsWith('trigger')) && (
        <Box
          sx={{
            position: 'fixed',

            top: 80,
            right: 30,
            backgroundColor: '#ffffff',
            padding: 2,
            borderRadius: 2,
            zIndex: 1,
            maxWidth: 400,
            borderLeft: `4px solid #F49837`,
            border: '1px solid #21446720',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: '#214467',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 1,
            }}
          >
            📡 Trigger URL
          </Typography>

          {nodes
            .filter((n) => n.type?.endsWith('trigger'))
            .map((n) => {
              if (n.type === 'scheduletrigger' && n.data?.config?.cron) {
                return (
                  <Box
                    key={n.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#f0fdf4',
                      border: '1px solid #c8e6c9',
                      borderLeft: `3px solid #66bb6a`,
                      borderRadius: 1,
                      px: 1.2,
                      py: 0.8,
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Roboto Mono, monospace',
                        fontSize: 12,
                        color: '#2e7d32',
                        wordBreak: 'break-word',
                        flexGrow: 1,
                      }}
                    >
                      ⏰ Cron: {n.data.config.cron}
                    </Typography>
                  </Box>
                );
              }

              const url = `${API_BASE_URL}/trigger/${n.type.replace('trigger', '')}/${workflowId}`;
              return (
                <Box
                  key={n.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderLeft: `3px solid #F49837`,
                    borderRadius: 1,
                    px: 1.2,
                    py: 0.8,
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Roboto Mono, monospace',
                      fontSize: 12,
                      color: '#333',
                      wordBreak: 'break-word',
                      flexGrow: 1,
                    }}
                  >
                    POST {url}
                  </Typography>
                  <Tooltip title="Copy URL">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(url)}
                      sx={{ ml: 1, color: '#F49837' }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })}

        </Box>
      )}


      {/* Center Control Buttons: Reset, Save, Upload, Load */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          borderRadius: 3,
          p: 1,
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            onClick={onReset}
            startIcon={<ReplayIcon />}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              backgroundColor: '#fff',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#94a3b8',
              },
            }}
          >
            Reset
          </Button>

          <Button
            onClick={onSave}
            startIcon={<DownloadIcon />}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              backgroundColor: '#fff',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#94a3b8',
              },
            }}
          >
            Download
          </Button>

          <Button
            onClick={onUpload}
            startIcon={<UploadIcon />}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              backgroundColor: '#fff',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#94a3b8',
              },
            }}
          >
            Upload
          </Button>

          <Button
            onClick={onLoad}
            startIcon={<CloudIcon />}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              backgroundColor: '#fff',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#94a3b8',
              },
            }}
          >
            Load
          </Button>
        </Stack>
      </Box>

      {/* Execution Logs Drawer */}
      <Drawer
        anchor="right"
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', md: '50%' }, p: 3, bgcolor: '#fff',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: PRIMARY_COLOR, fontWeight: 700 }}>
            Execution Logs
          </Typography>
          <Box>
            <Tooltip title="Copy JSON">
              <IconButton size="small" sx={{ color: PRIMARY_COLOR }} onClick={copyJson}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download JSON">
              <IconButton size="small" sx={{ color: PRIMARY_COLOR }} onClick={downloadJson}>
                <FileDownloadIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" sx={{ color: PRIMARY_COLOR }} onClick={() => setLogsOpen(false)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
        <Divider sx={{ borderColor: PRIMARY_COLOR, mb: 3 }} />

        {/* view selector + search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {['list', 'pretty', 'table'].map((m) => (
            <Button
              key={m}
              size="small"
              variant={viewMode === m ? 'contained' : 'outlined'}
              onClick={() => setViewMode(m)}
              sx={{
                textTransform: 'none', minWidth: 90,
                bgcolor: viewMode === m ? ACCENT_COLOR : 'transparent',
                color: viewMode === m ? '#fff' : PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
                '&:hover': { bgcolor: viewMode === m ? ACCENT_COLOR : 'rgba(33,68,103,0.1)' }
              }}
            >
              {({ list: 'List', pretty: 'Raw', table: 'Table' })[m]}
            </Button>
          ))}
          <TextField
            size="small"
            placeholder="Search logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ ml: 'auto', width: { xs: '100%', sm: 220 } }}
          />
        </Box>

        {/* content */}
        {result ? (
          { list: renderList(), pretty: renderPretty(), table: renderTable() }[viewMode]
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No logs available.
          </Typography>
        )}
      </Drawer>

    </>
  );
}
