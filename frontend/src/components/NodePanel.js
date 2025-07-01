// === File: src/components/nodePanel.js ===

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Box,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// MUI icons by category
import MemoryIcon from '@mui/icons-material/Memory'; // AI/ML
import LoopIcon from '@mui/icons-material/Loop'; // Control Flow
import TransformIcon from '@mui/icons-material/Transform'; // Data Transformation
import FolderIcon from '@mui/icons-material/Folder'; // File & Storage
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions'; // Integrations
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'; // Notifications
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'; // Triggers
import PersonIcon from '@mui/icons-material/Person'; // User Interaction
import BugReportIcon from '@mui/icons-material/BugReport'; // Utility

const PRIMARY_COLOR = '#214467';
const ACCENT_COLOR = '#F49837';

const categorizedNodes = {
  'AI/ML': [
    { label: 'Summarize Text', type: 'summarizetext' },
    { label: 'Classify Text', type: 'classifytext' },
    { label: 'Extract Entities', type: 'extractentities' },
    { label: 'Sentiment Analysis', type: 'sentimentanalysis' },
    { label: 'Generate Text (Bedrock)', type: 'generatetext' },
    { label: 'Text to Speech (Polly)', type: 'texttospeech' },
    { label: 'Image Analysis (Rekognition)', type: 'imageanalysis' },
    { label: 'Document OCR (Textract)', type: 'documentocr' },
  ],
  'Control Flow': [
    { label: 'Condition', type: 'condition' },
    { label: 'Loop / For Each', type: 'loopforeach' },
    { label: 'Delay / Wait', type: 'delay' },
    { label: 'Terminate', type: 'terminate' },
  ],
  'Data Transformation': [
    { label: 'Custom Lambda', type: 'customdatatransformation' },
    { label: 'Build JSON', type: 'buildjson' },
    { label: 'Merge JSON', type: 'mergejson' },
    { label: 'Parse CSV', type: 'parsecsv' },
    { label: 'Rename JSON Keys', type: 'renamejsonkeys' },
    { label: 'Flatten JSON', type: 'flattenjson' },
    { label: 'JSON to CSV', type: 'jsontocsv' },
    { label: 'Extract Field', type: 'extractfield' },
    { label: 'Math Expression', type: 'mathexpression' },
    { label: 'Filter Data', type: 'filterdata' },
    { label: 'Text Template', type: 'texttemplate' },
    { label: 'String Formatter', type: 'stringformatter' },
    { label: 'Generate PDF', type: 'generatepdf' },
  ],
  'File & Storage': [
    { label: 'Read File', type: 'readfile' },
    { label: 'Write File', type: 'writefile' },
    { label: 'Append to File', type: 'appendtofile' },
    { label: 'Upload to S3', type: 'uploadtos3' },
    { label: 'Download from S3', type: 'downloadfroms3' },
    { label: 'List S3 Files', type: 'lists3files' },
    { label: 'Put Item (DynamoDB)', type: 'putitem' },
    { label: 'Get Item (DynamoDB)', type: 'getitem' },
    { label: 'Scan DynamoDB', type: 'scandynamodb' },
  ],
  'Integrations & APIs': [
    { label: 'HTTP Request', type: 'httprequest' },
    { label: 'GraphQL Request', type: 'graphqlrequest' },
    { label: 'CRM Sync', type: 'crmsync' },
    { label: 'Send to Slack', type: 'sendtoslack' },
  ],
  'Triggers': [
    { label: 'API Gateway Trigger', type: 'apigatewaytrigger' },
    { label: 'S3 Trigger', type: 's3trigger' },
    { label: 'EventBridge Trigger', type: 'eventbridgetrigger' },
    { label: 'Schedule Trigger', type: 'scheduletrigger' },
    { label: 'DynamoDB Trigger', type: 'dynamodbtrigger' },
    { label: 'SNS Trigger', type: 'snstrigger' },
  ],
  'Notifications': [
    { label: 'Send Email (SES)', type: 'sendemail' },
    { label: 'Send SMS', type: 'sendsms' },
    { label: 'Push Notification', type: 'pushnotification' },
  ],
  'Utility & Debugging': [
    { label: 'Generate UUID', type: 'generateuuid' },
    { label: 'Log to Console', type: 'logtoconsole' },
    { label: 'Mock Data', type: 'mockdata' },
    { label: 'View Context', type: 'viewcontext' },
    { label: 'Comment', type: 'comment' },
    { label: 'Breakpoint', type: 'breakpoint' },
  ],
};


