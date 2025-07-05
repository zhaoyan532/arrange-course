/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - 先添加可选字段
ALTER TABLE "teachers" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'TEACHER';

-- 添加 username 字段（先允许为空）
ALTER TABLE "teachers" ADD COLUMN "username" TEXT;

-- 添加 password 字段（先允许为空）
ALTER TABLE "teachers" ADD COLUMN "password" TEXT;

-- 为现有教师设置默认用户名和密码
UPDATE "teachers" SET
  "username" = CASE
    WHEN "name" = '张老师' THEN 'admin'
    ELSE LOWER(REPLACE("name", '老师', ''))
  END,
  "password" = '$2b$10$LZ8qNcIWyv.c6V3L0Y13/.vhXehfKRB6uT91oQGIgUl1nfKdYcJFG', -- 默认密码 "123456" 的 bcrypt 哈希
  "role" = CASE
    WHEN "name" = '张老师' THEN 'ADMIN'
    ELSE 'TEACHER'
  END;

-- 现在将字段设为必填
ALTER TABLE "teachers" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "teachers" ALTER COLUMN "password" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "teachers_username_key" ON "teachers"("username");
