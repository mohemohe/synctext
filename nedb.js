const config = require('config');
const nedb = require('nedb');

const db = new nedb({ filename: config.nedb.filename, autoload: true });

class NeDB {
  constructor(id) {
    this.id = id;
  }

  static isExistIdAsync(id) {
    return new Promise((resolve, reject) => {
      db.find({ id: id }, (err, docs) => {
        if(err) {
          reject(err);
        }

        resolve(docs.length > 0);
      });
    });
  }

  isExistIdAsync() {
    return new Promise((resolve, reject) => {
      db.find({ id: this.id }, (err, docs) => {
        console.log(docs);
        if(err) {
          reject(err);
        }

        resolve(docs.length > 0);
      });
    });
  }

  getValueAsync() {
    return new Promise((resolve, reject) => {
      db.find({ id: this.id }, (err, docs) => {
        if(err) {
          reject(err);
        }

        resolve(docs ? docs.pop() : null);
      });
    });
  }

  setValueAsync(value) {
    return new Promise(async (resolve, reject) => {
      if(await this.isExistIdAsync()) {
        db.update({ id: this.id }, { id: this.id, value: value }, (err, res) => {
          if(err !== null) {
            reject(err);
          }

          resolve(res);
        });
      } else {
        db.insert({ id: this.id, value: value }, (err, res) => {
          if(err !== null) {
            reject(err);
          }

          resolve(res);
        });
      }
    });
  }

  removeAsync() {
    return new Promise(async (resolve, reject) => {
      db.remove({ id: this.id }, (err, res) => {
        if(err !== null) {
          reject(err);
        }

        resolve(res);
      });
    });
  }
}

module.exports = NeDB;
