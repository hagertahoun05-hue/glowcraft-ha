import axios from 'axios'

// JSON Server (fake API). Run it with: npm run server
const api = axios.create({
  baseURL: 'https://my-json-server.typicode.com/hagertahoun05-hue/glowcraft-ha',
})

export default api
