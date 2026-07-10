import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { getMenuOptions } from '../services/menuOptions';

/* eslint-disable react/prop-types */

const INVENTARIO_ARMAS = {
  categoria: 'Armas',
  tipos: {
    Pistola: {
      marcas: {
        Glock: ['G17', 'G19', 'G26'],
        'Sig Sauer': ['P320'],
        Taurus: ['PT-100', 'PT-101', 'PT-640', 'PT-840', 'PT-940', 'PT-24/7'],
        Bereta: ['APX'],
      },
    },
    Revolver: {
      marcas: { Revolver: ['Padrão'] },
    },
    Fuzil: {
      marcas: {
        'Radical Firearms': ['RF 14'],
        Imbel: ['IA2'],
        Bushmaster: ['XM15E25'],
      },
    },
    'Fuzil Sniper': {
      marcas: {
        Armalite: ['AR10'],
        HK: ['HKPSG1'],
      },
    },
    Carabina: {
      marcas: {
        SigSauer: ['MPX'],
        Taurus: ['CT', 'CTT', 'SMT', 'MT', 'MT12'],
        HK: ['MP5'],
        INA: ['MB50'],
      },
    },
    Espingarda: {
      marcas: {
        Benelli: ['M3A1'],
        CBC: ['586', '151', '586P'],
        Boito: ['BSA 5T 84'],
        Rossi: ['OVERLAND'],
      },
    },
  },
};

const CALIBRES_AUTOMATICOS_ARMAS = {
  Pistola: {
    Glock: { G17: ['9mm'], G19: ['9mm'], G26: ['9mm'] },
    'Sig Sauer': { P320: ['9mm', '.40'] },
    Taurus: {
      'PT-100': ['.40'], 'PT-101': ['.40'], 'PT-640': ['.40'], 'PT-840': ['.40'], 'PT-940': ['.40'], 'PT-24/7': ['.40'],
    },
    Bereta: { APX: ['9mm'] },
  },
  Revolver: { Revolver: { Padrão: ['.38'] } },
  Fuzil: {
    'Radical Firearms': { 'RF 14': ['5.56'] },
    Imbel: { IA2: ['5.56'] },
    Bushmaster: { XM15E25: ['5.56'] },
  },
  'Fuzil Sniper': {
    Armalite: { AR10: ['.308'] },
    HK: { HKPSG1: ['7,62'] },
  },
  Carabina: {
    SigSauer: { MPX: ['9mm'] },
    Taurus: { CT: ['.40'], CTT: ['.40'], SMT: ['.40'], MT: ['9mm', '.40'], MT12: ['9mm'] },
    HK: { MP5: ['9mm'] },
    INA: { MB50: ['.45'] },
  },
  Espingarda: {
    Benelli: { M3A1: ['12'] },
    CBC: { 586: ['12'], 151: ['12'], '586P': ['12'] },
    Boito: { 'BSA 5T 84': ['12'] },
    Rossi: { OVERLAND: ['12'] },
  },
};

const INVENTARIO_COLETES = {
  categoria: 'Coletes',
  marcas: ['Protecta', 'Imbraland'],
  niveis: ['IIIA'],
  tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'],
  sexos: ['Feminino', 'Masculino'],
};

const MODELOS_DRONES = [
  'MAVIC 3T', 'MAVIC MINI 3', 'MAVIC PRO', 'MAVIC 2 ENTERPRISE', 'PHANTOM 1', 'HUBSAN ZINO', 'DJI TELLO',
  'KFPLAN KF101 MAX-S', 'PHANTOM 4 ADVANCED', 'MINI 2 STANDART', 'PHANTOM 4 PRO', 'MAVIC SPARK', 'MATRICE 300', 'MAVIC 3 PRO',
];

const INVENTARIO_EQUIPAMENTOS = {
  categoria: 'Equipamentos',
  tipos: {
    'Rádio Comunicador': { marcas: [], modelos: ['Fixo', 'Móvel', 'HT'], marcaObrigatoria: false, modeloObrigatorio: true },
    Drones: { marcas: ['DJI'], modelos: MODELOS_DRONES, marcaObrigatoria: true, modeloObrigatorio: true },
    'Detector de Metal': { marcas: [], modelos: [], marcaObrigatoria: false, modeloObrigatorio: false },
    Algema: { marcas: [], modelos: [], marcaObrigatoria: false, modeloObrigatorio: false },
    Arrombamento: { marcas: [], modelos: [], marcaObrigatoria: false, modeloObrigatorio: false },
  },
};

