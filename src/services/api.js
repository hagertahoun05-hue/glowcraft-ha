import axios from 'axios'

// JSON Server (fake API). Run it with: npm run server
const api = axios.create({
  baseURL: 'https://api.npoint.io/a99906f2ab6a427e69c2',
})

export default api
