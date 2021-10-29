import express from 'express'
import * as authController from '../controllers/authentication'
import { body, check } from 'express-validator'
import { UserModel } from '../models/User'

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

authRoutes.post(
    '/signup',
    body('name').notEmpty().withMessage('Name is required.'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom(async (value: string, { req }) => {
            const existingUser = await UserModel.findOne({ email: value }).exec()
            if (existingUser) {
                throw new Error(
                    'A user with this email already exists. Please, use different email.'
                )
            }
            return true
        })
        .normalizeEmail(),
    body(
        'password',
        'Password should contain numbers, text and should be at least 5 characters long.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    // We can't rename req as request because it's a property of type Meta.
    body('confirmPassword')
        .trim()
        .custom((value: string, { req }) => {
            if (value != req.body.password) {
                throw new Error('Passwords must match!')
            }
            return true
        }),
    authController.postSignup
)

authRoutes.get('/reset-password', authController.getResetPassword)

authRoutes.post('/reset-password', authController.postResetPassword)

authRoutes.get('/reset-password/:resetPasswordToken', authController.getNewPassword)

authRoutes.post('/new-password', authController.postNewPassword)
