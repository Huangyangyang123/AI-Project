import { defineConfig } from 'vite'
import { resolve } from 'path'
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
          hack:`true; @import '@/styles/vars.less'`,
          'root-entry-name':'default'
        }
      }
    }
  },
  server:{
    open:true,
    proxy:{
      '/api':{
        // target:'http://120.26.248.174:8000',
        target: 'http://120.26.248.174:8004',
        changeOrigin:true,
        secure:false,
        // rewrite:(path)=>path.replace(/^\/api/,'')
      }

      // '/api/uds':{
      //   target:'120.26.248.174:8000',
      //   changeOrigin:true,
      //   rewrite:(path)=>path.replace(/^\/api\/uds/,'')
      // },
    },

  },
  resolve:{
    alias:{
      '@':resolve(__dirname,'./src')
    }
  },
  build:{
    rollupOptions:{
      output:{
        manualChunks:{
          react:['react','react-dom','react-router-dom'],
          antd:['antd','@ant-design/icons'],
          mobx:['mobx','mobx-react-lite']
        }
      }
    },
    target:['edge90','chrome90','firefox90','safari15']
  }
})
