import puppeteer, { Browser } from 'puppeteer-core';
import { executablePath } from '../../config/puppeteer';

import chromium from '@sparticuz/chromium-min';

const BROWSER_ARGS = [
  '--incognito',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--hide-scrollbars',
  '--disable-dev-shm-usage',
  '--disable-gpu',
];

export class PuppeteerBrowser {
  private static instance: Browser | null = null;

  private constructor() {}

  private static async launch(): Promise<Browser> {
    const systemChromiumPath = process.env.CHROMIUM_PATH;

    let browser: Browser;

    if (systemChromiumPath) {
      // Docker / production: use system-installed Chromium
      browser = await puppeteer.launch({
        args: BROWSER_ARGS,
        executablePath: systemChromiumPath,
        headless: true,
      });
    } else {
      // Lambda / dev: use @sparticuz/chromium-min
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;

      await chromium.font(
        'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf',
      );

      browser = await puppeteer.launch({
        args: [...chromium.args, ...BROWSER_ARGS],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(executablePath),
        headless: chromium.headless,
      });
    }

    browser.on('disconnected', () => {
      PuppeteerBrowser.instance = null;
    });

    return browser;
  }

  public static async getInstance(): Promise<Browser> {
    if (!PuppeteerBrowser.instance || !PuppeteerBrowser.instance.connected) {
      PuppeteerBrowser.instance = await PuppeteerBrowser.launch();
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
