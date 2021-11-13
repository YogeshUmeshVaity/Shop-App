export class PasswordResetException extends Error {
    constructor(message: string, public cause: unknown) {
        super(message)
    }
}
