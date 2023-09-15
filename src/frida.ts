import frida, { Application, Device, Script, Session } from 'frida';
import shelljs from 'shelljs';
import fs from 'fs';
import filenamify from 'filenamify';

export type Job = {
  script: Script;
  name: string;
};

export type LogEvent = {
  jobName: string;
  message: string;
};

export async function registerLogListener(
  callback: (logEvent: LogEvent) => void
) {
  logListeners.push(callback);
}

const logListeners: ((logEvent: LogEvent) => void)[] = [];
const runningJobs: Job[] = [];

export async function stopJob(name: string) {
  const job = getRunningJobs().find((job) => job.name === name);
  if (!job) {
    throw new Error(`Job ${name} not found`);
  }
  await job.script.unload();
  removeJob(job);
}

export function removeJob(job: Job): void {
  runningJobs.splice(runningJobs.indexOf(job), 1);
}

export function getRunningJobs(): Job[] {
  return runningJobs;
}

export async function getDevice() {
  try {
    return await frida.getUsbDevice();
  } catch (error) {
    // Try adb devices to wake up daemon
    shelljs.exec('adb devices');
    return await frida.getUsbDevice();
  }
}

export async function runJob(
  session: Session,
  name: string,
  scriptCode: string
): Promise<void> {
  const script = await session.createScript(scriptCode);
  await script.load();
  script.logHandler = (level, text) => {
    for (const logListener of logListeners) {
      logListener({ jobName: name, message: text });
    }
  };
  const job = {
    name,
    script,
  };
  runningJobs.push(job);
  script.destroyed.connect(() => removeJob(job));
}

export function openJadx(apkFileName: string) {
  shelljs.exec(
    `JAVA_OPTS="-Xmx15G" jadx-gui -j 4 -Pdex-input.verify-checksum=no "${apkFileName}"`,
    {
      async: true,
      silent: true,
    }
  );
}

export function downloadApk(application: Application): string {
  const output = shelljs.exec(`adb shell pm path ${application.identifier}`, {
    silent: true,
  });
  const apkPath = output.stdout.split('\n')[0].replace('package:', '');
  const downloadedApkPath = `./apks/${filenamify(application.name)}.apk`;
  shelljs.exec(`adb pull ${apkPath} "${downloadedApkPath}"`);
  return downloadedApkPath;
}

export async function getApplication(
  device: Device,
  identifier: string
): Promise<Application> {
  const applications = await device.enumerateApplications();
  const application = applications.find(
    (application) => application.identifier === identifier
  );
  if (!application) {
    throw new Error(`Application ${identifier} not found`);
  }
  return application;
}

export async function spawnByIdentifier(
  device: Device,
  identifier: string
): Promise<Session> {
  const processId = await device.spawn([identifier]);
  const session = await device.attach(processId);
  return session;
}

export async function spawnApplication(
  device: Device,
  application: Application
): Promise<Session> {
  return spawnByIdentifier(device, application.identifier);
}
