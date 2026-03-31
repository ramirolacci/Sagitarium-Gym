import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const ACTIVIDADES = [
  'Pesas', 'Pesas+Cinta', 'Power Jump', 'Danza Urbana',
  'Circuito Aerobico', 'Personalizado', 'Otro'
]
const ESTADOS = ['Al día', 'Debe']

export default function ClienteForm({ cliente, onSuccess, onCancel }) {
  const isEdit = !!cliente
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    apellido: '',
    nombre: '',
    actividad: 'Pesas',
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_vencimiento: '',
    monto_servicio: '',
    monto_pagado: '',
    estado: 'Al día',
    observaciones: '',
  })

  useEffect(() => {
    if (cliente) {
      setForm({
        apellido: cliente.apellido || '',
        nombre: cliente.nombre || '',
        actividad: cliente.actividad || 'Pesas',
        fecha_inicio: cliente.fecha_inicio || '',
        fecha_vencimiento: cliente.fecha_vencimiento || '',
        monto_servicio: cliente.monto_servicio?.toString() || '',
        monto_pagado: cliente.monto_pagado?.toString() || '',
        estado: cliente.estado || 'Al día',
        observaciones: cliente.observaciones || '',
      })
    }
  }, [cliente])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      ...form,
      monto_servicio: parseFloat(form.monto_servicio) || 0,
      monto_pagado: parseFloat(form.monto_pagado) || 0,
      fecha_vencimiento: form.fecha_vencimiento || null,
    }

    let result
    if (isEdit) {
      result = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', cliente.id)
    } else {
      result = await supabase
        .from('clientes')
        .insert([payload])
    }

    if (result.error) {
      setError('Error al guardar: ' + result.error.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-msg" style={{ marginBottom: 20 }}>
          <span>⚠️</span> {error}
        </div>
      )}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Apellido *</label>
          <input
            name="apellido"
            className="form-input"
            value={form.apellido}
            onChange={handleChange}
            placeholder="ej. García"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input
            name="nombre"
            className="form-input"
            value={form.nombre}
            onChange={handleChange}
            placeholder="ej. María"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Actividad *</label>
          <select
            name="actividad"
            className="form-select"
            value={form.actividad}
            onChange={handleChange}
          >
            {ACTIVIDADES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Estado *</label>
          <select
            name="estado"
            className="form-select"
            value={form.estado}
            onChange={handleChange}
          >
            {ESTADOS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Fecha Inicio *</label>
          <input
            name="fecha_inicio"
            type="date"
            className="form-input"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha Vencimiento</label>
          <input
            name="fecha_vencimiento"
            type="date"
            className="form-input"
            value={form.fecha_vencimiento}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Monto Servicio ($)</label>
          <input
            name="monto_servicio"
            type="number"
            min="0"
            className="form-input"
            value={form.monto_servicio}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Monto Pagado ($)</label>
          <input
            name="monto_pagado"
            type="number"
            min="0"
            className="form-input"
            value={form.monto_pagado}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Observaciones</label>
        <textarea
          name="observaciones"
          className="form-textarea"
          value={form.observaciones}
          onChange={handleChange}
          placeholder="Notas opcionales..."
        />
      </div>
      <div className="modal-footer" style={{ padding: 0, marginTop: 8 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? <><span className="spinner"></span> Guardando...</>
            : (isEdit ? '✓ Guardar Cambios' : '+ Agregar Cliente')}
        </button>
      </div>
    </form>
  )
}
