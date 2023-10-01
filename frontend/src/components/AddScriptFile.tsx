import { Script } from '../types'
import React from 'react'

const AddScriptFile = ({
  onAddScript,
}: {
  onAddScript: (script: Script) => void
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const script = {
        name: file.name,
        code: reader.result as string,
      }

      onAddScript(script)
    }
    reader.readAsText(file)
  }

  return (
    <div className="mb-3">
      <label htmlFor="formFile" className="form-label"></label>
      <input
        className="form-control"
        type="file"
        id="formFile"
        onChange={handleInputChange}
      />
    </div>
  )
}

export default AddScriptFile
