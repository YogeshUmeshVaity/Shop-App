import path from 'path'

// export const rootDir = path.dirname(require.main?.filename ?? '')

export function rootDir(): string {
    const mainModule = require.main
    if (!mainModule) {
        throw new Error('Root directory is undefined.')
    } else {
        console.log(path.dirname(mainModule.filename))
        return path.dirname(mainModule.filename)
    }
}
