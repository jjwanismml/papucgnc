import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://papucgnc-production-01f6.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

