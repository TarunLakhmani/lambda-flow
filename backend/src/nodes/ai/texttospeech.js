// === File: src/nodes/ai/texttospeech.js ===
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

export const handler = async (config, input) => {
  let {
    voice
  } = config;

  if (!voice) {
    voice = 'Joanna';
  }

  let text = input.text || input?.details?.text;

  if (!text) {
    const fileData = input?.details?.file || input?.output?.file;
    if (fileData?.startsWith('data:')) {
      const base64Match = fileData.match(/^data:.*?;base64,(.*)$/);
      if (base64Match) {
        const buffer = Buffer.from(base64Match[1], 'base64');
        text = buffer.toString('utf-8');
      }
    }
  }

  if (!text) throw new Error('Missing input text');

  const client = new PollyClient();

  const command = new SynthesizeSpeechCommand({
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: voice,
  });

  const response = await client.send(command);

  const buffer = await response.AudioStream.transformToByteArray();

  return {
    summary: `Speech synthesized using ${voice}`,
    base64: Buffer.from(buffer).toString('base64'),
    filename: `speech_${Date.now()}.mp3`,
  };
};
