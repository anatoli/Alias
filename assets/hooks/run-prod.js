/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

module.exports = (context) => {

    const { devmode } = context.opts.options
    if ((context.hook === 'before_run') && devmode) return

    const fs = require('fs')
    const path = require('path')
    const { spawn } = require('child_process')

    const promisify = () => {
        let promise, resolve, reject
        promise = new Promise((_resolve, _reject) => {
            resolve = _resolve
            reject = _reject
        })

        return { promise, resolve, reject }
    }

    const projectRoot = context.opts.projectRoot
    const wwwPath = path.join(projectRoot, 'www')
    const buildPath = path.join(projectRoot, 'build')

    const rmSync = (p) => {
        if (!fs.existsSync(p)) return
        if (typeof fs.rmSync === 'function') {
            fs.rmSync(p, { recursive: true, force: true })
            return
        }
        const stat = fs.lstatSync(p)
        if (stat.isDirectory()) {
            fs.readdirSync(p).forEach((name) => rmSync(path.join(p, name)))
            fs.rmdirSync(p)
        } else {
            fs.unlinkSync(p)
        }
    }

    const copyRecursiveSync = (src, dst) => {
        const stat = fs.lstatSync(src)
        if (stat.isSymbolicLink()) {
            // shouldn't happen for CRA build output, but keep behavior safe
            const real = fs.realpathSync(src)
            return copyRecursiveSync(real, dst)
        }
        if (stat.isDirectory()) {
            if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true })
            fs.readdirSync(src).forEach((name) => copyRecursiveSync(path.join(src, name), path.join(dst, name)))
            return
        }
        fs.copyFileSync(src, dst)
    }

    const appBuild = () => {

        const { promise, resolve } = promisify()
        const app = spawn('npm', ['run', 'cra:build'], {
            env: { ...process.env },
            shell: true
        })

        app.stdout.on('data', (data) => {
            console.log(data.toString())
        })

        app.stderr.on('data', (data) => {
            console.log(data.toString())
        })

        app.on('exit', code => {
            if (code === 0) {
                resolve()
            } else {
                console.log(`App build existed with ${code}`)
            }
        })

        app.on('error', (error) => {
            console.error(error)
            throw error
        })

        return promise
    }

    const buildEntries = () => fs.readdirSync(buildPath)

    const materializeWww = () => {
        // Always materialize real files (never symlinks): Cordova Android prepare
        // fails on CI with EEXIST when www contains symlinks into build/.
        rmSync(wwwPath)
        fs.mkdirSync(wwwPath, { recursive: true })

        buildEntries().forEach((entry) => {
            const targetPath = path.join(buildPath, entry)
            const dstPath = path.join(wwwPath, entry)
            copyRecursiveSync(targetPath, dstPath)
        })
    }

    const cleanupWww = () => {
        if (!fs.existsSync(wwwPath) || !fs.existsSync(buildPath)) return
        buildEntries().forEach((entry) => rmSync(path.join(wwwPath, entry)))
    }

    const build = async () => {
        await appBuild()
        materializeWww()
    }



    let didCleanup = false

    const cleanup = (sig) =>

        (code) => {

            if (didCleanup) return
            didCleanup = true

            cleanupWww()

            sig !== 'exit' && process.exit(0)
        }

    ['exit', 'SIGTERM', 'SIGINT'].forEach((sig) => {
        process.on(sig, cleanup(sig))
    })

    return build()

}