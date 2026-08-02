import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Barrios from './pages/Barrios';
import Asociaciones from './pages/Asociaciones';
import CambiarPassword from './pages/CambiarPassword';

function RutaProtegida({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" replace />;
}

function Rutas() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route path="/barrios" element={<Barrios />} />
        <Route path="/asociaciones" element={<Asociaciones />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
        <Route path="*" element={<Navigate to="/barrios" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </BrowserRouter>
  );
}
