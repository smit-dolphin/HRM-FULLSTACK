import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { querryClient } from './querryOptions/querryClinets.ts'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={querryClient}>
    <App />
  </QueryClientProvider>
   
)
