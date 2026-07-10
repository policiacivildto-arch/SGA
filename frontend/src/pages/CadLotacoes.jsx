import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';

/* eslint-disable react/prop-types */

function CadLotacoes() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ depto: '', nome: '', cidade: '', resp: '', area_atuacao: '', ais: '', tel: '', end: '' });

  const loadRows = async () => {
    try {
      const params = new URLSearchParams({ page_size: '500', ordering: 'depto' });
      if (search.trim()) params.append('search', search.trim());
      const data = await apiService.getList('lotacoes', params);
      setRows(data.results || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar lotações.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadRows(), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = async () => {
    if (!form.depto || !form.nome || !form.cidade) {
      setError('Preencha os campos obrigatórios da lotação.');
      return;
    }

    try {
      setError('');
      await apiService.create('lotacoes', form);
      setForm({ depto: '', nome: '', cidade: '', resp: '', area_atuacao: '', ais: '', tel: '', end: '' });
      setIsModalOpen(false);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao cadastrar lotação.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.remove('lotacoes', id);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao excluir lotação.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>🏢 Mapa de Unidades e Lotações</h1>
          <p>Configuração territorial e circunscricional</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>➕ Nova Lotação</button>
      </div>
      {error && <div className="alert alert-danger show">{error}</div>}

      <Modal
        isOpen={isModalOpen}
        title="🏢 Unidade / Lotação"
        onClose={() => setIsModalOpen(false)}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAdd}>💾 Salvar</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="form-group"><label htmlFor="lot-depto">Departamento *</label><input id="lot-depto" value={form.depto} onChange={(e) => setForm((p) => ({ ...p, depto: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="lot-nome">Nome *</label><input id="lot-nome" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="lot-cidade">Cidade *</label><input id="lot-cidade" value={form.cidade} onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="lot-resp">Responsável</label><input id="lot-resp" value={form.resp} onChange={(e) => setForm((p) => ({ ...p, resp: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="lot-area">Bairros/Locais de Atuação</label><input id="lot-area" value={form.area_atuacao} onChange={(e) => setForm((p) => ({ ...p, area_atuacao: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="lot-ais">AIS</label><input id="lot-ais" value={form.ais} onChange={(e) => setForm((p) => ({ ...p, ais: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="lot-tel">Telefone</label><input id="lot-tel" value={form.tel} onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="lot-end">Endereço</label><input id="lot-end" value={form.end} onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))} /></div>
        </div>
      </Modal>

      <div className="card">
        <div className="search-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Buscar por depto, nome, cidade, área, AIS..." style={{ width: '100%' }} /></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Departamento</th><th>Nome</th><th>Cidade</th><th>Responsável</th><th>Bairros/Locais de Atuação</th><th>AIS</th><th>Telefone</th><th>Ações</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><b>{row.depto}</b></td><td>{row.nome}</td><td>{row.cidade}</td><td>{row.resp || '—'}</td><td>{row.area_atuacao || '—'}</td><td>{row.ais || '—'}</td><td>{row.tel || '—'}</td>
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

export default CadLotacoes;
