import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import { DEPARTAMENTOS_PADRAO } from '../constants/organizacao';
import { getMenuOptions } from '../services/menuOptions';

/* eslint-disable react/prop-types */

const LISTAS = {
	armeiros: ['Thales', 'Santiago', 'Sales', 'Raimundo'],
	tiposServico: ['Manutenção', 'Limpeza', 'Reposição de Peça', 'Reposição de Arma'],
	status: ['Aberto', 'Em Andamento', 'Aguardando Peça', 'Aguardando Teste', 'Encaminhado à Fábrica', 'Concluído'],
	causasNormal: ['Mau Funcionamento', 'Dano Físico', 'Rotina', 'Solicitação do Policial'],
	causasEspecial: ['Furto', 'Roubo', 'Extravio'],
	modelos: ['G17', 'G19', 'G26', 'P320', 'PT-100', 'PT-101', 'PT-640', 'PT-840', 'PT-940', 'PT-24/7', 'APX', 'REVOLVER', 'RF 14', 'IA2', 'BUSHMASTER', 'AR10', 'MPX', 'CT40', 'CTT40', 'SMT40', 'MT9', 'BENELLI'],
	calibres: ['9mm', '.40', '5.56', '7.62', '12GA', '.38', 'Outro'],
};

function getToday() {
	return new Date().toISOString().slice(0, 10);
}

function normalizeSerie(value) {
	return String(value || '').replace(/\s+/g, '').toUpperCase();
}

