import { useState } from 'react';
import api from '../api';

export default function CambiarPassword() {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (passwordNueva !== confirmar) {
      setError('La confirmación no coincide con la contraseña nueva');
      return;
    }

    setCargando(true);
    try {
      await api.patch('/auth/password', { password_actual: passwordActual, password_nueva: passwordNueva });
      setMensaje('Contraseña actualizada correctamente.');
      setPasswordActual('');
      setPasswordNueva('');
      setConfirmar('');
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo cambiar la contraseña');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="row">
      <div className="col-md-5">
        <h5>Cambiar contraseña</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {mensaje && <div className="alert alert-success py-2">{mensaje}</div>}
        <form onSubmit={handleSubmit} className="card p-3">
          <div className="mb-2">
            <label className="form-label">Contraseña actual</label>
            <input
              type="password"
              className="form-control"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Contraseña nueva</label>
            <input
              type="password"
              className="form-control"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirmar contraseña nueva</label>
            <input
              type="password"
              className="form-control"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
