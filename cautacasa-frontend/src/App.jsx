import {BrowserRouter, Routes, Route} from "react-router-dom"
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyPhone from "./pages/VerifyPhone";
import { AuthProvider } from "./context/AuthContext";

export default function App(){
  return(
    <AuthProvider>
     <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}