import Nedb from 'nedb';
import { User } from '../Shared/Model';
import { randomUUID } from 'crypto';

export class UserDBAccess {
  private nedb: Nedb;

  constructor() {
    this.nedb = new Nedb<User>('user.db');
    this.nedb.loadDatabase((err: Error | null) =>
      console.log(err ? 'no error' : err)
    );
  }

  public async getUserByName(name: string): Promise<any> {
    const regEx = new RegExp(name);
    return new Promise((resolve, reject) => {
      this.nedb.find(
        { name: regEx },
        (error: Error | null, document: User[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(document);
          }
        }
      );
    });
  }

  public async removeUserFromDB(id: string): Promise<boolean> {
    const response = await this.removeUser(id);
    this.nedb.loadDatabase();
    return response;
  }

  private async removeUser(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.nedb.remove(
        { id: id },
        (error: Error | null, numRemoved: number) => {
          if (error) {
            reject(error);
          } else {
            if (numRemoved === 0) resolve(false);
            else resolve(true);
          }
        }
      );
    });
  }

  public async putUser(user: User): Promise<any> {
    if (!user.id) {
      user.id = randomUUID();
    }
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
