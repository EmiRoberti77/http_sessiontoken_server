import { HTTP_CODES, HTTP_METHODS } from '../Shared/Model';
import { UserDBAccess } from '../User/UsersDBAccess';
import { IncomingMessage, ServerResponse } from 'http';
import { Utils } from './Utils';
import { BaseHandler } from './BaseHandler';

export class UserHandler extends BaseHandler {
  private user_db: UserDBAccess;

  constructor(req: IncomingMessage, res: ServerResponse) {
    super(req, res);
    this.user_db = new UserDBAccess();
  }

  public async handleRequest(): Promise<void> {
    switch (this.req.method) {
      case HTTP_METHODS.GET:
        await this.handleGet();
        break;
      default:
        this.handleNotFound();
        break;
    }
  }

  private async handleGet(): Promise<any> {
    const parseUtl = Utils.getUrlParameters(this.req.url);
    const { id } = parseUtl?.query!;

    if (!id) {
      this.handleMissingQueriesParams();
      return;
    }

    const user = await this.user_db.getUser(id as string);

    if (!user) {
      this.res.statusCode = HTTP_CODES.NOT_FOUND;
      this.res.writeHead(HTTP_CODES.BAD_REQUEST, {
        'Content-type': 'application/json',
      });
      this.res.write(JSON.stringify({ error: 'no user found' }));
    } else {
      this.res.statusCode = HTTP_CODES.OK;
      this.res.writeHead(HTTP_CODES.OK, {
        'Content-type': 'application/json',
      });
      this.res.write(JSON.stringify({ message: user }));
    }
    this.res.end();
  }
}
