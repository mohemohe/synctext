const config = require('config');
const UwsServer = require('uws').Server;
const SocketIO = require('socket.io');
const NeDB = require('./nedb');
const ExpressFactory = require('./expressFactory');

class WebSocket {
  static async serve() {
    const express = ExpressFactory.getExpressInstance();
    const io = new SocketIO(express);

    io.engine.ws = new UwsServer({
      noServer: true,
      perMessageDeflate: false
    });

    io.set('heartbeat interval', config.socketio.heartbeatInterval);
    io.set('heartbeat timeout', config.socketio.heartbeatTimeout);
    console.log('heartbeat interval:', config.socketio.heartbeatInterval);
    console.log('heartbeat timeout:', config.socketio.heartbeatTimeout);

    io.sockets.on('connection', async (socket) => {
      const log = body => {
        process.stdout.write(`SOCKET ${body} | Socket ID: ${socket.id}, ID: ${id}, Address: ${address}\n`);
      };

      // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
      const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      let id = socket.handshake.query.id;
      const address = socket.request.connection.remoteAddress;

      if(!id || id === '') {
        for(let i = 1000000000000000; i <= 9999999999999999; i++) {
          const nextId = getRandomInt(1000000000000000, 9999999999999999);
          const isNewId = await NeDB.isExistIdAsync(nextId);
          if(!isNewId) {
            id = nextId;
            break;
          }
        }
      }

      socket.join(id);

      const db = new NeDB(id);
      const isExistId = await db.isExistIdAsync();

      if(!isExistId) {
        log('detect new id.');

        await db.setValueAsync('');

        socket.emit('message', {
          id: id,
          value: ''
        });
      } else {
        const data = await db.getValueAsync();

        socket.emit('message', data);

        log('connected.');
      }

      socket.on('message', async (data) => {
        log(`received: ${data.value}`);
        db.setValueAsync(data.value);
        data.sendBy = socket.id;
        io.in(id).emit('message', data);
      });

      socket.on('disconnect', async () => {
        log('disconnected.');

        const room = io.sockets.adapter.rooms[id];
        if(!room || room.length === 0) {
          log('no client detected. delete database.');
          await db.removeAsync();
        }
      });
    });

    express.listen(config.express.port, () => {
      console.log(`listening on 0.0.0.0:${config.express.port}\n`);
    });
  }
}

module.exports = WebSocket;
