const { SystemSettings } = require('../../database/models');

/**
 * Get System Settings
 * GET /api/v1/admin/settings
 */
async function getSettings(req, res) {
  try {
    const { category } = req.params;
    const whereClause = category ? { category } : {};

    const settings = await SystemSettings.findAll({
      where: whereClause
    });
    
    // Convert array to object with type casting
    const formattedSettings = settings.reduce((acc, curr) => {
      let val = curr.setting_value;
      
      // Cast based on value_type
      if (curr.value_type === 'number') val = parseFloat(val);
      else if (curr.value_type === 'boolean') val = (val === 'true');
      else if (curr.value_type === 'json') {
        try {
          val = JSON.parse(val);
        } catch (e) {
          val = [];
        }
      }
      
      acc[curr.setting_key] = val;
      return acc;
    }, {});

    return res.json({
      success: true,
      data: formattedSettings
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch settings' } });
  }
}

/**
 * Update System Settings
 * PATCH /api/v1/admin/settings
 */
async function updateSettings(req, res) {
  try {
    const { category } = req.params;
    const targetCategory = category || 'general';
    const updates = req.body; // Expect { key: value, ... }

    const promises = Object.keys(updates).map(async (key) => {
      let value = updates[key];
      let type = 'string';

      // Determine type
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (typeof value === 'object') {
        type = 'json';
        value = JSON.stringify(value);
      }
      
      // Convert to string for storage
      const stringValue = String(value);

      // Upsert
      const [setting, created] = await SystemSettings.findOrCreate({
        where: { setting_key: key },
        defaults: { 
          setting_value: stringValue,
          value_type: type,
          category: targetCategory
        }
      });

      // Update value if changed, OR if category needs correction
      if ((!created && setting.setting_value !== stringValue) || (setting.category !== targetCategory)) {
        await setting.update({ 
          setting_value: stringValue,
          value_type: type,
          category: targetCategory
        });
      }
      return setting;
    });

    await Promise.all(promises);

    // Notify Admins
    try {
        const adminNotificationService = require('../../services/adminNotificationService');
        const keys = Object.keys(updates).join(', ');
        await adminNotificationService.notify({
            title: 'System Settings Updated',
            message: `${req.user.username} updated settings: ${keys}`,
            type: 'warning', // Warning because setting changes are sensitive
            link: '/admin/settings'
        });
    } catch(err) { console.warn('Notification failed', err); }

    return res.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update Settings Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update settings' } });
  }
}

/**
 * Trigger Database Backup
 * POST /api/v1/admin/settings/backup
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function triggerBackup(req, res) {
  try {
    const backupDir = path.join(__dirname, '../../../public/backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    // Database Config (Should be from env)
    const dbName = process.env.DB_NAME || 'betak_db';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASS || '';
    const dbHost = process.env.DB_HOST || 'localhost';

    // Path to mysqldump (Found in XAMPP)
    const mysqldumpPath = 'c:\\xampp\\mysql\\bin\\mysqldump.exe';
    
    // Construct mysqldump command
    // Use absolute path to ensure it runs
    const command = `"${mysqldumpPath}" -h ${dbHost} -u ${dbUser} ${dbPass ? `-p${dbPass}` : ''} ${dbName} > "${filepath}"`;

    console.log(`Starting backup: ${filename} using ${mysqldumpPath}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup execution error: ${error.message}`);
        // Fallback: Try "mysqldump" from PATH if absolute path fails? 
        // No, user likely doesn't have it in PATH if absolute failed previously.
        return res.status(500).json({ 
          success: false, 
          error: { message: `Backup failed. mysqldump not found at ${mysqldumpPath} or execution error.` } 
        });
      }

      console.log('Backup created successfully');
      
      // Return download URL
      // Assuming public/ is served statically
      return res.json({
        success: true,
        message: 'Backup created successfully',
        data: {
            filename,
            downloadUrl: `/backups/${filename}`,
            size: fs.statSync(filepath).size
        }
      });
    });

  } catch (error) {
    console.error('Backup Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error during backup' } });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  triggerBackup
};
