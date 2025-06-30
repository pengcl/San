/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // 移动端优先的屏幕断点
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      // 设备特定断点
      mobile: { max: '767px' },
      tablet: { min: '768px', max: '1023px' },
      desktop: { min: '1024px' },
      // 横屏检测
      landscape: { raw: '(orientation: landscape)' },
      portrait: { raw: '(orientation: portrait)' },
      // 高分辨率屏幕
      retina: {
        raw: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        game: {
          // 三国主题色彩
          gold: '#ffd700',
          silver: '#c0c0c0',
          bronze: '#cd7f32',

          // 品质颜色
          legendary: '#ff6b35', // 传奇橙
          epic: '#9c27b0', // 史诗紫
          rare: '#2196f3', // 稀有蓝
          common: '#4caf50', // 普通绿

          // 阵营颜色
          shu: '#dc2626', // 蜀国红
          wei: '#2563eb', // 魏国蓝
          wu: '#16a34a', // 吴国绿
          han: '#f59e0b', // 汉朝黄

          // 特殊效果色
          fire: '#ef4444', // 火属性
          water: '#3b82f6', // 水属性
          earth: '#a3a3a3', // 土属性
          wood: '#22c55e', // 木属性
          metal: '#f97316', // 金属性
        },

        // 深度背景色
        dark: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          300: '#52525b',
          400: '#71717a',
          500: '#a1a1aa',
          600: '#d4d4d8',
          700: '#e4e4e7',
          800: '#f4f4f5',
          900: '#fafafa',
        },
      },

      // 游戏化渐变
      backgroundImage: {
        'game-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'hero-gradient': 'linear-gradient(45deg, #ff6b35 0%, #f7931e 100%)',
        'shu-gradient': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        'wei-gradient': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        'wu-gradient': 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        'legendary-gradient':
          'linear-gradient(45deg, #ff6b35, #f7931e, #ff6b35)',
        'epic-gradient': 'linear-gradient(45deg, #9c27b0, #673ab7, #9c27b0)',
        'rare-gradient': 'linear-gradient(45deg, #2196f3, #1976d2, #2196f3)',
      },

      // 阴影效果
      boxShadow: {
        game: '0 4px 14px 0 rgba(255, 107, 53, 0.3)',
        hero: '0 10px 40px rgba(255, 107, 53, 0.2)',
        legendary: '0 0 30px rgba(255, 107, 53, 0.6)',
        epic: '0 0 30px rgba(156, 39, 176, 0.6)',
        rare: '0 0 30px rgba(33, 150, 243, 0.6)',
        glow: '0 0 20px rgba(255, 255, 255, 0.1)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
      },

      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'legendary-glow': 'legendaryGlow 3s ease-in-out infinite',
        'epic-glow': 'epicGlow 3s ease-in-out infinite',
        'rare-glow': 'rareGlow 3s ease-in-out infinite',
      },

      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '70%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0)' },
        },
        legendaryGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)' },
          '50%': { boxShadow: '0 0 50px rgba(255, 107, 53, 0.9)' },
        },
        epicGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(156, 39, 176, 0.6)' },
          '50%': { boxShadow: '0 0 50px rgba(156, 39, 176, 0.9)' },
        },
        rareGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(33, 150, 243, 0.6)' },
          '50%': { boxShadow: '0 0 50px rgba(33, 150, 243, 0.9)' },
        },
      },

      fontFamily: {
        game: ['Cinzel', 'serif'],
        ui: ['Inter', 'sans-serif'],
      },

      // 边框
      borderWidth: {
        3: '3px',
      },

      // 移动端优化的间距
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      // 移动端友好的尺寸
      minHeight: {
        'screen-safe':
          'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        touch: '44px', // iOS 推荐的最小触摸区域
      },

      minWidth: {
        touch: '44px',
      },

      // 移动端手势动画
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'legendary-glow': 'legendaryGlow 3s ease-in-out infinite',
        'epic-glow': 'epicGlow 3s ease-in-out infinite',
        'rare-glow': 'rareGlow 3s ease-in-out infinite',
        'touch-feedback': 'touchFeedback 0.1s ease-out',
        'swipe-left': 'swipeLeft 0.3s ease-out',
        'swipe-right': 'swipeRight 0.3s ease-out',
      },

      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '70%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0)' },
        },
        legendaryGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)' },
          '50%': { boxShadow: '0 0 50px rgba(255, 107, 53, 0.9)' },
        },
        epicGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(156, 39, 176, 0.6)' },
          '50%': { boxShadow: '0 0 50px rgba(156, 39, 176, 0.9)' },
        },
        rareGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(33, 150, 243, 0.6)' },
          '50%': { boxShadow: '0 0 50px rgba(33, 150, 243, 0.9)' },
        },
        touchFeedback: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        swipeRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },

      fontFamily: {
        game: ['Cinzel', 'serif'],
        ui: ['Inter', 'sans-serif'],
      },

      // 移动端适配的字体大小
      fontSize: {
        xxs: ['0.625rem', { lineHeight: '0.75rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};
