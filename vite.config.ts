import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            // keep the 3D stack in its own chunks, loaded only for the arcade
            manualChunks(id) {
              // Vite's preload helper must not end up inside the 3D chunk
              if (id.includes('vite/preload-helper')) return 'react'
              if (!id.includes('node_modules')) return
              if (id.includes('/three/') || id.includes('three-stdlib') || id.includes('troika')) return 'three'
              if (id.includes('@react-three') || id.includes('postprocessing') || id.includes('maath')) return 'r3f'
              if (/\/(react|react-dom|scheduler|zustand|use-sync-external-store)\//.test(id)) return 'react'
            },
          },
        },
  },
}))
