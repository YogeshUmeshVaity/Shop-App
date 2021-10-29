import { NextFunction, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { UserModel } from '../models/User'

const handleErrorsForPostSignup = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const { name, email, password, confirmPassword } = request.body
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return response.status(422).render('authentication/signup', {
            pageTitle: 'Signup',
            routePath: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { name, email, password, confirmPassword },
            validationErrors: errors.array()
        })
    }
    next()
}

export const validatePostSignup = [
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
        }),
    // Normalize only if email, otherwise, if the user enters nothing, the @ symbol is returned to the form.
    body('email').if(body('email').isEmail()).normalizeEmail(),
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
    handleErrorsForPostSignup
]
