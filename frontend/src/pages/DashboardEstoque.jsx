import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

/* eslint-disable react/prop-types */

function DashboardEstoque() {
  const [dashboard, setDashboard] = useState({
    categorias: [],
    locais: [],
    stats: { total: 0, disp: 0, ativas: 0, registros_itens: 0 },
    by_categoria: [],
    by_status: [],
    by_modelo: [],
    validade: {
      qtdVencidos: 0,
      qtdVence30: 0,
      qtdVence60: 0,
      qtdSemValidade: 0,
      itensCriticos: [],
      porAno: [],
    },
    armas_por_local: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [deptoFiltro, setDeptoFiltro] = useState('');
  const [seccionalFiltro, setSeccionalFiltro] = useState('');
  const [delegaciaFiltro, setDelegaciaFiltro] = useState('');
  const [modeloFiltro, setModeloFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (categoriaFiltro) params.set('categoria', categoriaFiltro);
        if (deptoFiltro) params.set('depto', deptoFiltro);
        if (seccionalFiltro) params.set('seccional', seccionalFiltro);
        if (delegaciaFiltro) params.set('delegacia', delegaciaFiltro);
        if (statusFiltro) params.set('status', statusFiltro);
        if (modeloFiltro) params.set('modelo', modeloFiltro);

        const response = await apiService.getList('dashboard/estoque', params);
        setDashboard(response);
      } catch (err) {
        setError(err.message || 'Falha ao carregar dashboard de estoque.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [categoriaFiltro, deptoFiltro, seccionalFiltro, delegaciaFiltro, modeloFiltro, statusFiltro]);

  const categorias = useMemo(() => dashboard.categorias || [], [dashboard]);
  const locaisFiltro = useMemo(() => dashboard.locais || [], [dashboard]);

  const departamentos = useMemo(() => {
    const set = new Set(locaisFiltro.map((l) => l.departamento).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [locaisFiltro]);

  const seccionais = useMemo(() => {
    const set = new Set(
      locaisFiltro
        .filter((l) => !deptoFiltro || l.departamento === deptoFiltro)
        .map((l) => l.seccional)
        .filter(Boolean),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [locaisFiltro, deptoFiltro]);

  const delegacias = useMemo(() => {
    const set = new Set(
      locaisFiltro
        .filter((l) => (!deptoFiltro || l.departamento === deptoFiltro) && (!seccionalFiltro || l.seccional === seccionalFiltro))
        .map((l) => l.delegacia)
        .filter(Boolean),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [locaisFiltro, deptoFiltro, seccionalFiltro]);

  const modeloOptions = useMemo(() => {
    const set = new Set((dashboard.armas_por_local || []).map(arma => arma.modelo));
    return Array.from(set).sort();
  }, [dashboard.armas_por_local]);

  const byCategoria = useMemo(() => dashboard.by_categoria || [], [dashboard]);
  const byStatus = useMemo(() => dashboard.by_status || [], [dashboard]);
  const byModelo = useMemo(() => dashboard.by_modelo || [], [dashboard]);

  const statusOptions = useMemo(() => {
    const set = new Set(byStatus.map(([status]) => status));
    return Array.from(set).sort();
  }, [byStatus]);

  const maxCategoria = Math.max(...byCategoria.map(([, val]) => Number(val)), 1);
  const maxStatus = Math.max(...byStatus.map(([, val]) => Number(val)), 1);
  const maxModelo = Math.max(...byModelo.map(([, val]) => Number(val)), 1);

  const stats = dashboard.stats || { total: 0, disp: 0, ativas: 0, registros_itens: 0 };
  const validadeResumo = dashboard.validade || { qtdVencidos: 0, qtdVence30: 0, qtdVence60: 0, qtdSemValidade: 0, itensCriticos: [], porAno: [] };
  const armasPorLocal = dashboard.armas_por_local || [];

  const validadePorAno = useMemo(() => {
    return (validadeResumo.porAno || []).map((item) => ({
      ano: String(item.ano || ''),
      quantidade: Number(item.quantidade || 0),
    }));
  }, [validadeResumo]);

  const validadeGrafico = useMemo(() => {
    const rows = validadePorAno;
    const width = 1200;
    const height = 260;
    const left = 38;
    const right = 18;
    const top = 18;
    const bottom = 44;

    if (rows.length === 0) return { viewBox: `0 0 ${width} ${height}`, points: [], max: 1, baselineY: height - bottom, left, right };

    const maxRaw = Math.max(...rows.map((r) => r.quantidade), 1);
    const max = Math.max(10, Math.ceil(maxRaw * 1.2)); 
    const usableW = width - left - right;
    const usableH = height - top - bottom;
    const step = rows.length > 1 ? usableW / (rows.length - 1) : 0;

    const points = rows.map((row, idx) => ({
      ...row,
      x: left + (idx * step),
      y: top + ((1 - (row.quantidade / max)) * usableH),
    }));

    return { viewBox: `0 0 ${width} ${height}`, points, max, baselineY: height - bottom, left, right };
  }, [validadePorAno]);

  const validadePath = useMemo(() => {
    const pts = validadeGrafico.points;
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    const commands = [`M ${pts[0].x} ${pts[0].y}`];
    for (let i = 0; i < pts.length - 1; i += 1) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      commands.push(`Q ${cx} ${p0.y}, ${p1.x} ${p1.y}`);
    }
    return commands.join(' ');
  }, [validadeGrafico]);

  const formatMil = (value) => {
    const num = Number(value || 0);
    if (num >= 1000) return `${Math.round(num / 1000)} mil`;
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="ds-wrapper">
      <style>{`
        /* Estilo base inspirado na nova imagem */
        .ds-wrapper {
          padding: 20px;
          background-color: #f0f2f5;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          color: #333;
        }

        /* Header */
        .ds-header {
          margin-bottom: 25px;
        }
        .ds-header h1 {
          font-size: 22px;
          font-weight: 700;
          color: #0b1f3f; /* Azul marinho escuro */
          margin: 0 0 5px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ds-header p {
          margin: 0;
          color: #666;
          font-size: 13px;
        }

        /* Filtros */
        .ds-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
        }
        .ds-select {
          flex: 1;
          min-width: 180px;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fff;
          font-size: 13px;
          color: #4b5563;
          outline: none;
        }
        .ds-select:focus {
          border-color: #3b82f6;
        }

        /* KPIs (Linha superior de cartões menores) */
        .ds-kpi-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
        }
        .ds-kpi-card {
          flex: 1;
          min-width: 140px;
          background: #fff;
          border-radius: 10px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }
        .ds-kpi-value {
          font-size: 24px;
          font-weight: 700;
          color: #111;
          margin-bottom: 8px;
        }
        .ds-kpi-label {
          font-size: 12px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ds-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        /* Cores das bordas e bolinhas dos KPIs */
        .ds-border-blue { border-color: #3b82f6; }
        .ds-dot-blue { background-color: #3b82f6; }
        .ds-border-green { border-color: #10b981; }
        .ds-dot-green { background-color: #10b981; }
        .ds-border-orange { border-color: #f59e0b; }
        .ds-dot-orange { background-color: #f59e0b; }
        .ds-border-red { border-color: #ef4444; }
        .ds-dot-red { background-color: #ef4444; }
        .ds-border-purple { border-color: #8b5cf6; }
        .ds-dot-purple { background-color: #8b5cf6; }

        /* Grid de Gráficos */
        .ds-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        /* Card Branco Padrão */
        .ds-card {
          background: #fff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          border: 1px solid #e5e7eb;
        }
        .ds-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e3a8a; /* Azul marinho */
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 25px;
        }

        /* Barras Verticais (Estilo fino) */
        .ds-bar-v-container {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 180px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .ds-bar-v-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 50px;
        }
        .ds-bar-v-value {
          font-size: 12px;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 4px;
        }
        .ds-bar-v-fill {
          width: 18px; /* Barra fina como na imagem */
          background-color: #1d4ed8; /* Azul primário */
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }
        .ds-bar-v-label {
          font-size: 11px;
          color: #6b7280;
          margin-top: 8px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60px;
        }

        /* Tabela */
        .ds-table-wrap {
          max-height: 300px;
          overflow-y: auto;
        }
        .ds-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .ds-table th {
          text-align: left;
          padding: 10px;
          color: #6b7280;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: #fff;
        }
        .ds-table td {
          padding: 10px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
        }
        .ds-table tr:last-child td {
          border-bottom: none;
        }
      `}</style>

      {error && <div style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</div>}

      {/* Cabeçalho */}
      <div className="ds-header">
        <h1>📊 Dashboard Analítico — Controle de Estoque</h1>
        <p>Indicadores quantitativos estruturados com filtros cruzados.</p>
      </div>

      {/* Filtros em linha */}
      <div className="ds-filters">
        <select className="ds-select" value={deptoFiltro} onChange={(e) => { setDeptoFiltro(e.target.value); setSeccionalFiltro(''); setDelegaciaFiltro(''); }}>
          <option value="">Departamento (Todos)</option>
          {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="ds-select" value={delegaciaFiltro} onChange={(e) => setDelegaciaFiltro(e.target.value)} disabled={!deptoFiltro}>
          <option value="">Unidade / Delegacia (Todas)</option>
          {delegacias.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="ds-select" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="">Categoria (Todas)</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="ds-select" value={modeloFiltro} onChange={(e) => setModeloFiltro(e.target.value)}>
          <option value="">Modelo (Todos)</option>
          {modeloOptions.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* KPIs Superiores */}
      <div className="ds-kpi-row">
        <div className="ds-kpi-card ds-border-blue">
          <div className="ds-kpi-value">{stats.total.toLocaleString('pt-BR')}</div>
          <div className="ds-kpi-label"><span className="ds-dot ds-dot-blue"></span> Total Geral</div>
        </div>
        <div className="ds-kpi-card ds-border-green">
          <div className="ds-kpi-value">{stats.disp.toLocaleString('pt-BR')}</div>
          <div className="ds-kpi-label"><span className="ds-dot ds-dot-green"></span> Disponíveis</div>
        </div>
        <div className="ds-kpi-card ds-border-orange">
          <div className="ds-kpi-value">{stats.ativas.toLocaleString('pt-BR')}</div>
          <div className="ds-kpi-label"><span className="ds-dot ds-dot-orange"></span> Cautelas Ativas</div>
        </div>
        <div className="ds-kpi-card ds-border-red">
          <div className="ds-kpi-value">{validadeResumo.qtdVencidos.toLocaleString('pt-BR')}</div>
          <div className="ds-kpi-label"><span className="ds-dot ds-dot-red"></span> Vencidos</div>
        </div>
        <div className="ds-kpi-card ds-border-purple">
          <div className="ds-kpi-value">{validadeResumo.qtdVence30.toLocaleString('pt-BR')}</div>
          <div className="ds-kpi-label"><span className="ds-dot ds-dot-purple"></span> Vencem ≤ 1 ano</div>
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="ds-charts-grid">
        {/* Distribuição por Categoria */}
        <div className="ds-card">
          <div className="ds-card-title">📦 Distribuição por Categoria</div>
          <div className="ds-bar-v-container">
            {byCategoria.map(([name, value]) => {
              const h = maxCategoria > 0 ? Math.round((value / maxCategoria) * 150) : 0;
              return (
                <div key={name} className="ds-bar-v-col">
                  <div className="ds-bar-v-value">{value}</div>
                  <div className="ds-bar-v-fill" style={{ height: `${h}px` }}></div>
                  <div className="ds-bar-v-label" title={name}>{name.substring(0, 10)}...</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="ds-card">
          <div className="ds-card-title">🛡️ Status dos Itens</div>
          <div className="ds-bar-v-container">
            {byStatus.map(([name, value]) => {
              const h = maxStatus > 0 ? Math.round((value / maxStatus) * 150) : 0;
              return (
                <div key={name} className="ds-bar-v-col">
                  <div className="ds-bar-v-value">{value}</div>
                  <div className="ds-bar-v-fill" style={{ height: `${h}px`, backgroundColor: '#0ea5e9' }}></div>
                  <div className="ds-bar-v-label" title={name}>{name.substring(0, 10)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modelo */}
        <div className="ds-card">
          <div className="ds-card-title">🔫 Top Modelos</div>
          <div className="ds-bar-v-container">
            {byModelo.slice(0, 8).map(([name, value]) => {
              const h = maxModelo > 0 ? Math.round((value / maxModelo) * 150) : 0;
              return (
                <div key={name} className="ds-bar-v-col">
                  <div className="ds-bar-v-value">{value}</div>
                  <div className="ds-bar-v-fill" style={{ height: `${h}px`, backgroundColor: '#6366f1' }}></div>
                  <div className="ds-bar-v-label" title={name}>{name.substring(0, 8)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Linha Inferior: Tabela de Lotação e Gráfico de Validade */}
      <div className="ds-charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Tabela de Lotação */}
        <div className="ds-card">
          <div className="ds-card-title">🏢 Lotação dos Itens</div>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Série</th>
                  <th>Status</th>
                  <th>Lotação</th>
                </tr>
              </thead>
              <tbody>
                {armasPorLocal.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum registro encontrado.</td>
                  </tr>
                )}
                {armasPorLocal.map((row) => (
                  <tr key={row.id}>
                    <td><b>{row.modelo}</b></td>
                    <td>{row.serie}</td>
                    <td>{row.status}</td>
                    <td>{row.lotacao || row.departamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico de Validade (Original SVG mantido dentro do card) */}
        <div className="ds-card">
          <div className="ds-card-title">⏰ Controle de Vencimento</div>
          <div style={{ position: 'relative', marginTop: '10px' }}>
            {validadePorAno.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Sem itens com data de validade para exibir.
              </div>
            ) : (
              <svg viewBox={validadeGrafico.viewBox} style={{ width: '100%', height: '260px', display: 'block' }}>
                <line x1="38" y1={validadeGrafico.baselineY} x2="1182" y2={validadeGrafico.baselineY} stroke="#e5e7eb" strokeWidth="2" />
                <line x1="38" y1="18" x2="38" y2={validadeGrafico.baselineY} stroke="#e5e7eb" strokeWidth="1" />

                {validadeGrafico.points.length > 1 && (
                  <path d={validadePath} fill="none" stroke="#1d4ed8" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                )}

                {validadeGrafico.points.map((p) => (
                  <g key={`p-${p.ano}`}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#1e3a8a" />
                    <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="14" fill="#111" fontWeight="700">
                      {p.quantidade.toLocaleString('pt-BR')}
                    </text>
                    <line x1={p.x} y1={validadeGrafico.baselineY} x2={p.x} y2={validadeGrafico.baselineY - 6} stroke="#d1d5db" strokeWidth="2" />
                    <text x={p.x} y={validadeGrafico.baselineY + 22} textAnchor="middle" fontSize="13" fill="#6b7280" fontWeight="600">
                      {p.ano}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardEstoque;