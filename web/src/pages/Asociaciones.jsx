import { useEffect, useState } from 'react';
import api from '../api';

const vacio = { dni: '', nombre: '', apellido: '', id_barrio: '' };

export default function Asociaciones() {
  const [asociaciones, setAsociaciones] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [filtroDni, setFiltroDni] = useState('');
  const [error, setError] = useState('');

  async function cargar(dni) {
    const { data } = await api.get('/asociaciones', { params: dni ? { dni } : {} });
    setAsociaciones(data);
  }

  useEffect(() => {
    cargar();
    api.get('/barrios').then(({ data }) => setBarrios(data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/asociaciones', { ...form, id_barrio: Number(form.id_barrio) });
      setForm(vacio);
      cargar(filtroDni);
    } catch (err) {
      setError(err.response?.data?.error ?? 'No se pudo guardar la asociacion');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Quitar este barrio del DNI?')) return;
    await api.delete(`/asociaciones/${id}`);
    cargar(filtroDni);
  }

  async function toggleActivo(a) {
    await api.patch(`/asociaciones/${a.id}/estado`, { activo: !a.activo });
    cargar(filtroDni);
  }

  function buscar(e) {
    e.preventDefault();
    cargar(filtroDni);
  }

  return (
    <div className="row">
      <div className="col-md-5">
        <h5>Asociar DNI a un barrio</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-3">
          <div className="mb-2">
            <label className="form-label">DNI</label>
            <input className="form-control" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} required />
          </div>
          <div className="mb-2">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="mb-2">
            <label className="form-label">Apellido</label>
            <input className="form-control" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Barrio</label>
            <select className="form-select" value={form.id_barrio} onChange={(e) => setForm({ ...form, id_barrio: e.target.value })} required>
              <option value="">Elegir...</option>
              {barrios.map((b) => (
                <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Asociar</button>
        </form>
      </div>
      <div className="col-md-7">
        <h5>Asociaciones</h5>
        <form className="input-group mb-3" onSubmit={buscar}>
          <input className="form-control" placeholder="Buscar por DNI..." value={filtroDni} onChange={(e) => setFiltroDni(e.target.value)} />
          <button className="btn btn-outline-secondary" type="submit">Buscar</button>
        </form>
        <table className="table table-sm table-hover">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Barrio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {asociaciones.map((a) => (
              <tr key={a.id}>
                <td>{a.dni}</td>
                <td>{[a.nombre, a.apellido].filter(Boolean).join(' ')}</td>
                <td>{a.barrio.nombre}</td>
                <td>
                  {a.activo ? <span className="badge text-bg-success">Activo</span> : <span className="badge text-bg-secondary">Inactivo</span>}
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => toggleActivo(a)}>
                    {a.activo ? 'Inactivar' : 'Activar'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(a.id)}>Quitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
