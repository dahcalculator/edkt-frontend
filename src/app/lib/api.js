import axios from 'axios';

// Replace 'https://your-app-name.onrender.com' with your actual live Render backend URL
const RENDER_BACKEND_URL = 'https://edkt-backend.onrender.com';

const baseURL = process.env.NEXT_PUBLIC_API_URL || RENDER_BACKEND_URL;

console.log("Current API Base URL:", baseURL);

const API = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;