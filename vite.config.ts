import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig(({ mode }) => {
  const plugins = [react(), tailwindcss()]
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_'])
  const define: Record<string, string> = {}
  for (const [k,v] of Object.entries(env)) define[`process.env.${k}`] = JSON.stringify(v)
  return { plugins, envPrefix: ['VITE_', 'NEXT_PUBLIC_'], define }
})
