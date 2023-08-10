import Nedb from 'nedb';
import { SessionToken } from '../Server/Model';

const nedb = require('nedb');

export class SessionTokenDBAccess {
  private nedb: Nedb;

  constructor() {
    this.nedb = new Nedb<SessionToken>('session_db.bd');
    this.nedb.loadDatabase((err: Error | null) => console.log(err));
  }

  public async storeSessionToken(token: SessionToken): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nedb.insert(token, (err: Error | null, document: SessionToken) => {
        if (err) reject(err);
        else resolve(document);
      });
    });
  }
}
