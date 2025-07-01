// === File: src/components/ConfigModal.js ===

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { nodeSpecs } from './nodeSpecs';
import MonacoEditor from '@monaco-editor/react';

const PRIMARY_COLOR = '#214467';
const ACCENT_COLOR = '#F49837';

// A reusable function template
const FUNCTION_TEMPLATE = `async function customTransformation(config, input) {
  // <Put your code here>
}`;

export default function ConfigModal({ node, onClose, onSave }) {
  const [config, setConfig] = useState({});
  const [input, setInput] = useState({});
  const [userCode, setUserCode] = useState(FUNCTION_TEMPLATE);
  const [loadingFileKey, setLoadingFileKey] = useState(null);

  useEffect(() => {
    if (!node?.data) return;

    // If it's the custom node, load stored code or default template
    if (node.data.type === 'customdatatransformation') {
      setUserCode(node.data.config?.userCode || FUNCTION_TEMPLATE);
      return;
    }

    // Otherwise, initialize config & input from nodeSpecs
    const spec = nodeSpecs[node.data.label] || { config: [], input: [], inputTypes: {} };
    const initialConfig = {};
    const initialInput = {};

    spec.config.forEach((key) => {
      const v = node.data.config?.[key];
      if (v !== undefined) initialConfig[key] = v;
    });
    spec.input.forEach((key) => {
      const v = node.data.input?.[key];
      if (v !== undefined) initialInput[key] = v;
    });

    setConfig(initialConfig);
    setInput(initialInput);
  }, [node]);

  const handleConfigChange = (e) => {
    setConfig((c) => ({ ...c, [e.target.name]: e.target.value }));
  };

  const handleInputChange = async (e, key, type) => {
    if (type === 'file') {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoadingFileKey(key);
      const reader = new FileReader();
      reader.onload = () => {
        setInput((i) => ({ ...i, [key]: reader.result }));
        setLoadingFileKey(null);
      };
      reader.readAsDataURL(file);
    } else {
      setInput((i) => ({ ...i, [key]: e.target.value }));
    }
  };

  const handleCodeChange = (value) => {
    setUserCode(value);
  };

  const handleSave = () => {
    if (node.data.type === 'customdatatransformation') {
      // Save only the code for custom node
      onSave(node.id, { userCode }, {});
    } else {
      // Clean up CSV-style fields
      const parsedConfig = { ...config };
      ['categories', 'entityTypes', 'fields'].forEach((k) => {
        if (typeof parsedConfig[k] === 'string') {
          parsedConfig[k] = parsedConfig[k]
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
        }
      });
      onSave(node.id, parsedConfig, input);
    }
  };

  const spec = nodeSpecs[node?.data?.label] || { config: [], input: [], inputTypes: {} };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: '#fefefe',
          border: `1px solid ${PRIMARY_COLOR}20`,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.08)`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 18, pb: 2, color: PRIMARY_COLOR }}>
        {node?.data?.label} Configuration
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        {spec.description && (
          <Typography variant="body2" sx={{ mb: 2, color: PRIMARY_COLOR }}>
            {spec.description}
          </Typography>
        )}

        {node.data.type === 'customdatatransformation' ? (
          <MonacoEditor
            height="400px"
            language="javascript"
            value={userCode}
            onChange={handleCodeChange}
            options={{
              selectOnLineNumbers: true,
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        ) : (
          <>
            {spec.config.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  sx={{ mt: 2, mb: 1.5, fontWeight: 600, color: PRIMARY_COLOR }}
                >
                  Configuration Settings
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {spec.config.map((key) => (
                    <TextField
                      key={key}
                      name={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      fullWidth
                      size="small"
                      value={config[key] || ''}
                      onChange={handleConfigChange}
                      helperText={
                        spec.fieldDescriptions?.config?.[key] ||
                        (['categories', 'entityTypes', 'fields'].includes(key)
                          ? 'Comma-separated values'
                          : '')
                      }
                      InputLabelProps={{ sx: { color: PRIMARY_COLOR } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  ))}
                </Box>
              </>
            )}

            {spec.input.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 600, color: PRIMARY_COLOR }}
                >
                  Input Parameters
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {spec.input.map((key) => {
                    const type = spec.inputTypes?.[key] || 'text';
                    return (
                      <TextField
                        key={key}
                        name={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        fullWidth
                        size="small"
                        type={type === 'file' ? 'file' : 'text'}
                        value={type === 'file' ? undefined : input[key] || ''}
                        onChange={(e) => handleInputChange(e, key, type)}
                        disabled={loadingFileKey === key}
                        helperText={
                          loadingFileKey === key
                            ? 'Uploading...'
                            : spec.fieldDescriptions?.input?.[key] || ''
                        }
                        InputLabelProps={{ shrink: true, sx: { color: PRIMARY_COLOR } }}
                        inputProps={type === 'file' ? { accept: '*' } : undefined}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    );
                  })}
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>


      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: PRIMARY_COLOR,
            borderColor: PRIMARY_COLOR,
            textTransform: 'none',
            '&:hover': { backgroundColor: `${PRIMARY_COLOR}10`, borderColor: PRIMARY_COLOR },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={node.data.type !== 'customdatatransformation' && !!loadingFileKey}
          sx={{
            backgroundColor: ACCENT_COLOR,
            color: '#fff',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#e0892f' },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
