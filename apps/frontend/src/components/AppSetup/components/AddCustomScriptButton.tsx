import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Script } from '../../../types'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../ui/Dialog'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'

export default function AddCustomScript({
  onAddScript,
}: {
  onAddScript: (script: Script) => void
}) {
  const [scriptName, setScriptName] = useState('')
  const [scriptCode, setScriptCode] = useState('')

  const handleSave = () => {
    if (!scriptName || !scriptCode) return
    setScriptName('')
    setScriptCode('')
    onAddScript({
      name: scriptName,
      code: scriptCode,
    })
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'secondary'} className='mb-4'>Add Custom script</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Add Custom script</DialogHeader>
        <div className="py-6">
          <div className="flex flex-col gap-5">
            <Input
              value={scriptName}
              placeholder="Script Name"
              onChange={(e) => setScriptName(e.target.value)}
            />
            <Textarea
              className="code"
              rows={15}
              value={scriptCode}
              placeholder="Script Code"
              onChange={(e) => setScriptCode(e.target.value)}
            />
          </div>
          <DialogFooter className="py-4">
            <DialogTrigger asChild>
              <Button type="submit" onClick={handleSave}>
                Save changes
              </Button>
            </DialogTrigger>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
