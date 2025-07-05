# 排课系统

一个专为教师设计的智能排课管理系统，支持学生管理、课程安排和课表生成。



## 功能特色

### 🎯 核心功能
- **学生管理** - 完整的学生信息管理，包括姓名、手机号、年级和教室
- **教师管理** - 教师信息管理，包括联系方式和主要科目
- **排课管理** - 智能排课系统，自动检测时间冲突
- **课表生成** - 支持学生和教师课表查看
- **数据导出** - 支持 Excel 和图片格式导出

### 🔍 智能冲突检测
系统会自动检测以下冲突：
- **学生时间冲突** - 确保同一学生不会在重叠时间段有多个课程
- **教师时间冲突** - 确保同一教师不会在重叠时间段有多个课程
- **教室使用冲突** - 确保同一教室不会在重叠时间段被多次占用

### 📊 课表功能
- **HTML 格式显示** - 清晰的网格式课表布局
- **Excel 导出** - 支持导出为 Excel 文件
- **图片导出** - 支持导出为 PNG 图片格式
- **详细信息** - 包含科目、教师、教室、时间等完整信息

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **UI 组件**: Tailwind CSS, Radix UI, Shadcn/ui
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **导出功能**: xlsx, html2canvas

## 快速开始

### 环境要求
- Node.js 18+
- pnpm (推荐) 或 npm

### 安装步骤

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **配置环境变量**

   确保 `.env` 文件包含正确的 Supabase 连接信息：
   ```env
   DATABASE_URL="your-supabase-connection-string"
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   ```

3. **数据库迁移**
   ```bash
   npm run db:migrate
   ```

4. **生成 Prisma 客户端**
   ```bash
   npm run db:generate
   ```

5. **创建示例数据**
   ```bash
   npm run db:seed
   ```

6. **启动开发服务器**
   ```bash
   npm run dev
   ```

7. **访问应用**

   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 使用指南

### 1. 学生管理
- 添加学生信息（姓名、手机号、年级、教室）
- 系统会自动检查姓名+手机号的唯一性
- 支持搜索和编辑学生信息

### 2. 教师管理
- 添加教师信息（姓名、联系方式、主要科目）
- 支持搜索和编辑教师信息

### 3. 排课管理
- 选择学生、教师、科目、教室
- 设置上课时间（星期几、开始时间、结束时间）
- 系统自动检测并提示冲突
- 支持添加备注信息

### 4. 课表查看
- **学生课表**: 选择学生查看其个人课表
- **教师课表**: 选择教师查看其授课安排
- 支持导出为 Excel 和图片格式

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 数据库迁移
npm run db:migrate

# 生成 Prisma 客户端
npm run db:generate

# 创建示例数据
npm run db:seed

# 代码检查
npm run lint
```

## 系统截图

访问 [http://localhost:3000](http://localhost:3000) 查看完整的排课系统界面。

---

**排课系统** - 让教学管理更简单高效！
