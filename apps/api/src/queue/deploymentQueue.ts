import { Queue } from 'bullmq';
import { redis } from '../../config/redis';
import { logger } from '../../config/logger';

export interface DeploymentJobData {
  deploymentId: string;
  projectId: string;
  repoUrl: string;
  branch: string;
  triggeredBy: string;
}

export const DEPLOYMENT_QUEUE_NAME = 'deployments';

// Singleton queue instance
let deploymentQueue: Queue<DeploymentJobData> | null = null;

export function getDeploymentQueue(): Queue<DeploymentJobData> {
  if (deploymentQueue) return deploymentQueue;

  deploymentQueue = new Queue<DeploymentJobData>(DEPLOYMENT_QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s initial backoff, doubles each retry
      },
      removeOnComplete: { count: 100 }, // keep last 100 completed jobs
      removeOnFail: { count: 50 },      // keep last 50 failed jobs
    },
  });

  deploymentQueue.on('error', (err) => {
    logger.error({ err }, 'Deployment queue error');
  });

  logger.info('Deployment queue initialized');
  return deploymentQueue;
}

/**
 * Enqueue a new deployment job.
 * Returns the Bull job ID for tracking.
 */
export async function enqueueDeployment(data: DeploymentJobData): Promise<string> {
  const queue = getDeploymentQueue();

  const job = await queue.add(`deploy:${data.projectId}`, data, {
    jobId: data.deploymentId, // Use deployment DB id as the job id for easy correlation
  });

  logger.info(
    { jobId: job.id, deploymentId: data.deploymentId, projectId: data.projectId },
    'Deployment job enqueued'
  );

  return job.id!;
}
