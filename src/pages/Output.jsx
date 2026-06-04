import { useState } from 'react'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'

// The output experience: branded login first, then the dashboard. The brand is
// pre-configured (SEATAC default) in BrandContext, so there is no config step.
export default function Output() {
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return <Dashboard onLogout={() => setLoggedIn(false)} />
}
