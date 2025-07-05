// 不同配色方案示例
// 客户可以选择预设的配色方案或创建自定义方案

// 默认配色方案 (当前的粉紫主题)
export const defaultTheme = {
  name: 'Beauty Pink',
  description: '温暖的粉紫色调，适合美妆品牌',
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  }
}

// 蓝色专业主题
export const blueTheme = {
  name: 'Professional Blue',
  description: '专业的蓝色调，适合医美和护肤品牌',
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  }
}

// 绿色自然主题
export const greenTheme = {
  name: 'Natural Green',
  description: '清新的绿色调，适合天然有机品牌',
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  secondary: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#365314',
    900: '#1a2e05',
  }
}

// 紫色奢华主题
export const purpleTheme = {
  name: 'Luxury Purple',
  description: '奢华的紫色调，适合高端美妆品牌',
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  }
}

// 橙色活力主题
export const orangeTheme = {
  name: 'Vibrant Orange',
  description: '活力的橙色调，适合年轻时尚品牌',
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
  secondary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  }
}

// 红色热情主题
export const redTheme = {
  name: 'Passionate Red',
  description: '热情的红色调，适合彩妆和口红品牌',
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  secondary: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  }
}

// 灰色简约主题
export const grayTheme = {
  name: 'Minimalist Gray',
  description: '简约的灰色调，适合极简风格品牌',
  primary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
}

// 导出所有主题
export const colorSchemes = {
  default: defaultTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
  orange: orangeTheme,
  red: redTheme,
  gray: grayTheme,
}

// 主题应用函数
export const applyTheme = (themeName: keyof typeof colorSchemes) => {
  const theme = colorSchemes[themeName]
  if (!theme) {
    console.error(`Theme "${themeName}" not found`)
    return
  }
  
  // 这里可以实现主题切换逻辑
  // 例如更新CSS变量或重新导入配置
  console.log(`Applying theme: ${theme.name}`)
  return theme
}

// 获取主题预览色板
export const getThemePreview = (themeName: keyof typeof colorSchemes) => {
  const theme = colorSchemes[themeName]
  if (!theme) return null
  
  return {
    name: theme.name,
    description: theme.description,
    colors: [
      theme.primary[500],
      theme.primary[600],
      theme.secondary[500],
      theme.secondary[600],
    ]
  }
}

// 自定义主题创建器
export const createCustomTheme = (
  name: string,
  description: string,
  primaryColor: string,
  secondaryColor: string
) => {
  // 这里可以实现基于基础色生成完整色阶的逻辑
  // 目前返回一个简化版本
  return {
    name,
    description,
    primary: {
      500: primaryColor,
      600: adjustColor(primaryColor, -20), // 稍微深一点
    },
    secondary: {
      500: secondaryColor,
      600: adjustColor(secondaryColor, -20),
    }
  }
}

// 颜色调整辅助函数
function adjustColor(color: string, amount: number): string {
  // 简化的颜色调整函数
  // 实际应用中可以使用更复杂的颜色处理库
  return color // 暂时返回原色
}

export default colorSchemes 
 