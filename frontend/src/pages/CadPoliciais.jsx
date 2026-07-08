import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { CARGOS_POLICIAIS, DEPARTAMENTOS_PADRAO } from '../constants/organizacao';
import { getMenuOptions } from '../services/menuOptions';

/* eslint-disable react/prop-types */

function CadPoliciais() {
  const [rows, setRows] = useState([]);
  const [lotacoes, setLotacoes] = useState([]);
  const [cargosMenu, setCargosMenu] = useState([]);
  const [departamentosMenu, setDepartamentosMenu] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ matricula: '', nome: '', cargo: '', depto: '', lotacao: '' });

  const loadRows = async () => {
    try {
      const params = new URLSearchParams({ page_size: '500', ordering: 'nome' });
      if (search.trim()) params.append('search', search.trim());
      const policiaisData = await apiService.getList('policiais', params);
      setRows(policiaisData.results || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar policiais.');
    }
  };

  const loadLotacoes = async () => {
    try {
      const lotacoesData = await apiService.getList('lotacoes', new URLSearchParams({ page_size: '1000', ordering: 'depto,nome' }));
      setLotacoes(lotacoesData.results || []);
    } catch {
      // Mantem funcionamento do cadastro mesmo sem lotacoes.
    }
  };

  const departamentos = useMemo(() => {
    const set = new Set();
    if (departamentosMenu.length > 0) {
      departamentosMenu.forEach((opt) => set.add(opt.label));
    } else {
      DEPARTAMENTOS_PADRAO.forEach((d) => set.add(d));
    }
    lotacoes.forEach((l) => {
      if (l.depto) set.add(l.depto);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [lotacoes, departamentosMenu]);

  const cargos = useMemo(() => {
    if (cargosMenu.length > 0) return cargosMenu.map((opt) => opt.label);
    return CARGOS_POLICIAIS;
  }, [cargosMenu]);

  const lotacoesDoDepto = useMemo(() => {
    if (!form.depto) return [];
    const set = new Set();
    lotacoes
      .filter((l) => l.depto === form.depto)
      .forEach((l) => {
        if (l.nome) set.add(l.nome);
      });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [form.depto, lotacoes]);

  useEffect(() => {
    const timer = setTimeout(() => loadRows(), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadLotacoes();
  }, []);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const [cargosData, departamentosData] = await Promise.all([
          getMenuOptions('cargo_policial'),
          getMenuOptions('departamento'),
        ]);
        setCargosMenu(cargosData);
        setDepartamentosMenu(departamentosData);
      } catch {
        // fallback para listas locais
      }
    };

    loadMenus();
  }, []);

  const handleAdd = async () => {
    if (!form.matricula || !form.nome || !form.depto || !form.lotacao) {
      setError('Preencha os campos obrigatórios do policial.');
      return;
    }

    try {
      setError('');
      await apiService.create('policiais', form);
      setForm({ matricula: '', nome: '', cargo: '', depto: '', lotacao: '' });
      setIsModalOpen(false);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao cadastrar policial.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.remove('policiais', id);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao excluir policial.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>👮 Gerenciamento de Policiais</h1>
          <p>Relação de servidores ativos no sistema de logística</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>➕ Cadastrar Servidor</button>
      </div>
      {error && <div className="alert alert-danger show">{error}</div>}

      <Modal
        isOpen={isModalOpen}
        title="👮 Cadastro de Servidor Policial"
        onClose={() => setIsModalOpen(false)}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAdd}>💾 Salvar</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="form-group"><label htmlFor="pol-mat">Matrícula *</label><input id="pol-mat" value={form.matricula} onChange={(e) => setForm((p) => ({ ...p, matricula: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="pol-nome">Nome *</label><input id="pol-nome" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} /></div>
          <div className="form-group">
            <label htmlFor="pol-cargo">Cargo</label>
            <select id="pol-cargo" value={form.cargo} onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}>
              <option value="">Selecione...</option>
              {cargos.map((cargo) => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pol-depto">Departamento *</label>
            <select id="pol-depto" value={form.depto} onChange={(e) => setForm((p) => ({ ...p, depto: e.target.value, lotacao: '' }))}>
              <option value="">Selecione...</option>
              {departamentos.map((depto) => (
                <option key={depto} value={depto}>{depto}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pol-lot">Lotação *</label>
            <select id="pol-lot" value={form.lotacao} onChange={(e) => setForm((p) => ({ ...p, lotacao: e.target.value }))} disabled={!form.depto}>
              <option value="">{form.depto ? 'Selecione...' : 'Selecione o departamento'}</option>
              {lotacoesDoDepto.map((lotacao) => (
                <option key={lotacao} value={lotacao}>{lotacao}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <div className="card">
        <div className="search-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Buscar por nome, matrícula, cargo, depto..." style={{ width: '100%' }} /></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Matrícula</th><th>Nome</th><th>Cargo</th><th>Departamento</th><th>Lotação</th><th>Ações</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><b>{row.matricula}</b></td><td>{row.nome}</td><td>{row.cargo || '—'}</td><td>{row.depto}</td><td>{row.lotacao}</td>
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

export default CadPoliciais;
