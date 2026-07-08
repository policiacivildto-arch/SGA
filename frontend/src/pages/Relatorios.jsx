import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

/* eslint-disable react/prop-types */

function Relatorios() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page_size: '500', ordering: '-data' });
      if (search.trim()) params.append('search', search.trim());
      if (categoria.trim()) params.append('categoria', categoria.trim());
      const data = await apiService.getList('movimentos', params);
      setRows(data.results || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const buildCautelaFileName = (isFiltrada) => {
    const categoriaLabel = categoria.trim() ? categoria.trim().toLowerCase().replace(/\s+/g, '_') : 'todas';
    return isFiltrada
      ? `relatorio_cautelas_${categoriaLabel}_filtradas.xlsx`
      : `relatorio_cautelas_${categoriaLabel}.xlsx`;
  };

  const handleBaixarCautelas = async ({ usarBusca = false } = {}) => {
    try {
      setError('');
      const params = new URLSearchParams();
      if (categoria.trim()) params.append('categoria', categoria.trim());

      const searchValue = search.trim();
      if (usarBusca && !searchValue) {
        setError('Digite um termo na busca para baixar a planilha filtrada.');
        return;
      }
      if (usarBusca) params.append('search', searchValue);

      await apiService.download(
        'cautelas/relatorio-xlsx',
        buildCautelaFileName(usarBusca),
        params,
      );
    } catch (err) {
      setError(err.message || 'Falha ao baixar planilha de cautelas.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadRows(), 250);
    return () => clearTimeout(timer);
  }, [search, categoria]);

  return (
    <>
      <div className="page-header">
        <h1>📑 Relatório Geral de Movimentação</h1>
        <p>Histórico consolidado do almoxarifado</p>
      </div>

      {error && <div className="alert alert-danger show">{error}</div>}

      <div className="card">
        <div className="search-bar">
          <input
            type="text"
            value={search}
            placeholder="🔍 Pesquisar por item, policial, lotação, tipo..."
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group mt-16">
          <label htmlFor="rel-categoria">Categoria do Histórico</label>
          <select
            id="rel-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Armas">Armas</option>
            <option value="Drones">Drones</option>
            <option value="Uniformes">Uniformes</option>
            <option value="Munições">Munições</option>
            <option value="Equipamentos">Equipamentos</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={loadRows}>🔍 Atualizar Histórico</button>
        <button className="btn btn-outline" onClick={() => handleBaixarCautelas({ usarBusca: false })}>⬇️ Baixar Planilha Cautelas (Categoria/Todas)</button>
        <button className="btn btn-outline" onClick={() => handleBaixarCautelas({ usarBusca: true })}>⬇️ Baixar Planilha Cautelas (Filtradas)</button>

        <div className="table-wrap mt-16">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo Movimentação</th>
                <th>Item / Carga</th>
                <th>Qtd</th>
                <th>Policial</th>
                <th>Unidade / Lotação</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="6" className="text-center p-4">Carregando...</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan="6" className="text-center p-4">Sem movimentações.</td></tr>}
              {!loading && rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.data ? new Date(row.data).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>{row.tipo}</td>
                  <td><b>{row.item_desc}</b></td>
                  <td>{row.qtd}</td>
                  <td>{row.policial || '—'}</td>
                  <td>{row.lotacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Relatorios;
