export const authService = {
  // Existing methods usually here
  
  // Register new user (public)
  register: async (data) => {
    // In a real app, you would have a separate public auth route
    // For now we might repurpose admin route or create new one
    // Let's assume we need to create backend endpoint for public registration
    const response = await api.post('/auth/register', data);
    return response.data;
  }
};
