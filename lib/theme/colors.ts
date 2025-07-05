// 网站配色系统配置
// 客户可以通过修改这个文件来更换整个网站的配色方案

export const colorTheme = {
  // 主品牌色彩
  primary: {
    50: '#fdf2f8',   // 最浅的粉色背景
    100: '#fce7f3',  // 浅粉色背景
    200: '#fbcfe8',  // 中浅粉色
    300: '#f9a8d4',  // 中粉色
    400: '#f472b6',  // 深粉色
    500: '#ec4899',  // 主粉色 (主要按钮色)
    600: '#db2777',  // 深主粉色
    700: '#be185d',  // 更深粉色
    800: '#9d174d',  // 深色粉色
    900: '#831843',  // 最深粉色
  },

  // 次要品牌色彩 (紫色)
  secondary: {
    50: '#faf5ff',   // 最浅紫色
    100: '#f3e8ff',  // 浅紫色背景
    200: '#e9d5ff',  // 中浅紫色
    300: '#d8b4fe',  // 中紫色
    400: '#c084fc',  // 深紫色
    500: '#a855f7',  // 主紫色
    600: '#9333ea',  // 深主紫色 (渐变终点)
    700: '#7c3aed',  // 更深紫色
    800: '#6b21a8',  // 深色紫色
    900: '#581c87',  // 最深紫色
  },

  // 中性色彩 (灰色系)
  neutral: {
    50: '#f8fafc',   // 最浅灰色背景
    100: '#f1f5f9',  // 浅灰色背景
    200: '#e2e8f0',  // 边框色
    300: '#cbd5e1',  // 中浅灰色
    400: '#94a3b8',  // 占位符文字色
    500: '#64748b',  // 次要文字色
    600: '#475569',  // 主要文字色
    700: '#334155',  // 深色文字
    800: '#1e293b',  // 标题文字色
    900: '#0f172a',  // 最深文字色
  },

  // 功能色彩
  success: {
    50: '#f0fdf4',   // 成功背景
    100: '#dcfce7',  // 浅成功色
    500: '#22c55e',  // 主成功色
    600: '#16a34a',  // 深成功色
    700: '#15803d',  // 更深成功色
    800: '#166534',  // 深色成功色
  },

  error: {
    50: '#fef2f2',   // 错误背景
    100: '#fee2e2',  // 浅错误色
    500: '#ef4444',  // 主错误色
    600: '#dc2626',  // 深错误色
    700: '#b91c1c',  // 更深错误色
  },

  warning: {
    50: '#fffbeb',   // 警告背景
    100: '#fef3c7',  // 浅警告色
    500: '#f59e0b',  // 主警告色 (橙色按钮)
    600: '#d97706',  // 深警告色
    700: '#b45309',  // 更深警告色
  },

  // 特殊用途色彩
  background: {
    primary: '#ffffff',    // 主背景色 (白色)
    secondary: '#f8fafc',  // 次要背景色 (浅灰)
    tertiary: '#f1f5f9',   // 第三背景色 (更浅灰)
  },

  // 渐变色定义
  gradients: {
    primary: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',     // 主渐变 (粉到紫)
    primaryReverse: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', // 反向主渐变
    secondary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',   // 次要渐变 (橙色)
    text: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',        // 文字渐变
  }
}

