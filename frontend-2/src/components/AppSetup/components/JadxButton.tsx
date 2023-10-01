import { useState } from 'react'
import { Application } from '../../../types'
import { Button } from '../../ui/Button'

const JadxButton = ({ application }: { application: Application }) => {
  const [loading, setLoading] = useState(false)

  const handleOpenJadx = async () => {
    setLoading(true)
    try {
      await fetch(
        `http://localhost:3030/api/open-in-jadx/${application.identifier}`,
        {
          method: 'POST',
        }
      )
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className="btn btn-success"
      type="button"
      onClick={handleOpenJadx}
      variant="secondary"
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-1" role="status" />
      )}
      Open in JADX
    </Button>
  )
}

export default JadxButton
