import React from 'react'

import { Script } from '../../../types'
import { Input } from '../../ui/Input'
import { Label } from '../../ui/Label'

const AddScriptFileInput = ({
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
    <div className="mb-3 cursor-pointer">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label className="mb-4" htmlFor="formFile">
          Custom Script
        </Label>
        <Input
          accept=".js"
          onChange={handleInputChange}
          id="formFile"
          type="file"
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}

export default AddScriptFileInput
