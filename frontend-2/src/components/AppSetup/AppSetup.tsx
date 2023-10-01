import { useState } from 'react'
import { Application, Script } from '../../types'
import { bytesToImgSrc } from '../../utils'
import { AddCustomScript, JadxButton, AddScriptFileInput } from './components'
import { Checkbox } from '../ui/Checkbox'
import { Button } from '../ui/Button'

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
    <div className="flex items-center justify-center mt-5">
      <div className="">
        <div className="flex items-center gap-2">
          <img src={bytesToImgSrc(application)} className="w-8 h-8" />
          <h3 className="text-3xl">{application.name}</h3>
        </div>
        <hr className="mb-4 mt-2" />
        <div className="flex flex-col gap-2">
          <h5>Standard scripts</h5>
          <div className="mb-2 flex flex-col">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sslPinning"
                onChange={() => setUseSslPinning((prev) => !prev)}
              />
              <label
                htmlFor="sslPinning"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                SSL Pinning bypass
              </label>
            </div>
          </div>
        </div>
        <hr className="mb-4 mt-2" />

        <AddScriptFileInput onAddScript={addScript} />
        <AddCustomScript onAddScript={addScript} />

        {scripts.length > 0 && (
          <>
            <ul className="border border-input rounded-md p-3">
              {scripts.map((script, i) => (
                <>
                  <li
                    className="flex flex-row items-center justify-between code list-group-item list-group-item-action"
                    key={script.name}
                  >
                    {script.name}{' '}
                    <span
                      onClick={() =>
                        setScripts((scripts_) =>
                          scripts_.filter((_, i_) => i_ !== i)
                        )
                      }
                      className="cursor-pointer"
                    >
                      ✕
                    </span>
                  </li>
                  {i !== scripts.length - 1 && <hr className="my-2" />}
                </>
              ))}
            </ul>
          </>
        )}
        <hr className="mb-4 mt-2" />

        <div className="flex gap-4 mt-4">
          <Button onClick={handleOpenApp}>Start app</Button>
          <JadxButton application={application} />
        </div>
      </div>
    </div>
  )
}
