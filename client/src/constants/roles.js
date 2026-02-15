export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  ANALYST: 'Analyst',
  USER: 'User',
  SUPPORT_AGENT: 'Support Agent',
  FINANCIAL_MANAGER: 'Financial Manager',
  CONTENT_MANAGER: 'Content Manager'
};

// Define allowed routes per role
// If a role is missing from a route key, it's assumed they don't have access unless logic allows
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'], // All Access
  [ROLES.SUPER_ADMIN]: ['*'], // All Access
  [ROLES.ADMIN]: [
    '/admin',
    '/admin/users',
    '/admin/creators',
    '/admin/videos',
    '/admin/live',
    '/admin/verification',
    '/admin/notifications',
    '/admin/support',
    '/admin/music',
    '/admin/reports',
    '/admin/logs', 
    '/admin/analytics',
    '/admin/geographic',
    '/admin/badges',
    '/admin/revenue',
    '/admin/ads',
    '/admin/financial',
    '/admin/safety',
    '/admin/campaigns',
    '/admin/health',
    '/admin/settings'
    // EXCLUDED: /admin/admins (Only Super Admin can manage admins)
  ],
  [ROLES.MODERATOR]: [
    '/admin', // Dashboard
    '/admin/users',
    '/admin/videos',
    '/admin/reports',
    '/admin/live',
    '/admin/comments',
    '/admin/safety'
    // Explicitly NO: settings, financial, revenue, campaigns, logs, analytics (except maybe some basic), music
  ],
  [ROLES.ANALYST]: [
    '/admin',
    '/admin/analytics',
    '/admin/geographic',
    '/admin/logs', 
    '/admin/creators',
    '/admin/health',
    '/admin/users', // View only for demographics analysis
    '/admin/videos' // View only for content analysis
  ],
  [ROLES.SUPPORT_AGENT]: [
    '/admin', 
    '/admin/support',
    '/admin/users', // View profiled to help users
    '/admin/verification', // Check status
    '/admin/reports' // Check reports against user
  ],
  [ROLES.FINANCIAL_MANAGER]: [
      '/admin',
      '/admin/financial',
      '/admin/revenue',
      '/admin/ads',
      '/admin/users', // To check wallet/balance
      '/admin/creators' // To check payouts
  ],
  [ROLES.CONTENT_MANAGER]: [
      '/admin',
      '/admin/videos',
      '/admin/creators',
      '/admin/music',
      '/admin/campaigns',
      '/admin/reports',
      '/admin/badges', // Manage gamification
      '/admin/notifications' // Send content alerts
  ]
};

export const hasAccess = (route, userRole) => {
    if (!userRole) return false;
    
    // Normalize logic
    const roleName = userRole.name || userRole; // Handle object or string
    
    // Super Admin & Admin bypass
    if (roleName === ROLES.SUPER_ADMIN || roleName === ROLES.ADMIN) return true;

    const allowedRoutes = ROLE_PERMISSIONS[roleName];
    if (!allowedRoutes) return false;

    // Check strict match or prefix
    return allowedRoutes.some(allowed => {
        if (allowed === '*') return true;
        
        // Fix: If allowed is exactly '/admin', only match exact '/admin' (Dashboard)
        // Otherwise it acts as a wildcard for everything under /admin
        if (allowed === '/admin') {
            return route === '/admin';
        }

        // Exact match
        if (allowed === route) return true;
        
        // Parent path match for other routes (e.g. /admin/users matches /admin/users/123)
        return route.startsWith(allowed);
    });
};
