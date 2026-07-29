import axios from "axios";

const api = axios.create({
  baseURL: "https://leaddesk-mini-6a3g.onrender.com/api",
});

export default api;