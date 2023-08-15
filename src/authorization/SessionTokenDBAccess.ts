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

  public async getSessionToken(
    tokenId: string
  ): Promise<SessionToken | undefined> {
    return new Promise((resolve, reject) => {
      this.nedb.find(
        { tokenId },
        (err: Error | null, document: SessionToken[]) => {
          if (err) reject(err);
          else {
            if (document.length === 0) {
              console.log('No token found');
              resolve(undefined);
            } else {
              console.log('token found', document[0]);
              resolve(document[0]);
            }
          }
        }
      );
    });
  }
}