const INVENTARIO_UNIFORMES = {
  categoria: 'Uniformes',
  sexos: ['Feminino', 'Masculino'],
  tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'],
  cargos: ['Delegado de Policia Civil', 'Oficial Investigador', 'Oficial Investigadora'],
  tipos: {
    'Calça Tática': { exigeSexo: true, exigeTamanho: true, exigeCargo: false },
    'Camisa Gola Polo': { exigeSexo: false, exigeTamanho: false, exigeCargo: true },
    'Cinto BDU': { exigeSexo: false, exigeTamanho: true, exigeCargo: false },
    'Cinto de Guarnição': { exigeSexo: false, exigeTamanho: true, exigeCargo: false },
    'Combat Shirt': { exigeSexo: true, exigeTamanho: true, exigeCargo: false },
    'Jaqueta Tática': { exigeSexo: true, exigeTamanho: true, exigeCargo: false },
    'Capa de Chuva': { exigeSexo: true, exigeTamanho: true, exigeCargo: false },
    'Bota Tática': { exigeSexo: false, exigeTamanho: true, exigeCargo: false },
  },
};

const TAMANHOS_BOTA_NUMERICOS = ['34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54'];

const CATEGORIAS_INVENTARIO = [
  INVENTARIO_ARMAS.categoria,
  INVENTARIO_COLETES.categoria,
  INVENTARIO_EQUIPAMENTOS.categoria,
  INVENTARIO_UNIFORMES.categoria,
];

function getDescricaoArma(tipo, marca, modelo, calibre) {
  return [tipo, marca, modelo, calibre].filter(Boolean).join(' ');
}

function getDescricaoColete(marca, nivel, tamanho, sexo) {
  return ['Colete', marca, `Nivel ${nivel}`, `Tam ${tamanho}`, sexo].filter(Boolean).join(' ');
}

function getDescricaoEquipamento(tipo, marca, modelo) {
  return [tipo, marca, modelo].filter(Boolean).join(' ');
}

function getDescricaoUniforme(tipo, sexo, tamanho, cargo) {
  return [tipo, sexo, `Tam ${tamanho}`, cargo].filter(Boolean).join(' ');
}

function getCalibresDoModeloArma(tipo, marca, modelo) {
  if (!tipo || !marca || !modelo) return [];
  return CALIBRES_AUTOMATICOS_ARMAS[tipo]?.[marca]?.[modelo] || [];
}

function mapToSelectOptions(values) {
  return values.map((value) => ({ value, label: value }));
}

function isCategoriaUniformes(categoria) {
  return String(categoria || '').trim().toLowerCase() === 'uniformes';
}

