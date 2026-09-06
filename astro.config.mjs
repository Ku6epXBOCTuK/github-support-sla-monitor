// @ts-check
import { loadEnv } from 'vite'
import { defineConfig } from 'astro/config'

const mode = process.argv.includes('build') ? 'production' : 'development'
const env = loadEnv(mode, process.cwd(), '')

export default defineConfig({
  base: process.env.VERCEL ? '/' : (env.PUBLIC_BASE_PATH || '/'),
})
