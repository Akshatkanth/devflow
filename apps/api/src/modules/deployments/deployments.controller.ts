import { Request, Response, NextFunction } from 'express';
import * as deploymentsService from './deployments.service';
import { TriggerDeploymentSchema, PaginationSchema } from '@devflow/shared';

export async function triggerDeployment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { commitMessage } = TriggerDeploymentSchema.parse(req.body);
    const deployment = await deploymentsService.triggerDeployment(
      req.params.projectId as string,
      req.user!.sub,
      commitMessage
    );
    res.status(202).json({
      success: true,
      data: { deployment },
      message: 'Deployment queued',
    });
  } catch (err) {
    next(err);
  }
}

export async function getDeployment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deployment = await deploymentsService.getDeployment(
      req.params.id as string,
      req.user!.sub
    );
    res.status(200).json({ success: true, data: { deployment } });
  } catch (err) {
    next(err);
  }
}

export async function getDeploymentLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await deploymentsService.getDeploymentLogs(
      req.params.id as string,
      req.user!.sub,
      page,
      limit
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function cancelDeployment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deployment = await deploymentsService.cancelDeployment(
      req.params.id as string,
      req.user!.sub
    );
    res.status(200).json({
      success: true,
      data: { deployment },
      message: 'Deployment cancelled',
    });
  } catch (err) {
    next(err);
  }
}
