import { User } from '../models/User'

/**
 * Augments existing definition of Request in Express.
 */
declare global {
    declare namespace Express {
        export interface Request {
            user?: User
        }
    }
}
