import { randomUUID } from 'crypto';
import {
  Account,
  SessionToken,
  TokenGenerator,
  TokenRights,
  TokenState,
  TokenValidator,
} from '../Server/Model';
import { UserCredentialsDBAccess } from './UserCredentialsDBAccess';
import { SessionTokenDBAccess } from './SessionTokenDBAccess';

export class Authorizer implements TokenGenerator, TokenValidator {
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

  async validateToken(tokenId: string): Promise<TokenRights> {
    const sessionToken = await this.sessionTokenDb.getSessionToken(tokenId);
    if (!sessionToken || !sessionToken.valid) {
      return {
        accessRights: [],
        state: TokenState.INVALID,
      };
    } else if (sessionToken.expirationTime < new Date()) {
      return {
        accessRights: [],
        state: TokenState.EXPIRED,
      };
    } else {
      return {
        accessRights: sessionToken.accessRights,
        state: TokenState.VALID,
      };
    }
  }

  private generateExpirationTime() {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  private generateID() {
    return randomUUID();
  }
}
