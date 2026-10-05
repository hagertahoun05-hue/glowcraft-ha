import axios from 'axios'

// JSON Server (fake API). Run it with: npm run server
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://my-json-server.typicode.com/hagertahoun05-hue/glowcraft-ha',
})

export default api
