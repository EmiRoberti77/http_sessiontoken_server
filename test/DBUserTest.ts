import { randomUUID } from 'crypto';
import { WorkingPosition } from '../src/Shared/Model';
import { UserDBAccess } from '../src/User/UsersDBAccess';
import { error } from 'console';

class TestUser {
  public userDb: UserDBAccess;
  constructor() {
    this.userDb = new UserDBAccess();
  }
}

new TestUser().userDb
  .putUser({
    age: 46,
    name: 'admin',
    password: 'admin1234',
    workingPosition: WorkingPosition.MANAGER,
    id: randomUUID(),
    email: 'admin@typescript.com',
  })
  .then((resolve) => console.log(resolve))
  .catch((error) => console.log(error));
