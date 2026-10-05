import axios from 'axios'

// JSON Server (fake API). Run it with: npm run server
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

export default api
