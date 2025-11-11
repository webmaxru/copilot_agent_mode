// Add runtime config type definition
declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_URL: string;
    };
  }
}

const getBaseUrl = () => {
  // First check runtime configuration (from runtime-config.js)
  if (typeof window !== 'undefined' && window.RUNTIME_CONFIG?.API_URL) {
    console.log('Using runtime config API_URL:', window.RUNTIME_CONFIG.API_URL);
    return window.RUNTIME_CONFIG.API_URL;
  }

  // Derive protocol from current location (defaults to https for safety when window is undefined)
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const protocolToUse = protocol.includes('https') ? 'https' : 'http';

  // Detect GitHub Codespaces host pattern and map to API port 3000
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const codespacesMatch =
      host.match(/^(.*)-(\d+)\.app\.github\.dev$/) ||
      host.match(/^(.*)-(\d+)\.githubpreview\.dev$/);
    if (codespacesMatch) {
      console.log(`Using Codespace-derived URL with ${protocolToUse} protocol`);
      return `${protocolToUse}://${codespacesMatch[1]}-3000.app.github.dev`;
    }
  }

  console.log(`Using default localhost URL with ${protocolToUse} protocol`);
  return `${protocolToUse}://localhost:3000`;
};

export const API_BASE_URL = getBaseUrl();

export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    products: '/api/products',
    suppliers: '/api/suppliers',
    orders: '/api/orders',
    branches: '/api/branches',
    headquarters: '/api/headquarters',
    deliveries: '/api/deliveries',
    orderDetails: '/api/order-details',
    orderDetailDeliveries: '/api/order-detail-deliveries',
    cart: '/api/cart',
  },
};
