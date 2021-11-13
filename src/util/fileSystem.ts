import fs from 'fs/promises'
import { FileDeleteException } from '../exceptions/FileExceptions/FileDeleteException'

// TODO: Should handle case, if the find doesn't exist already.
export const deleteFile = async (filePath: string): Promise<void> => {
    try {
        await fs.unlink(filePath)
    } catch (error) {
        // TODO: Currently, the actual error information is getting lost. Check if the error object
        // of type unknown is Error and extract the error message from it. That error message should
        // be displayed in the console for debug purposes.
        // There may also be separate message for logging and displaying to the client.
        console.log(error)
        throw new FileDeleteException(`Error while deleting the file at ${filePath}.`, error)
    }
}
