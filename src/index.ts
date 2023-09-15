import { Scope } from 'frida';
import { readFileSync, writeFileSync } from 'fs';
import express from 'express';
import {
  downloadApk,
  getApplication,
  getDevice,
  getRunningJobs,
  openJadx,
  registerLogListener,
  runJob,
  spawnByIdentifier,
  stopJob,
} from './frida.js';
import { glob } from 'glob';
import expressWs from 'express-ws';
import { openMitmweb } from './mitm-proxy.js';

const FRIDA_UNIVERSAL_SCRIPT = readFileSync(
  './scripts/frida-universal.js'
).toString();

const { app } = expressWs(express());

app.use(express.json());

app.get('/api/saved-scripts', async (req, res) => {
  // Scan the custom-scripts folder and return each js file's path name
  // as an array of strings
  const scripts = await glob('custom-scripts/**/*.js');
  res.send(scripts.map((script) => script.replace('custom-scripts/', '')));
});

app.get('/api/saved-scripts/:name', async (req, res) => {
  const name = req.params.name;
  const script = readFileSync(`custom-scripts/${name}`).toString();
  res.send(script);
});

app.ws('/ws', (ws, req) => {
  registerLogListener((logEvent) => {
    ws.send(JSON.stringify(logEvent));
  });
});

app.get('/', (req, res) => {
  res.send(readFileSync('./src/pages/index.html').toString());
});

app.post('/api/open-in-jadx/:identifier', async (req, res) => {
  const identifier = req.params.identifier;
  const device = await getDevice();
  const application = await getApplication(device, identifier);
  const apkPath = downloadApk(application);
  openJadx(apkPath);
  res.send();
});

app.get('/api/applications', async (req, res) => {
  const device = await getDevice();
  const applications = await device.enumerateApplications({
    scope: Scope.Full,
  });
  res.send(applications);
});

app.post('/api/open-application', async (req, res) => {
  const device = await getDevice();
  const { identifier, sslpinning, scripts } = req.body;
  const session = await spawnByIdentifier(device, identifier);
  if (sslpinning) {
    await runJob(session, 'SSL Pinning', FRIDA_UNIVERSAL_SCRIPT);
  }
  for (const script of scripts) {
    await runJob(session, script.name, script.code);
  }
  await device.resume(session.pid);
  res.send();
});

app.get('/api/running-jobs', async (req, res) => {
  res.send(getRunningJobs().map((job) => ({ name: job.name, id: job.id })));
});

app.delete('/api/running-jobs/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  await stopJob(jobId);
  res.send();
});

app.post('/api/open-mitmweb', async (req, res) => {
  openMitmweb()
  res.send();
});

app.listen(3030);
