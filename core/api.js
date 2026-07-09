const API_BASE_URL = `http://${window.location.hostname}:8000/api`;

/**
 * Realiza uma requisição para a API, tratando erros comuns.
 * @param {string} url - A URL completa para a requisição.
 * @param {object} options - As opções para a função fetch().
 * @returns {Promise<any>} - O JSON retornado pela API.
 */
async function fetchApi(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || "Ocorreu um erro na requisição.");
    }

    // Retorna null para respostas sem conteúdo (ex: DELETE 204)
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Re-lança o erro para que o componente possa tratá-lo
  }
}

/**
 * Serviço para interagir com os endpoints da API.
 */
export const apiService = {
  /**
   * Busca uma lista de recursos, com suporte a filtros e paginação.
   * @param {string} endpoint - O nome do recurso (ex: 'servicos', 'policiais').
   * @param {URLSearchParams} [params] - Parâmetros de query para filtro, ordenação, etc.
   * @returns {Promise<any>}
   */
  getList: (endpoint, params = new URLSearchParams()) => {
    return fetchApi(`${API_BASE_URL}/${endpoint}/?${params.toString()}`);
  },

  // Você pode adicionar outros métodos aqui conforme a necessidade
  // getById: (endpoint, id) => fetchApi(`${API_BASE_URL}/${endpoint}/${id}/`),
  // create: (endpoint, data) => fetchApi(`${API_BASE_URL}/${endpoint}/`, { method: 'POST', body: JSON.stringify(data) }),
  // update: (endpoint, id, data) => fetchApi(`${API_BASE_URL}/${endpoint}/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  // remove: (endpoint, id) => fetchApi(`${API_BASE_URL}/${endpoint}/${id}/`, { method: 'DELETE' }),
};