const config = require('config');
const morgan = require('morgan');
const express = require('express');
const http = require('http');

http.globalAgent.maxSockets = config.express.maxSockets;

global.expressInstance = null;

class ExpressFactory {
  static getExpress() {
    return express;
  }

  static getExpressInstance() {
    if(global.expressInstance === null) {
      global.expressInstance = ExpressFactory.createExpressInstance();
    }

    return global.expressInstance;
  }

  static createExpressInstance() {
    const exp = express();
    console.log('created new express instance');
    exp.use(morgan('dev', {
      immediate: true
    }));
    exp.use(ExpressFactory.getExpress().static(`${__dirname}/static`));
    exp.get(config.express.endpoint, (req, res) => {
      return res.sendfile('index.html');
    });

    return http.Server(exp);
  }
}

module.exports = ExpressFactory;
