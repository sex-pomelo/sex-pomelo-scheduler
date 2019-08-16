var schedule = require('../lib/schedule');

var cronJob = function() {
	console.log('doing %s', Date.now())
}

try {
	schedule.scheduleJob("0/10 * * * * *", cronJob, {
		name: 'cronJobExample'
	});
} catch (e) {
	console.log(e.stack);
}