import axios from 'axios';

// Ensures client-side Axios calls use the live production Render URL
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;