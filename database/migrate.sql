-- Add employee_id column if not exists
SET @exist_emp := (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'pipeline_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'employee_id'
);
SET @sql_emp := IF(@exist_emp = 0, 
  'ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) UNIQUE AFTER id', 
  'SELECT 1'
);
PREPARE stmt FROM @sql_emp; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add failed_login_attempts column if not exists
SET @exist_fla := (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'pipeline_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'failed_login_attempts'
);
SET @sql_fla := IF(@exist_fla = 0, 
  'ALTER TABLE users ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0 AFTER is_active', 
  'SELECT 1'
);
PREPARE stmt FROM @sql_fla; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add lock_until column if not exists
SET @exist_lu := (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'pipeline_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'lock_until'
);
SET @sql_lu := IF(@exist_lu = 0, 
  'ALTER TABLE users ADD COLUMN lock_until TIMESTAMP NULL AFTER failed_login_attempts', 
  'SELECT 1'
);
PREPARE stmt FROM @sql_lu; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Update role enum to include photographer
ALTER TABLE users MODIFY COLUMN role ENUM('admin','chief_editor','editor','reporter','photographer') NOT NULL DEFAULT 'reporter';

-- Add index on employee_id if not exists
SELECT COUNT(*) INTO @idx_count FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'pipeline_db' AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_employee_id';
SET @sql_idx := IF(@idx_count = 0,
  'ALTER TABLE users ADD INDEX idx_users_employee_id (employee_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql_idx; EXECUTE stmt; DEALLOCATE PREPARE stmt;
