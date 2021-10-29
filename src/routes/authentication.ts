import express from 'express'
import * as authController from '../controllers/authentication'
import { body } from 'express-validator'
import { validatePostSignup } from '../validators/authentication'

export const authRoutes = express.Router()

authRoutes.get('/login', authController.getLogin)

/**
 * The length check should be the same (5 here) as specified in the check of sign-up route.
 */
authRoutes.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
        body('password', 'Please enter a valid password.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
)

authRoutes.post('/logout', authController.postLogout)

authRoutes.get('/signup', authController.getSignup)

authRoutes.post('/signup', validatePostSignup, authController.postSignup)

authRoutes.get('/reset-password', authController.getResetPassword)

authRoutes.post('/reset-password', authController.postResetPassword)

authRoutes.get('/reset-password/:resetPasswordToken', authController.getNewPassword)

authRoutes.post('/new-password', authController.postNewPassword)
