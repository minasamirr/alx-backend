#!/usr/bin/yarn dev
import kue from 'kue';

// Create a queue
const queue = kue.createQueue();

// Create job data
const jobData = {
  phoneNumber: '1234567890',
  message: 'This is a notification message'
};

// Create a job
const job = queue.create('push_notification_code', jobData)
  .save((err) => {
    if (!err) {
      console.log(`Notification job created: ${job.id}`);
    }
  });

// Handle job events
job.on('complete', () => {
  console.log('Notification job completed');
});

job.on('failed', (errorMessage) => {
  console.log(`Notification job failed: ${errorMessage}`);
});

// Handle job progress (optional)
job.on('progress', (progress) => {
  console.log(`Notification job ${job.id} ${progress}% complete`);
});
