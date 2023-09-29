import { useState } from 'react';
import './App.css';
import AppSelect from './components/AppSelect';
import { Application } from './types';
import AppSetup from './components/AppSetup';

function App() {
  const [application, setApplication] = useState<Application | null>(null);
  return (
    <div className="App">
      <h1 className="main-title pb-1 pt-1 text-center">
        <i className="las la-angle-right"></i>grida
      </h1>
      <div className="container" id="app">
        <div className="row">
          <div className="col-8 offset-2 pt-3">
            {!application && (
              <AppSelect
                onAppSelected={(app) => setApplication(app)}
              ></AppSelect>
            )}
            {application && <AppSetup application={application}></AppSetup>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
