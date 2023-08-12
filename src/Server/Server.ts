import { createServer, IncomingMessage, ServerResponse } from 'http';
import { NO_PATH_ERROR, SERVER_PATH, SUCCESS_ON_START, Utils } from './Utils';
import { LoginHandler } from './LoginHandler';
import { Authorizer } from '../authorization/Authorizer';
import { UserHandler } from './UserHandler';

const PORT: number = 8080;

export class Server {
  private authorizer: Authorizer = new Authorizer();

  startServer() {
    createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const basePath = Utils.getUrlBasePath(req.url);
      if (!basePath) return;
      if (basePath === undefined) return;
      switch (basePath) {
        case SERVER_PATH.LOGIN:
          await new LoginHandler(req, res, this.authorizer).handleRequest();
          break;
        case SERVER_PATH.USERS:
          await new UserHandler(req, res).handleRequest();
          break;
        default:
          console.log(NO_PATH_ERROR(basePath));
          break;
      }
    }).listen(PORT, () => {
      SUCCESS_ON_START(PORT);
    });
  }
}
