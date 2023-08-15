import Nedb from 'nedb';
import { User } from '../Shared/Model';

export class UserDBAccess {
  private nedb: Nedb;

  constructor() {
    this.nedb = new Nedb<User>('user.db');
    this.nedb.loadDatabase((err: Error | null) =>
      console.log(err ? 'no error' : err)
    );
  }

  public async putUser(user: User): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nedb.insert(user, (err: Error | null, document: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(document);
        }
      });
    });
  }

  public async getUser(id: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.nedb.find({ id }, (err: Error | null, document: User[]) => {
        if (err) {
          reject(err);
        } else {
          if (document.length === 0) {
            resolve(undefined);
          } else {
            resolve(document[0]);
          }
        }
      });
    });
  }
}
