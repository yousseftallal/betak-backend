require('dotenv').config();
const { getDashboardOverview } = require('./src/modules/platform-analytics/statsController');
const { sequelize } = require('./src/database/models');

const mockReq = {};
const mockRes = {
  status: (code) => {
    console.log(`[Response Status]: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('[Response Data]:', JSON.stringify(data, null, 2));
    return mockRes;
  }
};

async function runTest() {
  try {
    console.log('Connecting DB...');
    await sequelize.authenticate();
    console.log('Connected.');
    
    console.log('Calling getDashboardOverview...');
    await getDashboardOverview(mockReq, mockRes);
    
  } catch (error) {
    console.error('Test Script Error:', error);
  } finally {
    await sequelize.close();
  }
}

runTest();
