/**
 * Exception when the fs.readFile returns an error.
 */
export class FileReadException extends Error {
    constructor(message: string) {
        super(message)
    }
}
