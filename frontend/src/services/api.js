const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const buildUrl = (resource, params) => {
  const normalizedResource = String(resource || '').replace(/^\/+|\/+$/g, '');
  const query = params ? params.toString() : '';
  const querySuffix = query ? `?${query}` : '';
  return `${API_BASE_URL}/${normalizedResource}/${querySuffix}`;
};

const parseResponse = async (response) => {
  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody?.detail || JSON.stringify(errorBody) || message;
    } catch {
      // Mantem mensagem padrao caso resposta nao seja JSON
    }
    throw new Error(message);
  }

  return response.json();
};

export const apiService = {
  async getList(resource, params) {
    const response = await fetch(buildUrl(resource, params));
    return parseResponse(response);
  },

  async getOne(resource, id, params) {
    const resourceWithId = `${String(resource || '').replace(/^\/+|\/+$/g, '')}/${id}`;
    const response = await fetch(buildUrl(resourceWithId, params));
    return parseResponse(response);
  },

  async create(resource, payload) {
    const response = await fetch(buildUrl(resource), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async update(resource, id, payload) {
    const resourceWithId = `${String(resource || '').replace(/^\/+|\/+$/g, '')}/${id}`;
    const response = await fetch(buildUrl(resourceWithId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async remove(resource, id) {
    const resourceWithId = `${String(resource || '').replace(/^\/+|\/+$/g, '')}/${id}`;
    const response = await fetch(buildUrl(resourceWithId), {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return null;
    }

    return parseResponse(response);
  },

  async download(resource, suggestedFileName = 'arquivo.bin', params = null) {
    const response = await fetch(buildUrl(resource, params));
    if (!response.ok) {
      await parseResponse(response);
      return;
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition') || '';
    const fileNameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
    const fileName = fileNameMatch?.[1] || suggestedFileName;

    const downloadUrl = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.URL.revokeObjectURL(downloadUrl);
  },
};
