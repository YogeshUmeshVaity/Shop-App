/**
 * Exception when something goes wrong with payments.
 */
export class PaymentException extends Error {
    constructor(message: string) {
        super(message)
    }
}
