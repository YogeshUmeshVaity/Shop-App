import express from 'express'
import * as authController from '../controllers/authentication'
import { validatePostLogin, validatePostSignup } from '../validators/authentication'

export const authRoutes = express.Router()

authRoutes.get('/login', authController.getLogin)

authRoutes.post('/login', validatePostLogin, authController.postLogin)

authRoutes.post('/logout', authController.postLogout)

authRoutes.get('/signup', authController.getSignup)

authRoutes.post('/signup', validatePostSignup, authController.postSignup)

authRoutes.get('/reset-password', authController.getResetPassword)

authRoutes.post('/reset-password', authController.postResetPassword)

authRoutes.get('/reset-password/:resetPasswordToken', authController.getNewPassword)

authRoutes.post('/new-password', authController.postNewPassword)
