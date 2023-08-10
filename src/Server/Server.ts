import { createServer, IncomingMessage, ServerResponse } from 'http';
import { NO_PATH_ERROR, SERVER_PATH, SUCCESS_ON_START, Utils } from './Utils';
import { LoginHandler } from './LoginHandler';
import { Authorizer } from '../authorization/Authorizer';

const PORT: number = 8080;

export class Server {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  private authorizer: Authorizer = new Authorizer();

  startServer() {
    createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const basePath = Utils.getUrlBasePath(req.url);
      switch (basePath) {
        case SERVER_PATH.LOGIN:
          await new LoginHandler(req, res, this.authorizer).handleRequest();
          break;
        default:
          console.log(NO_PATH_ERROR(basePath));
          break;
      }
      res.end();
    }).listen(PORT, () => {
      SUCCESS_ON_START(PORT);
    });
  }
}
