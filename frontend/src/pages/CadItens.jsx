import React, { useEffect, useRef, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { getMenuOptions } from '../services/menuOptions';

/* eslint-disable react/prop-types */

const INVENTARIO_ARMAS = {
  categoria: 'Armas',
  tipos: {
    Pistola: {
      calibres: ['9mm', '.40'],
      marcas: {
        Glock: ['G17', 'G19', 'G26'],
        'Sig Sauer': ['P320'],
        Taurus: ['PT-100', 'PT-101', 'PT-640', 'PT-840', 'PT-940', 'PT-24/7'],
        Bereta: ['APX'],
      },
    },
    Revolver: {
      calibres: ['.38'],
      marcas: {
        Revolver: ['Padrão'],
      },
    },
    Fuzil: {
      calibres: ['5.56', '7,62x51mm'],
      marcas: {
        'Radical Firearms': ['RF 14'],
        Imbel: ['IA2'],
        Bushmaster: ['XM15E25'],
      },
    },
    'Fuzil Sniper': {
      calibres: ['.308', '7,62'],
      marcas: {
        Armalite: ['AR10'],
        HK: ['HKPSG1'],
      },
    },
    Carabina: {
      calibres: ['9mm', '.45', '.40'],
      marcas: {
        SigSauer: ['MPX'],
        Taurus: ['CT', 'CTT', 'SMT', 'MT', 'MT12'],
        HK: ['MP5'],
        INA: ['MB50'],
      },
    },
    Espingarda: {
      calibres: ['12'],
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
    Glock: {
      G17: ['9mm'],
      G19: ['9mm'],
      G26: ['9mm'],
    },
    'Sig Sauer': {
      P320: ['9mm', '.40'],
    },
    Taurus: {
      'PT-100': ['.40'],
      'PT-101': ['.40'],
      'PT-640': ['.40'],
      'PT-840': ['.40'],
      'PT-940': ['.40'],
      'PT-24/7': ['.40'],
    },
    Bereta: {
      APX: ['9mm'],
    },
  },
  Revolver: {
    Revolver: {
      Padrão: ['.38'],
    },
  },
  Fuzil: {
    'Radical Firearms': {
      'RF 14': ['5.56'],
    },
    Imbel: {
      IA2: ['5.56'],
    },
    Bushmaster: {
      XM15E25: ['5.56'],
    },
  },
  'Fuzil Sniper': {
    Armalite: {
      AR10: ['.308'],
    },
    HK: {
      HKPSG1: ['7,62'],
    },
  },
  Carabina: {
    SigSauer: {
      MPX: ['9mm'],
    },
    Taurus: {
      CT: ['.40'],
      CTT: ['.40'],
      SMT: ['.40'],
      MT: ['9mm', '.40'],
      MT12: ['9mm'],
    },
    HK: {
      MP5: ['9mm'],
    },
    INA: {
      MB50: ['.45'],
    },
  },
  Espingarda: {
    Benelli: {
      M3A1: ['12'],
    },
    CBC: {
      586: ['12'],
      151: ['12'],
      '586P': ['12'],
    },
    Boito: {
      'BSA 5T 84': ['12'],
    },
    Rossi: {
      OVERLAND: ['12'],
    },
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
  'MAVIC 3T',
  'MAVIC MINI 3',
  'MAVIC PRO',
  'MAVIC 2 ENTERPRISE',
  'PHANTOM 1',
  'HUBSAN ZINO',
  'DJI TELLO',
  'KFPLAN KF101 MAX-S',
  'PHANTOM 4 ADVANCED',
  'MINI 2 STANDART',
  'PHANTOM 4 PRO',
  'MAVIC SPARK',
  'MATRICE 300',
  'MAVIC 3 PRO',
];

const INVENTARIO_EQUIPAMENTOS = {
  categoria: 'Equipamentos',
  tipos: {
    'Rádio Comunicador': {
      marcas: [],
      modelos: ['Fixo', 'Móvel', 'HT'],
      marcaObrigatoria: false,
      modeloObrigatorio: true,
    },
    Drones: {
      marcas: ['DJI'],
      modelos: MODELOS_DRONES,
      marcaObrigatoria: true,
      modeloObrigatorio: true,
    },
    'Detector de Metal': {
      marcas: [],
      modelos: [],
      marcaObrigatoria: false,
      modeloObrigatorio: false,
    },
    Algema: {
      marcas: [],
      modelos: [],
      marcaObrigatoria: false,
      modeloObrigatorio: false,
    },
    Arrombamento: {
      marcas: [],
      modelos: [],
      marcaObrigatoria: false,
      modeloObrigatorio: false,
    },
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

const MODELO_PLANILHA_HEADERS = [
  'categoria',
  'tipo',
  'calibre',
  'marca',
  'modelo',
  'nivel',
  'tamanho',
  'sexo',
  'cargo',
  'serie',
  'qtd_total',
  'qtd_disp',
  'qtd_min',
  'status',
  'descricao',
  'patrimonio',
  'dt_aq',
  'dt_val',
  'obs',
];

const MODELO_PLANILHA_EXEMPLOS = [
  {
    categoria: 'Armas',
    tipo: 'Pistola',
    calibre: '9mm',
    marca: 'Glock',
    modelo: 'G17',
    nivel: '',
    tamanho: '',
    sexo: '',
    cargo: '',
    serie: 'ARM-0001',
    qtd_total: '10',
    qtd_disp: '10',
    qtd_min: '2',
    status: 'Disponivel',
    descricao: '',
    patrimonio: '',
    dt_aq: '',
    dt_val: '',
    obs: '',
  },
  {
    categoria: 'Coletes',
    tipo: '',
    calibre: '',
    marca: 'Protecta',
    modelo: '',
    nivel: 'IIIA',
    tamanho: 'M',
    sexo: 'Masculino',
    cargo: '',
    serie: 'COL-001',
    qtd_total: '8',
    qtd_disp: '8',
    qtd_min: '2',
    status: 'Disponivel',
    descricao: '',
    patrimonio: '',
    dt_aq: '',
    dt_val: '',
    obs: '',
  },
  {
    categoria: 'Equipamentos',
    tipo: 'Drones',
    calibre: '',
    marca: 'DJI',
    modelo: 'MAVIC 3T',
    nivel: '',
    tamanho: '',
    sexo: '',
    cargo: '',
    serie: 'DRN-001',
    qtd_total: '2',
    qtd_disp: '2',
    qtd_min: '1',
    status: 'Disponivel',
    descricao: '',
    patrimonio: '',
    dt_aq: '',
    dt_val: '',
    obs: '',
  },
  {
    categoria: 'Uniformes',
    tipo: 'Calça Tática',
    calibre: '',
    marca: '',
    modelo: '',
    nivel: '',
    tamanho: 'G',
    sexo: 'Feminino',
    cargo: '',
    serie: '',
    qtd_total: '20',
    qtd_disp: '20',
    qtd_min: '5',
    status: 'Disponivel',
    descricao: '',
    patrimonio: '',
    dt_aq: '',
    dt_val: '',
    obs: '',
  },
];

function normalizarTexto(valor) {
  return String(valor || '').trim();
}

function normalizarSerie(valor) {
  return String(valor || '').replace(/\s+/g, '').toUpperCase();
}

function detectarSeparadorCsv(linha) {
  const texto = String(linha || '');
  const pontosVirgula = (texto.match(/;/g) || []).length;
  const virgulas = (texto.match(/,/g) || []).length;
  return pontosVirgula >= virgulas ? ';' : ',';
}

function parseLinhaCsv(linha, separador) {
  const out = [];
  let atual = '';
  let emAspas = false;

  for (let i = 0; i < linha.length; i += 1) {
    const ch = linha[i];
    if (ch === '"') {
      if (emAspas && linha[i + 1] === '"') {
        atual += '"';
        i += 1;
      } else {
        emAspas = !emAspas;
      }
      continue;
    }

    if (ch === separador && !emAspas) {
      out.push(atual.trim());
      atual = '';
      continue;
    }

    atual += ch;
  }

  out.push(atual.trim());
  return out;
}

function parseInteiroPositivo(valor, fallback) {
  const n = Number.parseInt(String(valor || '').trim(), 10);
  if (Number.isNaN(n) || n < 0) return fallback;
  return n;
}

function escapeCsv(valor) {
  const texto = String(valor ?? '');
  if (texto.includes(';') || texto.includes('"') || texto.includes('\n')) {
    return `"${texto.replaceAll('"', '""')}"`;
  }
  return texto;
}

function montarDescricaoImportacao(registro) {
  const categoria = normalizarTexto(registro.categoria);
  if (categoria === INVENTARIO_ARMAS.categoria) {
    return getDescricaoArma(registro.tipo, registro.marca, registro.modelo, registro.calibre);
  }
  if (categoria === INVENTARIO_COLETES.categoria) {
    return getDescricaoColete(registro.marca, registro.nivel, registro.tamanho, registro.sexo);
  }
  if (categoria === INVENTARIO_EQUIPAMENTOS.categoria) {
    return getDescricaoEquipamento(registro.tipo, registro.marca, registro.modelo);
  }
  if (categoria === INVENTARIO_UNIFORMES.categoria) {
    return getDescricaoUniforme(registro.tipo, registro.sexo, registro.tamanho, registro.cargo);
  }
  return '';
}

function getCalibresDoModeloArma(tipo, marca, modelo, tipoArmaAtual) {
  if (!tipo || !marca || !modelo) return [];
  const porTipo = CALIBRES_AUTOMATICOS_ARMAS[tipo] || {};
  const porMarca = porTipo[marca] || {};
  const porModelo = porMarca[modelo] || [];
  if (porModelo.length > 0) return porModelo;
  return tipoArmaAtual ? tipoArmaAtual.calibres : [];
}

function mapToSelectOptions(values) {
  return values.map((value) => ({ value, label: value }));
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function CadItens() {
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [categoriasMenu, setCategoriasMenu] = useState([]);
  const [tiposArmasMenu, setTiposArmasMenu] = useState([]);
  const [tiposEquipamentosMenu, setTiposEquipamentosMenu] = useState([]);
  const [tiposUniformesMenu, setTiposUniformesMenu] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    categoria: INVENTARIO_ARMAS.categoria,
    tipo: '',
    calibre: '',
    marca: '',
    modelo: '',
    nivel: '',
    tamanho: '',
    sexo: '',
    cargo: '',
    patrimonio: '',
    serie: '',
    qtd_total: 1,
    qtd_disp: 1,
    qtd_min: 1,
    status: 'Disponivel',
  });

  const isArmas = form.categoria === INVENTARIO_ARMAS.categoria;
  const isColetes = form.categoria === INVENTARIO_COLETES.categoria;
  const isEquipamentos = form.categoria === INVENTARIO_EQUIPAMENTOS.categoria;
  const isUniformes = form.categoria === INVENTARIO_UNIFORMES.categoria;

  const tipoArmaAtual = form.tipo ? INVENTARIO_ARMAS.tipos[form.tipo] : null;
  const tipoEquipamentoAtual = form.tipo ? INVENTARIO_EQUIPAMENTOS.tipos[form.tipo] : null;
  const tipoUniformeAtual = form.tipo ? INVENTARIO_UNIFORMES.tipos[form.tipo] : null;

  let tipoOptions = [];
  if (isArmas) {
    tipoOptions = tiposArmasMenu.length > 0 ? tiposArmasMenu : mapToSelectOptions(Object.keys(INVENTARIO_ARMAS.tipos));
  }
  if (isEquipamentos) {
    tipoOptions = tiposEquipamentosMenu.length > 0 ? tiposEquipamentosMenu : mapToSelectOptions(Object.keys(INVENTARIO_EQUIPAMENTOS.tipos));
  }
  if (isUniformes) {
    tipoOptions = tiposUniformesMenu.length > 0 ? tiposUniformesMenu : mapToSelectOptions(Object.keys(INVENTARIO_UNIFORMES.tipos));
  }

  const categoriaOptions = categoriasMenu.length > 0 ? categoriasMenu : mapToSelectOptions(CATEGORIAS_INVENTARIO);

  const calibresDoModeloArma = getCalibresDoModeloArma(form.tipo, form.marca, form.modelo, tipoArmaAtual);
  const calibreOptions = isArmas ? calibresDoModeloArma : [];
  const calibreAutomatico = isArmas && calibreOptions.length === 1;
  let marcaOptions = [];
  if (isColetes) {
    marcaOptions = INVENTARIO_COLETES.marcas;
  }
  if (isArmas) {
    marcaOptions = tipoArmaAtual ? Object.keys(tipoArmaAtual.marcas) : [];
  }
  if (isEquipamentos) {
    marcaOptions = tipoEquipamentoAtual ? tipoEquipamentoAtual.marcas : [];
  }

  let modeloOptions = [];
  if (isArmas && tipoArmaAtual && form.marca) {
    modeloOptions = tipoArmaAtual.marcas[form.marca] || [];
  }
  if (isEquipamentos) {
    modeloOptions = tipoEquipamentoAtual ? tipoEquipamentoAtual.modelos : [];
  }

  let marcaPlaceholder = 'Selecione...';
  if (isArmas) {
    marcaPlaceholder = form.tipo ? 'Selecione...' : 'Selecione o tipo primeiro';
  }
  if (isEquipamentos) {
    marcaPlaceholder = marcaOptions.length ? 'Selecione...' : 'Não se aplica';
  }

  let modeloPlaceholder = 'Selecione...';
  if (isArmas) {
    modeloPlaceholder = form.marca ? 'Selecione...' : 'Selecione a marca primeiro';
  }

  let calibrePlaceholder = 'Selecione o tipo primeiro';
  if (form.tipo) {
    calibrePlaceholder = form.modelo ? 'Selecione...' : 'Selecione o modelo primeiro';
  }
  if (isEquipamentos) {
    if (!form.tipo) {
      modeloPlaceholder = 'Selecione o tipo primeiro';
    } else if (modeloOptions.length === 0) {
      modeloPlaceholder = 'Não se aplica';
    } else {
      modeloPlaceholder = 'Selecione...';
    }
  }

  let descricao = getDescricaoColete(form.marca, form.nivel, form.tamanho, form.sexo);
  if (isArmas) {
    descricao = getDescricaoArma(form.tipo, form.marca, form.modelo, form.calibre);
  }
  if (isEquipamentos) {
    descricao = getDescricaoEquipamento(form.tipo, form.marca, form.modelo);
  }
  if (isUniformes) {
    descricao = getDescricaoUniforme(form.tipo, form.sexo, form.tamanho, form.cargo);
  }

  useEffect(() => {
    if (!isArmas) return;
    if (!form.modelo) return;
    if (calibreOptions.length === 0) return;

    if (calibreOptions.length === 1) {
      if (form.calibre !== calibreOptions[0]) {
        setForm((prev) => ({ ...prev, calibre: calibreOptions[0] }));
      }
      return;
    }

    if (form.calibre && !calibreOptions.includes(form.calibre)) {
      setForm((prev) => ({ ...prev, calibre: '' }));
    }
  }, [isArmas, form.modelo, form.calibre, calibreOptions]);

  const loadRows = async () => {
    try {
      const params = new URLSearchParams({ page_size: '500', ordering: 'descricao' });
      if (search.trim()) params.append('search', search.trim());
      const data = await apiService.getList('itens', params);
      setRows(data.results || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar itens.');
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

  const handleDownloadModelo = () => {
    const lines = [];
    lines.push(MODELO_PLANILHA_HEADERS.join(';'));
    MODELO_PLANILHA_EXEMPLOS.forEach((registro) => {
      const row = MODELO_PLANILHA_HEADERS.map((header) => escapeCsv(registro[header] || ''));
      lines.push(row.join(';'));
    });

    const csvContent = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo_itens_importacao.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleOpenImport = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleDownloadInventario = async () => {
    try {
      setError('');
      setSuccess('');
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      await apiService.download('itens/relatorio-xlsx', 'relatorio_inventario.xlsx', params);
    } catch (err) {
      setError(err.message || 'Falha ao baixar planilha de inventario.');
    }
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const content = await file.text();
      const linhas = String(content)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (linhas.length < 2) {
        setError('Planilha vazia ou sem linhas de dados.');
        return;
      }

      const separador = detectarSeparadorCsv(linhas[0]);
      const headers = parseLinhaCsv(linhas[0], separador).map((h) => normalizarTexto(h).toLowerCase());
      const idx = (campo) => headers.indexOf(campo);

      const iCategoria = idx('categoria');
      const iDescricao = idx('descricao');

      if (iCategoria < 0) {
        setError('A planilha precisa ter a coluna categoria.');
        return;
      }

      let sucesso = 0;
      let falha = 0;
      const erros = [];

      for (let i = 1; i < linhas.length; i += 1) {
        const cols = parseLinhaCsv(linhas[i], separador);
        const registro = {
          categoria: normalizarTexto(cols[iCategoria]),
          tipo: normalizarTexto(cols[idx('tipo')]),
          calibre: normalizarTexto(cols[idx('calibre')]),
          marca: normalizarTexto(cols[idx('marca')]),
          modelo: normalizarTexto(cols[idx('modelo')]),
          nivel: normalizarTexto(cols[idx('nivel')]),
          tamanho: normalizarTexto(cols[idx('tamanho')]),
          sexo: normalizarTexto(cols[idx('sexo')]),
          cargo: normalizarTexto(cols[idx('cargo')]),
          serie: normalizarSerie(cols[idx('serie')]),
          status: normalizarTexto(cols[idx('status')]) || 'Disponivel',
          patrimonio: normalizarTexto(cols[idx('patrimonio')]),
          dt_aq: normalizarTexto(cols[idx('dt_aq')]),
          dt_val: normalizarTexto(cols[idx('dt_val')]),
          obs: normalizarTexto(cols[idx('obs')]),
        };

        const qtdTotal = parseInteiroPositivo(cols[idx('qtd_total')], 1);
        const qtdDisp = parseInteiroPositivo(cols[idx('qtd_disp')], qtdTotal);
        const qtdMin = parseInteiroPositivo(cols[idx('qtd_min')], 1);

        const descricaoPlanilha = iDescricao >= 0 ? normalizarTexto(cols[iDescricao]) : '';
        const descricaoGerada = montarDescricaoImportacao(registro);
        const descricaoFinal = descricaoPlanilha || descricaoGerada;

        if (!registro.categoria) {
          falha += 1;
          erros.push(`Linha ${i + 1}: categoria vazia.`);
          continue;
        }

        if (!descricaoFinal) {
          falha += 1;
          erros.push(`Linha ${i + 1}: descricao nao informada e nao foi possivel gerar automaticamente.`);
          continue;
        }

        try {
          await apiService.create('itens', {
            categoria: registro.categoria,
            marca: registro.marca,
            descricao: descricaoFinal,
            serie: registro.categoria === INVENTARIO_UNIFORMES.categoria ? '' : registro.serie,
            qtd_total: qtdTotal,
            qtd_disp: qtdDisp,
            qtd_min: qtdMin,
            status: registro.status,
            patrimonio: registro.patrimonio,
            dt_aq: registro.dt_aq || null,
            dt_val: registro.dt_val || null,
            obs: registro.obs,
          });
          sucesso += 1;
        } catch (err) {
          falha += 1;
          erros.push(`Linha ${i + 1}: ${err.message || 'erro ao cadastrar.'}`);
        }
      }

      await loadRows();

      if (falha > 0) {
        const detalhes = erros.slice(0, 6).join(' | ');
        setError(`Importacao concluida com ${sucesso} sucesso(s) e ${falha} falha(s). ${detalhes}`);
      } else {
        setSuccess(`Importacao concluida com ${sucesso} item(ns) cadastrado(s).`);
      }
    } catch (err) {
      setError(err.message || 'Falha ao importar planilha.');
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setForm({
      categoria: INVENTARIO_ARMAS.categoria,
      tipo: '',
      calibre: '',
      marca: '',
      modelo: '',
      nivel: '',
      tamanho: '',
      sexo: '',
      cargo: '',
        patrimonio: '',
      serie: '',
      qtd_total: 1,
      qtd_disp: 1,
      qtd_min: 1,
      status: 'Disponivel',
    });
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleAdd = async () => {
    if (isArmas && (!form.tipo || !form.calibre || !form.marca || !form.modelo)) {
      setError('Preencha tipo, calibre, marca e modelo para armas.');
      return;
    }

    if (isColetes && (!form.marca || !form.nivel || !form.tamanho || !form.sexo)) {
      setError('Preencha marca, nível, tamanho e sexo para coletes.');
      return;
    }

    if (isEquipamentos) {
      if (!form.tipo) {
        setError('Preencha o tipo para equipamentos.');
        return;
      }

      const marcaObrigatoria = tipoEquipamentoAtual ? tipoEquipamentoAtual.marcaObrigatoria : false;
      const modeloObrigatorio = tipoEquipamentoAtual ? tipoEquipamentoAtual.modeloObrigatorio : false;

      if (marcaObrigatoria && !form.marca) {
        setError('Preencha a marca para esse tipo de equipamento.');
        return;
      }

      if (modeloObrigatorio && !form.modelo) {
        setError('Preencha o modelo para esse tipo de equipamento.');
        return;
      }
    }

    if (isUniformes) {
      if (!form.tipo) {
        setError('Preencha o tipo para uniformes.');
        return;
      }

      const exigeSexo = tipoUniformeAtual ? tipoUniformeAtual.exigeSexo : false;
      const exigeTamanho = tipoUniformeAtual ? tipoUniformeAtual.exigeTamanho : false;
      const exigeCargo = tipoUniformeAtual ? tipoUniformeAtual.exigeCargo : false;

      if (exigeSexo && !form.sexo) {
        setError('Preencha o sexo para esse tipo de uniforme.');
        return;
      }

      if (exigeTamanho && !form.tamanho) {
        setError('Preencha o tamanho para esse tipo de uniforme.');
        return;
      }

      if (exigeCargo && !form.cargo) {
        setError('Preencha o cargo para esse tipo de uniforme.');
        return;
      }
    }

    try {
      setError('');
      setSuccess('');
      await apiService.create('itens', {
        categoria: form.categoria,
        marca: form.marca,
        descricao,
        patrimonio: form.patrimonio,
        serie: isUniformes ? '' : form.serie,
        qtd_total: Number(form.qtd_total || 1),
        qtd_disp: Number(form.qtd_disp || 1),
        qtd_min: Number(form.qtd_min || 1),
        status: form.status,
      });
      resetForm();
      setIsModalOpen(false);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao cadastrar item.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.remove('itens', id);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Falha ao excluir item.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>📦 Carga Geral do Inventário</h1>
          <p>Material bélico, munições, EPIs e ativos do almoxarifado</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" onClick={handleDownloadModelo}>⬇️ Baixar Modelo Planilha</button>
          <button className="btn btn-outline" onClick={handleDownloadInventario}>⬇️ Baixar Dados do Inventário</button>
          <button className="btn btn-outline" onClick={handleOpenImport} disabled={importing}>📤 Importar Planilha</button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>➕ Adicionar Item Manual</button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleImportFile} style={{ display: 'none' }} />
      {error && <div className="alert alert-danger show">{error}</div>}
      {success && <div className="alert alert-success show">{success}</div>}

      <Modal
        isOpen={isModalOpen}
        title="📦 Cadastro de Item Bélico / Logística"
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
            <label htmlFor="it-cat">Categoria *</label>
            <select
              id="it-cat"
              value={form.categoria}
              onChange={(e) => setForm((p) => ({
                ...p,
                categoria: e.target.value,
                tipo: '',
                calibre: '',
                marca: '',
                modelo: '',
                nivel: '',
                tamanho: '',
                sexo: '',
                cargo: '',
                patrimonio: '',
                serie: '',
              }))}
            >
              {categoriaOptions.map((categoria) => (
                <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
              ))}
            </select>
          </div>

          {isArmas && (
            <>
              <div className="form-group">
                <label htmlFor="it-tipo">Tipo *</label>
                <select
                  id="it-tipo"
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value, calibre: '', marca: '', modelo: '' }))}
                >
                  <option value="">Selecione...</option>
                  {tipoOptions.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="it-calibre">Calibre *</label>
                <select
                  id="it-calibre"
                  value={form.calibre}
                  onChange={(e) => setForm((p) => ({ ...p, calibre: e.target.value }))}
                  disabled={!form.tipo || calibreAutomatico || !form.modelo}
                >
                  <option value="">{calibrePlaceholder}</option>
                  {calibreOptions.map((calibre) => (
                    <option key={calibre} value={calibre}>{calibre}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isEquipamentos && (
            <div className="form-group">
              <label htmlFor="it-tipo-equip">Tipo *</label>
              <select
                id="it-tipo-equip"
                value={form.tipo}
                onChange={(e) => {
                  const tipoSelecionado = e.target.value;
                  const cfgTipo = INVENTARIO_EQUIPAMENTOS.tipos[tipoSelecionado];
                  const marcaUnica = cfgTipo?.marcas.length === 1 ? cfgTipo.marcas[0] : '';
                  setForm((p) => ({
                    ...p,
                    tipo: tipoSelecionado,
                    calibre: '',
                    marca: marcaUnica,
                    modelo: '',
                  }));
                }}
              >
                <option value="">Selecione...</option>
                {tipoOptions.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
          )}

          {isUniformes && (
            <div className="form-group">
              <label htmlFor="it-tipo-uni">Tipo *</label>
              <select
                id="it-tipo-uni"
                value={form.tipo}
                onChange={(e) => setForm((p) => ({
                  ...p,
                  tipo: e.target.value,
                  calibre: '',
                  marca: '',
                  modelo: '',
                  nivel: '',
                  tamanho: '',
                  sexo: '',
                  cargo: '',
                  patrimonio: '',
                  serie: '',
                }))}
              >
                <option value="">Selecione...</option>
                {tipoOptions.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
          )}

          {(isArmas || isColetes || (isEquipamentos && marcaOptions.length > 0)) && (
            <div className="form-group">
              <label htmlFor="it-marca">Marca *</label>
              <select
                id="it-marca"
                value={form.marca}
                onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value, modelo: '', calibre: '' }))}
                disabled={isArmas ? !form.tipo : false}
              >
                <option value="">{marcaPlaceholder}</option>
                {marcaOptions.map((marca) => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
          )}

          {(isArmas || (isEquipamentos && modeloOptions.length > 0)) && (
            <div className="form-group">
              <label htmlFor="it-modelo">Modelo *</label>
              <select
                id="it-modelo"
                value={form.modelo}
                onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value, calibre: '' }))}
                disabled={isArmas ? !form.marca : !form.tipo}
              >
                <option value="">{modeloPlaceholder}</option>
                {modeloOptions.map((modelo) => (
                  <option key={modelo} value={modelo}>{modelo}</option>
                ))}
              </select>
            </div>
          )}

          {isColetes && (
            <>
              <div className="form-group">
                <label htmlFor="it-nivel">Nível *</label>
                <select id="it-nivel" value={form.nivel} onChange={(e) => setForm((p) => ({ ...p, nivel: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {INVENTARIO_COLETES.niveis.map((nivel) => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="it-tamanho">Tamanho *</label>
                <select id="it-tamanho" value={form.tamanho} onChange={(e) => setForm((p) => ({ ...p, tamanho: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {INVENTARIO_COLETES.tamanhos.map((tamanho) => (
                    <option key={tamanho} value={tamanho}>{tamanho}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="it-sexo">Sexo *</label>
                <select id="it-sexo" value={form.sexo} onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {INVENTARIO_COLETES.sexos.map((sexo) => (
                    <option key={sexo} value={sexo}>{sexo}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isUniformes && tipoUniformeAtual && (
            <>
              {tipoUniformeAtual.exigeSexo && (
                <div className="form-group">
                  <label htmlFor="it-sexo-uniforme">Sexo *</label>
                  <select id="it-sexo-uniforme" value={form.sexo} onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {INVENTARIO_UNIFORMES.sexos.map((sexo) => (
                      <option key={sexo} value={sexo}>{sexo}</option>
                    ))}
                  </select>
                </div>
              )}
              {tipoUniformeAtual.exigeTamanho && (
                <div className="form-group">
                  <label htmlFor="it-tamanho-uniforme">Tamanho *</label>
                  <select id="it-tamanho-uniforme" value={form.tamanho} onChange={(e) => setForm((p) => ({ ...p, tamanho: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {INVENTARIO_UNIFORMES.tamanhos.map((tamanho) => (
                      <option key={tamanho} value={tamanho}>{tamanho}</option>
                    ))}
                  </select>
                </div>
              )}
              {tipoUniformeAtual.exigeCargo && (
                <div className="form-group">
                  <label htmlFor="it-cargo-uniforme">Cargo *</label>
                  <select id="it-cargo-uniforme" value={form.cargo} onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {INVENTARIO_UNIFORMES.cargos.map((cargo) => (
                      <option key={cargo} value={cargo}>{cargo}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="form-group"><label htmlFor="it-desc">Descrição *</label><input id="it-desc" value={descricao} disabled /></div>
          <div className="form-group"><label htmlFor="it-patrimonio">Número do Tombo / Patrimônio</label><input id="it-patrimonio" value={form.patrimonio} onChange={(e) => setForm((p) => ({ ...p, patrimonio: e.target.value }))} placeholder="Ex.: TOM-0001" /></div>
          {!isUniformes && <div className="form-group"><label htmlFor="it-serie">Série</label><input id="it-serie" value={form.serie} onChange={(e) => setForm((p) => ({ ...p, serie: normalizarSerie(e.target.value) }))} /></div>}
          <div className="form-group"><label htmlFor="it-total">Qtd Total</label><input id="it-total" type="number" min="1" value={form.qtd_total} onChange={(e) => setForm((p) => ({ ...p, qtd_total: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="it-disp">Qtd Disp.</label><input id="it-disp" type="number" min="0" value={form.qtd_disp} onChange={(e) => setForm((p) => ({ ...p, qtd_disp: e.target.value }))} /></div>
          <div className="form-group"><label htmlFor="it-min">Qtd Mín.</label><input id="it-min" type="number" min="0" value={form.qtd_min} onChange={(e) => setForm((p) => ({ ...p, qtd_min: e.target.value }))} /></div>
        </div>
      </Modal>

      <div className="card">
        <div className="search-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Buscar por descrição, série, categoria..." style={{ width: '100%' }} /></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Descrição</th><th>Categoria</th><th>Tombo</th><th>Série</th><th>Total</th><th>Disp.</th><th>Mín.</th><th>Ações</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><b>{row.descricao}</b></td><td>{row.categoria}</td><td>{row.patrimonio || '—'}</td><td>{row.serie || '—'}</td><td>{row.qtd_total}</td><td>{row.qtd_disp}</td><td>{row.qtd_min}</td>
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

export default CadItens;
