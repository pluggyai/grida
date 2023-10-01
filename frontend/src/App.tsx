import { useEffect, useState } from 'react'
import './App.css'
import AppSelect from './components/AppSelect'
import { Application } from './types'
import AppSetup from './components/AppSetup'

function App() {
  const [application, setApplication] = useState<Application | null>(null)
  const [isRunningApplication, setIsRunningApplicaiton] = useState(false)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3030/ws')

    ws.onopen = () => {
      console.log('connected')
    }
    ws.onmessage = (e) => {
      console.log(e.data)

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
    <div className="App">
      <h1 className="main-title pb-1 pt-1 text-center">
        <i className="las la-angle-right"></i>grida
      </h1>
      <div className="container" id="app">
        <div className="row">
          <div className="col-8 offset-2 pt-3">
            {isRunningApplication && application ? (
              <div>pepe</div>
            ) : (
              <>
                {!application && (
                  <AppSelect
                    onAppSelected={(app) => setApplication(app)}
                  ></AppSelect>
                )}
                {application && <AppSetup application={application}></AppSetup>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
