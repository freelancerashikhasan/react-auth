import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css'
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import axios, {isCancel, AxiosError} from 'axios';
import Form from './pages/Form.jsx';
import AuthComponent from './Components/AuthComponent.jsx';
import toast, { Toaster } from 'react-hot-toast';
import Login from './pages/Login.jsx';

import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BookDetail from './pages/BookDetail.jsx';
import PdfDetail from './pages/PdfDetail.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import TrainingDetails from './pages/TrainingDetails.jsx';
import TrainingSuccess from './pages/TrainingSuccess.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ProfileCompletion from './Components/ProfileCompletion.jsx';
import WhatsAppLogin from './pages/WhatsAppLogin.jsx';
import Register from './pages/Register.jsx';
import Trainings from './pages/Trainings/Trainings.jsx';
import OnlineCourses from './pages/Trainings/OnlineCourses.jsx';
import Orders from './pages/Trainings/Orders.jsx';
import VideoCourses from './pages/Trainings/VideoCourses.jsx';
import VideoCoursePlayer from './pages/Trainings/VideoCoursePlayer.jsx';
import ScrollToTop from './Components/ScrollToTop.jsx';

function App() {
   const { user, requiresProfileCompletion } = useAuth();
  return (
    <>
      <div>
        {/* <AuthComponent></AuthComponent> */}
        <Toaster />
         <CartProvider>
            <ScrollToTop />
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/training/:type/:id" element={<TrainingDetails />} />
            <Route path="/training-success/:type/:id" element={<TrainingSuccess />} />
            <Route path="/order-success" element={<OrderSuccess />} />
             <Route path="/complete-profile" element={
                requiresProfileCompletion ? <ProfileCompletion /> : <Navigate to="/dashboard" />
            } />

             {/* <Route path="/enroll/:type/:id" element={<EnrollmentForm />} /> */}
            <Route path="/pdfs/:id" element={<PdfDetail />} />
            <Route path="/checkout" element={<Checkout />} />
              <Route element={<ProtectedRoute requireAuth={false} redirectTo="/profile" />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/whatsapp-login" element={<WhatsAppLogin />} />
                  {/* <Route path="/register" element={<Register />} /> */}
              </Route>
                <Route element={<ProtectedRoute requireAuth={true} />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/trainings" element={<Trainings />} />
                    <Route path="/online-courses" element={<OnlineCourses />} />
                    <Route path="/video-courses" element={<VideoCourses />} />
                     <Route path="video-courses/player/:courseId" element={<VideoCoursePlayer />} /> {/* Add this route */}
                    <Route path="/orders" element={<Orders />} />
                </Route>
        
            <Route path='/*' element={<NotFound/>}/>
            
          </Routes>
          </CartProvider>
      </div>
    </>
  )
}

export default App
