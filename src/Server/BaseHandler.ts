import { IncomingMessage, ServerResponse } from 'http';
import { HTTP_CODES } from '../Shared/Model';

export abstract class BaseHandler {
  protected req: IncomingMessage;
  protected res: ServerResponse;

  constructor(req: IncomingMessage, res: ServerResponse) {
    this.req = req;
    this.res = res;
  }

  abstract handleRequest(): Promise<void>;

  protected methodNotSupported(httpMethod: string): string {
    return `${httpMethod} not supported for this endpoint`;
  }

  protected async handleNotFound() {
    this.res.statusCode = HTTP_CODES.BAD_REQUEST;
    this.res.writeHead(HTTP_CODES.BAD_REQUEST, {
      'Content-type': 'application/json',
    });
    this.res.write(
      JSON.stringify({ error: this.methodNotSupported(this.req.method!) })
    );
    this.res.end();
  }

  protected handleMissingQueriesParams() {
    this.res.statusCode = HTTP_CODES.BAD_REQUEST;
    this.res.writeHead(HTTP_CODES.BAD_REQUEST, {
      'Content-type': 'application/json',
    });
    this.res.write(JSON.stringify({ error: 'missing query string' }));
    this.res.end();
  }
}
