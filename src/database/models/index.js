const sequelize = require('../../config/database');

// Import all models
// --- Admin System ---
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Admin = require('./Admin');
const AdminSession = require('./AdminSession');
const AdminActivityLog = require('./AdminActivityLog');
const SystemSettings = require('./SystemSettings');
const AnalyticsSnapshot = require('./AnalyticsSnapshot');

// --- Platform Core ---
const User = require('./User');
const Video = require('./Video');
const Comment = require('./Comment');
const Report = require('./Report');

const LiveStream = require('./LiveStream');

// --- Creator Economy & Advanced Analytics (Phase 4) ---
const Creator = require('./Creator');
const VideoEngagement = require('./VideoEngagement');
const CreatorRevenue = require('./CreatorRevenue');
const CreatorFollower = require('./CreatorFollower');
const CreatorDailyActivity = require('./CreatorDailyActivity');
const DailyStat = require('./DailyStat');

// --- Financial System (Phase 5) ---
const Wallet = require('./Wallet');
const Voucher = require('./Voucher');
const ChargeRequest = require('./ChargeRequest');
const VerificationRequest = require('./VerificationRequest');
const SupportTicket = require('./SupportTicket');
const Sound = require('./Sound');
const AdminNotification = require('./AdminNotification');
const PushCampaign = require('./PushCampaign');
const WalletTransaction = require('./WalletTransaction');

// --- Messaging System ---
const Conversation = require('./Conversation');
const Message = require('./Message');

// --- Stories System ---
const Story = require('./Story');
const StoryView = require('./StoryView');

// ========================================
// Define Model Associations
// ========================================

// --- Live Stream Associations ---
LiveStream.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(LiveStream, { foreignKey: 'user_id', as: 'liveStreams' });

// --- Admin System Associations ---
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  as: 'permissions'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  as: 'roles'
});

// Admin <-> Role
Admin.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(Admin, { foreignKey: 'role_id', as: 'admins' });

// Admin <-> Session
AdminSession.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });
Admin.hasMany(AdminSession, { foreignKey: 'admin_id', as: 'sessions' });

// Admin <-> ActivityLog
AdminActivityLog.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });
Admin.hasMany(AdminActivityLog, { foreignKey: 'admin_id', as: 'activityLogs' });

// Admin <-> Notifications
AdminNotification.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });
Admin.hasMany(AdminNotification, { foreignKey: 'admin_id', as: 'notifications' });

// Admin <-> Push Campaigns
PushCampaign.belongsTo(Admin, { foreignKey: 'created_by', as: 'creator' });
Admin.hasMany(PushCampaign, { foreignKey: 'created_by', as: 'campaigns' });

// --- User Associations ---

// User <-> Role (for platform roles if needed, currently reusing admin roles table or just ID)
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// --- Creator Associations ---

// User <-> Creator (1:1)
Creator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Creator, { foreignKey: 'user_id', as: 'creatorProfile' });

// Creator <-> Video (1:N) - Note: Video has user_id, but logically belongs to Creator context
// We can link Video to Creator if we add creator_id to Video, or via User. 
// Current Video model has user_id. Let's use user_id to link, or map via User.
// For analytics convenience specified in prompt: Creators -> Videos
// To support "Creator hasMany Videos", we need to associate via the common user_id or add creator_id column.
// Since we didn't add creator_id to Video explicitly (we kept user_id), we can associate through User OR just alias it if we added creator_id.
// Let's stick to standard User->Video. If we need Creator->Video, we can do a conceptual link.
// START_UPDATE: Let's assume Video.user_id is the link.
// Video belongs to User. User hasOne Creator. So Video belongs to Creator indirectly.
// However, typically querying Creator.getVideos() is useful.
Video.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Video, { foreignKey: 'user_id', as: 'videos' });

// Creator <-> DailyActivity
CreatorDailyActivity.belongsTo(Creator, { foreignKey: 'creator_id', as: 'creator' });
Creator.hasMany(CreatorDailyActivity, { foreignKey: 'creator_id', as: 'dailyActivities' });

// Creator <-> Revenue
CreatorRevenue.belongsTo(Creator, { foreignKey: 'creator_id', as: 'creator' });
Creator.hasMany(CreatorRevenue, { foreignKey: 'creator_id', as: 'revenues' });

CreatorRevenue.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });
Video.hasMany(CreatorRevenue, { foreignKey: 'video_id', as: 'revenues' });

