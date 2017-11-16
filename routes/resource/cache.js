const runningDiscoveryTaskIDs = new Set();

function discoveryTaskStartRunning(taskIDs) {
	taskIDs.split(',').forEach(function(item) {
		runningDiscoveryTaskIDs.add(item);
	});
	log.debug('discovery task id cache, added:' + taskIDs + ', now:' + [...runningDiscoveryTaskIDs]);
}

function discoveryTaskStopRunning(taskIDs) {
	(taskIDs+'').split(',').forEach(function(item) {
		runningDiscoveryTaskIDs.delete(item);
	});
	log.debug('discovery task id cache, deleted:' + taskIDs + ', now:' + [...runningDiscoveryTaskIDs]);
}

function isDiscoveryTaskRunning(taskID) {
	return runningDiscoveryTaskIDs.has(taskID+'');
}

function isAnyDiscoveryTaskRunning() {
	return runningDiscoveryTaskIDs.size > 0;
}

exports.discoveryTaskStartRunning = discoveryTaskStartRunning;
exports.discoveryTaskStopRunning = discoveryTaskStopRunning;
exports.isDiscoveryTaskRunning = isDiscoveryTaskRunning;
exports.isAnyDiscoveryTaskRunning = isAnyDiscoveryTaskRunning;