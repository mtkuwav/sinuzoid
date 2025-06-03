/// <reference types="vite-plugin-svgr/client" />

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Footer from './components/common/footer'
import SinuzoidLogo from './assets/logos/logo_sinuzoid-cyan.svg?react'
import Header from './components/common/header'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16"> {/* Ajoute un padding-top égal à la hauteur du header (h-16) */}
        <div className="container mx-auto px-4 py-8">
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
          </div>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
          <SinuzoidLogo className='fill-amber-700 size-24 '/>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
