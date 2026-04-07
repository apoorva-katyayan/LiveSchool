import axios from 'axios';

// Set axios base URL from Vite env or fallback to provided backend URL
axios.defaults.baseURL = import.meta.env.VITE_API_BASE || 'https://liveschool.onrender.com';

export default axios;
