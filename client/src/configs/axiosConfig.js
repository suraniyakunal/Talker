import axios from 'axios';

axios.interceptors.request.use(config => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo && userInfo.token) {
    // Attach the Bearer token to the headers
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Now any axios.get('/api/chats') will automatically have the Authorization header!

