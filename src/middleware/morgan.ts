import morgan, { StreamOptions } from 'morgan'
import { Logger } from '../lib/logger'

// The morgan middleware is used for logging the HTTP request information.

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
    // Use the http severity
    // The trim() is used for removing the empty line after every logged line
    write: (message) => Logger.http(message.trim())
}

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told the logger that it should print
// only messages above info in production.
const skip = () => {
    const env = process.env.NODE_ENV || 'development'
    return env !== 'development'
}

// Build the morgan middleware
export const morganMiddleware = morgan(
    // Define message format string (this is the default one).
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    ':method :url :status :res[content-length] - :response-time ms',
    // Options: in this case, I overwrote the stream and the skip logic.
    // See the methods above.
    { stream, skip }
)
