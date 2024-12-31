const CHROMIUM_VERSION = '131.0.1';

const CHROMIUM_FILE = `chromium-v${CHROMIUM_VERSION}-pack.tar`;

// export const executablePath = `${MINIO_ENDPOINT}/${MINIO_BUCKET}/${CHROMIUM_FILE}`;
export const executablePath = `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/${CHROMIUM_FILE}`;
export const scrapeUrls = [
  'https://coinacademy.fr/actualites/',
  'https://journalducoin.com/news/',
  'https://www.cointribune.com/actu/',
];
