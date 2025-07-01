import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser';
import apiRouter from './routes/api.js';
import triggerRouter from './routes/trigger.js';


const app = express();
const PORT = process.env.PORT || 4000;
const IS_OFFLINE = process.env.IS_OFFLINE === 'true';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/trigger/sns', bodyParser.raw({ type: '*/*' }));
app.use('/trigger/s3', bodyParser.raw({ type: '*/*' }));

app.use('/api', apiRouter);
app.use('/trigger', triggerRouter);

app.listen(PORT, () => {
  console.log(`\n🟢 LambdaFlow backend running at http://localhost:${PORT}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 IS_OFFLINE: ${IS_OFFLINE}`);
});