/**
 * This is a base class for all HTTP exceptions respective to the HTTP status codes.
 */
export class HttpException extends Error {
    public status: number
    public message: string
    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.message = message
    }
}
