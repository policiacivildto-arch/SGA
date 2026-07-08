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

        const response = await apiService.getList('dashboard/estoque', params);
        setDashboard(response);
      } catch (err) {
        setError(err.message || 'Falha ao carregar dashboard de estoque.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoriaFiltro, deptoFiltro, seccionalFiltro, delegaciaFiltro]);

  const categorias = useMemo(() => {
    return dashboard.categorias || [];
  }, [dashboard]);

  const locaisFiltro = useMemo(() => {
    return dashboard.locais || [];
  }, [dashboard]);

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

  const byCategoria = useMemo(() => {
    return dashboard.by_categoria || [];
  }, [dashboard]);

  const byStatus = useMemo(() => {
    return dashboard.by_status || [];
  }, [dashboard]);

  const maxCategoria = Math.max(...byCategoria.map(([, val]) => Number(val)), 1);
  const maxStatus = Math.max(...byStatus.map(([, val]) => Number(val)), 1);

  const stats = dashboard.stats || { total: 0, disp: 0, ativas: 0, registros_itens: 0 };
  const validadeResumo = dashboard.validade || {
    qtdVencidos: 0,
    qtdVence30: 0,
    qtdVence60: 0,
    qtdSemValidade: 0,
    itensCriticos: [],
    porAno: [],
  };
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

    if (rows.length === 0) {
      return {
        viewBox: `0 0 ${width} ${height}`,
        points: [],
        max: 1,
        baselineY: height - bottom,
      };
    }

    const maxRaw = Math.max(...rows.map((r) => r.quantidade), 1);
    const max = Math.max(5000, Math.ceil(maxRaw / 1000) * 1000);
    const usableW = width - left - right;
    const usableH = height - top - bottom;
    const step = rows.length > 1 ? usableW / (rows.length - 1) : 0;

    const points = rows.map((row, idx) => {
      const x = left + (idx * step);
      const y = top + ((1 - (row.quantidade / max)) * usableH);
      return { ...row, x, y };
    });

    return {
      viewBox: `0 0 ${width} ${height}`,
      points,
      max,
      baselineY: height - bottom,
    };
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
    if (num >= 1000) {
      return `${Math.round(num / 1000)} mil`;
    }
    return num.toLocaleString('pt-BR');
  };

  return (
    <>
      <div className="page-header">
        <h1>📈 Dashboard Analítico do Estoque</h1>
        <p>Balanço quantitativo geral do inventário</p>
      </div>

      <div className="card">
  <div className="filters-container">
    <div className="filters-grid">
      
      {/* Filtro de Categoria */}
      <div className="filter-group">
        <label htmlFor="filtro-categoria">Categoria</label>
        <select id="filtro-categoria" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="">Todas as Categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>
      </div>

      {/* Filtro de Departamento */}
      <div className="filter-group">
        <label htmlFor="filtro-depto">Departamento</label>
        <select
          id="filtro-depto"
          value={deptoFiltro}
          onChange={(e) => {
            setDeptoFiltro(e.target.value);
            setSeccionalFiltro('');
            setDelegaciaFiltro('');
          }}
        >
          <option value="">Todos os Departamentos</option>
          {departamentos.map((depto) => (
            <option key={depto} value={depto}>{depto}</option>
          ))}
        </select>
      </div>

      {/* Filtro de Seccional */}
      <div className="filter-group">
        <label htmlFor="filtro-seccional">Seccional</label>
        <select
          id="filtro-seccional"
          value={seccionalFiltro}
          onChange={(e) => {
            setSeccionalFiltro(e.target.value);
            setDelegaciaFiltro('');
          }}
          disabled={!deptoFiltro}
        >
          <option value="">{deptoFiltro ? 'Todas as Seccionais' : 'Selecione o departamento'}</option>
          {seccionais.map((sec) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      {/* Filtro de Delegacia */}
      <div className="filter-group">
        <label htmlFor="filtro-delegacia">Delegacia</label>
        <select
          id="filtro-delegacia"
          value={delegaciaFiltro}
          onChange={(e) => setDelegaciaFiltro(e.target.value)}
          disabled={!deptoFiltro}
        >
          <option value="">{deptoFiltro ? 'Todas as Delegacias' : 'Selecione o departamento'}</option>
          {delegacias.map((del) => (
            <option key={del} value={del}>{del}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Botões de Limpar Filtros */}
    <div className="filter-actions">
      {categoriaFiltro && (
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setCategoriaFiltro('')}>
          Limpar Categoria
        </button>
      )}
      {(deptoFiltro || seccionalFiltro || delegaciaFiltro) && (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            setDeptoFiltro('');
            setSeccionalFiltro('');
            setDelegaciaFiltro('');
          }}
        >
          Limpar Local
        </button>
      )}
    </div>
  </div>
</div>

      {error && <div className="alert alert-danger show">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card blue"><div className="stat-val">{stats.total}</div><div className="stat-label">Total de Itens</div></div>
        <div className="stat-card green"><div className="stat-val">{stats.disp}</div><div className="stat-label">Disponíveis</div></div>
        <div className="stat-card orange"><div className="stat-val">{stats.ativas}</div><div className="stat-label">Cautelas Ativas</div></div>
        <div className="stat-card red"><div className="stat-val">{validadeResumo.qtdVencidos}</div><div className="stat-label">Itens Vencidos</div></div>
        <div className="stat-card yellow"><div className="stat-val">{validadeResumo.qtdVence30}</div><div className="stat-label">Vencem em até 1 ano</div></div>
      </div>

      <div className="chart-row-3">
        <div className="card">
          <div className="card-title">📦 Distribuição por Categoria Geral</div>
          <div className="chart-v-container">
            {byCategoria.map(([name, value]) => (
              <div key={name} className="chart-v-bar-wrapper">
                <span className="chart-v-val">{value}</span>
                <div className="chart-v-bar color-2" style={{ height: `${Math.round((value / maxCategoria) * 140)}px` }} />
                <span className="chart-v-label">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">🛡️ Ativos do Inventário por Status</div>
          <div className="chart-v-container">
            {byStatus.map(([name, value]) => (
              <div key={name} className="chart-v-bar-wrapper">
                <span className="chart-v-val">{value}</span>
                <div className="chart-v-bar color-3" style={{ height: `${Math.round((value / maxStatus) * 140)}px` }} />
                <span className="chart-v-label">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">📊 Resumo do Inventário</div>
          <div className="form-grid">
            <div className="form-group"><label htmlFor="de-resumo-itens">Registros de Itens</label><input id="de-resumo-itens" value={stats.registros_itens || 0} disabled /></div>
            <div className="form-group"><label htmlFor="de-resumo-cautelas">Registros de Cautela</label><input id="de-resumo-cautelas" value={stats.registros_cautelas || 0} disabled /></div>
            <div className="form-group"><label htmlFor="de-resumo-falta">Itens em Falta</label><input id="de-resumo-falta" value={Math.max(stats.total - stats.disp, 0)} disabled /></div>
            <div className="form-group"><label htmlFor="de-resumo-loading">Carregando</label><input id="de-resumo-loading" value={loading ? 'Sim' : 'Não'} disabled /></div>
          </div>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-title">📍 Quantidade de Armas por Local</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Departamento</th>
                <th>Seccional</th>
                <th>Delegacia</th>
                <th>Qtde de Armas</th>
              </tr>
            </thead>
            <tbody>
              {armasPorLocal.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4">Sem dados para os filtros selecionados.</td>
                </tr>
              )}
              {armasPorLocal.map((row) => (
                <tr key={`${row.departamento}-${row.seccional}-${row.delegacia}`}>
                  <td>{row.departamento}</td>
                  <td>{row.seccional}</td>
                  <td>{row.delegacia}</td>
                  <td><b>{row.quantidade}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-title">⏰ Controle de Vencimento de Itens</div>
        <div className="form-grid">
          <div className="form-group"><label htmlFor="de-val-vencidos">Qtd. Vencidos</label><input id="de-val-vencidos" value={validadeResumo.qtdVencidos} disabled /></div>
          <div className="form-group"><label htmlFor="de-val-30">Qtd. Vencem em até 1 ano</label><input id="de-val-30" value={validadeResumo.qtdVence30} disabled /></div>
          <div className="form-group"><label htmlFor="de-val-60">Qtd. Vencem em até 2 anos</label><input id="de-val-60" value={validadeResumo.qtdVence60} disabled /></div>
          <div className="form-group"><label htmlFor="de-val-sem">Qtd. sem validade</label><input id="de-val-sem" value={validadeResumo.qtdSemValidade} disabled /></div>
        </div>

        <div className="table-wrap mt-16">
          {validadePorAno.length === 0 ? (
            <div className="text-center p-4">Sem itens com data de validade para exibir.</div>
          ) : (
            <svg viewBox={validadeGrafico.viewBox} style={{ width: '100%', height: '280px', display: 'block' }}>
              <line x1="38" y1={validadeGrafico.baselineY} x2="1182" y2={validadeGrafico.baselineY} stroke="#9aa4bd" strokeWidth="2" />
              <line x1="38" y1="18" x2="38" y2={validadeGrafico.baselineY} stroke="#d0d4e8" strokeWidth="1" />

              {validadeGrafico.points.length > 1 && (
                <path
                  d={validadePath}
                  fill="none"
                  stroke="#111"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {validadeGrafico.points.map((p) => (
                <g key={`p-${p.ano}`}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#000" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="12" fill="#111" fontWeight="700">
                    {p.quantidade.toLocaleString('pt-BR')}
                  </text>
                  <line x1={p.x} y1={validadeGrafico.baselineY} x2={p.x} y2={validadeGrafico.baselineY - 8} stroke="#9aa4bd" strokeWidth="1" />
                  <text x={p.x} y={validadeGrafico.baselineY + 20} textAnchor="middle" fontSize="12" fill="#3f4656">
                    {p.ano}
                  </text>
                </g>
              ))}

              <text x="4" y={validadeGrafico.baselineY + 4} fontSize="12" fill="#3f4656">0</text>
              <text x="4" y="22" fontSize="12" fill="#3f4656">{formatMil(validadeGrafico.max)}</text>
            </svg>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardEstoque;