function normalizeSerieText(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase();
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function CadFornecedores() {
  const [rows, setRows] = useState([]);
  const [compras, setCompras] = useState([]);
  const [categoriasMenu, setCategoriasMenu] = useState([]);
  const [tiposArmasMenu, setTiposArmasMenu] = useState([]);
  const [tiposEquipamentosMenu, setTiposEquipamentosMenu] = useState([]);
  const [tiposUniformesMenu, setTiposUniformesMenu] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [isCompraModalOpen, setIsCompraModalOpen] = useState(false);
  const [isLancarModalOpen, setIsLancarModalOpen] = useState(false);
  const [compraParaLancar, setCompraParaLancar] = useState(null);
  const [usarUnidades, setUsarUnidades] = useState(false);
  const [unidadesDetalhe, setUnidadesDetalhe] = useState([]);
  const [seriePrefixo, setSeriePrefixo] = useState('');
  const [serieInicio, setSerieInicio] = useState('1');
  const [tomboPrefixo, setTomboPrefixo] = useState('');
  const [tomboInicio, setTomboInicio] = useState('1');
  const [formFornecedor, setFormFornecedor] = useState({ nome: '', cnpj: '', contato: '', tel: '', email: '', categoria: '', end: '', obs: '' });
  const [formCompra, setFormCompra] = useState({
    fornecedor: '',
    categoria: INVENTARIO_ARMAS.categoria,
    tipo: '',
    calibre: '',
    comprimento_cano: '',
    quantidade_carregadores: 0,
    capacidade: 0,
    marca: '',
    modelo: '',
    nivel: '',
    tamanho: '',
    sexo: '',
    cargo: '',
    numero_nota_fiscal: '',
    numero_empenho: '',
    numero_tombo: '',
    serie: '',
    qtd_total: 1,
    status: 'Disponivel',
    dt_aq: new Date().toISOString().slice(0, 10),
    valor_compra: '',
    dt_val: '',
    obs: '',
  });

  const isArmas = formCompra.categoria === INVENTARIO_ARMAS.categoria;
  const isColetes = formCompra.categoria === INVENTARIO_COLETES.categoria;
  const isEquipamentos = formCompra.categoria === INVENTARIO_EQUIPAMENTOS.categoria;
  const isUniformes = formCompra.categoria === INVENTARIO_UNIFORMES.categoria;

  const tipoArmaAtual = formCompra.tipo ? INVENTARIO_ARMAS.tipos[formCompra.tipo] : null;
  const tipoEquipamentoAtual = formCompra.tipo ? INVENTARIO_EQUIPAMENTOS.tipos[formCompra.tipo] : null;
  const tipoUniformeAtual = formCompra.tipo ? INVENTARIO_UNIFORMES.tipos[formCompra.tipo] : null;
  const isBotaUniforme = isUniformes && formCompra.tipo === 'Bota Tática';
  const tamanhosUniformeOptions = isBotaUniforme ? TAMANHOS_BOTA_NUMERICOS : INVENTARIO_UNIFORMES.tamanhos;

  let tipoOptions = [];
  if (isArmas) tipoOptions = tiposArmasMenu.length > 0 ? tiposArmasMenu : mapToSelectOptions(Object.keys(INVENTARIO_ARMAS.tipos));
  if (isEquipamentos) tipoOptions = tiposEquipamentosMenu.length > 0 ? tiposEquipamentosMenu : mapToSelectOptions(Object.keys(INVENTARIO_EQUIPAMENTOS.tipos));
  if (isUniformes) tipoOptions = tiposUniformesMenu.length > 0 ? tiposUniformesMenu : mapToSelectOptions(Object.keys(INVENTARIO_UNIFORMES.tipos));

  const categoriaOptions = categoriasMenu.length > 0 ? categoriasMenu : mapToSelectOptions(CATEGORIAS_INVENTARIO);

  let marcaOptions = [];
  if (isColetes) marcaOptions = INVENTARIO_COLETES.marcas;
  if (isArmas) marcaOptions = tipoArmaAtual ? Object.keys(tipoArmaAtual.marcas) : [];
  if (isEquipamentos) marcaOptions = tipoEquipamentoAtual ? tipoEquipamentoAtual.marcas : [];

  let modeloOptions = [];
  if (isArmas && tipoArmaAtual && formCompra.marca) modeloOptions = tipoArmaAtual.marcas[formCompra.marca] || [];
  if (isEquipamentos) modeloOptions = tipoEquipamentoAtual ? tipoEquipamentoAtual.modelos : [];

  const calibreOptions = isArmas ? getCalibresDoModeloArma(formCompra.tipo, formCompra.marca, formCompra.modelo) : [];
  const calibreAutomatico = isArmas && calibreOptions.length === 1;

  const descricaoCompra = useMemo(() => {
    if (isArmas) return getDescricaoArma(formCompra.tipo, formCompra.marca, formCompra.modelo, formCompra.calibre);
    if (isColetes) return getDescricaoColete(formCompra.marca, formCompra.nivel, formCompra.tamanho, formCompra.sexo);
    if (isEquipamentos) return getDescricaoEquipamento(formCompra.tipo, formCompra.marca, formCompra.modelo);
    if (isUniformes) return getDescricaoUniforme(formCompra.tipo, formCompra.sexo, formCompra.tamanho, formCompra.cargo);
    return '';
  }, [
    formCompra.tipo,
    formCompra.marca,
    formCompra.modelo,
    formCompra.calibre,
    formCompra.nivel,
    formCompra.tamanho,
    formCompra.sexo,
    formCompra.cargo,
    isArmas,
    isColetes,
    isEquipamentos,
    isUniformes,
  ]);

  useEffect(() => {
    if (!isArmas || !formCompra.modelo || calibreOptions.length === 0) return;
    if (calibreOptions.length === 1 && formCompra.calibre !== calibreOptions[0]) {
      setFormCompra((prev) => ({ ...prev, calibre: calibreOptions[0] }));
    }
  }, [isArmas, formCompra.modelo, formCompra.calibre, calibreOptions]);

  const loadRows = async () => {
    try {
      const params = new URLSearchParams({ page_size: '500', ordering: 'nome' });
      if (search.trim()) params.append('search', search.trim());
      const [fornecedoresData, comprasData] = await Promise.all([
        apiService.getList('fornecedores', params),
        apiService.getList('compras', new URLSearchParams({ page_size: '500', ordering: '-criado_em' })),
      ]);
      setRows(fornecedoresData.results || []);
      setCompras((comprasData.results || []).filter((item) => item.fornecedor));
    } catch (err) {
      setError(err.message || 'Falha ao carregar fornecedores.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadRows(), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const [categorias, tiposArmas, tiposEquipamentos, tiposUniformes] = await Promise.all([
          getMenuOptions('item_categoria'),
          getMenuOptions('item_tipo_armas'),
          getMenuOptions('item_tipo_equipamentos'),
          getMenuOptions('item_tipo_uniformes'),
        ]);
        setCategoriasMenu(categorias);
        setTiposArmasMenu(tiposArmas);
        setTiposEquipamentosMenu(tiposEquipamentos);
        setTiposUniformesMenu(tiposUniformes);
      } catch {
        // fallback para constantes locais
      }
    };

    loadMenus();
  }, []);

  const handleAddFornecedor = async () => {
    if (!formFornecedor.nome) {
      setError('Informe a razão social do fornecedor.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await apiService.create('fornecedores', formFornecedor);
      setFormFornecedor({ nome: '', cnpj: '', contato: '', tel: '', email: '', categoria: '', end: '', obs: '' });
      setIsFornecedorModalOpen(false);
      setSuccess('Fornecedor cadastrado com sucesso.');
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao cadastrar fornecedor.');
    }
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleAddCompra = async () => {
    if (!formCompra.fornecedor) {
      setError('Selecione o fornecedor da compra.');
      return;
    }

    if (!String(formCompra.dt_aq || '').trim()) {
      setError('Informe a data da compra.');
      return;
    }

    const valorCompra = Number.parseFloat(String(formCompra.valor_compra || '').replace(',', '.'));
    if (Number.isNaN(valorCompra) || valorCompra <= 0) {
      setError('Informe o valor da compra maior que zero.');
      return;
    }

    if (isArmas && (!formCompra.tipo || !formCompra.marca || !formCompra.modelo || !formCompra.calibre)) {
      setError('Preencha tipo, marca, modelo e calibre para armas.');
      return;
    }

    if (isColetes && (!formCompra.marca || !formCompra.nivel || !formCompra.tamanho || !formCompra.sexo)) {
      setError('Preencha marca, nível, tamanho e sexo para coletes.');
      return;
    }
    if (isColetes && !String(formCompra.dt_val || '').trim()) {
      setError('Para coletes, a data de validade é obrigatória.');
      return;
    }

    if (isEquipamentos) {
      const marcaObrigatoria = tipoEquipamentoAtual ? tipoEquipamentoAtual.marcaObrigatoria : false;
      const modeloObrigatorio = tipoEquipamentoAtual ? tipoEquipamentoAtual.modeloObrigatorio : false;
      if (!formCompra.tipo) {
        setError('Preencha o tipo para equipamentos.');
        return;
      }
      if (marcaObrigatoria && !formCompra.marca) {
        setError('Preencha a marca para esse equipamento.');
        return;
      }
      if (modeloObrigatorio && !formCompra.modelo) {
        setError('Preencha o modelo para esse equipamento.');
        return;
      }
    }

    if (isUniformes) {
      if (!formCompra.tipo) {
        setError('Preencha o tipo para uniformes.');
        return;
      }
      const exigeSexo = tipoUniformeAtual ? tipoUniformeAtual.exigeSexo : false;
      const exigeTamanho = tipoUniformeAtual ? tipoUniformeAtual.exigeTamanho : false;
      const exigeCargo = tipoUniformeAtual ? tipoUniformeAtual.exigeCargo : false;
      if (exigeSexo && !formCompra.sexo) {
        setError('Preencha o sexo para esse uniforme.');
        return;
      }
      if (exigeTamanho && !formCompra.tamanho) {
        setError('Preencha o tamanho para esse uniforme.');
        return;
      }
      if (exigeCargo && !formCompra.cargo) {
        setError('Preencha o cargo para esse uniforme.');
        return;
      }
    }

    try {
      setError('');
      setSuccess('');
      const qtdTotal = Math.max(1, Number(formCompra.qtd_total || 1));
      await apiService.create('compras', {
        categoria: formCompra.categoria,
        tipo: formCompra.tipo,
        calibre: formCompra.calibre,
        comprimento_cano: formCompra.comprimento_cano,
        quantidade_carregadores: Number(formCompra.quantidade_carregadores || 0),
        capacidade: Number(formCompra.capacidade || 0),
        marca: formCompra.marca,
        modelo: formCompra.modelo,
        nivel: formCompra.nivel,
        tamanho: formCompra.tamanho,
        sexo: formCompra.sexo,
        cargo: formCompra.cargo,
        numero_nota_fiscal: formCompra.numero_nota_fiscal,
        numero_empenho: formCompra.numero_empenho,
        numero_tombo: formCompra.numero_tombo,
        descricao: descricaoCompra,
        serie: isUniformes ? '' : formCompra.serie,
        qtd_total: qtdTotal,
        qtd_disp: qtdTotal,
        qtd_min: 0,
        status: 'Pendente',
        fornecedor: Number(formCompra.fornecedor),
        dt_aq: formCompra.dt_aq || null,
        valor_compra: valorCompra,
        dt_val: formCompra.dt_val || null,
        obs: formCompra.obs,
      });
      setFormCompra({
        fornecedor: '',
        categoria: INVENTARIO_ARMAS.categoria,
        tipo: '',
        calibre: '',
        comprimento_cano: '',
        quantidade_carregadores: 0,
        capacidade: 0,
        marca: '',
        modelo: '',
        nivel: '',
        tamanho: '',
        sexo: '',
        cargo: '',
        numero_nota_fiscal: '',
        numero_empenho: '',
        numero_tombo: '',
        serie: '',
        qtd_total: 1,
        status: 'Disponivel',
        dt_aq: new Date().toISOString().slice(0, 10),
        valor_compra: '',
        dt_val: '',
        obs: '',
      });
      setIsCompraModalOpen(false);
      setSuccess('Compra registrada com sucesso. Item nao foi lancado no inventario.');
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao registrar compra do fornecedor.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.remove('fornecedores', id);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao excluir fornecedor.');
    }
  };

  const openLancarModal = (compra) => {
    const statusNorm = String(compra.status || '').toLowerCase();
    if (statusNorm.includes('lanc')) {
      setError('Esta compra ja foi lancada no inventario.');
      return;
    }

    const qtd = Math.max(1, Number.parseInt(compra.qtd_total, 10) || 1);
    setCompraParaLancar(compra);
    setUsarUnidades(false);
    setUnidadesDetalhe(Array.from({ length: qtd }, () => ({ serie: '', patrimonio: '' })));
    setSeriePrefixo('');
    setSerieInicio('1');
    setTomboPrefixo('');
    setTomboInicio('1');
    setIsLancarModalOpen(true);
  };

  useEffect(() => {
    if (!isLancarModalOpen || !compraParaLancar) return;
    if (!usarUnidades) return;
    if (isCategoriaUniformes(compraParaLancar.categoria)) return;

    const qtd = Math.max(1, Number.parseInt(compraParaLancar.qtd_total, 10) || 1);
    setUnidadesDetalhe((prev) => {
      if (prev.length === qtd) return prev;
      const next = [...prev];
      while (next.length < qtd) next.push({ serie: '', patrimonio: '' });
      return next.slice(0, qtd);
    });
  }, [isLancarModalOpen, compraParaLancar, usarUnidades]);

  const updateUnidadeCampo = (index, campo, value) => {
    setUnidadesDetalhe((prev) => {
      const next = [...prev];
      const novoValor = campo === 'serie' ? normalizeSerieText(value) : value;
      next[index] = { ...next[index], [campo]: novoValor };
      return next;
    });
  };

  const aplicarSequencial = () => {
    const inicioSerieRaw = String(serieInicio || '').trim();
    const inicioSerie = Number.parseInt(inicioSerieRaw, 10);
    const larguraSerie = Math.max(inicioSerieRaw.length, 1);
    const inicioTombo = Number.parseInt(tomboInicio, 10);
    const temSerie = String(seriePrefixo || '').trim().length > 0;
    const temTombo = String(tomboPrefixo || '').trim().length > 0;

    if (!temSerie && !temTombo) {
      setError('Informe prefixo de serie e/ou tombo para gerar sequencial.');
      return;
    }
    if (temSerie && (Number.isNaN(inicioSerie) || inicioSerie < 0)) {
      setError('Numero inicial da serie invalido.');
      return;
    }
    if (temTombo && (Number.isNaN(inicioTombo) || inicioTombo < 0)) {
      setError('Numero inicial do tombo invalido.');
      return;
    }

    setError('');
    setUnidadesDetalhe((prev) => prev.map((u, idx) => ({
      ...u,
      serie: temSerie ? `${seriePrefixo}${String(inicioSerie + idx).padStart(larguraSerie, '0')}` : u.serie,
      patrimonio: temTombo ? `${tomboPrefixo}${inicioTombo + idx}` : u.patrimonio,
    })));
  };

  const handleLancarInventario = async (compra) => {
    const isUniforme = isCategoriaUniformes(compra.categoria);

    const payload = {};
    if (!isUniforme && usarUnidades) {
      const algumaVazia = unidadesDetalhe.some((u) => !String(u.serie || '').trim() && !String(u.patrimonio || '').trim());
      if (algumaVazia) {
        setError('Preencha serie ou tombo para todas as unidades.');
        return;
      }
      payload.usar_unidades = true;
      payload.unidades = unidadesDetalhe.map((u) => ({
        serie: normalizeSerieText(u.serie),
        patrimonio: String(u.patrimonio || '').trim(),
      }));
    }

    try {
      setError('');
      setSuccess('');
      await apiService.create(`compras/${compra.id}/lancar-inventario`, payload);
      setSuccess('Compra lancada no inventario com sucesso.');
      setIsLancarModalOpen(false);
      setCompraParaLancar(null);
      setUsarUnidades(false);
      setUnidadesDetalhe([]);
      setSeriePrefixo('');
      setSerieInicio('1');
      setTomboPrefixo('');
      setTomboInicio('1');
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao lancar compra no inventario.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>🏭 Fornecedores e Compras</h1>
          <p>Cadastro de fornecedor e registro de compra sem lancamento automatico no inventario</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" onClick={() => setIsCompraModalOpen(true)}>🧾 Nova Compra</button>
          <button className="btn btn-primary" onClick={() => setIsFornecedorModalOpen(true)}>➕ Novo Fornecedor</button>
        </div>
      </div>
      {error && <div className="alert alert-danger show">{error}</div>}
      {success && <div className="alert alert-success show">{success}</div>}

      <Modal
        isOpen={isFornecedorModalOpen}
        title="🏭 Fornecedor Homologado"
        onClose={() => setIsFornecedorModalOpen(false)}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsFornecedorModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAddFornecedor}>💾 Salvar</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="form-group"><label htmlFor="forn-nome">Razão Social *</label><input id="forn-nome" value={formFornecedor.nome} onChange={(e) => setFormFornecedor((p) => ({ ...p, nome: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="forn-cnpj">CNPJ</label><input id="forn-cnpj" value={formFornecedor.cnpj} onChange={(e) => setFormFornecedor((p) => ({ ...p, cnpj: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="forn-contato">Contato</label><input id="forn-contato" value={formFornecedor.contato} onChange={(e) => setFormFornecedor((p) => ({ ...p, contato: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="forn-tel">Telefone</label><input id="forn-tel" value={formFornecedor.tel} onChange={(e) => setFormFornecedor((p) => ({ ...p, tel: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="forn-email">Email</label><input id="forn-email" value={formFornecedor.email} onChange={(e) => setFormFornecedor((p) => ({ ...p, email: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="forn-cat">Categoria</label><input id="forn-cat" value={formFornecedor.categoria} onChange={(e) => setFormFornecedor((p) => ({ ...p, categoria: e.target.value }))} /></div>
        </div>
      </Modal>

      <Modal
        isOpen={isCompraModalOpen}
        title="🧾 Vincular Compra ao Fornecedor"
        onClose={() => setIsCompraModalOpen(false)}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => setIsCompraModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAddCompra}>💾 Salvar Compra</button>
          </>
        )}
      >
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="comp-fornecedor">Fornecedor *</label>
            <select id="comp-fornecedor" value={formCompra.fornecedor} onChange={(e) => setFormCompra((p) => ({ ...p, fornecedor: e.target.value }))}>
              <option value="">Selecione...</option>
              {rows.map((f) => (<option key={f.id} value={f.id}>{f.nome}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comp-dt-aq">Data da Compra</label>
            <input id="comp-dt-aq" type="date" value={formCompra.dt_aq} onChange={(e) => setFormCompra((p) => ({ ...p, dt_aq: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="comp-valor">Valor da Compra (R$) *</label>
            <input id="comp-valor" type="number" min="0" step="0.01" value={formCompra.valor_compra} onChange={(e) => setFormCompra((p) => ({ ...p, valor_compra: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="comp-dt-val">Data de Validade{isColetes ? ' *' : ''}</label>
            <input id="comp-dt-val" type="date" value={formCompra.dt_val} onChange={(e) => setFormCompra((p) => ({ ...p, dt_val: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="comp-nota-fiscal">Nº Nota Fiscal</label>
            <input
              id="comp-nota-fiscal"
              value={formCompra.numero_nota_fiscal}
              onChange={(e) => setFormCompra((p) => ({ ...p, numero_nota_fiscal: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="comp-empenho">Nº Empenho</label>
            <input
              id="comp-empenho"
              value={formCompra.numero_empenho}
              onChange={(e) => setFormCompra((p) => ({ ...p, numero_empenho: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="comp-tombo">Nº Tombo</label>
            <input
              id="comp-tombo"
              value={formCompra.numero_tombo}
              onChange={(e) => setFormCompra((p) => ({ ...p, numero_tombo: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="comp-cat">Categoria *</label>
            <select id="comp-cat" value={formCompra.categoria} onChange={(e) => setFormCompra((p) => ({
              ...p,
              categoria: e.target.value,
              tipo: '',
              calibre: '',
              comprimento_cano: '',
              quantidade_carregadores: 0,
              capacidade: 0,
              marca: '',
              modelo: '',
              nivel: '',
              tamanho: '',
              sexo: '',
              cargo: '',
              serie: '',
            }))}
            >
              {categoriaOptions.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>

          {(isArmas || isEquipamentos || isUniformes) && (
            <div className="form-group">
              <label htmlFor="comp-tipo">Tipo *</label>
              <select id="comp-tipo" value={formCompra.tipo} onChange={(e) => setFormCompra((p) => ({ ...p, tipo: e.target.value, marca: '', modelo: '', calibre: '', sexo: '', tamanho: '', cargo: '' }))}>
                <option value="">Selecione...</option>
                {tipoOptions.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
          )}

          {(isArmas || isColetes || (isEquipamentos && marcaOptions.length > 0)) && (
            <div className="form-group">
              <label htmlFor="comp-marca">Marca *</label>
              <select id="comp-marca" value={formCompra.marca} onChange={(e) => setFormCompra((p) => ({ ...p, marca: e.target.value, modelo: '', calibre: '' }))}>
                <option value="">Selecione...</option>
                {marcaOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
          )}

          {(isArmas || (isEquipamentos && modeloOptions.length > 0)) && (
            <div className="form-group">
              <label htmlFor="comp-modelo">Modelo *</label>
              <select id="comp-modelo" value={formCompra.modelo} onChange={(e) => setFormCompra((p) => ({ ...p, modelo: e.target.value, calibre: '' }))}>
                <option value="">Selecione...</option>
                {modeloOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
          )}

          {isArmas && (
            <>
              <div className="form-group">
                <label htmlFor="comp-calibre">Calibre *</label>
                <select id="comp-calibre" value={formCompra.calibre} onChange={(e) => setFormCompra((p) => ({ ...p, calibre: e.target.value }))} disabled={calibreAutomatico || calibreOptions.length === 0}>
                  <option value="">Selecione...</option>
                  {calibreOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comp-cano">Comprimento do Cano</label>
                <input id="comp-cano" value={formCompra.comprimento_cano} onChange={(e) => setFormCompra((p) => ({ ...p, comprimento_cano: e.target.value }))} placeholder="Ex.: 102 mm" />
              </div>
              <div className="form-group">
                <label htmlFor="comp-carregadores">Qtd. de Carregadores</label>
                <input id="comp-carregadores" type="number" min="0" value={formCompra.quantidade_carregadores} onChange={(e) => setFormCompra((p) => ({ ...p, quantidade_carregadores: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="comp-capacidade">Capacidade</label>
                <input id="comp-capacidade" type="number" min="0" value={formCompra.capacidade} onChange={(e) => setFormCompra((p) => ({ ...p, capacidade: e.target.value }))} />
              </div>
            </>
          )}

          {isColetes && (
            <>
              <div className="form-group"><label htmlFor="comp-nivel">Nível *</label><select id="comp-nivel" value={formCompra.nivel} onChange={(e) => setFormCompra((p) => ({ ...p, nivel: e.target.value }))}><option value="">Selecione...</option>{INVENTARIO_COLETES.niveis.map((n) => (<option key={n} value={n}>{n}</option>))}</select></div>
              <div className="form-group"><label htmlFor="comp-tamanho">Tamanho *</label><select id="comp-tamanho" value={formCompra.tamanho} onChange={(e) => setFormCompra((p) => ({ ...p, tamanho: e.target.value }))}><option value="">Selecione...</option>{INVENTARIO_COLETES.tamanhos.map((t) => (<option key={t} value={t}>{t}</option>))}</select></div>
              <div className="form-group"><label htmlFor="comp-sexo">Sexo *</label><select id="comp-sexo" value={formCompra.sexo} onChange={(e) => setFormCompra((p) => ({ ...p, sexo: e.target.value }))}><option value="">Selecione...</option>{INVENTARIO_COLETES.sexos.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
            </>
          )}

          {isUniformes && tipoUniformeAtual && (
            <>
              {tipoUniformeAtual.exigeSexo && <div className="form-group"><label htmlFor="comp-sexo-uni">Sexo *</label><select id="comp-sexo-uni" value={formCompra.sexo} onChange={(e) => setFormCompra((p) => ({ ...p, sexo: e.target.value }))}><option value="">Selecione...</option>{INVENTARIO_UNIFORMES.sexos.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>}
              {tipoUniformeAtual.exigeTamanho && <div className="form-group"><label htmlFor="comp-tam-uni">Tamanho *</label><select id="comp-tam-uni" value={formCompra.tamanho} onChange={(e) => setFormCompra((p) => ({ ...p, tamanho: e.target.value }))}><option value="">Selecione...</option>{tamanhosUniformeOptions.map((t) => (<option key={t} value={t}>{t}</option>))}</select></div>}
              {tipoUniformeAtual.exigeCargo && <div className="form-group"><label htmlFor="comp-cargo-uni">Cargo *</label><select id="comp-cargo-uni" value={formCompra.cargo} onChange={(e) => setFormCompra((p) => ({ ...p, cargo: e.target.value }))}><option value="">Selecione...</option>{INVENTARIO_UNIFORMES.cargos.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>}
            </>
          )}

          <div className="form-group"><label htmlFor="comp-serie">Série</label><input id="comp-serie" value={formCompra.serie} onChange={(e) => setFormCompra((p) => ({ ...p, serie: normalizeSerieText(e.target.value) }))} disabled={isUniformes} /></div>
          <div className="form-group"><label htmlFor="comp-total">Qtd Total</label><input id="comp-total" type="number" min="1" value={formCompra.qtd_total} onChange={(e) => setFormCompra((p) => ({ ...p, qtd_total: e.target.value }))} /></div>
          <div className="form-group full"><label htmlFor="comp-desc">Descrição</label><input id="comp-desc" value={descricaoCompra} disabled /></div>
        </div>
      </Modal>

      <Modal
        isOpen={isLancarModalOpen}
        title="📦 Lançar Compra no Inventário"
        onClose={() => {
          setIsLancarModalOpen(false);
          setCompraParaLancar(null);
          setUsarUnidades(false);
          setSeriePrefixo('');
          setSerieInicio('1');
          setTomboPrefixo('');
          setTomboInicio('1');
        }}
        footer={(
          <>
            <button className="btn btn-outline" onClick={() => {
              setIsLancarModalOpen(false);
              setCompraParaLancar(null);
              setUsarUnidades(false);
              setSeriePrefixo('');
              setSerieInicio('1');
              setTomboPrefixo('');
              setTomboInicio('1');
            }}
            >Cancelar</button>
            <button
              className="btn btn-primary"
              onClick={() => compraParaLancar && handleLancarInventario(compraParaLancar)}
            >
              Confirmar Lançamento
            </button>
          </>
        )}
      >
        {compraParaLancar && (
          <>
            <div className="form-grid">
              <div className="form-group"><label htmlFor="lan-compra-fornecedor">Fornecedor</label><input id="lan-compra-fornecedor" value={compraParaLancar.fornecedor_nome || '—'} disabled /></div>
              <div className="form-group"><label htmlFor="lan-compra-desc">Descrição</label><input id="lan-compra-desc" value={compraParaLancar.descricao || '—'} disabled /></div>
              <div className="form-group"><label htmlFor="lan-compra-cat">Categoria</label><input id="lan-compra-cat" value={compraParaLancar.categoria || '—'} disabled /></div>
              <div className="form-group"><label htmlFor="lan-compra-qtd">Quantidade</label><input id="lan-compra-qtd" value={compraParaLancar.qtd_total || 1} disabled /></div>
            </div>

            {!isCategoriaUniformes(compraParaLancar.categoria) && (
              <>
                <div className="form-group mt-16">
                  <label htmlFor="lan-usar-unidades">Detalhar por unidade (serie e tombo)</label>
                  <select
                    id="lan-usar-unidades"
                    value={usarUnidades ? 'sim' : 'nao'}
                    onChange={(e) => setUsarUnidades(e.target.value === 'sim')}
                  >
                    <option value="nao">Nao (lanca em lote)</option>
                    <option value="sim">Sim (uma linha por item)</option>
                  </select>
                </div>

                {usarUnidades && (
                  <>
                    <div className="form-grid mt-16">
                      <div className="form-group">
                        <label htmlFor="lan-serie-prefixo">Prefixo Série</label>
                        <input id="lan-serie-prefixo" value={seriePrefixo} onChange={(e) => setSeriePrefixo(normalizeSerieText(e.target.value))} placeholder="Ex.: SER-" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lan-serie-inicio">Início Série</label>
                        <input id="lan-serie-inicio" type="text" inputMode="numeric" value={serieInicio} onChange={(e) => setSerieInicio(String(e.target.value || '').replace(/\D+/g, ''))} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lan-tombo-prefixo">Prefixo Tombo</label>
                        <input id="lan-tombo-prefixo" value={tomboPrefixo} onChange={(e) => setTomboPrefixo(e.target.value)} placeholder="Ex.: TOM-" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lan-tombo-inicio">Início Tombo</label>
                        <input id="lan-tombo-inicio" type="number" min="0" value={tomboInicio} onChange={(e) => setTomboInicio(e.target.value)} />
                      </div>
                    </div>

                    <button type="button" className="btn btn-outline btn-sm mt-16" onClick={aplicarSequencial}>
                      Preencher Sequencial
                    </button>

                    <div className="table-wrap mt-16" style={{ maxHeight: '320px' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Número de Série</th>
                            <th>Número de Tombo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unidadesDetalhe.map((u, idx) => (
                            <tr key={`un-${idx + 1}`}>
                              <td>{idx + 1}</td>
                              <td>
                                <input
                                  value={u.serie}
                                  onChange={(e) => updateUnidadeCampo(idx, 'serie', e.target.value)}
                                  placeholder={`Serie ${idx + 1}`}
                                />
                              </td>
                              <td>
                                <input
                                  value={u.patrimonio}
                                  onChange={(e) => updateUnidadeCampo(idx, 'patrimonio', e.target.value)}
                                  placeholder={`Tombo ${idx + 1}`}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Modal>

      <div className="card">
        <div className="search-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Buscar por razão social, cnpj, contato..." style={{ width: '100%' }} /></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Razão Social</th><th>CNPJ</th><th>Contato</th><th>Telefone</th><th>Ações</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><b>{row.nome}</b></td><td>{row.cnpj || '—'}</td><td>{row.contato || '—'}</td><td>{row.tel || '—'}</td>
                  <td><button className="btn btn-xs btn-danger" onClick={() => handleDelete(row.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-title">🧾 Compras Vinculadas ao Fornecedor</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>Fornecedor</th><th>Descrição</th><th>Categoria</th><th>Nº NF</th><th>Nº Empenho</th><th>Nº Tombo</th><th>Valor Compra</th><th>Qtd</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {compras.map((row) => (
                <tr key={row.id}>
                  <td>{row.dt_aq ? new Date(row.dt_aq).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>{row.fornecedor_nome || '—'}</td>
                  <td><b>{row.descricao}</b></td>
                  <td>{row.categoria}</td>
                  <td>{row.numero_nota_fiscal || '—'}</td>
                  <td>{row.numero_empenho || '—'}</td>
                  <td>{row.numero_tombo || '—'}</td>
                  <td>{row.valor_compra == null ? '—' : Number(row.valor_compra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>{row.qtd_total}</td>
                  <td>{row.status || 'Pendente'}</td>
                  <td>
                    <button
                      className="btn btn-xs btn-primary"
                      onClick={() => openLancarModal(row)}
                      disabled={String(row.status || '').toLowerCase().includes('lanc')}
                    >
                      {String(row.status || '').toLowerCase().includes('lanc') ? 'Lançada' : 'Lançar no Inventário'}
                    </button>
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

export default CadFornecedores;
