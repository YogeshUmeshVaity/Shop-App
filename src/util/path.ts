import path from 'path'

// export const rootDir = path.dirname(require.main?.filename ?? '')

export function rootDirectory(): string {
    const mainModule = require.main
    if (!mainModule) {
        throw new Error('Root directory is undefined.')
    } else {
        return path.dirname(mainModule.filename)
    }
}
