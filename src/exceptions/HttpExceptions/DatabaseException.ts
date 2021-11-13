import { StatusCodes } from 'http-status-codes'
import { HttpException } from './HttpException'

/**
 * This exception is thrown whenever an unexpected error occurs while interacting with the database.
 * Includes the HTTP status code: 500.
 */
export class DatabaseException extends HttpException {
    constructor(message: string, public cause: unknown) {
        // We have mentioned the status code (500) in the super for avoiding the clutter at call site.
        // This way we only have to mention the message and not the status code.
        super(StatusCodes.INTERNAL_SERVER_ERROR, message)
    }
}
