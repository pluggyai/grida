import { Application } from '../types';
import { bytesToImgSrc } from '../utils';
import AddCustomScript from './AddCustomScript';

export default function AppSetup({
  application,
}: {
  application: Application;
}) {
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
          v-model="pinning"
        />
        <label className="form-check-label" htmlFor="sslpinning">
          SSL Pinning
        </label>
      </div>
      <AddCustomScript />
    </div>
  );
}