const categoryIcons = {
  'AI/ML': <MemoryIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'Control Flow': <LoopIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'Data Transformation': <TransformIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'File & Storage': <FolderIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'Integrations & APIs': <IntegrationInstructionsIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'Triggers': <PlayCircleOutlineIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'Notifications': <NotificationsActiveIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'User Interaction': <PersonIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
  'Utility & Debugging': <BugReportIcon sx={{ color: ACCENT_COLOR, mr: 1 }} />,
};

const onDragStart = (event, nodeData) => {
  event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
  event.dataTransfer.effectAllowed = 'move';
};

export default function NodePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState();

  const handleAccordionChange = (category) => (_, isExpanded) => {
    setExpanded(isExpanded ? category : false);
  };

  const filteredNodes = Object.entries(categorizedNodes).reduce((acc, [category, nodes]) => {
    const filtered = nodes.filter(({ label }) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) acc[category] = filtered;
    return acc;
  }, {});

  return (
    <Card
      sx={{
        height: '100vh',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
        borderRight: `1px solid ${PRIMARY_COLOR}20`,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${PRIMARY_COLOR}20`,
          backgroundColor: '#ffffff',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 1,
          py: 1,
          backgroundColor: '#f4f6f8',
        }}
      >
        {Object.entries(filteredNodes).map(([category, nodes]) => (
          <Accordion
            key={category}
            expanded={expanded === category}
            onChange={handleAccordionChange(category)}
            sx={{
              mb: 1.5,
              boxShadow: expanded === category ? '0px 4px 12px rgba(0,0,0,0.06)' : 'none',
              backgroundColor: '#ffffff',
              borderLeft: `4px solid ${ACCENT_COLOR}`,
              borderRadius: 2,
              '&::before': { display: 'none' },
              transition: 'box-shadow 0.2s ease-in-out',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: PRIMARY_COLOR }} />}
              sx={{
                px: 2,
                py: 1.2,
                minHeight: 48,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  margin: 0,
                },
              }}
            >
              <Typography
                fontWeight="600"
                sx={{
                  color: PRIMARY_COLOR,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.95rem',
                }}
              >
                {categoryIcons[category]}
                {category}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 1.5 }}>
              <Stack spacing={1}>
                {nodes.map(({ label, type }) => (
                  <Paper
                    key={label}
                    draggable
                    onDragStart={(e) => onDragStart(e, { label, type })}
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1,
                      backgroundColor: '#fdfdfd',
                      borderLeft: `4px solid ${ACCENT_COLOR}`,
                      border: `1px solid ${PRIMARY_COLOR}15`,
                      color: PRIMARY_COLOR,
                      fontWeight: 500,
                      fontSize: '0.82rem',
                      fontFamily: 'Roboto Mono, monospace',
                      borderRadius: 1,
                      cursor: 'grab',
                      userSelect: 'none',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: 'inset 0 0 0.5px rgba(0,0,0,0.06)',
                      '&:hover': {
                        backgroundColor: `${ACCENT_COLOR}10`,
                        transform: 'translateX(2px)',
                        boxShadow: `0 1px 4px ${PRIMARY_COLOR}25`,
                      },
                    }}
                  >
                    {label}
                  </Paper>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Card>
  );
}