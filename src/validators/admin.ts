import { body } from 'express-validator'

const MIN_CHARS = 8
const MAX_CHARS = 400

export const addOREditProduct = [
    body('title', 'Title needs to be a text and minimum 3 characters long.')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('imageUrl', 'Please enter a valid URL.').isURL(),
    body('price', 'Price needs to be a number.').isFloat(),
    body(
        'description',
        `Description needs to be minimum ${MIN_CHARS} and maximum ${MAX_CHARS} characters long`
    )
        .isLength({ min: MIN_CHARS, max: MAX_CHARS })
        .trim()
]
