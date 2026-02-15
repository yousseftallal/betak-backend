import api from './api';

const adminService = {
  // Get all admins
  getAdmins: async () => {
    const response = await api.get('/admins');
    return response.data;
  },

  // Create new admin
  createAdmin: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  // Delete admin
  deleteAdmin: async (id) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
  
  getPermissions: async () => {
    const response = await api.get('/roles/permissions');
    return response.data;
  },

  createRole: async (data) => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  }
};

export default adminService;
