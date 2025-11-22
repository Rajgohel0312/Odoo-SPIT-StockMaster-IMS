import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import Sidebar from './components/Sidebar'; 
import Login from "./pages/Login";
function App() {
   const { user } = useContext(AuthContext);
  return (
    <>  
     <BrowserRouter>
      {user && <Sidebar />}
      <Routes>
        {!user? (
          <>
          <Route path="/" element={<Login />} />
          </>
        ):(
          <>
          </>
        )}
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
