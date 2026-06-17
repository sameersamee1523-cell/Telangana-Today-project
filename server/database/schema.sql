-- ============================================================
-- Reporter Assignment & Story Pipeline Manager - Database Schema
-- Telangana Today Newspaper
-- ============================================================

CREATE DATABASE IF NOT EXISTS pipeline_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pipeline_db;

-- ============================================================
-- TABLE: departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280' COMMENT 'Hex color code for UI display',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','chief_editor','editor','reporter') NOT NULL DEFAULT 'reporter',
  department_id INT UNSIGNED,
  avatar VARCHAR(500),
  phone VARCHAR(20),
  bio TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_department (department_id),
  INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: stories
-- ============================================================
CREATE TABLE IF NOT EXISTS stories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category_id INT UNSIGNED,
  location VARCHAR(255),
  reporter_id INT UNSIGNED,
  editor_id INT UNSIGNED,
  priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  deadline DATETIME,
  status ENUM('draft','assigned','in_progress','submitted','under_review','approved','published','rejected') NOT NULL DEFAULT 'draft',
  tags JSON,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_stories_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_stories_editor FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_stories_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_stories_status (status),
  INDEX idx_stories_priority (priority),
  INDEX idx_stories_reporter (reporter_id),
  INDEX idx_stories_editor (editor_id),
  INDEX idx_stories_category (category_id),
  INDEX idx_stories_deadline (deadline),
  INDEX idx_stories_created_at (created_at),
  FULLTEXT INDEX ft_stories_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: story_updates (status change history / comments)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_updates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  story_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_story_updates_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_story_updates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_story_updates_story (story_id),
  INDEX idx_story_updates_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: story_attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS story_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  story_id INT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  filepath VARCHAR(1000) NOT NULL,
  filesize INT UNSIGNED NOT NULL DEFAULT 0,
  mimetype VARCHAR(100) NOT NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_story_attachments_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_story_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_story_attachments_story (story_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(100) NOT NULL COMMENT 'e.g. story_assigned, status_changed, deadline_warning',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  story_id INT UNSIGNED,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_is_read (is_read),
  INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('daily','weekly','monthly','custom') NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSON NOT NULL,
  generated_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_reports_type (type),
  INDEX idx_reports_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED,
  action VARCHAR(100) NOT NULL COMMENT 'e.g. CREATE_STORY, UPDATE_STATUS, DELETE_USER',
  entity_type VARCHAR(100) NOT NULL COMMENT 'e.g. story, user, category',
  entity_id INT UNSIGNED,
  details JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_audit_logs_user (user_id),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_entity (entity_type, entity_id),
  INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
