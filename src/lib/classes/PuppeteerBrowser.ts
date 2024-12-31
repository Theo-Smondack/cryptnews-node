import puppeteer, { Browser } from 'puppeteer-core';
import { executablePath } from '../../config/puppeteer';

import chromium from '@sparticuz/chromium-min';


export class PuppeteerBrowser {
  private static instance: Browser | null = null;

  private constructor() {}

  public static async getInstance(): Promise<Browser> {
    if (!PuppeteerBrowser.instance) {
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;

      await chromium.font(
        'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf',
      );

      PuppeteerBrowser.instance = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--incognito',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--hide-scrollbars',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(executablePath),
        headless: chromium.headless,
      });

      PuppeteerBrowser.instance.on('disconnected', () => {
        PuppeteerBrowser.instance = null;
      });
    }

    return PuppeteerBrowser.instance;
  }

  public static async closeInstance(): Promise<void> {
    if (PuppeteerBrowser.instance) {
      await PuppeteerBrowser.instance.close();
      PuppeteerBrowser.instance = null;
    }
  }
}

process.on('exit', PuppeteerBrowser.closeInstance);
process.on('SIGINT', PuppeteerBrowser.closeInstance);
process.on('SIGTERM', PuppeteerBrowser.closeInstance);
