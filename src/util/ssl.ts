import fs from 'fs'
/**
 * To be able to use our server using https secure protocol during development, we need to create
 * our own self signed SSL certificate (server.cert file) and SSL private key (server.key file).
 *
 * These server.key file must not be committed to source control.
 * Go here for instructions on generating these files: https://flaviocopes.com/express-https-self-signed-certificate/
 *
 * After generating, the two files should be kept in the same directory as app.ts file
 */

// We use synchronous function here because we don't want to continue the execution without
// reading this file.

// Generally hosting provider configures the SSL/TLS encryption. When we need to manually configure
// the SSL, uncomment the following lines of code.

// export const sslPrivateKey = fs.readFileSync('server.key')
// export const sslCertificate = fs.readFileSync('server.cert')
