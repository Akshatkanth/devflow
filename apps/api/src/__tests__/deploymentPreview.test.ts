import { captureDeploymentPreview } from '../services/deploymentPreview';

jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

const playwright = require('playwright');

jest.mock('../config/database', () => ({
  prisma: {
    deployment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const { prisma } = require('../config/database');

jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('captureDeploymentPreview', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('captures preview when deployment is healthy', async () => {
    prisma.deployment.findUnique.mockResolvedValue({ status: 'HEALTHY' });

    const mockPage = {
      goto: jest.fn().mockResolvedValue(undefined),
      waitForTimeout: jest.fn().mockResolvedValue(undefined),
      screenshot: jest.fn().mockResolvedValue(undefined),
    };
    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };

    playwright.chromium.launch.mockResolvedValue(mockBrowser);

    await captureDeploymentPreview('deployment-123');

    expect(prisma.deployment.update).toHaveBeenCalled();
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.screenshot).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('does nothing if deployment not healthy', async () => {
    prisma.deployment.findUnique.mockResolvedValue({ status: 'FAILED' });

    await captureDeploymentPreview('deployment-456');

    expect(playwright.chromium.launch).not.toHaveBeenCalled();
    expect(prisma.deployment.update).not.toHaveBeenCalled();
  });
});