// 常用的颜色组合和工具函数
export const colorUtils = {
  // 获取主要按钮样式
  getPrimaryButton: () => ({
    background: colorTheme.gradients.primary,
    hover: `linear-gradient(135deg, ${colorTheme.primary[600]} 0%, ${colorTheme.secondary[700]} 100%)`,
  }),

  // 获取次要按钮样式 (橙色重购按钮)
  getSecondaryButton: () => ({
    background: colorTheme.gradients.secondary,
    hover: `linear-gradient(135deg, ${colorTheme.warning[600]} 0%, ${colorTheme.warning[700]} 100%)`,
  }),

  // 获取灰色按钮样式 (取消订阅等)
  getGrayButton: () => ({
    background: `linear-gradient(135deg, ${colorTheme.neutral[500]} 0%, ${colorTheme.neutral[600]} 100%)`,
    hover: `linear-gradient(135deg, ${colorTheme.neutral[600]} 0%, ${colorTheme.neutral[700]} 100%)`,
  }),

  // 获取文字渐变样式
  getTextGradient: () => ({
    background: colorTheme.gradients.text,
    backgroundClip: 'text',
    color: 'transparent',
  }),

  // 获取特征标签颜色
  getFeatureTagColor: (feature: string) => {
    // 根据特征类型返回不同颜色
    const featureColors: { [key: string]: string } = {
      'hairColor': colorTheme.primary[100],
      'hairStyle': colorTheme.secondary[100], 
      'faceShape': colorTheme.warning[100],
      'skinTone': colorTheme.success[100],
      'eyeColor': colorTheme.primary[100],
      'age': colorTheme.neutral[100],
      'gender': colorTheme.secondary[100],
    }
    return featureColors[feature] || colorTheme.neutral[100]
  },

  // 获取产品特征标签颜色
  getProductFeatureColor: () => ({
    background: colorTheme.primary[100],
    color: colorTheme.primary[700],
  }),

  // 获取评分星星颜色
  getStarColor: () => colorTheme.warning[500], // 金黄色

  // 获取分类标签颜色
  getCategoryColors: () => ({
    'Skincare': { bg: colorTheme.success[100], text: colorTheme.success[700] },
    'Makeup': { bg: colorTheme.primary[100], text: colorTheme.primary[700] },
    'Haircare': { bg: colorTheme.secondary[100], text: colorTheme.secondary[700] },
    'Tools': { bg: colorTheme.warning[100], text: colorTheme.warning[700] },
    'Special': { bg: colorTheme.neutral[100], text: colorTheme.neutral[700] },
  }),
}

// Tailwind CSS 类名映射 (用于动态生成类名)
export const tailwindColors = {
  // 主色系 Tailwind 类名
  primary: {
    bg: {
      50: 'bg-pink-50',
      100: 'bg-pink-100', 
      200: 'bg-pink-200',
      500: 'bg-pink-500',
      600: 'bg-pink-600',
    },
    text: {
      500: 'text-pink-500',
      600: 'text-pink-600',
      700: 'text-pink-700',
    },
    border: {
      200: 'border-pink-200',
      500: 'border-pink-500',
    }
  },

  // 次要色系 Tailwind 类名
  secondary: {
    bg: {
      100: 'bg-purple-100',
      500: 'bg-purple-500',
      600: 'bg-purple-600',
    },
    text: {
      500: 'text-purple-500',
      600: 'text-purple-600',
      700: 'text-purple-700',
    }
  },

  // 中性色系 Tailwind 类名
  neutral: {
    bg: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      500: 'bg-gray-500',
    },
    text: {
      400: 'text-gray-400',
      500: 'text-gray-500',
      600: 'text-gray-600',
      700: 'text-gray-700',
      800: 'text-gray-800',
    }
  },

  // 功能色系 Tailwind 类名
  success: {
    bg: {
      50: 'bg-green-50',
      100: 'bg-green-100',
    },
    text: {
      600: 'text-green-600',
      700: 'text-green-700',
      800: 'text-green-800',
    }
  },

  warning: {
    bg: {
      100: 'bg-orange-100',
    },
    text: {
      500: 'text-orange-500',
      600: 'text-orange-600',
    }
  },

  // 渐变类名
  gradients: {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-500',
    primaryHover: 'hover:from-pink-600 hover:to-purple-600',
    secondary: 'bg-gradient-to-r from-orange-500 to-amber-500',
    secondaryHover: 'hover:from-orange-600 hover:to-amber-600',
    gray: 'bg-gradient-to-r from-gray-500 to-gray-600',
    grayHover: 'hover:from-gray-600 hover:to-gray-700',
    text: 'bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent',
  }
}

// 导出默认主题配置
export default colorTheme 