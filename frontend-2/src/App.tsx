import { useEffect, useState } from 'react'
import AppSelect from './components/AppSelect/AppSelect'
import { Application } from './types'
import { AppSetup } from './components/AppSetup/'

function App() {
  const [application, setApplication] = useState<Application | null>(null)
  const [isRunningApplication, setIsRunningApplicaiton] = useState(false)

  const handleAppSelection = (app: Application) => setApplication(app)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3030/ws')

    ws.onmessage = (e) => {
      // Parse the data into an object
      let parsedData
      try {
        parsedData = JSON.parse(e.data)
      } catch (error) {
        console.error('Failed to parse WebSocket data:', error)
        return
      }

      if (
        'runningApplication' in parsedData.payload &&
        parsedData.payload.runningApplication !== null
      ) {
        setApplication(parsedData.payload.runningApplication)
        setIsRunningApplicaiton(true)
      }
    }
  }, [])

  return (
    <div className="text-white p-5 max-w-[1000px] mx-auto">
      <header className="pb-5">
        <h1 className="text-sky-400 text-5xl text-center">grida</h1>
      </header>

      {isRunningApplication && application ? (
        <div>TODO: Add App running</div>
      ) : (
        <>
          {!application && (
            <AppSelect onAppSelected={handleAppSelection}></AppSelect>
          )}
          {application && <AppSetup application={application}></AppSetup>}
        </>
      )}
    </div>
  )
}

export default App
