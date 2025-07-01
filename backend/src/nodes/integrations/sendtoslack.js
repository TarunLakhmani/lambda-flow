import axios from 'axios';
import { WebClient } from '@slack/web-api';

export const handler = async (config, input) => {
  const { webhookUrl, botToken, channelId } = config;

  const message =
    input.html ||
    input.message ||
    input.text ||
    input?.output?.text ||
    input?.summary ||
    input?.output?.summary;

  const base64 =
    input.base64 ||
    input?.output?.base64 ||
    input?.details?.base64;

  const fileName =
    input.filename ||
    input?.output?.filename ||
    input?.details?.filename ||
    'attachment.bin';

  const fileBuffer = base64 ? Buffer.from(base64, 'base64') : null;
  const fileType = inferFileType(fileName);
  const title = input.title || 'Slack Attachment';

  if (!message && !fileBuffer) {
    throw new Error('Missing message or file for Slack delivery');
  }

  try {
    // === Case 1: Upload file to Slack using uploadV2 ===
    if (fileBuffer && botToken && channelId) {
      const slack = new WebClient(botToken);

      const uploadResult = await slack.files.uploadV2({
        filename: fileName,
        title,
        alt_text: title,
        file: fileBuffer,
        initial_comment: message || 'File attached',
        channel_id: channelId, // ✅ THIS is the correct key for uploadV2
      });

      return {
        summary: `✅ File uploaded to Slack (${fileType}) via uploadV2`,
        details: uploadResult,
        output: {
          fileId: uploadResult.file?.id,
          permalink: uploadResult.file?.permalink,
          fileName,
          fileType,
        },
      };
    }

    // === Case 2: Webhook fallback ===
    if (webhookUrl && message) {
      const response = await axios.post(webhookUrl, { text: message });

      return {
        summary: '✅ Slack message sent via webhook',
        details: response.data,
        output: response.data,
      };
    }

    throw new Error('Missing Slack botToken/channelId for file upload, or webhookUrl for fallback');

  } catch (err) {
    return {
      summary: '❌ Slack delivery failed',
      details: {
        error: err.message,
        response: err.response?.data,
      },
      output: null,
    };
  }
};

function inferFileType(fileName) {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  return ext || 'auto';
}
