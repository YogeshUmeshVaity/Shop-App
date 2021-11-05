/**
 * Exception when the fs.unlink returns an error.
 */
export class FileDeleteException extends Error {
    constructor(message: string) {
        super(message)
    }
}