// Creator <-> Followers (User follows Creator)
// This uses CreatorFollower throught-table
Creator.belongsToMany(User, {
  through: CreatorFollower,
  foreignKey: 'creator_id',
  otherKey: 'follower_id',
  as: 'followers'
});
User.belongsToMany(Creator, {
  through: CreatorFollower,
  foreignKey: 'follower_id',
  otherKey: 'creator_id',
  as: 'followedCreators'
});

// --- Engagement Associations ---

VideoEngagement.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });
Video.hasMany(VideoEngagement, { foreignKey: 'video_id', as: 'engagements' });

VideoEngagement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(VideoEngagement, { foreignKey: 'video_engagements', as: 'videoEngagements' });

// --- Report Associations ---

Report.belongsTo(User, { foreignKey: 'reporter_user_id', as: 'reporter' });
User.hasMany(Report, { foreignKey: 'reporter_user_id', as: 'reports' });

Report.belongsTo(Admin, { foreignKey: 'assigned_admin_id', as: 'assignedAdmin' });
Admin.hasMany(Report, { foreignKey: 'assigned_admin_id', as: 'assignedReports' });

Report.belongsTo(Admin, { foreignKey: 'reviewed_by', as: 'reviewer' });
Admin.hasMany(Report, { foreignKey: 'reviewed_by', as: 'reviewedReports' });

// --- Comment Associations ---
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });

Comment.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });
Video.hasMany(Comment, { foreignKey: 'video_id', as: 'comments' });

// --- Financial System Associations ---

// Wallet (1:1 with User)
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });

// Wallet Transactions
WalletTransaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
Wallet.hasMany(WalletTransaction, { foreignKey: 'wallet_id', as: 'transactions' });

WalletTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(WalletTransaction, { foreignKey: 'user_id', as: 'walletTransactions' });

// Voucher
Voucher.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Voucher.belongsTo(User, { foreignKey: 'used_by', as: 'redeemer' });

// ChargeRequest
ChargeRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChargeRequest, { foreignKey: 'user_id', as: 'chargeRequests' });

ChargeRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// --- Verification System Associations ---
VerificationRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(VerificationRequest, { foreignKey: 'user_id', as: 'verificationRequests' });

VerificationRequest.belongsTo(Admin, { foreignKey: 'reviewed_by', as: 'reviewer' });
Admin.hasMany(VerificationRequest, { foreignKey: 'reviewed_by', as: 'checkedVerifications' });

// --- Support System Associations ---
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'tickets' });

SupportTicket.belongsTo(Admin, { foreignKey: 'assigned_to', as: 'assignedAdmin' });
Admin.hasMany(SupportTicket, { foreignKey: 'assigned_to', as: 'assignedTickets' });

// --- Sound System Associations ---
Sound.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
User.hasMany(Sound, { foreignKey: 'uploaded_by', as: 'uploadedSounds' });

// --- Gamification System (Phase 7) ---
const Badge = require('./Badge');
const UserBadge = require('./UserBadge');

// --- Ads System (Phase 8) ---
const AdBanner = require('./AdBanner');

// ... (previous exports)

// --- Gamification Associations ---
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id', as: 'users' });
User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'user_id', as: 'badges' });

// --- Messaging System Associations ---
Conversation.belongsTo(User, { foreignKey: 'participant1_id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2_id', as: 'participant2' });
User.hasMany(Conversation, { foreignKey: 'participant1_id', as: 'conversationsAsP1' });
User.hasMany(Conversation, { foreignKey: 'participant2_id', as: 'conversationsAsP2' });

Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });

Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });

// --- Stories System Associations ---
Story.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Story, { foreignKey: 'user_id', as: 'stories' });

StoryView.belongsTo(Story, { foreignKey: 'story_id', as: 'story' });
Story.hasMany(StoryView, { foreignKey: 'story_id', as: 'views' });

StoryView.belongsTo(User, { foreignKey: 'viewer_id', as: 'viewer' });
User.hasMany(StoryView, { foreignKey: 'viewer_id', as: 'viewedStories' });

// Export
module.exports = {
  sequelize,
  Role,
  Permission,
  RolePermission,
  Admin,
  AdminSession,
  AdminActivityLog,
  SystemSettings,
  AnalyticsSnapshot,
  User,
  Video,
  Comment,
  Report,
  LiveStream,
  Creator,
  VideoEngagement,
  CreatorRevenue,
  CreatorFollower,
  CreatorDailyActivity,
  DailyStat,
  DailyStat,
  Wallet,
  WalletTransaction,
  Voucher,
  ChargeRequest,
  VerificationRequest,
  SupportTicket,
  Sound,
  AdminNotification,
  PushCampaign,
  Badge,
  UserBadge,
  AdBanner,
  Conversation,
  Message,
  Story,
  StoryView
};