function NovoServico({ onNavigate }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [policiais, setPoliciais] = useState([]);
	const [departamentosMenu, setDepartamentosMenu] = useState([]);
	const [armaEncontrada, setArmaEncontrada] = useState(null);
	const [form, setForm] = useState({
		codigo: '',
		tipo: '',
		armeiro: '',
		data_rec: getToday(),
		data_dev: '',
		status: '',
		motivo: '',
		matricula: '',
		policial_nome: '',
		depto: '',
		lotacao: '',
		modelo: '',
		calibre: '',
		serie: '',
		descricao: '',
		policial_id: null,
	});

	useEffect(() => {
		const bootstrap = async () => {
			try {
				const [policiaisData, nextCodeData] = await Promise.all([
					apiService.getList('policiais', new URLSearchParams({ page_size: '500', ordering: 'nome' })),
					apiService.get('servicos/next-code'),
				]);
				setPoliciais(policiaisData?.results || []);
				setForm((prev) => ({ ...prev, codigo: nextCodeData.codigo }));
				const departamentosData = await getMenuOptions('departamento');
				setDepartamentosMenu(departamentosData);
			} catch {
				// Nao bloqueia o preenchimento manual do formulario se falhar o bootstrap
			}
		};

		bootstrap();
	}, []);

	const causas = useMemo(() => {
		return form.tipo === 'Reposição de Arma' ? LISTAS.causasEspecial : LISTAS.causasNormal;
	}, [form.tipo]);

	const departamentos = useMemo(() => {
		const set = new Set();
		if (departamentosMenu.length > 0) {
			departamentosMenu.forEach((opt) => set.add(opt.label));
		} else {
			DEPARTAMENTOS_PADRAO.forEach((item) => set.add(item));
		}
		policiais.forEach((p) => {
			if (p.depto) set.add(p.depto);
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
	}, [policiais, departamentosMenu]);

	const lotacoes = useMemo(() => {
		if (!form.depto) return [];
		const set = new Set(
			policiais
				.filter((p) => p.depto === form.depto)
				.map((p) => p.lotacao)
				.filter(Boolean),
		);
		return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
	}, [policiais, form.depto]);

	const esconderDataDevolucao = form.tipo === 'Reposição de Arma';

	useEffect(() => {
		if (form.motivo && !causas.includes(form.motivo)) {
			setForm((prev) => ({ ...prev, motivo: '' }));
		}
	}, [causas, form.motivo]);

	useEffect(() => {
		if (!esconderDataDevolucao) return;
		if (!form.data_dev) return;
		setForm((prev) => ({ ...prev, data_dev: '' }));
	}, [esconderDataDevolucao, form.data_dev]);

	const setField = (key, value) => {
		const nextValue = key === 'serie' ? normalizeSerie(value) : value;
		setForm((prev) => ({ ...prev, [key]: nextValue }));
	};

	useEffect(() => {
		const matricula = form.matricula.trim();
		if (matricula.length < 3) return;

		const timer = setTimeout(async () => {
			let found = policiais.find((item) => item.matricula === matricula);

			if (!found) {
				try {
					const data = await apiService.getList('policiais', new URLSearchParams({ search: matricula, page_size: '10' }));
					found = (data.results || []).find((item) => item.matricula === matricula);
				} catch {
					// Mantem fluxo manual se consulta de apoio falhar.
				}
			}

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
		const serie = form.serie.trim();
		if (serie.length < 3) {
			setArmaEncontrada(null);
			return;
		}

		const timer = setTimeout(async () => {
			try {
				// 1. Tenta busca exata primeiro para maior precisão
				let params = new URLSearchParams({ numero_serie: serie, page_size: 1 });
				let data = await apiService.getList('armas', params);

				// 2. Se não encontrar, faz uma busca mais ampla (parcial)
				if (!data.results || data.results.length === 0) {
					params = new URLSearchParams({ search: serie, page_size: 1 });
					data = await apiService.getList('armas', params);
				}

				const found = data.results?.[0];

				if (!found) {
					setArmaEncontrada(null);
					return;
				}

				setArmaEncontrada(found);
				setForm((prev) => ({ ...prev, modelo: found.modelo, calibre: found.calibre, descricao: found.descricao }));
			} catch {
				setArmaEncontrada(null);
			}
		}, 250);

		return () => clearTimeout(timer);
	}, [form.serie]);

	const handleSubmit = async () => {
		setLoading(true);
		setError('');
		setSuccess('');

		const required = [
			form.tipo,
			form.armeiro,
			form.data_rec,
			form.status,
			form.motivo,
			form.matricula,
			form.policial_nome,
			form.depto,
			form.lotacao,
			form.modelo,
			form.calibre,
			form.serie,
		];

		if (required.some((item) => !String(item || '').trim())) {
			setError('Preencha todos os campos obrigatórios para salvar a ordem.');
			setLoading(false);
			return;
		}

		try {
			const payload = {
				codigo: form.codigo,
				tipo: form.tipo,
				armeiro: form.armeiro,
				data_rec: form.data_rec,
				data_dev: esconderDataDevolucao ? null : (form.data_dev || null),
				status: form.status,
				motivo: form.motivo,
				modelo: form.modelo,
				calibre: form.calibre,
				serie: form.serie,
				descricao: form.descricao,
			};

			if (form.policial_id) {
				payload.policial_id = form.policial_id;
			}

			await apiService.create('servicos', payload);
			setSuccess('Ficha de serviço salva com sucesso!');
			setForm({
				codigo: '',
				tipo: '',
				armeiro: '',
				data_rec: getToday(),
				data_dev: '',
				status: '',
				motivo: '',
				matricula: '',
				policial_nome: '',
				depto: '',
				lotacao: '',
				modelo: '',
				calibre: '',
				serie: '',
				descricao: '',
				policial_id: null,
			});
			setArmaEncontrada(null);
			// Busca o próximo código para o próximo formulário
			try {
				const nextCodeData = await apiService.get('servicos/next-code');
				setForm((prev) => ({ ...prev, codigo: nextCodeData.codigo }));
			} catch {
				// Não bloqueia se a busca falhar
			}
		} catch (err) {
			setError(err.message || 'Não foi possível salvar o serviço.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="page-header flex justify-between items-center">
				<div>
					<h1>➕ Novo Registro de Serviço</h1>
					<p>Abertura manual de ficha de manutenção</p>
				</div>
				<button className="btn btn-outline btn-sm" onClick={() => onNavigate('pg-registros')}>
					📋 Ver Registros
				</button>
			</div>

			{success && <div className="alert alert-success show">✅ {success}</div>}
			{error && <div className="alert alert-danger show">⚠️ {error}</div>}

			<div className="card">
				<div className="form-grid">
					<div className="form-group">
						<label htmlFor="ns-tipo">Tipo de Serviço *</label>
						<select id="ns-tipo" value={form.tipo} onChange={(e) => setField('tipo', e.target.value)}>
							<option value="">Selecione o tipo de serviço...</option>
							{LISTAS.tiposServico.map((item) => <option key={item} value={item}>{item}</option>)}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="ns-armeiro">Armeiro Responsável *</label>
						<select id="ns-armeiro" value={form.armeiro} onChange={(e) => setField('armeiro', e.target.value)}>
							<option value="">Selecione o armeiro...</option>
							{LISTAS.armeiros.map((item) => <option key={item} value={item}>{item}</option>)}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="ns-data-rec">Data Recebimento *</label>
						<input id="ns-data-rec" type="date" value={form.data_rec} onChange={(e) => setField('data_rec', e.target.value)} />
					</div>
					{!esconderDataDevolucao && (
						<div className="form-group">
							<label htmlFor="ns-data-dev">Data Devolução</label>
							<input id="ns-data-dev" type="date" value={form.data_dev} onChange={(e) => setField('data_dev', e.target.value)} />
						</div>
					)}
					<div className="form-group">
						<label htmlFor="ns-status">Status *</label>
						<select id="ns-status" value={form.status} onChange={(e) => setField('status', e.target.value)}>
							<option value="">Selecione o status...</option>
							{LISTAS.status.map((item) => <option key={item} value={item}>{item}</option>)}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="ns-motivo">Causa / Motivo *</label>
						<select id="ns-motivo" value={form.motivo} onChange={(e) => setField('motivo', e.target.value)}>
							<option value="">Selecione a causa/motivo...</option>
							{causas.map((item) => <option key={item} value={item}>{item}</option>)}
						</select>
					</div>
				</div>

				<div className="card-title mt-16">👮 Dados do Policial Recebedor</div>
				<div className="form-grid">
					<div className="form-group">
						<label htmlFor="ns-matricula">Matrícula *</label>
						<input
							id="ns-matricula"
							type="text"
							value={form.matricula}
							onChange={(e) => setField('matricula', e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="ns-policial">Nome do Policial *</label>
						<input id="ns-policial" type="text" value={form.policial_nome} onChange={(e) => setField('policial_nome', e.target.value)} />
					</div>
					<div className="form-group">
						<label htmlFor="ns-depto">Departamento *</label>
						<select id="ns-depto" value={form.depto} onChange={(e) => setForm((prev) => ({ ...prev, depto: e.target.value, lotacao: '' }))}>
							<option value="">Selecione...</option>
							{departamentos.map((item) => <option key={item} value={item}>{item}</option>)}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="ns-lotacao">Lotação da Unidade *</label>
						<select
							id="ns-lotacao"
							value={form.lotacao}
							onChange={(e) => setField('lotacao', e.target.value)}
							disabled={!form.depto}
						>
							<option value="">{form.depto ? 'Selecione...' : 'Selecione o departamento'}</option>
							{lotacoes.map((item) => <option key={item} value={item}>{item}</option>)}
						</select>
					</div>
				</div>

				<div className="card-title mt-16">🔫 Identificação do Armamento</div>

<div className="form-grid">

	<div className="form-group">
		<label htmlFor="ns-serie">Número de Série *</label>
		<input
			id="ns-serie"
			type="text"
			value={form.serie}
			onChange={(e) => setField("serie", e.target.value)}
		/>
		{armaEncontrada && (
			<small className="text-muted">
				Arma cadastrada encontrada: {armaEncontrada.descricao}
			</small>
		)}
	</div>

	<div className="form-group">
		<label htmlFor="ns-modelo">Modelo *</label>
		<select
			id="ns-modelo"
			value={form.modelo}
			onChange={(e) => setField("modelo", e.target.value)}
		>
			<option value="">Selecione o modelo...</option>
			{LISTAS.modelos.map((item) => (
				<option key={item} value={item}>
					{item}
				</option>
			))}
		</select>
	</div>

	<div className="form-group">
		<label htmlFor="ns-calibre">Calibre *</label>
		<select
			id="ns-calibre"
			value={form.calibre}
			onChange={(e) => setField("calibre", e.target.value)}
		>
			<option value="">Selecione o calibre...</option>
			{LISTAS.calibres.map((item) => (
				<option key={item} value={item}>
					{item}
				</option>
			))}
		</select>
	</div>

</div>
				<div className="form-group full mt-16">
					<label htmlFor="ns-descricao">Descrição Detalhada do Reparo</label>
					<textarea id="ns-descricao" value={form.descricao} onChange={(e) => setField('descricao', e.target.value)} />
				</div>

				<button className="btn btn-primary mt-16" onClick={handleSubmit} disabled={loading}>
					{loading ? 'Salvando...' : '💾 Salvar Ordem de Serviço'}
				</button>
			</div>
		</>
	);
}

export default NovoServico;
