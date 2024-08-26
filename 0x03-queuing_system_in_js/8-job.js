#!/usr/bin/yarn dev
import kue from 'kue';

/**
 * Creates push notification jobs and adds them to the specified queue.
 * @param {Array<Object>} jobs - Array of job objects, each containing phoneNumber and message.
 * @param {kue.Queue} queue - The Kue queue instance.
 * @throws Will throw an error if jobs is not an array.
 */
function createPushNotificationsJobs(jobs, queue) {
  // Check if jobs is an array
  if (!Array.isArray(jobs)) {
    throw new Error('Jobs is not an array');
  }

  // Iterate over the jobs array
  jobs.forEach(jobData => {
    const job = queue.create('push_notification_code_3', jobData)
      .on('enqueue', job => {
        console.log(`Notification job created: ${job.id}`);
      })
      .on('complete', (result) => {
        console.log(`Notification job ${job.id} completed`);
      })
      .on('failed', (errorMessage) => {
        console.error(`Notification job ${job.id} failed: ${errorMessage}`);
      })
      .on('progress', (progress, data) => {
        console.log(`Notification job ${job.id} ${progress}% complete`);
      })
      .save(); // Save the job to the queue
  });
}

export default createPushNotificationsJobs;
