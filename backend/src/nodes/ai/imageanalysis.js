// === File: src/nodes/ai/imageanalysis.js ===
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

export const handler = async (config, input) => {
  const {
    features = [], // optional
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion = 'ap-south-1',
  } = config;

  const fileData = input.image || input?.details?.file;
  if (!fileData?.startsWith('data:')) throw new Error('Invalid or missing image input');

  const base64 = fileData.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  const client = new RekognitionClient({
    region: awsRegion,
    credentials: { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey },
  });

  const command = new DetectLabelsCommand({
    Image: { Bytes: buffer },
    MaxLabels: 10,
    MinConfidence: 70,
  });

  const response = await client.send(command);

  return {
    summary: `Detected ${response.Labels?.length} labels`,
    labels: response.Labels,
  };
};
