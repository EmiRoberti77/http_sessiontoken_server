import { IncomingMessage, ServerResponse } from 'http';
import { Account, Handler, SessionToken, TokenGenerator } from './Model';
import { error } from 'console';
import { HTTP_CODES, HTTP_METHODS } from '../Shared/Model';

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
    switch (this.req.method) {
      case HTTP_METHODS.POST:
        await this.handlePost();
        break;
      default:
        this.handleNotFound();
        break;
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

  private async handleNotFound() {
    this.res.statusCode = HTTP_CODES.BAD_REQUEST;
    this.res.writeHead(HTTP_CODES.BAD_REQUEST, {
      'Content-type': 'application/json',
    });
    this.res.write(
      JSON.stringify({ error: this.methodNotSupported(this.req.method!) })
    );
  }

  private async handlePost(): Promise<void> {
    try {
      const body: Account = await this.getBodyFromRequest();
      const sessionToken = await this.tokenGenerator.generateToken(body);
      if (sessionToken) {
        this.res.statusCode = HTTP_CODES.CREATED;
        this.res.writeHead(HTTP_CODES.CREATED, {
          'Content-type': 'application/json',
        });
        this.res.write(JSON.stringify({ sessionToken: sessionToken }));
      } else {
        this.res.write(JSON.stringify({ error: 'no session' }));
      }
    } catch (error: any) {
      this.res.statusCode = HTTP_CODES.NOT_FOUND;
      this.res.writeHead(HTTP_CODES.NOT_FOUND, {
        'Content-type': 'application/json',
      });
      this.res.write(JSON.stringify({ error: error.message }));
    }
  }

  private methodNotSupported(httpMethod: string): string {
    return `${httpMethod} not supported for this endpoint`;
  }
}
