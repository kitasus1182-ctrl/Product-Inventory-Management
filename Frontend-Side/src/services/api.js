// All backend calls live here. Components never use fetch directly.

const request = async (url, method = 'GET', body) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error(
      `Expected a JSON response from ${url}. Check that the backend is running and the API route is correct.`,
    );
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// products
export const getProducts = (search = '', category = '') =>
  request('/api/products?' + new URLSearchParams({ search, category }));

export const getCategories = () => request('/api/products/categories');
export const createProduct = (product) => request('/api/products', 'POST', product);
export const updateProduct = (id, product) => request(`/api/products/${id}`, 'PUT', product);
export const deleteProduct = (id) => request(`/api/products/${id}`, 'DELETE');

// stock: body = { type: 'add' | 'remove', quantity, reason }
export const changeStock = (id, body) => request(`/api/products/${id}/stock`, 'POST', body);

// history
export const getMovements = () => request('/api/movements');