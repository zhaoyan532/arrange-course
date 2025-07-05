// 主题工具函数
import { colorTheme } from './colors'

// 按钮样式生成器
export const buttonStyles = {
  // 主要按钮 (粉紫渐变)
  primary: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium transition-all duration-300",
  
  // 次要按钮 (橙色，用于重购)
  secondary: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium transition-all duration-300",
  
  // 灰色按钮 (取消订阅等)
  gray: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium transition-all duration-300",
  
  // 轮廓按钮
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200",
}

// 文字样式生成器
export const textStyles = {
  // 渐变标题文字
  gradient: "bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold",
  
  // 主要文字
  primary: "text-gray-800",
  
  // 次要文字
  secondary: "text-gray-600",
  
  // 弱化文字
  muted: "text-gray-400",
  
  // 链接文字
  link: "text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200",
}

// 背景样式生成器
export const backgroundStyles = {
  // 主背景
  primary: "bg-white",
  
  // 次要背景
  secondary: "bg-gray-50",
  
  // 第三背景
  tertiary: "bg-gray-100",
  
  // 成功背景
  success: "bg-green-50",
  
  // 错误背景
  error: "bg-red-50",
  
  // 警告背景
  warning: "bg-orange-50",
}

// 边框样式生成器
export const borderStyles = {
  light: "border-gray-200",
  medium: "border-gray-300",
  primary: "border-pink-200",
  focus: "focus:border-pink-200 focus:ring focus:ring-pink-100",
}

// 卡片样式生成器
export const cardStyles = {
  default: "bg-white border-none shadow-lg hover:shadow-xl transition-shadow",
  flat: "bg-white border border-gray-200",
  elevated: "bg-white shadow-xl",
}

// 输入框样式生成器
export const inputStyles = {
  default: "bg-gray-50 border-gray-100 focus:border-pink-200 focus:ring focus:ring-pink-100 rounded-xl transition-all duration-200",
  error: "bg-red-50 border-red-200 focus:border-red-300 focus:ring focus:ring-red-100",
  success: "bg-green-50 border-green-200 focus:border-green-300 focus:ring focus:ring-green-100",
}

// 标签样式生成器
export const tagStyles = {
  // 产品特征标签
  feature: "bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium",
  
  // 分类标签
  category: {
    'Skincare': "bg-green-100 text-green-700",
    'Makeup': "bg-pink-100 text-pink-700", 
    'Haircare': "bg-purple-100 text-purple-700",
    'Tools': "bg-orange-100 text-orange-700",
    'Special': "bg-gray-100 text-gray-700",
  },
  
  // 状态标签
  status: {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-orange-100 text-orange-800",
    info: "bg-blue-100 text-blue-800",
  }
}

// 性别选项颜色生成器
export const genderColors = {
  'Female': "bg-pink-400",
  'Male': "bg-blue-400",
  'Unisex': "bg-gradient-to-r from-pink-400 to-blue-400", 
  'All': "bg-gradient-to-r from-purple-400 to-green-400"
}

// 特征图标背景色
export const featureColors = {
  'hairColor': "bg-pink-100",
  'hairStyle': "bg-purple-100",
  'faceShape': "bg-orange-100", 
  'skinTone': "bg-green-100",
  'eyeColor': "bg-pink-100",
  'age': "bg-gray-100",
  'gender': "bg-purple-100",
}

// 工具函数：根据分类获取标签样式
export const getCategoryTagClass = (category: string): string => {
  return tagStyles.category[category as keyof typeof tagStyles.category] || tagStyles.category.Special
}

// 工具函数：根据状态获取标签样式
export const getStatusTagClass = (status: keyof typeof tagStyles.status): string => {
  return tagStyles.status[status]
}

// 工具函数：根据特征获取背景色
export const getFeatureBackgroundClass = (feature: string): string => {
  return featureColors[feature as keyof typeof featureColors] || featureColors.age
}

// 工具函数：根据性别选项获取颜色
export const getGenderColorClass = (gender: string): string => {
  return genderColors[gender as keyof typeof genderColors] || "bg-gray-400"
}

// 导出所有样式
export const themeStyles = {
  button: buttonStyles,
  text: textStyles,
  background: backgroundStyles,
  border: borderStyles,
  card: cardStyles,
  input: inputStyles,
  tag: tagStyles,
}

export default themeStyles 