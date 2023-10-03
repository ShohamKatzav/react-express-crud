import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Navbar from './components/navBar';
import ProfilePage from './pages/profilePage';
import TodoListPage from './pages/todoListPage';
import ContactPage from './pages/contactPage';
import AboutPage from './pages/aboutPage';
import Footer from './components/footer';

const router = createBrowserRouter([
  { path: "*", Component: Root },
]);


function App() {

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
      />
    </>
  )
}

function Root() {
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<TodoListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
      <Footer/>
    </div>
  );
}


export default App
