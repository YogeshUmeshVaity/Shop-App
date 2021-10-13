import express from 'express'
import * as authController from '../controllers/authentication'

export const authRoutes = express.Router()

authRoutes.get('/login', authController.getLogin)

authRoutes.post('/login', authController.postLogin)

authRoutes.post('/logout', authController.postLogout)
