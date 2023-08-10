import { parse, URL } from 'url';

export class Utils {
  public static getUrlBasePath(url: string | undefined): string {
    if (!url) return 'no_url';

    const parsedUrl = parse(url);
    const basePath = parsedUrl.pathname?.split('/')[1];
    return basePath ? basePath : 'no base path';
  }
}

export enum SERVER_PATH {
  LOGIN = 'login',
}

export const SUCCESS_ON_START = (port: number) =>
  console.log(`Server started on ${port}`);

export const NO_PATH_ERROR = (path: string) => `No path found for ${path}`;
