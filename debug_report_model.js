const { Report } = require('./src/database/models');

async function debugReport() {
  try {
    const report = await Report.findOne();
    if (!report) {
        console.log('No reports found.');
        return;
    }
    
    console.log('--- Report Instance Keys ---');
    console.log(Object.keys(report.dataValues));
    console.log('----------------------------');
    console.log('report.target_id:', report.target_id);
    console.log('report.reported_id:', report.reported_id);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debugReport();
