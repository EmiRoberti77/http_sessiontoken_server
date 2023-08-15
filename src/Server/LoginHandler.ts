import { IncomingMessage, ServerResponse } from 'http';
import { Account, Handler, TokenGenerator } from './Model';
import { HTTP_CODES, HTTP_METHODS } from '../Shared/Model';
import { Utils } from './Utils';
import { BaseHandler } from './BaseHandler';

export class LoginHandler extends BaseHandler {
  private tokenGenerator: TokenGenerator;

  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    tokenGenerator: TokenGenerator
  ) {
    super(req, res);
    this.tokenGenerator = tokenGenerator;
  }

  public async handleRequest(): Promise<void> {
    switch (this.req.method) {
      case HTTP_METHODS.POST:
        await this.handlePost();
        break;
      default:
        this.handleNotFound();
        break;
    }
  }

  private async handlePost(): Promise<void> {
    try {
      const body: Account = await this.getBodyFromRequest();
      const sessionToken = await this.tokenGenerator.generateToken(body);
      if (sessionToken) {
        this.respondJsonObject(HTTP_CODES.CREATED, {
          sessionToken: sessionToken,
        });
      } else {
        this.respondJsonObject(HTTP_CODES.BAD_REQUEST, { error: 'no session' });
      }
    } catch (error: any) {
      this.respondJsonObject(HTTP_CODES.NOT_FOUND, { error: error.message });
    }
  }
}
