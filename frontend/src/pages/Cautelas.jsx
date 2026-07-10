import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { DEPARTAMENTOS_PADRAO } from '../constants/organizacao';
import { getMenuOptions } from '../services/menuOptions';

/* eslint-disable react/prop-types */

const BAIXA_MOTIVO_OPTIONS = [
  'Devolvido',
  'Apreendida',
  'Destruida',
  'Em Reparo',
  'Furtada',
  'Inservivel',
  'Perdida',
  'Recolhida',
  'Ressarcida',
  'Roubada',
];

function mapMotivoToStatus(motivo) {
  if (motivo === 'Devolvido') return 'Disponivel';
  return motivo || 'Disponivel';
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function Cautelas() {
  const [cautelas, setCautelas] = useState([]);
  const [policiais, setPoliciais] = useState([]);
  const [departamentosMenu, setDepartamentosMenu] = useState([]);
  const [departamentosBase, setDepartamentosBase] = useState([]);
  const [lotacoesBase, setLotacoesBase] = useState([]);
  const [armasDisponiveis, setArmasDisponiveis] = useState([]);
  const [armasByItemId, setArmasByItemId] = useState({});
  const [armasBySerial, setArmasBySerial] = useState({});
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
  const [cautelaBaixa, setCautelaBaixa] = useState(null);
  const [baixaForm, setBaixaForm] = useState({
    data_dev: new Date().toISOString().slice(0, 10),
    condicao_dev: 'Devolvido',
    status_item: 'Disponivel',
    motivo_recolhimento: '',
    nup: '',
    numero_io_bo: '',
    numero_serie_reparo: '',
    obs_dev: '',
  });
  const [form, setForm] = useState({
    numero: '',
    data_saida: '',
    data_prev: '',
    matricula: '',
    policial_nome: '',
    depto: '',
    lotacao: '',
    categoria: '',
    item: '',
    numero_serie: '',
    serie_patrimonio: '',
    qtd: 1,
    obs: '',
    policial_id: '',
  });

  const getFallbackNextNumber = (rows) => {
    const year = new Date().getFullYear();
    const prefix = `CAU-${year}-`;
    const max = (rows || []).reduce((acc, row) => {
      const numero = String(row?.numero || '');
      if (!numero.startsWith(prefix)) return acc;
      const seq = Number(numero.slice(prefix.length));
      return Number.isFinite(seq) ? Math.max(acc, seq) : acc;
    }, 0);
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  };

  const normalizeSerialInput = (value) => {
    return String(value || '').replace(/\s+/g, '').toUpperCase();
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [cautelasData, policiaisData, departamentosData, lotacoesData, itensData, armasData] = await Promise.all([
        apiService.getList('cautelas', new URLSearchParams({ page_size: '500', ordering: '-data_saida' })),
        apiService.getList('policiais', new URLSearchParams({ page_size: '500', ordering: 'nome' })),
        apiService.getList('departamentos', new URLSearchParams({ page_size: '500', ordering: 'nome' })),
        apiService.getList('lotacoes', new URLSearchParams({ page_size: '500', ordering: 'depto,nome' })),
        apiService.getList('itens', new URLSearchParams({ page_size: '500', ordering: 'descricao' })),
        apiService.getList('armas', new URLSearchParams({ page_size: '1000' })),
      ]);
      const cautelasRows = cautelasData.results || [];
      const armasRows = armasData.results || [];
      setCautelas(cautelasRows);
      setPoliciais(policiaisData.results || []);
      setDepartamentosBase(departamentosData.results || []);
      setLotacoesBase(lotacoesData.results || []);
      setItens((itensData.results || []).filter((item) => Number(item.qtd_disp || 0) > 0));
      setArmasDisponiveis(armasRows);
      const armasMap = {};
      const armasSerialMap = {};
      armasRows.forEach((arma) => {
        if (arma?.item) {
          armasMap[String(arma.item)] = arma;
        }
        const numeroSerie = normalizeText(arma?.numero_serie);
        if (numeroSerie) {
          armasSerialMap[numeroSerie] = arma;
        }
      });
      setArmasByItemId(armasMap);
      setArmasBySerial(armasSerialMap);

      let nextNumber = getFallbackNextNumber(cautelasRows);
      try {
        const nextNumberData = await apiService.getList('cautelas/next-number');
        if (nextNumberData?.numero) {
          nextNumber = nextNumberData.numero;
        }
      } catch {
        // Mantem fallback local caso endpoint dedicado esteja indisponivel.
      }

      setForm((prev) => ({
        ...prev,
        numero: nextNumber || prev.numero,
        data_saida: prev.data_saida || new Date().toISOString().slice(0, 10),
      }));
    } catch (err) {
      setError(err.message || 'Falha ao carregar cautelas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const departamentosData = await getMenuOptions('departamento');
        setDepartamentosMenu(departamentosData);
      } catch {
        // fallback para listas locais
      }
    };

    loadMenus();
  }, []);

  const departamentos = useMemo(() => {
    const set = new Set();
    if (departamentosMenu.length > 0) {
      departamentosMenu.forEach((opt) => set.add(opt.label));
    } else {
      DEPARTAMENTOS_PADRAO.forEach((depto) => set.add(depto));
    }

    departamentosBase.forEach((d) => {
      if (d.nome) set.add(d.nome);
    });
    policiais.forEach((p) => {
      if (p.depto) set.add(p.depto);
    });
    lotacoesBase.forEach((l) => {
      if (l.depto) set.add(l.depto);
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [departamentosMenu, departamentosBase, policiais, lotacoesBase]);

  const lotacoes = useMemo(() => {
    if (!form.depto) return [];
    const set = new Set(
      [
        ...policiais.filter((p) => p.depto === form.depto).map((p) => p.lotacao).filter(Boolean),
        ...lotacoesBase.filter((l) => l.depto === form.depto).map((l) => l.nome).filter(Boolean),
      ],
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [policiais, lotacoesBase, form.depto]);

  const categorias = useMemo(() => {
    const set = new Set(itens.map((item) => item.categoria).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [itens]);

  const itensDaCategoria = useMemo(() => {
    if (!form.categoria) return [];
    return itens.filter((item) => item.categoria === form.categoria);
  }, [itens, form.categoria]);

  const selectedItem = useMemo(() => {
    return itens.find((item) => String(item.id) === String(form.item));
  }, [itens, form.item]);

  const selectedArma = useMemo(() => {
    if (!selectedItem?.id) return null;
    return armasByItemId[String(selectedItem.id)] || null;
  }, [armasByItemId, selectedItem]);

  const isItemUniforme = useMemo(() => {
    if (!selectedItem?.categoria) return false;
    return String(selectedItem.categoria).trim().toLowerCase() === 'uniformes';
  }, [selectedItem]);

  const isCategoriaArmas = useMemo(() => {
    return normalizeText(selectedItem?.categoria) === 'armas';
  }, [selectedItem]);

  const itemDetails = useMemo(() => {
    if (!selectedItem) {
      return {
        marca: '—',
        modelo: '—',
        calibre: '—',
        serie: '—',
      };
    }

    if (isItemUniforme) {
      return {
        marca: 'Não se aplica para uniformes',
        modelo: 'Não se aplica para uniformes',
        calibre: 'Não se aplica para uniformes',
        serie: 'Não se aplica para uniformes',
      };
    }

    if (!isCategoriaArmas) {
      return {
        marca: 'Não se aplica para esta categoria',
        modelo: 'Não se aplica para esta categoria',
        calibre: 'Não se aplica para esta categoria',
        serie: 'Não se aplica para esta categoria',
      };
    }

    return {
      marca: selectedArma?.marca || selectedItem.marca || '—',
      modelo: selectedArma?.modelo || '—',
      calibre: selectedArma?.calibre || '—',
      serie: selectedArma?.numero_serie || selectedItem.serie || '—',
    };
  }, [selectedItem, selectedArma, isItemUniforme, isCategoriaArmas]);

  const isCautelaPessoal = useMemo(() => {
    if (!isCategoriaArmas) return true;
    const tipo = normalizeText(selectedArma?.tipo);
    if (!tipo) {
      const descricao = normalizeText(selectedItem?.descricao);
      if (descricao.includes('pistola') || descricao.includes('revolver')) {
        return true;
      }
    }
    return tipo === 'pistola' || tipo === 'revolver';
  }, [isCategoriaArmas, selectedArma, selectedItem]);

  const isCautelaUnidade = isCategoriaArmas && !isCautelaPessoal;

  const tomboPlaceholder = useMemo(() => {
    if (isItemUniforme) return 'Não se aplica para uniformes';
    if (isCategoriaArmas) return 'Preenchido automaticamente';
    return 'Não se aplica para esta categoria';
  }, [isCategoriaArmas, isItemUniforme]);

  const findArmaBySerial = (value) => {
    const normalizedSerial = normalizeText(value);
    if (!normalizedSerial) return null;

    const exactMatch = armasBySerial[normalizedSerial];
    if (exactMatch) return exactMatch;

    if (normalizedSerial.length < 3) return null;

    const prefixMatches = armasDisponiveis.filter((arma) => normalizeText(arma?.numero_serie).startsWith(normalizedSerial));
    if (prefixMatches.length === 1) return prefixMatches[0];

    const includesMatches = armasDisponiveis.filter((arma) => normalizeText(arma?.numero_serie).includes(normalizedSerial));
    if (includesMatches.length === 1) return includesMatches[0];

    return null;
  };

  const findItemBySerial = (value) => {
    const normalizedSerial = normalizeText(value);
    if (!normalizedSerial) return null;

    const itensArmas = itens.filter((item) => normalizeText(item.categoria) === 'armas');
    const exactMatch = itensArmas.find((item) => normalizeText(item.serie) === normalizedSerial);
    if (exactMatch) return exactMatch;

    if (normalizedSerial.length < 3) return null;

    const prefixMatches = itensArmas.filter((item) => normalizeText(item.serie).startsWith(normalizedSerial));
    if (prefixMatches.length === 1) return prefixMatches[0];

    const includesMatches = itensArmas.filter((item) => normalizeText(item.serie).includes(normalizedSerial));
    if (includesMatches.length === 1) return includesMatches[0];

    return null;
  };

  const handleNumeroSerieChange = (value) => {
    const numeroSerie = normalizeSerialInput(value);
    const arma = findArmaBySerial(numeroSerie);
    if (!arma) {
      const itemPorSerie = findItemBySerial(numeroSerie);
      if (itemPorSerie) {
        setForm((prev) => ({
          ...prev,
          numero_serie: numeroSerie,
          categoria: itemPorSerie.categoria || prev.categoria,
          item: String(itemPorSerie.id),
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        numero_serie: numeroSerie,
      }));
      return;
    }

    const itemRelacionado = itens.find((item) => String(item.id) === String(arma.item));
    setForm((prev) => ({
      ...prev,
      numero_serie: numeroSerie,
      categoria: itemRelacionado?.categoria || prev.categoria,
      item: itemRelacionado ? String(itemRelacionado.id) : prev.item,
    }));
  };

  useEffect(() => {
    const matricula = form.matricula.trim();
    if (matricula.length < 3) return;

    const timer = setTimeout(() => {
      const found = policiais.find((p) => p.matricula === matricula);
      if (!found) return;

      setForm((prev) => ({
        ...prev,
        policial_id: found.id,
        matricula: found.matricula,
        policial_nome: found.nome,
        depto: found.depto,
        lotacao: found.lotacao,
      }));
    }, 250);

    return () => clearTimeout(timer);
  }, [form.matricula, policiais]);

  useEffect(() => {
    if (!selectedItem) return;
    let seriePatrimonio = 'Não se aplica para esta categoria';
    if (isItemUniforme) {
      seriePatrimonio = 'Não se aplica para uniformes';
    } else if (isCategoriaArmas) {
      seriePatrimonio = selectedArma?.numero_serie || selectedItem.serie || selectedItem.patrimonio || '—';
    }

    setForm((prev) => ({
      ...prev,
      serie_patrimonio: seriePatrimonio,
    }));
  }, [selectedItem, selectedArma, isItemUniforme, isCategoriaArmas]);

  useEffect(() => {
    if (!isCautelaUnidade) return;
    setForm((prev) => ({
      ...prev,
      matricula: '',
      policial_nome: '',
      policial_id: '',
    }));
  }, [isCautelaUnidade]);

  const handleCreate = async () => {
    if (!form.numero || !form.data_saida || !form.item) {
      setError('Preencha os campos obrigatórios da cautela.');
      return;
    }

    if (!form.depto || !form.lotacao) {
      setError('Departamento e lotação são obrigatórios.');
      return;
    }

    if (!isCautelaUnidade && (!form.policial_id || !form.matricula || !form.policial_nome)) {
      setError('Para cautela pessoal, informe policial e matrícula.');
      return;
    }

    try {
      setError('');
      const payload = {
        numero: form.numero,
        data_saida: form.data_saida,
        data_prev: form.data_prev || null,
        depto: form.depto,
        lotacao: form.lotacao,
        item: Number(form.item),
        qtd: Number(form.qtd || 1),
        obs: form.obs,
      };
      if (!isCautelaUnidade) {
        payload.policial_id = Number(form.policial_id);
      }
      await apiService.create('cautelas', payload);
      setForm({
        numero: '',
        data_saida: new Date().toISOString().slice(0, 10),
        data_prev: '',
        matricula: '',
        policial_nome: '',
        depto: '',
        lotacao: '',
        categoria: '',
        item: '',
        numero_serie: '',
        serie_patrimonio: '',
        qtd: 1,
        obs: '',
        policial_id: '',
      });
      setIsModalOpen(false);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Não foi possível registrar cautela.');
    }
  };

  const openBaixaModal = (cautela) => {
    setCautelaBaixa(cautela);
    setBaixaForm({
      data_dev: new Date().toISOString().slice(0, 10),
      condicao_dev: 'Devolvido',
      status_item: 'Disponivel',
      motivo_recolhimento: '',
      nup: '',
      numero_io_bo: '',
      numero_serie_reparo: cautela?.serie || '',
      obs_dev: '',
    });
    setIsBaixaModalOpen(true);
  };

  const handleDevolver = async () => {
    try {
      if (!cautelaBaixa?.id) return;
      const motivoNorm = normalizeText(baixaForm.condicao_dev);

      if (motivoNorm === 'recolhida' && !baixaForm.motivo_recolhimento.trim()) {
        setError('Informe o motivo quando a baixa for Recolhida.');
        return;
      }

      if (motivoNorm === 'recolhida' && !baixaForm.nup.trim()) {
        setError('NUP é obrigatório quando a baixa for Recolhida.');
        return;
      }

      if (motivoNorm === 'apreendida' && !baixaForm.numero_io_bo.trim()) {
        setError('Informe o número do IO ou BO para baixa por Apreendida.');
        return;
      }

      if (motivoNorm === 'em reparo' && !baixaForm.numero_serie_reparo.trim()) {
        setError('Informe o número de série para baixa em reparo.');
        return;
      }

      await apiService.create(`cautelas/${cautelaBaixa.id}/devolver`, baixaForm);
      setIsBaixaModalOpen(false);
      setCautelaBaixa(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Não foi possível devolver cautela.');
    }
  };

  const handleCancelar = async (id) => {
    try {
      await apiService.remove('cautelas', id);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Não foi possível cancelar cautela.');
    }
  };

  const handleBaixarPdf = async (id, numero) => {
    try {
      await apiService.download(`cautelas/${id}/documento-pdf`, `${numero || 'cautela'}.pdf`);
    } catch (err) {
      setError(err.message || 'Não foi possível baixar o PDF da cautela.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>📜 Controle Histórico de Cautelas</h1>
          <p>Gerenciamento de saída e atribuição de armamento de carga</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>➕ Registrar Nova Cautela</button>
      </div>

      {error && <div className="alert alert-danger show">{error}</div>}

      <Modal
        isOpen={isModalOpen}
        title="📜 Registrar Cautela Operacional"
        onClose={() => setIsModalOpen(false)}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCreate}>💾 Registrar Cautela</button>
          </>
        )}
      >
        <div className="card-title">Nº da Cautela</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="caut-numero">Nº da Cautela</label>
            <input id="caut-numero" value={form.numero} onChange={(e) => setForm((prev) => ({ ...prev, numero: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="caut-data">Data de Saída *</label>
            <input id="caut-data" type="date" value={form.data_saida} onChange={(e) => setForm((prev) => ({ ...prev, data_saida: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="caut-data-prev">Previsão de Devolução</label>
            <input id="caut-data-prev" type="date" value={form.data_prev} onChange={(e) => setForm((prev) => ({ ...prev, data_prev: e.target.value }))} />
          </div>
        </div>

        <div className="card-title mt-16">👮 Vínculo da Cautela</div>
        {isCautelaUnidade && (
          <div className="alert alert-info show">
            Arma vinculada por unidade. Policial não é obrigatório para este tipo.
          </div>
        )}
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="caut-matricula">Matrícula {isCautelaPessoal ? '*' : ''}</label>
            <input
              id="caut-matricula"
              placeholder="Ex.: 123456"
              value={form.matricula}
              disabled={isCautelaUnidade}
              onChange={(e) => setForm((prev) => ({ ...prev, matricula: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="caut-policial-nome">Nome do Policial {isCautelaPessoal ? '*' : ''}</label>
            <input
              id="caut-policial-nome"
              placeholder="Nome completo"
              value={form.policial_nome}
              disabled={isCautelaUnidade}
              onChange={(e) => setForm((prev) => ({ ...prev, policial_nome: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="caut-depto">Departamento *</label>
            <select
              id="caut-depto"
              value={form.depto}
              onChange={(e) => setForm((prev) => ({ ...prev, depto: e.target.value, lotacao: '' }))}
            >
              <option value="">Selecione...</option>
              {departamentos.map((depto) => (
                <option key={depto} value={depto}>{depto}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="caut-lotacao">Lotação *</label>
            <select
              id="caut-lotacao"
              value={form.lotacao}
              onChange={(e) => setForm((prev) => ({ ...prev, lotacao: e.target.value }))}
              disabled={!form.depto}
            >
              <option value="">{form.depto ? 'Selecione...' : 'Selecione o departamento'}</option>
              {lotacoes.map((lotacao) => (
                <option key={lotacao} value={lotacao}>{lotacao}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-title mt-16">📦 Item Cautelado</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="caut-categoria">Categoria *</label>
            <select
              id="caut-categoria"
              value={form.categoria}
              onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value, item: '', serie_patrimonio: '' }))}
            >
              <option value="">Selecione...</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="caut-serie-busca">Nº de Série</label>
            <input
              id="caut-serie-busca"
              value={form.numero_serie}
              placeholder="Digite o número de série para localizar"
              onChange={(e) => handleNumeroSerieChange(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="caut-item">Item *</label>
            <select
              id="caut-item"
              value={form.item}
              onChange={(e) => setForm((prev) => ({ ...prev, item: e.target.value }))}
              disabled={!form.categoria}
            >
              <option value="">{form.categoria ? 'Selecione...' : 'Selecione a categoria primeiro'}</option>
              {itensDaCategoria.map((item) => (
                <option key={item.id} value={item.id}>{item.descricao} (Saldo: {item.qtd_disp})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-title mt-16">🔫 Dados da Arma</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="caut-serie">Nº de Série Localizado</label>
            <input
              id="caut-serie"
              value={itemDetails.serie}
              placeholder={tomboPlaceholder}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="caut-marca-item">Marca</label>
            <input id="caut-marca-item" value={itemDetails.marca} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="caut-modelo-item">Modelo</label>
            <input id="caut-modelo-item" value={itemDetails.modelo} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="caut-calibre-item">Calibre</label>
            <input id="caut-calibre-item" value={itemDetails.calibre} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="caut-qtd">Quantidade *</label>
            <input id="caut-qtd" type="number" min="1" value={form.qtd} onChange={(e) => setForm((prev) => ({ ...prev, qtd: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="caut-disponivel">Disponível em Estoque</label>
            <input id="caut-disponivel" value={selectedItem ? selectedItem.qtd_disp : '—'} disabled />
          </div>
          <div className="form-group full">
            <label htmlFor="caut-obs">Observações / Finalidade</label>
            <textarea
              id="caut-obs"
              placeholder="Descreva a finalidade ou observações relevantes..."
              value={form.obs}
              onChange={(e) => setForm((prev) => ({ ...prev, obs: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isBaixaModalOpen}
        title="Baixa da Cautela"
        onClose={() => setIsBaixaModalOpen(false)}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsBaixaModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleDevolver}>Confirmar Baixa</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="baixa-data">Data da Baixa *</label>
            <input
              id="baixa-data"
              type="date"
              value={baixaForm.data_dev}
              onChange={(e) => setBaixaForm((prev) => ({ ...prev, data_dev: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="baixa-motivo">Motivo *</label>
            <select
              id="baixa-motivo"
              value={baixaForm.condicao_dev}
              onChange={(e) => {
                const motivo = e.target.value;
                setBaixaForm((prev) => ({
                  ...prev,
                  condicao_dev: motivo,
                  status_item: mapMotivoToStatus(motivo),
                }));
              }}
            >
              {BAIXA_MOTIVO_OPTIONS.map((motivo) => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="baixa-status">Status do Item</label>
            <input
              id="baixa-status"
              value={baixaForm.status_item}
              disabled
            />
          </div>
          {baixaForm.condicao_dev === 'Recolhida' && (
            <div className="form-group full">
              <label htmlFor="baixa-motivo-recolhimento">Motivo da Recolhida *</label>
              <input
                id="baixa-motivo-recolhimento"
                value={baixaForm.motivo_recolhimento}
                placeholder="Ex.: CID.F"
                onChange={(e) => setBaixaForm((prev) => ({ ...prev, motivo_recolhimento: e.target.value }))}
              />
            </div>
          )}
          {baixaForm.condicao_dev === 'Recolhida' && (
            <div className="form-group full">
              <label htmlFor="baixa-nup">NUP *</label>
              <input
                id="baixa-nup"
                value={baixaForm.nup}
                placeholder="Informe o NUP"
                onChange={(e) => setBaixaForm((prev) => ({ ...prev, nup: e.target.value }))}
              />
            </div>
          )}
          {baixaForm.condicao_dev === 'Apreendida' && (
            <div className="form-group full">
              <label htmlFor="baixa-io-bo">Número do IO ou BO *</label>
              <input
                id="baixa-io-bo"
                value={baixaForm.numero_io_bo}
                placeholder="Informe o número do IO ou BO"
                onChange={(e) => setBaixaForm((prev) => ({ ...prev, numero_io_bo: e.target.value }))}
              />
            </div>
          )}
          {baixaForm.condicao_dev === 'Em Reparo' && (
            <div className="form-group full">
              <label htmlFor="baixa-serie-reparo">Número de Série *</label>
              <input
                id="baixa-serie-reparo"
                value={baixaForm.numero_serie_reparo}
                placeholder="Informe o número de série da arma"
                onChange={(e) => setBaixaForm((prev) => ({ ...prev, numero_serie_reparo: e.target.value }))}
              />
            </div>
          )}
          <div className="form-group full">
            <label htmlFor="baixa-obs">Observações</label>
            <textarea
              id="baixa-obs"
              placeholder="Detalhes da baixa"
              value={baixaForm.obs_dev}
              onChange={(e) => setBaixaForm((prev) => ({ ...prev, obs_dev: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <div className="card">
        <div className="card-title">📋 Cautelas Registradas</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nº Cautela</th>
                <th>Data Saída</th>
                <th>Policial</th>
                <th>Matrícula</th>
                <th>Lotação</th>
                <th>Item</th>
                <th>Qtd</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="9" className="text-center p-4">Carregando...</td></tr>}
              {!loading && cautelas.map((row) => (
                <tr key={row.id}>
                  <td>{row.numero}</td>
                  <td>{row.data_saida ? new Date(row.data_saida).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>{row.policial_nome || (row.lotacao ? `UNIDADE: ${row.lotacao}` : '—')}</td>
                  <td>{row.matricula}</td>
                  <td>{row.lotacao}</td>
                  <td>{row.item_desc}</td>
                  <td>{row.qtd}</td>
                  <td><span className={`badge ${row.status === 'Ativa' ? 'badge-orange' : 'badge-green'}`}>{row.status}</span></td>
                  <td>
  <div className="flex items-center gap-2">
    <button className="btn btn-xs btn-outline" onClick={() => handleBaixarPdf(row.id, row.numero)}>
      PDF
    </button>
    
    {row.status === 'Ativa' && (
      <>
        <button className="btn btn-xs btn-success" onClick={() => openBaixaModal(row)}>
          Devolver
        </button>
        <button className="btn btn-xs btn-danger" onClick={() => handleCancelar(row.id)}>
          Cancelar
        </button>
      </>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Cautelas;
