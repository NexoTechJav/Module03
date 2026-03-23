import React, { useState } from 'react';
import './App.css';
import AddCandidateForm from './components/AddCandidateForm';

type View = 'dashboard' | 'addCandidate';

function App() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <div className="appRoot">
      {view === 'dashboard' ? (
        <div className="page">
          <div className="container">
            <div className="card">
              <h1>ATS - Dashboard Reclutador</h1>
              <p className="muted">
                Gestiona candidatos de forma rapida y eficiente.
              </p>

              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => setView('addCandidate')}
                >
                  Anadir candidato
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {view === 'addCandidate' ? (
        <AddCandidateForm onCancel={() => setView('dashboard')} />
      ) : null}
    </div>
  );
}

export default App;
