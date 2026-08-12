import axios from 'axios';



const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});


// We export it so other pages (like Registration) can use it
export default API;