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
      case HTTP_METHODS.DELETE:
        await this.handleDelete();
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

    try {
      const user: User = (await this.getBodyFromRequest()) as User;
      await this.user_db.putUser(user);
      logger.log(LoggerLevel.INF0, user);
      this.respondJsonObject(HTTP_CODES.CREATED, user);
    } catch (error: any) {
      logger.log(LoggerLevel.ERROR, { error: error.message });
      this.respondJsonObject(HTTP_CODES.BAD_REQUEST, { error: error.message });
    }
  }

  private async handleDelete() {
    const authorized = await this.operationAuthorized(AccessRight.DELETE);
    if (!authorized) {
      this.respondJsonObject(HTTP_CODES.UNAUTHORIZED, {
        error: UNAUTHORIZED_ERROR,
      });
      return;
    }

    try {
      const parsedUrl = Utils.getUrlParameters(this.req.url);
      const { id } = parsedUrl?.query!;
      logger.log(LoggerLevel.INF0, { delete_id: id });
      if (!id) {
        this.respondJsonObject(HTTP_CODES.NOT_FOUND, { delete_id: id });
        return;
      }
      const response = await this.user_db.removeUserFromDB(id as string);
      this.respondJsonObject(
        response ? HTTP_CODES.OK : HTTP_CODES.BAD_REQUEST,
        { message: response }
      );
    } catch (error: any) {
      logger.log(LoggerLevel.ERROR, { error: error.message });
      this.respondJsonObject(HTTP_CODES.BAD_REQUEST, { error: error.message });
    }
  }

  private async handleGet() {
    const authorized = await this.operationAuthorized(AccessRight.READ);
    logger.log(LoggerLevel.INF0, authorized);
    if (!authorized) {
      this.respondJsonObject(HTTP_CODES.UNAUTHORIZED, {
        error: UNAUTHORIZED_ERROR,
      });
      return;
    }

    const parsedUrl = Utils.getUrlParameters(this.req.url);
    const { id, name } = parsedUrl?.query!;
    let user;
    if (!id && !name) {
      this.respondJsonObject(
        HTTP_CODES.BAD_REQUEST,
        this.handleMissingQueriesParams()
      );
      return;
    }

    if (id) {
      user = await this.user_db.getUser(id as string);
    } else if (name) {
      user = await this.user_db.getUserByName(name as string);
    }

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
