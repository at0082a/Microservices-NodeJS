const express = require('express');
const service = express();
const ServiceRegistry = require('./lib/ServiceRegistry');

module.exports = (config) => {
  const log = config.log();
  // Add a request logging middleware in development mode
  const serviceregistry = new ServiceRegistry(log);
  if (service.get('env') === 'development') {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }

  service.put('/register/:servicename/:serviceversion/:serviceport', (req, res) => {
    const { servicename, serviceversion, serviceport } = req.params;
    // the serviceip variable will recognize ipv6
    const serviceip = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
    const servicekey = serviceregistry
      .register(servicename, serviceversion, serviceip, serviceport);
    return res.json({ result: servicekey });
  });

  service.delete('/register/:servicename/:serviceversion/:serviceport', (req, res, next) => {
    const { servicename, serviceversion, serviceport } = req.params;
    const serviceip = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
    const servicekey = serviceregistry
      .unregister(servicename, serviceversion, serviceip, serviceport);
    return res.json({ message: `deleted ${servicekey}` });
  });

  service.get('/find/:servicename/:serviceversion', (req, res, next) => {
    return next('not implemented');
  });

  // eslint-disable-next-line no-unused-vars
  service.use((error, req, res, next) => {
    res.status(error.status || 500);
    // Log out the error to the console
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  return service;
};
