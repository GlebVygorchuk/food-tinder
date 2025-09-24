import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Main from './pages/Main/Main'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ContextProvider from './components/AppContext'
import { ToastContainer } from 'react-toastify'
import './styles/App.scss'

function App() {
  return (
    <ContextProvider>
    <Router>
      <ToastContainer 
      autoClose={5000}
      theme='dark'/>
      <Routes>
        <Route path='/' element={<Main />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/login' element={<Login />}/>
      </Routes>
    </Router>
    </ContextProvider>
  )
}

export default App
