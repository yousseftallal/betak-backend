const { sequelize } = require('./src/database/models');

async function checkCounts() {
  try {
    const models = ['User', 'Creator', 'Video', 'Report', 'DailyStat', 'AnalyticsSnapshot'];
    console.log('📊 Table Record Counts:');
    
    for (const modelName of models) {
        const [results] = await sequelize.query(`SELECT count(*) as c FROM "${sequelize.model(modelName).tableName}"`);
        console.log(`- ${modelName}: ${results[0].c}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCounts();
