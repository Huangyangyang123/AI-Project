import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css:{
    preprocessorOptions:{
      less:{
        javascriptEnabled:true,
        math: 'parens-division',
        modifyVars:{
          // hack:`true;@import '@styles/vars.less`,
          // 'root-entry-name':'default'
        }
      }
    }
  },
  server:{
    proxy:'',

  },
  resolve:{
    alias:''
  },
  build:{

  }
})
