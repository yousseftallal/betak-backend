import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Corrected backticks
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Refresh Token logic could go here later)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401, clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    // Try admin login first, if fails or specific flag can be used
    // For simplicity, we can try public login if admin path fails or have a switcher
    // But better approach: Let's unify or create separate method
    // Current setup forces admin path. Let's try to detect or use robust path.
    
    try {
      // Try Admin Login
      const response = await api.post('/auth/login', { email, password });
      if (response.data.data.access_token) {
        localStorage.setItem('token', response.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.admin));
        return { ...response.data, role: 'admin' };
      }
    } catch (error) {
       // If admin login fails (401/404), try public user login
       // We need a separate axios instance or absolute URL because 'api' base is /admin
       const publicResponse = await axios.post('http://localhost:3000/api/v1/auth/login', { email, password });
       if (publicResponse.data.data.tokens.accessToken) {
         localStorage.setItem('token', publicResponse.data.data.tokens.accessToken);
         localStorage.setItem('user', JSON.stringify(publicResponse.data.data.user));
         return { ...publicResponse.data, role: 'user' };
       }
       throw error;
    }
  },
  
  register: async (data) => {
      const response = await axios.post('http://localhost:3000/api/v1/auth/register', data);
      return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};

export const interactionService = {
    toggleLike: async (videoId) => {
        // We need auth token. Let's use the 'api' instance but with modified url or just manual axios with header
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:3000/api/v1/interact/like/${videoId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getLikeStatus: async (videoId) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/v1/interact/status/${videoId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    toggleFollow: async (username) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:3000/api/v1/interact/follow/${username}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getFollowStatus: async (username) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/v1/interact/follow-status/${username}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    
    // Comments
    listComments: async (videoId) => {
        const response = await axios.get(`http://localhost:3000/api/v1/interact/comments/${videoId}`);
        return response.data;
    },
    
    addComment: async (videoId, content) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:3000/api/v1/interact/comments/${videoId}`, { content }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default api;
