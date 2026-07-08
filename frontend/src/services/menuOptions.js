import { apiService } from './api';

export async function getMenuOptions(grupo) {
  const params = new URLSearchParams({
    page_size: '500',
    ordering: 'ordem',
    grupo,
    ativo: 'true',
  });

  const data = await apiService.getList('opcoes-menu', params);
  return (data.results || []).map((item) => ({
    value: item.valor,
    label: item.rotulo || item.valor,
    ordem: item.ordem || 0,
  }));
}
