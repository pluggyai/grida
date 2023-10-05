import { useEffect, useRef, useState } from 'react'
import AppSelect from './components/AppSelect/AppSelect'
import { Application, ApplicationLogEvent, Job } from './types'
import { AppSetup } from './components/AppSetup'
import { Button } from './components/ui/Button'

function App() {
  const [application, setApplication] = useState<Application | null>(null)
  const [isRunningApplication, setIsRunningApplicaiton] = useState(false)
  const [runningJobs, setRunningJobs] = useState<Job[]>([])
  const [applicationLogs, setApplicationLogs] = useState<ApplicationLogEvent[]>(
    []
  )

  const handleAppSelection = (app: Application) => setApplication(app)
  const stopApplication = () => {
    fetch('http://localhost:3030/api/application', {
      method: 'DELETE',
    })
  }
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3030/ws')

    ws.onmessage = (e) => {
      // Parse the data into an object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsedData: any
      try {
        parsedData = JSON.parse(e.data)
      } catch (error) {
        console.error('Failed to parse WebSocket data:', error)
        return
      }

      if (parsedData.type === 'runningApplication') {
        setApplication(parsedData.payload.runningApplication)
        setIsRunningApplicaiton(parsedData.payload.runningApplication != null)
      }
      if (parsedData.type === 'runningJobs') {
        setRunningJobs((parsedData as any).payload.runningJobs)
      }
      if (parsedData.type === 'log') {
        setApplicationLogs((prev) => [...prev, (parsedData as any).payload])
        scrollToBottom()
      }
    }
  }, [])

  console.log(runningJobs)

  const codeElement = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    // scroll to bottom off the code element
    codeElement.current?.scrollTo({
      top: codeElement.current.scrollHeight + 1000,
      behavior: 'smooth',
    })
  }

  return (
    <div className="text-white p-5 max-w-[1000px] mx-auto">
      <header className="pb-5">
        <h1 className="text-sky-400 text-5xl text-center">grida</h1>
      </header>

      {isRunningApplication && application ? (
        <>
          <div
            className="w-full h-96 rounded-md border border-white resize-y overflow-auto py-4 px-7"
            ref={codeElement}
          >
            {applicationLogs.map((log) => {
              return (
                <code className="block">
                  [{log.jobName}] {log.message}
                </code>
              )
            })}
          </div>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={stopApplication}
          >
            Stop app
          </Button>
        </>
      ) : (
        <>
          {!application && (
            <AppSelect onAppSelected={handleAppSelection}></AppSelect>
          )}
          {application && (
            <AppSetup
              setApplication={setApplication}
              application={application}
            ></AppSetup>
          )}
        </>
      )}
    </div>
  )
}

export default App
