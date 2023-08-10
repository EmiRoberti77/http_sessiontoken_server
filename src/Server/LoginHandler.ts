import { IncomingMessage, ServerResponse } from 'http';
import { Account, Handler, SessionToken, TokenGenerator } from './Model';
import { error } from 'console';

export class LoginHandler implements Handler {
  private req: IncomingMessage;
  private res: ServerResponse;
  private tokenGenerator: TokenGenerator;

  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    tokenGenerator: TokenGenerator
  ) {
    this.req = req;
    this.res = res;
    this.tokenGenerator = tokenGenerator;
  }

  public async handleRequest(): Promise<void> {
    try {
      const body: Account = await this.getBodyFromRequest();
      const sessionToken = await this.tokenGenerator.generateToken(body);
      if (sessionToken) {
        this.res.write(JSON.stringify({ success: sessionToken.tokenId }));
      } else {
        this.res.write(JSON.stringify({ error: 'no session' }));
      }
    } catch (error: any) {
      this.res.write(JSON.stringify({ error: error.message }));
    }
  }

  private async getBodyFromRequest(): Promise<Account> {
    return new Promise((resolve, reject) => {
      let body: string = '';

      this.req.on('data', (data: string) => {
        body += data;
      });
      this.req.on('end', () => {
        try {
          resolve(JSON.parse(body) as Account);
        } catch (err: any) {
          reject(err);
        }
      });
      this.req.on('error', (error: any) => {
        reject(error);
      });
    });
  }
}
