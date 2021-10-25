import express from 'express'
import * as authController from '../controllers/authentication'
import { body, check } from 'express-validator'

export const authRoutes = express.Router()

authRoutes.get('/login', authController.getLogin)

authRoutes.post('/login', authController.postLogin)

authRoutes.post('/logout', authController.postLogout)

authRoutes.get('/signup', authController.getSignup)

authRoutes.post(
    '/signup',
    check('email').isEmail().withMessage('Please enter a valid email'),
    check(
        'password',
        'Password should contain numbers, text and should be at least 5 characters long.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric(),
    authController.postSignup
)

authRoutes.get('/reset-password', authController.getResetPassword)

authRoutes.post('/reset-password', authController.postResetPassword)

authRoutes.get('/reset-password/:resetPasswordToken', authController.getNewPassword)

authRoutes.post('/new-password', authController.postNewPassword)
