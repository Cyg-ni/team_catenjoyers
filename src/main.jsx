import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CheckApp from './testing/testing-tailwind.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CheckApp />
  </StrictMode>,
)
