-- CreateIndex
CREATE INDEX "GameClockState_userId_idx" ON "GameClockState"("userId");

-- CreateIndex
CREATE INDEX "WidgetInstance_userId_idx" ON "WidgetInstance"("userId");

-- CreateIndex
CREATE INDEX "WidgetInstance_userId_type_idx" ON "WidgetInstance"("userId", "type");
