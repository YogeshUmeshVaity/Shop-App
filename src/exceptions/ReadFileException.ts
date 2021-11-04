/**
 * Exception when the fs.readFile returns an error.
 */
export class ReadFileException extends Error {
    constructor(message: string) {
        super(message)
    }
}
