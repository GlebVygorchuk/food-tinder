import Homepage from './pages/Homepage/Homepage'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './styles/App.scss'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/register' element={<Register />}/>
        <Route path='/login' element={<Login />}/>
      </Routes>
    </Router>
  )
}

export default App
