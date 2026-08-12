import axios from 'axios';

// Get backend URL from environment or fallback
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log("Current API Base URL:", backendUrl);

const API = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;