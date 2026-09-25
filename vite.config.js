import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Il build produce un unico dist/index.html con JS e CSS inline:
// si apre con doppio click, senza alcun server.
export default defineConfig({
  base: './',
  plugins: [vue(), viteSingleFile()],
})
