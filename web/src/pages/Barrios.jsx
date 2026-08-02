import { useEffect, useState } from 'react';
import api from '../api';

const vacio = { nombre: '', subdominio: '', url: '', activo: true };

export default function Barrios() {
  const [barrios, setBarrios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');

  async function cargar() {
    const { data } = await api.get('/barrios');
    setBarrios(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editando) {
        await api.put(`/barrios/${editando}`, form);
      } else {
        await api.post('/barrios', form);
      }
      setForm(vacio);
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo guardar el barrio');
    }
  }

  function editar(barrio) {
    setEditando(barrio.id_barrio);
    setForm({ nombre: barrio.nombre, subdominio: barrio.subdominio, url: barrio.url, activo: barrio.activo });
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este barrio? Esto no borra su base, solo lo saca del directorio.')) return;
    await api.delete(`/barrios/${id}`);
    cargar();
  }

  return (
    <div className="row">
      <div className="col-md-5">
        <h5>{editando ? 'Editar barrio' : 'Nuevo barrio'}</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-3">
          <div className="mb-2">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="mb-2">
            <label className="form-label">Subdominio</label>
            <input className="form-control" placeholder="sanpablo" value={form.subdominio} onChange={(e) => setForm({ ...form, subdominio: e.target.value })} required />
          </div>
          <div className="mb-2">
            <label className="form-label">URL del backend</label>
            <input className="form-control" placeholder="https://sanpablo.debarrios.com.ar" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          </div>
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} id="activo" />
            <label className="form-check-label" htmlFor="activo">Activo</label>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar' : 'Crear'}</button>
            {editando && (
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditando(null); setForm(vacio); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="col-md-7">
        <h5>Barrios</h5>
        <table className="table table-sm table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Subdominio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {barrios.map((b) => (
              <tr key={b.id_barrio}>
                <td>{b.nombre}</td>
                <td>{b.subdominio}</td>
                <td>{b.activo ? <span className="badge text-bg-success">Activo</span> : <span className="badge text-bg-secondary">Inactivo</span>}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editar(b)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(b.id_barrio)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
