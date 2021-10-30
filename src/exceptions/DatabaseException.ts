import { StatusCodes } from 'http-status-codes'
import { HttpException } from './HttpException'

/**
 * This exception is thrown whenever an unexpected error occurs while interacting with the database.
 */
export class DatabaseException extends HttpException {
    constructor(message: string) {
        super(StatusCodes.INTERNAL_SERVER_ERROR, message)
    }
}
