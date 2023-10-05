import { useEffect, useState } from 'react'
import { Application } from '../../types'
import { useFetch } from '../../hooks/useFetch'
import { bytesToImgSrc } from '../../utils'
import { Input } from '../ui/Input'
import { AppSelectSkeleton } from './components'

export default function AppSelect({
  onAppSelected,
}: {
  onAppSelected: (app: Application) => void
}) {
  const {
    data: applications,
    isLoading,
    error,
  } = useFetch<Application[]>('http://localhost:3030/api/applications')
  const [filteredApplications, setFilteredApplications] = useState<
    Application[] | null
  >(null)
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    if (search === '') {
      setFilteredApplications(applications)
    } else {
      const filterResults =
        applications?.filter((application) => {
          return (
            application.name.toLowerCase().includes(search.toLowerCase()) ||
            application.identifier.toLowerCase().includes(search.toLowerCase())
          )
        }) ?? []
      setFilteredApplications(filterResults)
    }
  }, [search, applications])

  return (
    <>
      <Input
        type="text"
        className="bg-transparent rounded-md w-full outline-none"
        id="search"
        placeholder="Choose an application to spawn"
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading && <AppSelectSkeleton />}
      {error && (
        <div className="mt-4 text-red-500" role="alert">
          {error}
        </div>
      )}
      {filteredApplications && (
        <ul>
          {filteredApplications.map((application) => (
            <a
              key={application.identifier}
              className="flex items-center gap-3 my-3 hover:bg-gray-800 rounded-md p-2"
              onClick={() => onAppSelected(application)}
              href="#"
            >
              <img
                src={bytesToImgSrc(application)}
                className="w-6 h-6 max-w-6 max-h-6"
                alt="logo"
              />
              <div>
                <span className="text-lg">{application.name}</span>
                <span className="ml-2 text-xs italic text-slate-200">
                  {application.parameters.version}
                </span>
              </div>
            </a>
          ))}
        </ul>
      )}
    </>
  )
}
