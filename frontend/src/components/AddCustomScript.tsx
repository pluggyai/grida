import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Script } from '../types'

export default function AddCustomScript({
  onAddScript,
}: {
  onAddScript: (script: Script) => void
}) {
  const [isAddingScript, setIsAddingScript] = useState(false)
  const [scriptName, setScriptName] = useState('')
  const [scriptCode, setScriptCode] = useState('')
  const handleOpen = () => setIsAddingScript(true)
  const handleCancel = () => {
    setIsAddingScript(false)
    setScriptName('')
    setScriptCode('')
  }

  const handleSave = () => {
    setIsAddingScript(false)
    setScriptName('')
    setScriptCode('')
    onAddScript({
      name: scriptName,
      code: scriptCode,
    })
  }
  return (
    <>
      {!isAddingScript && (
        <a className="me-2" href="#" onClick={handleOpen}>
          + Custom script
        </a>
      )}
      <Modal centered show={isAddingScript} onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Add custom script</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control form-control-sm mb-3"
            value={scriptName}
            placeholder="Name"
            onChange={(e) => setScriptName(e.target.value)}
          />
          <textarea
            className="form-control code"
            rows={15}
            value={scriptCode}
            placeholder="Script"
            onChange={(e) => setScriptCode(e.target.value)}
          ></textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
