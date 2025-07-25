/**
 * The main class and interface of the schedule module
 */
var PriorityQueue = require('./priorityQueue');
var Job = require('./job.js');
var timerCount = 0;

const logger = require('@sex-pomelo/sex-pomelo-logger').getLogger(__filename);

var map = {};
var queue = PriorityQueue.createPriorityQueue(comparator);

var jobId = 0;
var timer;

//The accuracy of the scheduler, it will affect the performance when the schedule tasks are
//crowded together
var accuracy = 10;

/**
 * Schedule a new Job
 * 
 * @param {import('../index.d.ts').Trigger} trigger - The trigger for the job.
 * @param {import('../index.d.ts').JobCallback} jobFunc - The function to be executed when the job runs.
 * @param {any} jobData - Optional data to be passed to the job function.
 * @returns {import('../index.d.ts').JobId} The ID of the scheduled job.  
 */
function scheduleJob(trigger, jobFunc, jobData){
  let job = Job.createJob(trigger, jobFunc, jobData);
  let excuteTime = job.excuteTime();
  let id = job.id;

  map[id] = job;
  let element = {
    id : id,
    time : excuteTime
  };

  let curJob = queue.peek();
  if(!curJob || excuteTime < curJob.time){
    queue.offer(element);
    setTimer(job);

    return job.id;
  }

  queue.offer(element);
  return job.id;
}

/**
 * Cancel Job
 * 
 * @param {import('../index.d.ts').JobId} id - The ID of the job to cancel.
 * @returns {boolean} `true` if the job was successfully cancelled. 
 */
function cancelJob(id){
  let curJob = queue.peek();
  if(curJob && id === curJob.id){ // to avoid queue.peek() is null
    queue.pop();
    delete map[id];

    clearTimeout(timer);
    excuteJob();
  }
  delete map[id];
  return true;
}

/**
 * Clear last timeout and schedule the next job, it will automaticly run the job that
 * need to run now
 * @param job The job need to schedule
 * @return void
 */
function setTimer(job){
  clearTimeout(timer);

  timer = setTimeout(excuteJob, job.excuteTime()-Date.now());
}

/**
 * The function used to ran the schedule job, and setTimeout for next running job
 */
function excuteJob(){
  var job = peekNextJob();
  var nextJob;

  while(!!job && (job.excuteTime()-Date.now())<accuracy){
    job.run();
    queue.pop();

    var nextTime = job.nextTime();

    if(nextTime === null){
      delete map[job.id];
    }else{
      queue.offer({id:job.id, time: nextTime});
    }
    job = peekNextJob();
  }

  //If all the job have been canceled
  if(!job)
    return;

  //Run next schedule
  setTimer(job);
}

/**
 * Return, but not remove the next valid job
 * @return Next valid job
 */
function peekNextJob(){
  if(queue.size() <= 0)
    return null;

  var job = null;

  do{
    job = map[queue.peek().id];
    if(!job) queue.pop();
  }while(!job && queue.size() > 0);

  return (!!job)?job:null;
}

/**
 * Return and remove the next valid job
 * @return Next valid job
 */
function getNextJob(){
  var job = null;

  while(!job && queue.size() > 0){
    var id = queue.pop().id;
    job = map[id];
  }

  return (!!job)?job:null;
}

function comparator(e1, e2){
  return e1.time > e2.time;
}

module.exports.scheduleJob = scheduleJob;
module.exports.cancelJob = cancelJob;
