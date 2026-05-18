import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { DeploymentStatus } from '@devflow/shared';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';

const PREVIEW_STORAGE_DIR = path.resolve(process.cwd(), 'storage', 'previews');
const PREVIEW_PUBLIC_BASE_URL = `http://localhost:${env.PORT}`;
const DEFAULT_APP_URL = process.env.DEPLOYMENT_PREVIEW_URL ?? 'http://localhost:3000';

function getPreviewFileName(deploymentId: string): string {
  return `${deploymentId}.png`;
}

function getPreviewFilePath(deploymentId: string): string {
  return path.join(PREVIEW_STORAGE_DIR, getPreviewFileName(deploymentId));
}

function getPreviewUrl(deploymentId: string): string {
  return `${PREVIEW_PUBLIC_BASE_URL}/previews/${getPreviewFileName(deploymentId)}`;
}

export async function captureDeploymentPreview(deploymentId: string): Promise<void> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    select: { status: true },
  });

  if (!deployment || deployment.status !== DeploymentStatus.HEALTHY) {
    return;
  }

  await fs.mkdir(PREVIEW_STORAGE_DIR, { recursive: true });

  const filePath = getPreviewFilePath(deploymentId);
  const previewUrl = getPreviewUrl(deploymentId);
  const capturedAt = new Date();

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage({
      viewport: { width: 1440, height: 1024 },
      deviceScaleFactor: 1,
    });

    await page.goto(DEFAULT_APP_URL, {
      waitUntil: 'load',
      timeout: 30_000,
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: filePath,
      fullPage: true,
      type: 'png',
    });

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        previewScreenshotPath: filePath,
        previewScreenshotUrl: previewUrl,
        previewScreenshotCapturedAt: capturedAt,
      },
    });

    logger.info(
      { deploymentId, previewScreenshotPath: filePath, previewScreenshotUrl: previewUrl },
      'Deployment preview screenshot captured'
    );
  } catch (err) {
    logger.warn({ deploymentId, err }, 'Deployment preview screenshot failed');
  } finally {
    if (browser) {
      await browser.close().catch((err) => {
        logger.warn({ deploymentId, err }, 'Failed to close preview browser cleanly');
      });
    }
  }
}