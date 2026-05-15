import { Request, Response, NextFunction } from 'express';
import * as projectsService from './projects.service';
import { PaginationSchema } from '@devflow/shared';

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectsService.createProject(req.body, req.user!.sub);
    res.status(201).json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await projectsService.listProjects(req.user!.sub);
    res.status(200).json({ success: true, data: { projects } });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectsService.getProject(req.params.id, req.user!.sub);
    res.status(200).json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body, req.user!.sub);
    res.status(200).json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await projectsService.deleteProject(req.params.id, req.user!.sub);
    res.status(200).json({ success: true, data: null, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getProjectDeployments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await projectsService.getProjectDeployments(
      req.params.id,
      req.user!.sub,
      page,
      limit
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
