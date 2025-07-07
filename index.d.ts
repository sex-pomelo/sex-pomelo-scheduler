/**
 * A unique identifier for a scheduled job.
 */
export type JobId = number;

/**
 * Configuration for a simple, time-based trigger.
 */
export interface SimpleTrigger {
  /**
   * The start time for the trigger in milliseconds since the epoch.
   * If omitted, the job starts immediately.
   */
  start?: number;

  /**
   * The interval in milliseconds for recurring jobs.
   * If omitted, the job will only run once.
   */
  period?: number;

  /**
   * The total number of times the job should run.
   * This property is only valid when `period` is also set.
   * If `period` is set but `count` is omitted, the job will run indefinitely.
   */
  count?: number;
}

/**
 * Represents a trigger for a job, which can be a cron pattern string or a `SimpleTrigger` object.
 */
export type Trigger = string | SimpleTrigger;

/**
 * The callback function that gets executed when a job runs.
 * @param data The data object passed to `scheduleJob`.
 */
export type JobCallback = (data: any) => void;

/**
 * Schedules a new job to run based on the provided trigger.
 *
 * @param trigger A cron string or a `SimpleTrigger` object that defines when the job should run.
 * @param jobFunc The function to execute.
 * @param jobData Optional data to pass to the `jobFunc`.
 * @returns The `JobId` for the newly created job, which can be used to cancel it later.
 */
export function scheduleJob(trigger: Trigger, jobFunc: JobCallback, jobData?: any): JobId;

/**
 * Cancels a scheduled job.
 *
 * @param id The `JobId` of the job to cancel.
 * @returns `true` if the job was successfully cancelled.
 */
export function cancelJob(id: JobId): boolean; 