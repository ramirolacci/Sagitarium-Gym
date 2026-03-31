import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import ClienteForm from '../components/ClienteForm'

const ITEMS_PER_PAGE = 20

function formatDate(d) {
  if (!d || d === '0000-00-00') return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function isVencido(fecha) {
  if (!fecha || fecha === '0000-00-00') return false
  return new Date(fecha) < new Date()
}

export default function Clientes({ user, rol }) {
  const [clientes, setClientes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [page, setPage] = useState(0)

  // Modal estado
  const [modalOpen, setModalOpen] = useState(false)
  const [editCliente, setEditCliente] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const isAdmin = rol === 'admin'

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    const from = page * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .order('apellido', { ascending: true })
      .range(from, to)

    if (search.trim()) {
      query = query.or(
        `apellido.ilike.%${search}%,nombre.ilike.%${search}%`
      )
    }
    if (filterEstado) {
      query = query.eq('estado', filterEstado)
    }

    const { data, count, error } = await query
    if (!error) {
      setClientes(data || [])
      setTotal(count || 0)
    }
    setLoading(false)
  }, [page, search, filterEstado])

  useEffect(() => { fetchClientes() }, [fetchClientes])

  // Reset page when search/filter changes
  useEffect(() => { setPage(0) }, [search, filterEstado])

  const handleNewCliente = () => {
    setEditCliente(null)
    setModalOpen(true)
  }

  const handleEdit = (cliente) => {
    setEditCliente(cliente)
    setModalOpen(true)
  }

  const handleFormSuccess = () => {
    setModalOpen(false)
    fetchClientes()
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    setDeleteLoading(true)
    await supabase.from('clientes').delete().eq('id', confirmDelete.id)
    setDeleteLoading(false)
    setConfirmDelete(null)
    fetchClientes()
  }

  // Stats
  const totalDeudores = clientes.filter(c => c.estado === 'Debe').length
  const totalAlDia = clientes.filter(c => c.estado === 'Al día').length

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="app-layout">
      <Navbar user={user} rol={rol} />

      <main className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Clientes</h1>
            <p className="page-subtitle">{total} socios registrados</p>
          </div>
          {isAdmin && (
            <button
              id="btn-nuevo-cliente"
              className="btn btn-primary"
              onClick={handleNewCliente}
            >
              + Nuevo Cliente
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.15)' }}>👥</div>
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Socios</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)' }}>✅</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{totalAlDia}</div>
            <div className="stat-label">Al día (página actual)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-bg)' }}>⚠️</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{totalDeudores}</div>
            <div className="stat-label">Con deuda (página actual)</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                id="search-clientes"
                className="form-input"
                placeholder="Buscar por nombre o apellido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              id="filter-estado"
              className="form-select"
              style={{ maxWidth: 180 }}
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Al día">Al día</option>
              <option value="Debe">Debe</option>
            </select>
            {(search || filterEstado) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); setFilterEstado('') }}
              >
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderTopColor: 'var(--accent)', width: 28, height: 28 }}></div>
              <span style={{ color: 'var(--text-muted)' }}>Cargando clientes...</span>
            </div>
          ) : clientes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏃</div>
              <span>No se encontraron clientes</span>
              {isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={handleNewCliente}>
                  + Agregar el primero
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Apellido</th>
                      <th>Nombre</th>
                      <th>Actividad</th>
                      <th>Vencimiento</th>
                      <th>Servicio</th>
                      <th>Pagado</th>
                      <th>Estado</th>
                      {isAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c) => {
                      const vencido = isVencido(c.fecha_vencimiento)
                      const debe = c.estado === 'Debe'
                      return (
                        <tr key={c.id}>
                          <td className="td-name">{c.apellido}</td>
                          <td>{c.nombre}</td>
                          <td>
                            <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                              {c.actividad}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: vencido ? 'var(--danger)' : 'inherit' }}>
                              {formatDate(c.fecha_vencimiento)}
                              {vencido && ' ⚠️'}
                            </span>
                          </td>
                          <td>${Number(c.monto_servicio).toLocaleString('es-AR')}</td>
                          <td>${Number(c.monto_pagado).toLocaleString('es-AR')}</td>
                          <td>
                            <span className={`badge ${debe ? 'badge-danger' : 'badge-success'}`}>
                              {debe ? '● Debe' : '● Al día'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td>
                              <div className="actions-cell">
                                <button
                                  id={`edit-${c.id}`}
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleEdit(c)}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  id={`delete-${c.id}`}
                                  className="btn btn-danger btn-sm"
                                  onClick={() => setConfirmDelete(c)}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="pagination">
                <span>
                  Mostrando {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, total)} de {total}
                </span>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 0}
                  >
                    ← Anterior
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page + 1 >= totalPages}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal – Alta / Edición */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">
                {editCliente ? '✏️ Editar Cliente' : '+ Nuevo Cliente'}
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ClienteForm
                cliente={editCliente}
                onSuccess={handleFormSuccess}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal – Confirmar Eliminación */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 8 }}>
              <div className="confirm-icon">🗑️</div>
              <p className="confirm-text">
                ¿Eliminar a{' '}
                <span className="confirm-name">
                  {confirmDelete.nombre} {confirmDelete.apellido}
                </span>
                ?<br />
                <small style={{ color: 'var(--text-muted)' }}>Esta acción no se puede deshacer.</small>
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(null)}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-btn"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? <><span className="spinner"></span> Eliminando...</>
                  : '🗑️ Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
