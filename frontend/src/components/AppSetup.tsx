import { useCallback, useState } from 'react'
import { Application, Script } from '../types'
import { bytesToImgSrc } from '../utils'
import AddCustomScript from './AddCustomScript'
import OpenInJadxButton from './OpenInJadxButton'
import AddScriptFile from './AddScriptFile'

export default function AppSetup({
  application,
}: {
  application: Application
}) {
  const [scripts, setScripts] = useState<Script[]>([])
  const [useSslPinning, setUseSslPinning] = useState(false)

  const addScript = (script: Script) => {
    setScripts((scripts_) => [...scripts_, script])
  }

  const handleOpenApp = async () => {
    console.log('handleOpenApp')
    console.log(application)
    console.log(scripts)

    await fetch('http://localhost:3030/api/open-application', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        scripts,
        identifier: application.identifier,
        sslpinning: useSslPinning,
      }),
    })
  }

  return (
    <div>
      <h3>
        <img
          src={bytesToImgSrc(application)}
          className="me-2"
          width="20"
          height="20"
        />
        {application.name}
      </h3>
      <p>
        <code>{application.identifier}</code>
      </p>
      <h5>Standard scripts</h5>
      <div className="form-check mb-2">
        <input
          type="checkbox"
          className="form-check-input"
          id="sslpinning"
          onChange={(e) => setUseSslPinning(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="sslpinning">
          SSL Pinning
        </label>
      </div>
      {scripts.length > 0 && (
        <>
          <h5>Custom scripts</h5>
          <ul className="list-group ">
            {scripts.map((script) => (
              <a
                className="code list-group-item list-group-item-action"
                key={script.name}
              >
                {script.name}
              </a>
            ))}
          </ul>
        </>
      )}
      <AddScriptFile onAddScript={addScript} />
      <AddCustomScript onAddScript={addScript} />
      <br />
      <button
        className="btn btn-primary me-1"
        type="button"
        onClick={handleOpenApp}
      >
        Start app
      </button>
      <OpenInJadxButton application={application} />
    </div>
  )
}
