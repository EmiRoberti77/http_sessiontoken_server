export enum LoggerLevel {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INF0 = 'INFO',
}

export class logger {
  public static log(level: LoggerLevel, object: any) {
    const dateTimeStamp = new Date().toISOString();
    console.log(dateTimeStamp, level, object);
  }
}
