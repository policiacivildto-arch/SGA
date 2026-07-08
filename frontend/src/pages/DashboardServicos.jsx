import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

const STATUS_LIST = [
  'Aberto',
  'Em Andamento',
  'Aguardando Peça',
  'Aguardando Teste',
  'Encaminhado à Fábrica',
  'Concluído',
];

const statusMeta = {
  '': { id: 'card-f-todos', label: '📁 Total Geral', className: 'blue' },
  Aberto: { id: 'card-f-aberto', label: '🔴 Abertos', className: 'red' },
  'Em Andamento': { id: 'card-f-andamento', label: '🟡 Em Andamento', className: 'orange' },
  'Aguardando Peça': { id: 'card-f-peca', label: '🔵 Aguard. Peça', className: 'blue' },
  'Aguardando Teste': { id: 'card-f-teste', label: '🟣 Aguard. Teste', className: 'purple' },
  'Encaminhado à Fábrica': { id: 'card-f-fabrica', label: '🟤 Na Fábrica', className: 'teal' },
  Concluído: { id: 'card-f-concluido', label: '🟢 Concluídos', className: 'green' },
};

function statusBadgeClass(status) {
  if (status === 'Aberto') return 'badge-red';
  if (status === 'Em Andamento') return 'badge-orange';
  if (status === 'Concluído') return 'badge-green';
  return 'badge-blue';
}

function DashboardServicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', armeiro: '', tipo: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page_size', '500');
        params.append('ordering', '-data_rec');
        const data = await apiService.getList('servicos', params);
        setServicos(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const countsByStatus = useMemo(() => {
    return STATUS_LIST.reduce((acc, status) => {
      acc[status] = servicos.filter((item) => item.status === status).length;
      return acc;
    }, {});
  }, [servicos]);

  const filtered = useMemo(() => {
    return servicos.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.armeiro && item.armeiro !== filters.armeiro) return false;
      if (filters.tipo && item.tipo !== filters.tipo) return false;
      return true;
    });
  }, [servicos, filters]);

  const groupedArmeiro = useMemo(() => {
    const bucket = {};
    servicos.forEach((item) => {
      const key = item.armeiro || 'Não informado';
      bucket[key] = (bucket[key] || 0) + 1;
    });
    return Object.entries(bucket).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [servicos]);

  const groupedTipo = useMemo(() => {
    const bucket = {};
    servicos.forEach((item) => {
      const key = item.tipo || 'Não informado';
      bucket[key] = (bucket[key] || 0) + 1;
    });
    return Object.entries(bucket).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [servicos]);

  const groupedDepto = useMemo(() => {
    const bucket = {};
    servicos.forEach((item) => {
      const key = item.depto || 'Não informado';
      bucket[key] = (bucket[key] || 0) + 1;
    });
    return Object.entries(bucket).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [servicos]);

  const groupedCausa = useMemo(() => {
    const bucket = {};
    servicos.forEach((item) => {
      const key = item.motivo || 'Rotina';
      bucket[key] = (bucket[key] || 0) + 1;
    });
    return Object.entries(bucket).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [servicos]);

  const latestRows = filtered.slice(0, 5);

  const maxArmeiro = Math.max(...groupedArmeiro.map(([, value]) => value), 1);
  const maxTipo = Math.max(...groupedTipo.map(([, value]) => value), 1);
  const maxDepto = Math.max(...groupedDepto.map(([, value]) => value), 1);

  const totalCausas = groupedCausa.reduce((sum, [, value]) => sum + value, 0) || 1;

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  return (
    <>
      <div className="page-header">
        <h1>📊 Dashboard Analítico — Serviços de Armas</h1>
        <p>Indicadores de manutenção estruturados com filtros cruzados.</p>
      </div>

      {error && <div className="alert alert-danger show">Erro ao carregar dashboard: {error}</div>}

      <div className="stats-grid">
        {Object.entries(statusMeta).map(([status, meta]) => {
          const value = status ? countsByStatus[status] || 0 : servicos.length;
          return (
            <button
              key={meta.id}
              type="button"
              id={meta.id}
              className={`stat-card ${meta.className} ${filters.status === status ? 'active-filter' : ''}`}
              onClick={() => toggleFilter('status', status)}
            >
              <div className="stat-val">{value}</div>
              <div className="stat-label">{meta.label}</div>
            </button>
          );
        })}
      </div>

      <div className="chart-row-3">
        <div className="card">
          <div className="card-title">👨‍🔧 Serviços por Armeiro</div>
          <div className="chart-v-container">
            {groupedArmeiro.map(([name, value]) => (
              <button
                key={name}
                type="button"
                className={`chart-v-bar-wrapper ${filters.armeiro === name ? 'active-filter' : ''} ${
                  filters.armeiro && filters.armeiro !== name ? 'filtered-out' : ''
                }`}
                onClick={() => toggleFilter('armeiro', name)}
              >
                <span className="chart-v-val">{value}</span>
                <div className="chart-v-bar" style={{ height: `${Math.round((value / maxArmeiro) * 120)}px` }} />
                <span className="chart-v-label">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">⚙️ Tipo de Serviço Executado</div>
          <div className="chart-v-container">
            {groupedTipo.map(([name, value]) => (
              <button
                key={name}
                type="button"
                className={`chart-v-bar-wrapper ${filters.tipo === name ? 'active-filter' : ''} ${
                  filters.tipo && filters.tipo !== name ? 'filtered-out' : ''
                }`}
                onClick={() => toggleFilter('tipo', name)}
              >
                <span className="chart-v-val">{value}</span>
                <div className="chart-v-bar color-2" style={{ height: `${Math.round((value / maxTipo) * 120)}px` }} />
                <span className="chart-v-label">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">❓ Motivo / Causa do Chamado</div>
          <div className="chart-donut-container">
            <div className="chart-donut">{totalCausas}</div>
            <div className="chart-donut-legend">
              {groupedCausa.map(([name, value]) => (
                <div key={name} className="chart-donut-legend-item">
                  <span className="donut-dot" />
                  <span>
                    {name}: <b>{value}</b> ({Math.round((value / totalCausas) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🏢 Carga de Ordens por Departamento Executador</div>
        <div className="chart-v-container chart-v-container-lg">
          {groupedDepto.map(([name, value]) => (
            <div key={name} className="chart-v-bar-wrapper">
              <span className="chart-v-val">{value}</span>
              <div className="chart-v-bar color-3 depto-bar" style={{ height: `${Math.round((value / maxDepto) * 140)}px` }} />
              <span className="chart-v-label chart-v-label-wide">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Últimos Registros Realizados no Sistema</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data Rec.</th>
                <th>Armeiro</th>
                <th>Tipo</th>
                <th>Policial</th>
                <th>Modelo</th>
                <th>Nº Série</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="text-center p-4">Carregando dashboard...</td>
                </tr>
              )}
              {!loading && latestRows.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-4">Sem registros para os filtros atuais.</td>
                </tr>
              )}
              {!loading && latestRows.map((item) => (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.data_rec ? new Date(item.data_rec).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>{item.armeiro}</td>
                  <td>{item.tipo}</td>
                  <td>{item.policial_nome || '—'}</td>
                  <td>{item.modelo}</td>
                  <td>{item.serie}</td>
                  <td><span className={`badge ${statusBadgeClass(item.status)}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DashboardServicos;
