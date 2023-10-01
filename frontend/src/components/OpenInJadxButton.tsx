import { useState } from 'react'
import { Application } from '../types'

const OpenInJadxButton = ({ application }: { application: Application }) => {
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
    <button className="btn btn-success" type="button" onClick={handleOpenJadx}>
      {loading && (
        <span className="spinner-border spinner-border-sm me-1" role="status" />
      )}
      Open in JADX
    </button>
  )
}

export default OpenInJadxButton
