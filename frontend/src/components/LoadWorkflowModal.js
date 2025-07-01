import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  InputAdornment,
  Box,
  ListItemIcon,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import axios from 'axios';
import API_BASE_URL from '../config'; 
const PRIMARY_COLOR = '#214467';
const ACCENT_COLOR = '#F49837';

export default function LoadWorkflowModal({ open, onClose, onSelect }) {
  const [workflows, setWorkflows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/list-workflows`)
        .then((res) => {
          const wfList = res.data.workflows || [];
          setWorkflows(wfList);
          setFiltered(wfList);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFiltered(workflows.filter(w => w.workflowId.toLowerCase().includes(term)));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: PRIMARY_COLOR,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <FolderOpenIcon sx={{ color: ACCENT_COLOR }} />
        Load Workflow
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#fdfdfd' }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search workflows..."
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999' }} />
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

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={80}>
            <CircularProgress size={24} sx={{ color: ACCENT_COLOR }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            No workflows found.
          </Typography>
        ) : (
          <List dense sx={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.map((w) => (
              <ListItem
                key={w.workflowId}
                button
                onClick={() => onSelect(w.workflowId)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AccountTreeIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
                </ListItemIcon>
                <ListItemText
                  primary={w.workflowId}
                  primaryTypographyProps={{
                    fontSize: 14,
                    color: PRIMARY_COLOR,
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{
            textTransform: 'none',
            borderColor: PRIMARY_COLOR,
            color: PRIMARY_COLOR,
            '&:hover': {
              borderColor: ACCENT_COLOR,
              backgroundColor: '#fef9f4',
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
