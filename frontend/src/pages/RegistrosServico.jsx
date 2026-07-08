import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Pagination from '../Pagination';

/* eslint-disable react/prop-types */

function statusBadgeClass(status) {
  if (status === 'Aberto') return 'badge-red';
  if (status === 'Em Andamento') return 'badge-orange';
  if (status === 'Concluído') return 'badge-green';
  return 'badge-blue';
}

function RegistrosServico({ onNavigate }) {
  // Estados para os dados e controles de filtro
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  // 2. Adicione estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15; // Defina quantos itens por página

  // Estados dos filtros
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [armeiroFilter, setArmeiroFilter] = useState('');
  const [ordering, setOrdering] = useState('-data_rec'); // Ordenação inicial

  // Efeito para resetar a página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, tipoFilter, armeiroFilter]);

  // Efeito para buscar os dados da API sempre que um filtro mudar
  useEffect(() => {
    const fetchServicos = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchText) params.append('search', searchText);
        if (statusFilter) params.append('status', statusFilter);
        if (tipoFilter) params.append('tipo', tipoFilter);
        if (armeiroFilter) params.append('armeiro', armeiroFilter);
        if (ordering) params.append('ordering', ordering);
        // 3. Adicione os parâmetros de paginação na chamada da API
        params.append('page', currentPage);
        params.append('page_size', PAGE_SIZE);

        const data = await apiService.getList('servicos', params);
        setServicos(data.results || []);
        setCount(data.count || 0);
      } catch (err) {
        setError(err.message);
        setServicos([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: espera um pouco após o usuário parar de digitar para fazer a busca
    const timer = setTimeout(() => {
      fetchServicos();
    }, 300); // Reduzido para melhor responsividade com paginação

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, [searchText, statusFilter, tipoFilter, armeiroFilter, ordering, currentPage]); // Adicione currentPage

  const handleSort = (column) => {
    const isAsc = ordering === column;
    setOrdering(isAsc ? `-${column}` : column);
  };

  const handleFinalizar = async (id) => {
    try {
      await apiService.update('servicos', id, { status: 'Concluído' });
      // Atualiza a lista localmente para refletir a mudança imediatamente
      setServicos(servicos.map(s => s.id === id ? { ...s, status: 'Concluído' } : s));
    } catch (err) {
      setError(err.message || 'Não foi possível finalizar o serviço.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div><h1>📋 Registros de Serviço</h1><p>Gerencie todos os serviços de manutenção de armamento</p></div>
        <div className="flex gap-8">
          <button className="btn btn-outline btn-sm">📥 CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('pg-novo-servico')}>➕ Novo</button>
        </div>
      </div>
      <div className="card">
        <div className="search-bar">
          <input type="text" placeholder="🔍 Buscar..." value={searchText} onChange={e => setSearchText(e.target.value)} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos os Status</option>
            <option>Aberto</option><option>Em Andamento</option><option>Aguardando Peça</option><option>Aguardando Teste</option><option>Concluído</option>
          </select>
          {/* Os selects de tipo e armeiro podem ser populados dinamicamente no futuro */}
          <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}><option value="">Todos os Tipos</option></select>
          <select value={armeiroFilter} onChange={e => setArmeiroFilter(e.target.value)}><option value="">Todos os Armeiros</option></select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th onClick={() => handleSort('codigo')}>ID</th>
              <th onClick={() => handleSort('data_rec')}>Data Rec.</th>
              <th onClick={() => handleSort('armeiro')}>Armeiro</th>
              <th onClick={() => handleSort('tipo')}>Tipo</th>
              <th onClick={() => handleSort('matricula')}>Matrícula</th>
              <th onClick={() => handleSort('policial_nome')}>Policial</th>
              <th onClick={() => handleSort('depto')}>Depto.</th>
              <th onClick={() => handleSort('modelo')}>Modelo</th>
              <th onClick={() => handleSort('serie')}>Nº Série</th>
              <th onClick={() => handleSort('status')}>Status</th>
              <th>Ações</th>
            </tr></thead>
            <tbody>
              {loading && <tr><td colSpan="11" className="text-center p-4">Carregando...</td></tr>}
              {error && <tr><td colSpan="11" className="text-center p-4 text-red-600">Erro: {error}</td></tr>}
              {!loading && !error && servicos.map(servico => (
                <tr key={servico.id}>
                  <td>{servico.codigo}</td>
                  <td>{new Date(servico.data_rec).toLocaleDateString('pt-BR')}</td>
                  <td>{servico.armeiro}</td><td>{servico.tipo}</td>
                  <td>{servico.matricula}</td><td>{servico.policial_nome}</td>
                  <td>{servico.depto}</td><td>{servico.modelo}</td>
                  <td>{servico.serie}</td>
                  <td><span className={`badge ${statusBadgeClass(servico.status)}`}>{servico.status}</span></td>
                  <td>
                    {servico.status !== 'Concluído' && (
                      <button className="btn btn-xs btn-success" onClick={() => handleFinalizar(servico.id)}>
                        Finalizar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 4. Renderize o componente de paginação */}
        <Pagination
          currentPage={currentPage}
          totalCount={count}
          pageSize={PAGE_SIZE}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>
    </>
  );
}

export default RegistrosServico;