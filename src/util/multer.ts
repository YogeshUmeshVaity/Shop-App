import { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

/**
 * Multer configuration for file storage. When the multer receives a file, it calls these
 * two functions. Here it specifies the destination directory and the file name appended with
 * current date.
 */
export const fileStorage = multer.diskStorage({
    destination: (
        request: Request,
        file: Express.Multer.File,
        callback: DestinationCallback
    ): void => {
        // Need to manually create the directory before first use.
        callback(null, path.join(__dirname, '../images/'))
    },

    // g means replace all instances of ':' character. We replace ':', because it's not accepted on
    // all operating systems(e.g. Windows doesn't accept ':' in file names).
    filename: (req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
        callback(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
})

/**
 * Controls which types of files are uploaded. This is called for every file that is processed.
 * request.file is undefined, if the file type doesn't belong to the types specified below.
 */
export const fileFilter = (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
): void => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}
