const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Global Request Logging (Top Priority)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ========================================
// Middleware
// ========================================

// CORS - allow all origins for mobile app
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (dashboard frontend from client/dist)
app.use(express.static(path.join(__dirname, '../client/dist'))); // Serve at root
app.use('/admin', express.static(path.join(__dirname, '../client/dist')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



// ========================================
// Routes
// ========================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'betak-admin-dashboard'
  });
});

// API Routes
app.use('/api/v1/feed', require('./modules/public-feed/routes'));
app.use('/api/v1/auth', require('./modules/public-auth/routes'));
app.use('/api/v1/profile', require('./modules/public-profile/routes'));
app.use('/api/v1/interact', require('./modules/interactions/routes'));
app.use('/api/v1/videos', require('./modules/video-management/routesPublic'));
app.use('/api/v1/messages', require('./modules/messaging/routes'));
app.use('/api/v1/stories', require('./modules/stories/routes'));
app.use('/api/v1/admin/auth', require('./modules/admin-system/routes'));
app.use('/api/v1/admin/users', require('./modules/user-management/routes'));
app.use('/api/v1/admin/videos', require('./modules/video-management/routes'));
app.use('/api/v1/admin/creators', require('./modules/creator-analytics/routes'));
app.use('/api/v1/admin/stats', require('./modules/platform-analytics/routes'));
app.use('/api/v1/admin/reports', require('./modules/reports-moderation/routes'));
app.use('/api/v1/admin/logs', require('./modules/admin-system/logsRoutes'));
app.use('/api/v1/admin/settings', require('./modules/admin-system/settingsRoutes'));
app.use('/api/v1/admin/health', require('./modules/admin-system/healthRoutes'));
app.use('/api/v1/admin/admins', require('./modules/admin-system/adminsRoutes'));
app.use('/api/v1/admin/live', require('./modules/video-management/liveRoutes'));
app.use('/api/v1/admin/verification', require('./modules/verification-system/routes'));
app.use('/api/v1/admin/support', require('./modules/support-system/routes'));
app.use('/api/v1/admin/music', require('./modules/sound-system/routes'));
app.use('/api/v1/admin/notifications', require('./modules/notification-system/routes'));
app.use('/api/v1/admin/badges', require('./modules/gamification/routes')); // Phase 7
app.use('/api/v1/admin/ads', require('./modules/financial-system/adsRoutes')); // Phase 8

app.use('/api/v1/admin/finance', require('./modules/financial-system/routes'));
// etc...
// SPA fallback for dashboard (Handles /login, /users, etc on refresh)
app.get('*', (req, res, next) => {
  // Don't intercept API requests (let them 404 if not found)
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

module.exports = app;
