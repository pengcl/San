import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA相关配置在构建时处理
  ],

  // 构建优化配置
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks: (id: string) => {
          // React 生态系统
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router')
          ) {
            return 'react-vendor';
          }

          // Redux 状态管理
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'redux-vendor';
          }

          // UI 框架
          if (id.includes('framer-motion') || id.includes('antd')) {
            return 'ui-vendor';
          }

          // 工具库
          if (id.includes('axios')) {
            return 'utils-vendor';
          }

          // 游戏页面
          if (id.includes('src/pages/')) {
            return 'pages';
          }

          // 游戏组件
          if (id.includes('src/components/')) {
            return 'components';
          }

          // 业务逻辑
          if (
            id.includes('src/store/') ||
            id.includes('src/services/') ||
            id.includes('src/utils/')
          ) {
            return 'game-logic';
          }
        },

        // 文件命名策略
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info.pop();

          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/i.test(assetInfo.name || '')) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash].${ext}`;
          }

          return `assets/[name]-[hash].${ext}`;
        },
      },
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console.log
        drop_console: true,
        // 移除debugger
        drop_debugger: true,
        // 移除未使用的代码
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
        ],
      },
      mangle: {
        // 混淆变量名
        safari10: true,
      },
    },

    // chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 资源内联阈值
    assetsInlineLimit: 4096,

    // 构建目标
    target: 'esnext',

    // 启用源码映射（生产环境可关闭）
    sourcemap: false,
  },

  // 开发服务器配置
  server: {
    port: 3000,        // 【强制】前端必须使用3000端口
    strictPort: true,  // 如果端口被占用则报错，不自动切换
    host: '0.0.0.0',
    open: true,
    cors: true,
    hmr: {
      port: 3000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // 预览服务器配置
  preview: {
    port: 3000,    // 【强制】预览也使用3000端口
    open: true,
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'framer-motion',
      'axios',
    ],
    exclude: ['@vitejs/plugin-react'],
  },

  // 解析配置
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@utils': '/src/utils',
      '@services': '/src/services',
      '@store': '/src/store',
      '@types': '/src/types',
      '@assets': '/src/assets',
    },
  },

  // 环境变量前缀
  envPrefix: 'VITE_',
});
