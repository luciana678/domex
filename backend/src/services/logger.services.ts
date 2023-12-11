import { logger } from '../config/winston.config.js'

export default class LoggerService {
  static fatal(...params: any[]): void {
    const arrayParams = this.#formatParams(params, '\n')
    logger.log('fatal', arrayParams)
  }

  static error(...params: any[]): void {
    const arrayParams = this.#formatParams(params, '\n')
    logger.error(arrayParams)
  }

  static info(...params: any[]): void {
    const arrayParams = this.#formatParams(params, ' ')
    logger.info(arrayParams)
  }

  static warn(...params: any[]): void {
    const arrayParams = this.#formatParams(params, ' ')
    logger.warning(arrayParams)
  }

  static http(...params: any[]): void {
    const arrayParams = this.#formatParams(params, ' ')
    logger.http(arrayParams)
  }

  static debug(...params: any[]): void {
    const arrayParams = this.#formatParams(params, ' ')
    logger.debug(arrayParams)
  }

  static readonly #formatParams = (params: any, separator: string): string => {
    return params
      .map((param: any) => (typeof param === 'object' ? JSON.stringify(param, null, 2) : param))
      .join(separator)
  }
}
