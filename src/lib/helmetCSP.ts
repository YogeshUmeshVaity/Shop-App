import helmet from 'helmet'

/**
 * This middleware is defined separate from other default helmet middlewares for the stripe to
 * correctly function. Without this the checkout page for stripe does not launch when the ORDER
 * button is clicked. Make sure to set useDefaults to true to inherit other defaults from helmet.
 */
export default helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        //imgSrc: ["'self'", 'https://*.stripe.com'],
        styleSrc: ["'self'", 'fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'js.stripe.com'],
        frameSrc: ["'self'", 'js.stripe.com']
    }
})
