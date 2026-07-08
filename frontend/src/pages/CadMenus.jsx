import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';

/* eslint-disable react/prop-types */

function CadMenus() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ grupo: '', valor: '', rotulo: '', ordem: 0, ativo: true });

  const gruposExistentes = Array.from(new Set(rows.map((row) => row.grupo).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const gruposSugeridos = [
    'departamento',
    'cargo_policial',
    'lotacao',
    'item_categoria',
    'item_tipo_armas',
    'item_tipo_equipamentos',
    'item_tipo_uniformes',
    'fornecedor_categoria',
  ];

  const gruposDisponiveis = Array.from(new Set([...gruposSugeridos, ...gruposExistentes]));

  const loadRows = async () => {
    try {
      const data = await apiService.getList('opcoes-menu', new URLSearchParams({ page_size: '500', ordering: 'grupo' }));
      setRows(data.results || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar opções de menu.');
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const handleAdd = async () => {
    if (!form.grupo || !form.valor || !form.rotulo) {
      setError('Preencha grupo, valor e rótulo para salvar opção.');
      return;
    }

    try {
      setError('');
      await apiService.create('opcoes-menu', { ...form, ordem: Number(form.ordem || 0) });
      setForm({ grupo: '', valor: '', rotulo: '', ordem: 0, ativo: true });
      setIsModalOpen(false);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao salvar opção de menu.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.remove('opcoes-menu', id);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao excluir opção de menu.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>🧩 Menus Suspensos</h1>
          <p>Gerencie as opções de selects utilizadas no sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>➕ Nova Opção</button>
      </div>
      {error && <div className="alert alert-danger show">{error}</div>}

      <Modal
        isOpen={isModalOpen}
        title="🧩 Nova Opção de Menu"
        onClose={() => setIsModalOpen(false)}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAdd}>💾 Salvar</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="menu-grupo">Grupo *</label>
            <input id="menu-grupo" list="menu-grupo-lista" value={form.grupo} onChange={(e) => setForm((p) => ({ ...p, grupo: e.target.value }))} placeholder="Ex.: departamento" />
            <datalist id="menu-grupo-lista">
              {gruposDisponiveis.map((grupo) => (
                <option key={grupo} value={grupo} />
              ))}
            </datalist>
          </div>
          <div className="form-group"><label htmlFor="menu-valor">Valor *</label><input id="menu-valor" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="menu-rotulo">Rótulo *</label><input id="menu-rotulo" value={form.rotulo} onChange={(e) => setForm((p) => ({ ...p, rotulo: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="menu-ordem">Ordem</label><input id="menu-ordem" type="number" value={form.ordem} onChange={(e) => setForm((p) => ({ ...p, ordem: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="menu-ativo">Ativo</label><select id="menu-ativo" value={form.ativo ? '1' : '0'} onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.value === '1' }))}><option value="1">Sim</option><option value="0">Não</option></select></div>
        </div>
      </Modal>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Grupo</th><th>Valor</th><th>Rótulo</th><th>Ordem</th><th>Ativo</th><th>Ações</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.grupo}</td><td>{row.valor}</td><td>{row.rotulo}</td><td>{row.ordem}</td><td>{row.ativo ? 'Sim' : 'Não'}</td>
                  <td><button className="btn btn-xs btn-danger" onClick={() => handleDelete(row.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default CadMenus;
