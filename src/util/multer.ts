import multer from 'multer'
import path from 'path'

/**
 * Multer configuration for file storage. When the multer receives a file, it calls these
 * two functions. Here it specifies the destination directory and the file name appended with
 * current date.
 */
export const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Need to manually create the directory before first use.
        cb(null, path.join(__dirname, '../images/'))
    },

    // g means replace all instances of ':' character. We replace ':', because it's not accepted on
    // all operating systems(e.g. Windows doesn't accept ':' in file names).
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
})
