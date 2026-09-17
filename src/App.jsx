import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import GameDetail from './pages/GameDetail'
import Browse from './pages/Browse'
import PCCheck from './pages/PCCheck'
import Compare from './pages/Compare'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/pc-check" element={<PCCheck />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
