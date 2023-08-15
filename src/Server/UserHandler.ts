import { AccessRight, HTTP_CODES, HTTP_METHODS, User } from '../Shared/Model';
import { UserDBAccess } from '../User/UsersDBAccess';
import { IncomingMessage, ServerResponse } from 'http';
import { UNAUTHORIZED_ERROR, Utils } from './Utils';
import { BaseHandler } from './BaseHandler';
import { TokenValidator } from './Model';
import { LoggerLevel, logger } from '../Logger/logger';

export class UserHandler extends BaseHandler {
  private user_db: UserDBAccess;
  private tokenValidator: TokenValidator;

  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    tokenValidator: TokenValidator
  ) {
    super(req, res);
    this.user_db = new UserDBAccess();
    this.tokenValidator = tokenValidator;
  }

  public async handleRequest(): Promise<void> {
    switch (this.req.method) {
      case HTTP_METHODS.GET:
        await this.handleGet();
        break;
      case HTTP_METHODS.PUT:
        await this.handlePut();
        break;
      default:
        this.handleNotFound();
        break;
    }
  }

  private async handlePut() {
    const authorized = await this.operationAuthorized(AccessRight.UPDATE);
    if (!authorized) {
      this.respondJsonObject(HTTP_CODES.UNAUTHORIZED, {
        error: UNAUTHORIZED_ERROR,
      });
      return;
    }

    const user: User = (await this.getBodyFromRequest()) as User;
    await this.user_db.putUser(user);
    logger.log(LoggerLevel.INF0, user);
    this.respondJsonObject(HTTP_CODES.CREATED, user);
  }

  private async handleGet() {
    const authorized = await this.operationAuthorized(AccessRight.READ);
    console.log('authorized', authorized);
    if (!authorized) {
      this.respondJsonObject(HTTP_CODES.UNAUTHORIZED, {
        error: UNAUTHORIZED_ERROR,
      });
      return;
    }

    const parsedUrl = Utils.getUrlParameters(this.req.url);
    const { id } = parsedUrl?.query!;

    if (!id) {
      this.handleMissingQueriesParams();
      return;
    }
    const user = await this.user_db.getUser(id as string);

    if (!user) {
      this.respondJsonObject(HTTP_CODES.NOT_FOUND, { error: 'no user found' });
    } else {
      this.respondJsonObject(HTTP_CODES.OK, { message: user });
    }
  }

  public async operationAuthorized(operation: AccessRight): Promise<boolean> {
    const token = this.req.headers.authorization;
    console.log('token', token);
    if (!token) return false;

    const tokenRights = await this.tokenValidator.validateToken(token);
    console.log(tokenRights);
    if (tokenRights.accessRights.includes(operation)) {
      return true;
    } else {
      return false;
    }
  }
}
