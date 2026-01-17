import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // your backend base URL
  withCredentials: true, // send cookies with requests
  timeout: 10000, // optional: request timeout in ms
});

export default axiosInstance;
