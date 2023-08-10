import { randomUUID } from 'crypto';
import { Account, SessionToken, TokenGenerator } from '../Server/Model';
import { UserCredentialsDBAccess } from './UserCredentialsDBAccess';
import { SessionTokenDBAccess } from './SessionTokenDBAccess';

export class Authorizer implements TokenGenerator {
  private userCredentialDB = new UserCredentialsDBAccess();
  private sessionTokenDb = new SessionTokenDBAccess();

  async generateToken(account: Account): Promise<SessionToken | undefined> {
    const userAccount = await this.userCredentialDB.getUserCredentials(
      account.username,
      account.password
    );
    if (userAccount) {
      const token: SessionToken = {
        tokenId: this.generateID(),
        username: userAccount.username,
        password: userAccount.password,
        accessRights: userAccount.accessRights,
        valid: true,
        expirationTime: this.generateExpirationTime(),
      };

      await this.sessionTokenDb.storeSessionToken(token);

      return token;
    } else {
      return undefined;
    }
  }

  private generateExpirationTime() {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  private generateID() {
    return randomUUID();
  }
}
