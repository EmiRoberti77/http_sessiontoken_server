import { IncomingMessage, ServerResponse } from 'http';
import { HTTP_CODES } from '../Shared/Model';
import { LoggerLevel, logger } from '../Logger/logger';

export abstract class BaseHandler {
  protected req: IncomingMessage;
  protected res: ServerResponse;

  constructor(req: IncomingMessage, res: ServerResponse) {
    this.req = req;
    this.res = res;
  }

  abstract handleRequest(): Promise<void>;

  protected respondJsonObject(code: HTTP_CODES, messageObject: any) {
    this.res.statusCode = code;
    this.res.writeHead(code, {
      'Content-type': 'application/json',
    });
    this.res.write(JSON.stringify(messageObject));
    this.res.end();
  }

  protected methodNotSupported(httpMethod: string): string {
    return `${httpMethod} not supported for this endpoint`;
  }

  protected async handleNotFound() {
    this.respondJsonObject(HTTP_CODES.BAD_REQUEST, {
      error: this.methodNotSupported(this.req.method!),
    });
  }

  protected handleMissingQueriesParams() {
    this.respondJsonObject(HTTP_CODES.BAD_REQUEST, {
      error: 'missing query string',
    });
  }

  protected async getBodyFromRequest(): Promise<any> {
    return new Promise((resolve, reject) => {
      let body: string = '';

      this.req.on('data', (data: string) => {
        body += data;
      });
      this.req.on('end', () => {
        try {
          logger.log(LoggerLevel.INF0, body);
          resolve(JSON.parse(body));
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
