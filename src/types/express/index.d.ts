import { User } from '../models/User'

/**
 * This file must be in the ./types/express directory of the project. The reason is that You can
 * either create a directory named express or having a file named express.d.ts to tell typescript
 * that you are aiming this specific module (that installed is through express type definitions).
 * Augments existing definition of Request in Express.
 */
declare global {
    declare namespace Express {
        export interface Request {
            isLoggedIn: boolean
            user?: User
        }
    }
}

/**
 * Adds property 'isLoggedIn' to the request.session object.
 */
declare module 'express-session' {
    interface SessionData {
        isLoggedIn: boolean
    }
}
