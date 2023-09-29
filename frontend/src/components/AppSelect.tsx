import { useEffect, useState } from 'react';
import { Application } from '../types';
import { useFetch } from '../hooks/useFetch';
import { bytesToImgSrc } from '../utils';

export default function AppSelect({
  onAppSelected,
}: {
  onAppSelected: (app: Application) => void;
}) {
  const {
    data: applications,
    isLoading,
    error,
  } = useFetch<Application[]>('http://localhost:3030/api/applications');
  const [filteredApplications, setFilteredApplications] = useState<
    Application[] | null
  >(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (search === '') {
      setFilteredApplications(applications);
    } else {
      const filterResults =
        applications?.filter((application) => {
          return (
            application.name.toLowerCase().includes(search.toLowerCase()) ||
            application.identifier.toLowerCase().includes(search.toLowerCase())
          );
        }) ?? [];
      setFilteredApplications(filterResults);
    }
  }, [search, applications]);

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-3"
          id="search"
          placeholder="Choose an application to spawn"
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoading && (
          <div className="text-center">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {filteredApplications && (
          <ul className="list-group list-group-flush">
            {filteredApplications.map((application) => (
              <a
                key={application.identifier}
                className="list-group-item list-group-item-action"
                onClick={() => onAppSelected(application)}
                href="#"
              >
                <img
                  src={bytesToImgSrc(application)}
                  className="me-3"
                  width="24"
                  height="24"
                  alt="logo"
                />
                {application.name}
                <span className="ms-2 badge text-bg-secondary">
                  {application.parameters.version}
                </span>
              </a>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
