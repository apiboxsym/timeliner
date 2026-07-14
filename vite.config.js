import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function resolveBase() {
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY) {
    const [, repo] = process.env.GITHUB_REPOSITORY.split('/')
    return repo ? `/${repo}/` : '/'
  }

  if (process.env.CI && process.env.CI_PROJECT_NAME) {
    return `/${process.env.CI_PROJECT_NAME}/`
  }

  return '/'
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
})
