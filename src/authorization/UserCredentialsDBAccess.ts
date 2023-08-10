import { rejects } from 'assert';
import { UserCredentials } from '../Shared/Model';
import Nedb = require('nedb');
import { join, resolve } from 'path';

export class UserCredentialsDBAccess {
  private nedb: Nedb;

  constructor() {
    this.nedb = new Nedb<UserCredentials>({ filename: 'user_db.db' });
    this.nedb.loadDatabase((err: Error | null) => console.log(err));
  }

  public async putUserCredentials(
    userCredential: UserCredentials
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nedb.insert(userCredential, (err: Error | null, document: any) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(document);
          resolve(document);
        }
      });
    });
  }

  public async getUserCredentials(
    username: string,
    password: string
  ): Promise<UserCredentials | undefined> {
    return new Promise((resolve, reject) => {
      this.nedb.find(
        {
          username,
          password,
        },
        (err: Error | null, document: UserCredentials[]) => {
          if (err) reject(err);
          else {
            if (document.length == 0) resolve(undefined);
            else resolve(document[0]);
          }
        }
      );
    });
  }
}
