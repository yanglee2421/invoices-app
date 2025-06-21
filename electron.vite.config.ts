import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const ReactCompilerConfig = {
  target: '19' // '17' | '18' | '19'
}

type HTMLPlugin = {
  name: string
  transformIndexHtml(html: string): string
}

/**
 * @description
 * Vite plugin to remove the React DevTools script tag in production build.
 *
 *
 * This is a workaround for the issue that React DevTools script tag is not removed in production build.
 *
 *
 * Remove all empty lines in the HTML file.
 */
const htmlPlugin = (isBuild: boolean): HTMLPlugin => ({
  name: 'html-transform',
  transformIndexHtml: (html: string) => {
    if (!isBuild) {
      return html
    }
    return html
      .replace(
        /<script src="http:\/\/localhost:8097"><\/script>/,
        `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:" />`
      )
      .replace(/^\s*[\r\n]/gm, '')
  }
})

export default defineConfig((config) => ({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]]
        }
      }),
      htmlPlugin(config.command === 'build')
    ]
  }
}))
