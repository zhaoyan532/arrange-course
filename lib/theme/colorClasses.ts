// 颜色类名工具 - 动态生成CSS类名
// 这个文件提供了一套完整的方法来动态应用主题颜色

import { colorTheme, tailwindColors } from './colors'

export class ColorClasses {
  // 获取主要按钮的类名
  static getPrimaryButtonClasses(): string {
    return `${tailwindColors.gradients.primary} ${tailwindColors.gradients.primaryHover} text-white font-medium transition-all duration-300`
  }

  // 获取次要按钮的类名 (橙色重购按钮)
  static getSecondaryButtonClasses(): string {
    return `${tailwindColors.gradients.secondary} ${tailwindColors.gradients.secondaryHover} text-white font-medium transition-all duration-300`
  }

  // 获取灰色按钮的类名 (取消订阅等)
  static getGrayButtonClasses(): string {
    return `${tailwindColors.gradients.gray} ${tailwindColors.gradients.grayHover} text-white font-medium transition-all duration-300`
  }

  // 获取文字渐变类名
  static getTextGradientClasses(): string {
    return tailwindColors.gradients.text
  }

  // 获取卡片背景类名
  static getCardClasses(): string {
    return 'bg-white border-none shadow-lg hover:shadow-xl transition-shadow'
  }

  // 获取输入框类名
  static getInputClasses(): string {
    return `bg-gray-50 border-gray-100 focus:border-pink-200 focus:ring focus:ring-pink-100 rounded-xl transition-all duration-200`
  }

  // 获取产品特征标签类名
  static getProductFeatureClasses(): string {
    return `${tailwindColors.primary.bg[100]} ${tailwindColors.primary.text[700]} px-2 py-1 rounded-full text-xs font-medium`
  }

  // 获取成功状态类名
  static getSuccessClasses(): string {
    return `${tailwindColors.success.bg[50]} ${tailwindColors.success.text[800]} border border-green-200 rounded-lg`
  }

  // 获取错误状态类名
  static getErrorClasses(): string {
    return 'bg-red-50 text-red-800 border border-red-200 rounded-lg'
  }

  // 获取警告状态类名
  static getWarningClasses(): string {
    return `${tailwindColors.warning.bg[100]} ${tailwindColors.warning.text[600]} border border-orange-200 rounded-lg`
  }

  // 根据分类获取颜色类名
  static getCategoryClasses(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'Skincare': `${tailwindColors.success.bg[100]} ${tailwindColors.success.text[700]}`,
      'Makeup': `${tailwindColors.primary.bg[100]} ${tailwindColors.primary.text[700]}`,
      'Haircare': `${tailwindColors.secondary.bg[100]} ${tailwindColors.secondary.text[700]}`,
      'Tools': `${tailwindColors.warning.bg[100]} ${tailwindColors.warning.text[600]}`,
      'Special': `${tailwindColors.neutral.bg[100]} ${tailwindColors.neutral.text[700]}`,
    }
    return categoryMap[category] || `${tailwindColors.neutral.bg[100]} ${tailwindColors.neutral.text[700]}`
  }

  // 获取评分星星颜色
  static getStarClasses(filled: boolean = true): string {
    return filled ? 'text-yellow-400' : 'text-gray-300'
  }

  // 获取复选框类名
  static getCheckboxClasses(): string {
    return `border-gray-200 ${tailwindColors.primary.text[500]} rounded-sm data-[state=checked]:${tailwindColors.gradients.primary}`
  }

  // 获取链接类名
  static getLinkClasses(): string {
    return `text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200`
  }

  // 获取页脚类名
  static getFooterClasses(): string {
    return `bg-slate-50 border-t border-slate-200 ${tailwindColors.neutral.text[500]}`
  }

  // 获取导航栏类名
  static getNavClasses(): string {
    return 'backdrop-blur-md bg-white/80 border-b border-white/20'
  }

  // 获取加载动画类名
  static getLoadingClasses(): string {
    return `border-2 ${tailwindColors.primary.text[500]} border-t-transparent rounded-full animate-spin`
  }

  // 获取性别偏好选项的颜色
  static getGenderOptionClasses(option: string): string {
    const optionMap: { [key: string]: string } = {
      'Female': 'bg-pink-400',
      'Male': 'bg-blue-400', 
      'Unisex': 'bg-gradient-to-r from-pink-400 to-blue-400',
      'All': 'bg-gradient-to-r from-purple-400 to-green-400'
    }
    return optionMap[option] || 'bg-gray-400'
  }

  // 获取特征图标背景色
  static getFeatureIconClasses(feature: string): string {
    const featureMap: { [key: string]: string } = {
      'hairColor': tailwindColors.primary.bg[100],
      'hairStyle': tailwindColors.secondary.bg[100],
      'faceShape': tailwindColors.warning.bg[100],
      'skinTone': tailwindColors.success.bg[100],
      'eyeColor': tailwindColors.primary.bg[100],
      'age': tailwindColors.neutral.bg[100],
      'gender': tailwindColors.secondary.bg[100],
    }
    return featureMap[feature] || tailwindColors.neutral.bg[100]
  }
}

