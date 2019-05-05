'use strict';
const MongoDB = require('@brickyang/easy-mongodb').default;
const path = require('path');

module.exports = app => {
  app.addSingleton('mongo', createMongo);
};

function createMongo(config, app) {
  const client = new MongoDB(config);
  const connectUrl = client.url.replace(
    /:\S*@/,
    `://${client.config.user}:******@`
  );

  client.on('connect', () => {
    app.coreLogger.info(`[egg-mongo] Connect success on ${connectUrl}.`);
    /* load the model dir */
    /* load the models here because of the MongoDB set the db after db connected */
    loadModelToApp(app);
  });
  /* istanbul ignore next */
  client.on('error', error => {
    app.coreLogger.warn(`[egg-mongo] Connect fail on ${connectUrl}.`);
    app.coreLogger.error(error);
  });

  app.beforeStart(async () => {
    app.coreLogger.info('[egg-mongo] Connecting MongoDB...');
    await client.connect();
  });

  return client;
}

function loadModelToApp(app) {
  const dir = path.join(app.config.baseDir, 'app/model');
  app.loader.loadToApp(dir, 'model', {
    inject: app,
    caseStyle: 'upper',
    filter(model) {
      /* TODO check the real type of model */
      return typeof model === 'object';
    },
  });
}