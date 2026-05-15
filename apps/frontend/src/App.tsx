import { Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary-700 mb-2">
                  Sanmar Meeting System
                </h1>
                <p className="text-neutral-500 text-lg mb-8">
                  Meeting room &amp; site visit booking platform
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  🚧 Phase 0 — Foundation Setup
                </div>
              </div>
            </div>
          }
        />
        {/* Routes will be added here:
          /login
          /dashboard
          /bookings
          /bookings/new
          /bookings/:id
          /admin
        */}
      </Routes>
    </div>
  );
}

export default App;