// 动态样式生成器 - 用于需要内联样式的场景
export class DynamicStyles {
  // 获取主要按钮的内联样式
  static getPrimaryButtonStyle(): React.CSSProperties {
    return {
      background: colorTheme.gradients.primary,
      color: 'white',
      border: 'none',
      transition: 'all 0.3s ease',
    }
  }

  // 获取主要按钮悬停样式
  static getPrimaryButtonHoverStyle(): React.CSSProperties {
    return {
      background: `linear-gradient(135deg, ${colorTheme.primary[600]} 0%, ${colorTheme.secondary[700]} 100%)`,
    }
  }

  // 获取次要按钮的内联样式
  static getSecondaryButtonStyle(): React.CSSProperties {
    return {
      background: colorTheme.gradients.secondary,
      color: 'white',
      border: 'none',
      transition: 'all 0.3s ease',
    }
  }

  // 获取文字渐变样式
  static getTextGradientStyle(): React.CSSProperties {
    return {
      background: colorTheme.gradients.text,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      fontWeight: 'bold',
    }
  }

  // 获取分类标签样式
  static getCategoryStyle(category: string): React.CSSProperties {
    const colors = {
      'Skincare': { background: colorTheme.success[100], color: colorTheme.success[700] },
      'Makeup': { background: colorTheme.primary[100], color: colorTheme.primary[700] },
      'Haircare': { background: colorTheme.secondary[100], color: colorTheme.secondary[700] },
      'Tools': { background: colorTheme.warning[100], color: colorTheme.warning[700] },
      'Special': { background: colorTheme.neutral[100], color: colorTheme.neutral[700] },
    }
    return colors[category as keyof typeof colors] || { background: colorTheme.neutral[100], color: colorTheme.neutral[700] }
  }

  // 获取性别选项圆点样式
  static getGenderDotStyle(option: string): React.CSSProperties {
    const dotStyles: { [key: string]: React.CSSProperties } = {
      'Female': { backgroundColor: colorTheme.primary[400] },
      'Male': { backgroundColor: '#60a5fa' }, // blue-400
      'Unisex': { background: 'linear-gradient(to right, #f472b6, #60a5fa)' },
      'All': { background: 'linear-gradient(to right, #c084fc, #4ade80)' }
    }
    return dotStyles[option] || { backgroundColor: colorTheme.neutral[400] }
  }
}

// 颜色常量 - 用于直接引用
export const colorConstants = {
  // 主要颜色
  PRIMARY: colorTheme.primary[500],
  SECONDARY: colorTheme.secondary[600],
  
  // 功能颜色
  SUCCESS: colorTheme.success[500],
  ERROR: colorTheme.error[500],
  WARNING: colorTheme.warning[500],
  
  // 中性颜色
  TEXT_PRIMARY: colorTheme.neutral[800],
  TEXT_SECONDARY: colorTheme.neutral[600],
  TEXT_MUTED: colorTheme.neutral[400],
  
  // 背景颜色
  BG_PRIMARY: colorTheme.background.primary,
  BG_SECONDARY: colorTheme.background.secondary,
  BG_TERTIARY: colorTheme.background.tertiary,
  
  // 边框颜色
  BORDER_LIGHT: colorTheme.neutral[200],
  BORDER_MEDIUM: colorTheme.neutral[300],
  
  // 渐变
  GRADIENT_PRIMARY: colorTheme.gradients.primary,
  GRADIENT_SECONDARY: colorTheme.gradients.secondary,
  GRADIENT_TEXT: colorTheme.gradients.text,
}

export default ColorClasses 
 