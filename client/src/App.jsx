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
        autoClose={2800}
        hideProgressBar={false}
        newestOnTop
        closeButton={false}
        toastStyle={{
          borderRadius: '20px',
          border: '1px solid rgba(31, 64, 87, 0.12)',
          background: 'rgba(255, 250, 244, 0.96)',
          color: '#193042',
          boxShadow: '0 24px 60px rgba(25, 48, 66, 0.14)',
        }}
      />
    </>
  )
}

function Root() {
  return (
    <div className="app-shell">
      <div className="app-shell__orb app-shell__orb--one" />
      <div className="app-shell__orb app-shell__orb--two" />
      <div className="app-shell__grid" />
      <Navbar />
      <main className="app-shell__main">
        <Routes>
          <Route path="/" element={<TodoListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


export default App
