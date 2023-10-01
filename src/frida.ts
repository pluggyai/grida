import frida, {
  Application,
  Cancellable,
  Device,
  Message,
  Scope,
  Script,
  SendMessage,
  Session,
} from 'frida'
import shelljs from 'shelljs'
import filenamify from 'filenamify'
import crypto from 'crypto'

export type Job = {
  id: string
  script: Script
  name: string
}

type WebsocketEventType = 'log' | 'runningApplication'
export type WebsocketEvents = LogEvent | RunningApplicationEvent

export type RunningApplicationEvent = WebsocketEvent<
  {
    runningApplication: Application | null
  },
  'runningApplication'
>
export type WebsocketEvent<T, X extends WebsocketEventType> = {
  type: X
  payload: T
}

export type LogEvent = WebsocketEvent<
  {
    jobId: string
    message: string
  },
  'log'
>

export async function registerWebsocketEventListener(
  callback: (event: WebsocketEvents) => void
) {
  websocketEventListeners.push(callback)
}

let session: Session | null = null
let runningApplication: Application | null = null
const websocketEventListeners: ((event: WebsocketEvents) => void)[] = []
const runningJobs: Job[] = []

export async function stopJob(jobId: string) {
  console.log('Stopping job:', jobId)
  const job = getRunningJobs().find((job) => job.id === jobId)
  if (!job) {
    throw new Error(`Job ${name} not found`)
  }
  await job.script.unload()
}

export function removeJobById(jobId: string): void {
  const jobIndexToDelete = getRunningJobs().findIndex((job) => job.id === jobId)
  if (jobIndexToDelete === -1) {
    throw new Error(`Job ${jobId} not found`)
  }
  runningJobs.splice(jobIndexToDelete, 1)
}

export function getRunningJobs(): Job[] {
  return runningJobs
}

export async function getDevice() {
  try {
    return await frida.getUsbDevice()
  } catch (error) {
    shelljs.exec('adb devices', {
      silent: true,
    })
    return await frida.getUsbDevice()
  }
}

export async function runJob(
  session: Session,
  name: string,
  scriptCode: string,
  messageListener?: (message: Message) => void
): Promise<void> {
  const jobId = crypto.randomUUID()
  const script = await session.createScript(scriptCode)
  if (messageListener) {
    script.message.connect((message) => messageListener(message))
  }
  await script.load()
  script.logHandler = (level, text) => {
    for (const logListener of websocketEventListeners) {
      logListener({ type: 'log', payload: { jobId, message: text } })
    }
  }
  const job = {
    id: jobId,
    name,
    script,
  }
  runningJobs.push(job)
  script.destroyed.connect(() => removeJobById(job.id))
}

export function openJadx(apkFileName: string) {
  shelljs.exec(
    `JAVA_OPTS="-Xmx15G" jadx-gui -j 4 -Pdex-input.verify-checksum=no "${apkFileName}"`,
    {
      async: true,
      silent: true,
    }
  )
}

export function downloadApk(application: Application): string {
  // check if apks folder exists
  if (!shelljs.test('-d', './apks')) {
    shelljs.mkdir('./apks')
  }
  const output = shelljs.exec(`adb shell pm path ${application.identifier}`, {
    silent: true,
  })
  const apkPath = output.stdout.split('\n')[0].replace('package:', '')
  const downloadedApkPath = `./apks/${filenamify(application.name)}.apk`
  shelljs.exec(`adb pull ${apkPath} "${downloadedApkPath}"`)
  return downloadedApkPath
}

export async function getApplication(
  device: Device,
  identifier: string,
  full?: boolean
): Promise<Application> {
  const applications = await device.enumerateApplications({
    scope: full ? Scope.Full : Scope.Minimal,
  })
  const application = applications.find(
    (application) => application.identifier === identifier
  )

  if (!application) {
    throw new Error(`Application ${identifier} not found`)
  }
  return application
}

export async function spawnByIdentifier(
  device: Device,
  identifier: string
): Promise<Session> {
  const processId = await device.spawn([identifier])
  session = await device.attach(processId)
  runningApplication = await getApplication(device, identifier, true)
  websocketEventListeners.forEach((listener) => {
    console.log('Sending runningApplication event')
    listener({
      type: 'runningApplication',
      payload: { runningApplication },
    })
  }
  )
  return session
}

export function getRunningApplication() {
  return runningApplication
}

export function getSession(): Session {
  if (!session) {
    throw new Error('Session not found')
  }
  return session
}

export async function createMethodHook(methodPath: string) {
  const parts = methodPath.split('.')
  const classPath = parts.slice(0, -1).join('.')
  const methodName = parts.slice(-1)[0]
  const scriptCode = getMethodHookScript(classPath, methodName)
  console.log('Creating job')
  await new Promise<void>((resolve, reject) => {
    runJob(getSession(), methodPath, scriptCode, (message) => {
      console.log('Received message', message)
      if (message.type === 'send') {
        console.log('Message was send, resolving')
        resolve()
      } else if (message.type === 'error') {
        console.log('Message was error, rejecting')
        reject(message.description)
      }
    })
  })
  console.log('Resolved')
}

function getMethodHookScript(classPath: string, methodName: string) {
  return `
Java.perform(() => {
  const throwable = Java.use("java.lang.Throwable");
  const targetClass = Java.use("${classPath}");
  if (targetClass["${methodName}"] === undefined) {
    throw new Error("Error: Method ${methodName} not found in class ${classPath}");
    return;
  }
  targetClass["${methodName}"].overloads.forEach((overload) => {
    const calleeArgTypes = overload.argumentTypes.map((arg) => arg.className);
    const calleeArgTypesStr = calleeArgTypes.join(',');
    const methodSignature = "${classPath}.${methodName}" + '(' + calleeArgTypesStr + ')';
    send("Watching" + methodSignature);
    overload.implementation = function () {
      console.log("Calling" + methodSignature);
      const returnValue = overload.apply(this, arguments);
      return returnValue;
    }
  });
  send("OK");
});
`
}

let applications: Application[] | null = null

export async function enumerateApplications(): Promise<Application[]> {
  if (applications) {
    return applications
  }
  const device = await getDevice()
  applications = await device.enumerateApplications({
    scope: Scope.Full,
  })
  return applications
}
