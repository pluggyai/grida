import { Scope } from 'frida'
import { readFileSync } from 'fs'
import express, { NextFunction, Response, Request } from 'express'
import {
  createMethodHook,
  downloadApk,
  enumerateApplications,
  getApplication,
  getDevice,
  getRunningJobs,
  getRunningApplication,
  openJadx,
  registerWebsocketEventListener,
  runJob,
  spawnByIdentifier,
  stopJob,
} from './frida.js'
import { glob } from 'glob'
import expressWs from 'express-ws'
import { openMitmweb } from './mitm-proxy.js'
import cors from 'cors'

function sendError(error: unknown, response: Response) {
  if (error instanceof Error) {
    response.status(500).send(error.message)
  } else {
    response.status(500).send('Unknown error occurred')
  }
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }
}

const FRIDA_UNIVERSAL_SCRIPT = readFileSync(
  './scripts/frida-universal.js'
).toString()

const { app } = expressWs(express())

app.use(express.json())
app.use(express.static('./src/static'))
app.use(cors())

app.get(
  '/api/saved-scripts',
  asyncHandler(async (req, res) => {
    // Scan the custom-scripts folder and return each js file's path name
    // as an array of strings
    const scripts = await glob('custom-scripts/**/*.js')
    res.send(scripts.map((script) => script.replace('custom-scripts/', '')))
  })
)

app.get(
  '/api/saved-scripts/:name',
  asyncHandler(async (req, res) => {
    const name = req.params.name
    const script = readFileSync(`custom-scripts/${name}`).toString()
    res.send(script)
  })
)

app.ws('/ws', (ws, req) => {
  ws.send(JSON.stringify({
    type: 'runningApplication',
    payload: {
      runningApplication: getRunningApplication()
    }
  }))  
  registerWebsocketEventListener((event) => {
    ws.send(JSON.stringify(event))
  })
})

app.get('/', (req, res) => {
  res.send(readFileSync('./src/pages/index.html').toString())
})

app.post(
  '/api/open-in-jadx/:identifier',
  asyncHandler(async (req, res) => {
    const identifier = req.params.identifier
    const device = await getDevice()
    const application = await getApplication(device, identifier)
    const apkPath = downloadApk(application)
    openJadx(apkPath)
    res.send()
  })
)

app.get(
  '/api/applications',
  asyncHandler(async (req, res) => {
    try {
      res.send(await enumerateApplications())
    } catch (error) {
      sendError(error, res)
    }
  })
)

app.post(
  '/api/method-hook/:methodHookPath',
  asyncHandler(async (req, res) => {
    const { methodHookPath } = req.params
    try {
      await createMethodHook(methodHookPath)
      res.send()
    } catch (error) {
      sendError(error, res)
    }
  })
)

app.post(
  '/api/open-application',
  asyncHandler(async (req, res) => {
    const device = await getDevice()
    const { identifier, sslpinning, scripts } = req.body
    const session = await spawnByIdentifier(device, identifier)
    if (sslpinning) {
      await runJob(session, 'SSL Pinning', FRIDA_UNIVERSAL_SCRIPT)
    }
    for (const script of scripts) {
      await runJob(session, script.name, script.code)
    }
    await device.resume(session.pid)
    res.send()
  })
)

app.get(
  '/api/running-jobs',
  asyncHandler(async (req, res) => {
    res.send(getRunningJobs().map((job) => ({ name: job.name, id: job.id })))
  })
)

app.delete(
  '/api/running-jobs/:jobId',
  asyncHandler(async (req, res) => {
    const jobId = req.params.jobId
    await stopJob(jobId)
    res.send()
  })
)

app.post(
  '/api/open-mitmweb',
  asyncHandler(async (req, res) => {
    openMitmweb()
    res.send()
  })
)

app.listen(3030)
