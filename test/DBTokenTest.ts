import { SessionToken } from '../src/Server/Model';
import { AccessRight } from '../src/Shared/Model';
import { SessionTokenDBAccess } from '../src/authorization/SessionTokenDBAccess';

class TestSessionToken {
  private sessionTokenDBAccess: SessionTokenDBAccess;
  constructor() {
    this.sessionTokenDBAccess = new SessionTokenDBAccess();
  }

  public async createToken(token: SessionToken) {
    await this.sessionTokenDBAccess.storeSessionToken(token);
  }
}

// export interface SessionToken {
//   tokenId: string;
//   username: string;
//   password: string;
//   valid: boolean;
//   expirationTime: Date;
//   accessRights: AccessRight[];
// }

const newToken: SessionToken = {
  tokenId: 'emi12345',
  username: 'admin',
  password: 'admin1234',
  valid: true,
  expirationTime: new Date(new Date().getTime() + 60 * 60 * 1000),
  accessRights: [
    AccessRight.CREATE,
    AccessRight.DELETE,
    AccessRight.READ,
    AccessRight.UPDATE,
  ],
};

new TestSessionToken().createToken(newToken);
