## Getting Started

Create a `.env` file and add docker variables.

```dotenv
PORT=8000

#### MONGO ####
MONGO_INITDB_ROOT_USERNAME=$YOUR_MONGO_INITDB_ROOT_USERNAME$
MONGO_INITDB_ROOT_PASSWORD=$YOUR_MONGO_INITDB_ROOT_PASSWORD$
MONGO_INITDB_DATABASE=$YOUR_MONGO_INITDB_DATABASE$
MONGO_INITDB_COLLECTION=$YOUR_MONGO_INITDB_COLLECTION$
MONGO_HOST_RS0=$YOUR_MONGO_HOST_RS0$
MONGO_PORT_RS0=$YOUR_MONGO_PORT_RS0$
MONGO_HOST_RS1=$YOUR_MONGO_HOST_RS1$
MONGO_PORT_RS1=$YOUR_MONGO_PORT_RS1$
##################

#### PRISMA ####
DATABASE_URL="mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOST_RS0}:${MONGO_PORT_RS0},${MONGO_HOST_RS1}:${MONGO_PORT_RS1}/${MONGO_INITDB_DATABASE}?authSource=admin&replicaSet=rs0"
##################
```

Generate prisma schema.

```bash
npx prisma generate
```

Prepare the database.

```bash
npx prisma db push
```

## Initialize puppeteer

We use `@sparticuz/chromium` as the default browser for puppeteer ([See documentation](https://www.npmjs.com/package/@sparticuz/chromium)). To initialize puppeteer, first check the latest browser version available.

Example:  
If you use `@sparticuz/chromium@131` the version of `puppeteer-core` should be `23.8.0` relate to this [page](https://pptr.dev/supported-browsers).

Then, download the matching version of chromium [here](https://github.com/Sparticuz/chromium/releases) (Relate to the example it should be `chromium-v131.0.0-pack.tar
`) and put it in your MinIO bucket to simulate AWS S3 environment.
