/**
 * Middleware to check for specific permissions
 * Usage: checkPermission('users:read') or checkPermission(['users:read', 'users:write'])
 */
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    // 1. Check if user exists (should be set by authMiddleware)
    if (!req.user || !req.permissions) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
    }

    // 2. Super Admin bypass (optional, but good for safety)
    if (req.role === 'Super Admin') {
      return next();
    }

    // 3. Normalize input to array
    const permissionsToCheck = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    // 4. Check if user has AT LEAST ONE of the required permissions (OR logic)
    // To implement AND logic, change .some() to .every()
    const hasPermission = permissionsToCheck.some(perm => 
      req.permissions.includes(perm)
    );

    if (!hasPermission) {
      console.warn(`[Access Denied] User: ${req.user.username} | Role: ${req.role} | Required: ${permissionsToCheck} | UserPerms: ${req.permissions.length}`);
      return res.status(403).json({
        success: false,
        error: { 
          code: 'FORBIDDEN', 
          message: `You do not have permission to perform this action. Required: ${permissionsToCheck.join(' or ')}` 
        }
      });
    }

    next();
  };
};

module.exports = { checkPermission };
