-- CreateTable
CREATE TABLE "operation_logs" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "operator_type" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operation_logs_table_name_record_id_idx" ON "operation_logs"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "operation_logs_operator_name_idx" ON "operation_logs"("operator_name");

-- CreateIndex
CREATE INDEX "operation_logs_created_at_idx" ON "operation_logs"("created_at");
