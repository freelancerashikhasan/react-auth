import { Route, Routes } from 'react-router-dom';
import './App.css'
import Home from './pages/Home.jsx';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound.jsx';
import axios, {isCancel, AxiosError} from 'axios';
import Form from './pages/Form.jsx';
import AuthComponent from './Components/AuthComponent.jsx';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <div>
        <AuthComponent></AuthComponent>
        <Toaster />
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/chat/:userId' element={<Chat/>}/>
            <Route path='/form' element={<Form/>}/>
            <Route path='/*' element={<NotFound/>}/>
            
          </Routes>
      </div>
    </>
  )
}

export default App
