// === File: src/nodes/ai/documentocr.js ===
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

export const handler = async (config, input) => {


  const fileData = input.document || input?.details?.file;
  if (!fileData?.startsWith('data:')) throw new Error('Invalid or missing document input');

  const base64 = fileData.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  const client = new TextractClient({});

  const command = new DetectDocumentTextCommand({
    Document: { Bytes: buffer },
  });

  const response = await client.send(command);
  const text = response.Blocks?.filter(b => b.BlockType === 'LINE').map(b => b.Text).join('\n');

  return {
    summary: 'Document OCR successful',
    text,
    aiResult: text
  };
};
