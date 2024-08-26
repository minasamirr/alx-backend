#!/usr/bin/yarn test
import kue from 'kue';
import { expect } from 'chai';
import createPushNotificationsJobs from './8-job.js';

// Create a queue instance
const queue = kue.createQueue();

describe('createPushNotificationsJobs', () => {
  beforeEach(() => {
    // Enter test mode before running the tests
    kue.testMode.enter();
  });

  afterEach(() => {
    // Clear the queue and exit test mode after running the tests
    kue.testMode.clear();
    kue.testMode.exit();
  });

  it('should throw an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs({}, queue)).to.throw(Error, 'Jobs is not an array');
  });

  it('should create jobs and add them to the queue', () => {
    const jobs = [
      {
        phoneNumber: '4153518780',
        message: 'This is the code 1234 to verify your account'
      },
      {
        phoneNumber: '4153518781',
        message: 'This is the code 4562 to verify your account'
      }
    ];

    // Create jobs in test mode
    createPushNotificationsJobs(jobs, queue);

    // Validate jobs are added to the queue
    const createdJobs = kue.testMode.jobs;

    expect(createdJobs).to.have.lengthOf(2);
    expect(createdJobs[0].data).to.deep.equal(jobs[0]);
    expect(createdJobs[1].data).to.deep.equal(jobs[1]);
  });
});
