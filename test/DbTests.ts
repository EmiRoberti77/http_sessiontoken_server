import { AccessRight } from '../src/Shared/Model';
import { UserCredentialsDBAccess } from '../src/authorization/UserCredentialsDBAccess';

class TestDb {
  public dbAccess: UserCredentialsDBAccess;

  constructor() {
    this.dbAccess = new UserCredentialsDBAccess();
  }
}

const dbtest: TestDb = new TestDb();
dbtest.dbAccess
  .putUserCredentials({
    username: 'admin',
    password: 'admin1234',
    accessRights: [
      AccessRight.CREATE,
      AccessRight.DELETE,
      AccessRight.READ,
      AccessRight.UPDATE,
    ],
  })
  .then((resolve) => console.log(resolve))
  .catch((err) => console.log(err));
console.log('done');
