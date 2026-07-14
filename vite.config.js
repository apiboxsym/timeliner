import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const gitlabPagesBase =
  process.env.CI && process.env.CI_PROJECT_NAME ? `/${process.env.CI_PROJECT_NAME}/` : '/'

export default defineConfig({
  base: gitlabPagesBase,
  plugins: [react()],
})
