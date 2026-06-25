-- ============================================================
-- Reporter Assignment & Story Pipeline Manager - Seed Data
-- Telangana Today Newspaper
-- Run AFTER schema.sql
-- ============================================================

USE pipeline_db;

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (name, description) VALUES
  ('News',     'General news coverage and breaking stories'),
  ('Sports',   'Sports reporting and athletic event coverage'),
  ('Politics', 'Political analysis, government, and policy coverage')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, color, description) VALUES
  ('Breaking News',  '#E11D48', 'Urgent and time-sensitive news stories'),
  ('Politics',       '#2563EB', 'Government, elections, and political affairs'),
  ('Sports',         '#16A34A', 'Sports events, scores, and athlete profiles'),
  ('Entertainment',  '#D97706', 'Movies, music, celebrity news, and culture'),
  ('Technology',     '#7C3AED', 'Tech news, startups, and digital innovation')
ON DUPLICATE KEY UPDATE color = VALUES(color), description = VALUES(description);

-- ============================================================
-- USERS
-- All passwords: Password@123
-- Hash: $2b$12$L8f6Aml6ymUiIPA8qTvRUuevqDq3RLMuudVXG6tkSZm4OyoKRDmAO
-- ============================================================
INSERT INTO users (name, email, password_hash, role, department_id, phone, bio, is_active) VALUES
  (
    'Admin User',
    'admin@telanganatoday.com',
    '$2b$12$L8f6Aml6ymUiIPA8qTvRUuevqDq3RLMuudVXG6tkSZm4OyoKRDmAO',
    'admin',
    1,
    '+91-9000000001',
    'System administrator for Telangana Today digital operations.',
    1
  ),
  (
    'Chief Editor',
    'chiefeditor@telanganatoday.com',
    '$2b$12$L8f6Aml6ymUiIPA8qTvRUuevqDq3RLMuudVXG6tkSZm4OyoKRDmAO',
    'chief_editor',
    1,
    '+91-9000000002',
    'Chief Editor overseeing all editorial decisions at Telangana Today.',
    1
  ),
  (
    'Senior Editor',
    'editor@telanganatoday.com',
    '$2b$12$L8f6Aml6ymUiIPA8qTvRUuevqDq3RLMuudVXG6tkSZm4OyoKRDmAO',
    'editor',
    1,
    '+91-9000000003',
    'Senior Editor managing the news desk and story assignments.',
    1
  ),
  (
    'Priya Sharma',
    'reporter1@telanganatoday.com',
    '$2b$12$L8f6Aml6ymUiIPA8qTvRUuevqDq3RLMuudVXG6tkSZm4OyoKRDmAO',
    'reporter',
    3,
    '+91-9000000004',
    'Political reporter covering Telangana state assembly and government affairs.',
    1
  ),
  (
    'Rahul Verma',
    'reporter2@telanganatoday.com',
    '$2b$12$L8f6Aml6ymUiIPA8qTvRUuevqDq3RLMuudVXG6tkSZm4OyoKRDmAO',
    'reporter',
    2,
    '+91-9000000005',
    'Sports reporter specializing in cricket, football, and IPL coverage.',
    1
  )
ON DUPLICATE KEY UPDATE
  name         = VALUES(name),
  phone        = VALUES(phone),
  bio          = VALUES(bio),
  is_active    = VALUES(is_active);

-- ============================================================
-- STORIES (10 sample stories across all statuses)
-- ============================================================
INSERT INTO stories
  (title, description, category_id, location, reporter_id, editor_id, priority, deadline, status, tags, created_by)
VALUES
  (
    'Telangana Budget 2026: Key Highlights and Allocations',
    'A comprehensive analysis of the Telangana state budget for fiscal year 2026, covering allocations to agriculture, infrastructure, and social welfare schemes.',
    2, 'Hyderabad', 4, 3, 'urgent',
    DATE_ADD(NOW(), INTERVAL 2 DAY),
    'published',
    JSON_ARRAY('budget', 'telangana', 'government', '2026'),
    2
  ),
  (
    'Hyderabad Metro Phase 3 Expansion: Routes Announced',
    'The Hyderabad Metro Rail authorities have announced the routes for the Phase 3 expansion project, connecting new areas of the city.',
    1, 'Hyderabad', 4, 3, 'high',
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    'approved',
    JSON_ARRAY('metro', 'hyderabad', 'infrastructure', 'transport'),
    3
  ),
  (
    'IPL 2026: Sunrisers Hyderabad Preview and Predictions',
    'A detailed analysis of the Sunrisers Hyderabad squad for IPL 2026, key player picks, and match predictions for the season opener.',
    3, 'Hyderabad', 5, 3, 'medium',
    DATE_ADD(NOW(), INTERVAL 3 DAY),
    'under_review',
    JSON_ARRAY('IPL', 'SRH', 'cricket', 'sports'),
    3
  ),
  (
    'KCR Meets Prime Minister: Key Agenda Points Discussed',
    'Former Telangana Chief Minister KCR held a crucial meeting with the Prime Minister in New Delhi to discuss state funds and irrigation projects.',
    2, 'New Delhi', 4, 3, 'high',
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    'submitted',
    JSON_ARRAY('KCR', 'politics', 'BRS', 'delhi'),
    3
  ),
  (
    'T20 World Cup 2026: India Squad Selection Analysis',
    'The BCCI announces the Indian squad for the T20 World Cup 2026. We analyze the selection, key inclusions, and notable omissions.',
    3, 'Mumbai', 5, 3, 'medium',
    DATE_ADD(NOW(), INTERVAL 5 DAY),
    'in_progress',
    JSON_ARRAY('T20WorldCup', 'India', 'BCCI', 'cricket'),
    3
  ),
  (
    'Hyderabad Startup Ecosystem: Record Funding in Q1 2026',
    'Hyderabad-based startups raised a record $2.3 billion in Q1 2026, driven by growth in fintech, healthtech, and SaaS sectors.',
    5, 'Hyderabad', 4, 3, 'medium',
    DATE_ADD(NOW(), INTERVAL 4 DAY),
    'assigned',
    JSON_ARRAY('startup', 'funding', 'hyderabad', 'tech'),
    3
  ),
  (
    'Heavy Rains Lash Telangana: Red Alert Issued in 6 Districts',
    'The Indian Meteorological Department has issued a red alert for heavy rains in six districts of Telangana. Relief teams put on standby.',
    1, 'Telangana', 5, 3, 'urgent',
    NOW(),
    'draft',
    JSON_ARRAY('rain', 'alert', 'telangana', 'weather'),
    4
  ),
  (
    'Tollywood Box Office: Prabhas Starrer Breaks Records',
    'The latest Prabhas film has shattered box office records, grossing over Rs 400 crore in its opening weekend globally.',
    4, 'Hyderabad', 5, 3, 'low',
    DATE_ADD(NOW(), INTERVAL 7 DAY),
    'rejected',
    JSON_ARRAY('tollywood', 'prabhas', 'boxoffice', 'entertainment'),
    3
  ),
  (
    'Telangana Elections 2025: Exit Poll Analysis Deep Dive',
    'An in-depth post-mortem of exit polls for the Telangana assembly elections, comparing predictions with actual results.',
    2, 'Hyderabad', 4, 3, 'high',
    DATE_ADD(NOW(), INTERVAL 2 DAY),
    'published',
    JSON_ARRAY('elections', 'telangana', 'exitpoll', 'analysis'),
    2
  ),
  (
    'TGCSB Cracks Major Cybercrime Ring in Hyderabad',
    'The Telangana Cyber Security Bureau busted a major cybercrime ring operating out of Hyderabad, arresting 15 suspects.',
    1, 'Hyderabad', 5, 3, 'urgent',
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    'in_progress',
    JSON_ARRAY('cybercrime', 'TGCSB', 'hyderabad', 'police'),
    3
  );

-- ============================================================
-- STORY UPDATES (status history)
-- ============================================================
INSERT INTO story_updates (story_id, user_id, old_status, new_status, comment) VALUES
  (1, 3, 'draft',       'assigned',     'Assigned to Priya Sharma for coverage.'),
  (1, 4, 'assigned',    'in_progress',  'Started researching the budget documents.'),
  (1, 4, 'in_progress', 'submitted',    'Draft submitted. Please review.'),
  (1, 3, 'submitted',   'under_review', 'Under editorial review.'),
  (1, 3, 'under_review','approved',     'Approved with minor edits.'),
  (1, 2, 'approved',    'published',    'Published on website and print edition.'),
  (2, 3, 'draft',       'assigned',     'Assigned to Priya for metro story.'),
  (2, 4, 'assigned',    'in_progress',  'On field, gathering details.'),
  (2, 4, 'in_progress', 'submitted',    'Story ready for review.'),
  (2, 3, 'submitted',   'under_review', 'Reviewing facts and sources.'),
  (2, 3, 'under_review','approved',     'Approved – publish tomorrow morning.'),
  (3, 3, 'draft',       'assigned',     'Assigned to Rahul for IPL preview.'),
  (3, 5, 'assigned',    'in_progress',  'Working on player statistics.'),
  (3, 5, 'in_progress', 'submitted',    'Preview article submitted.'),
  (3, 3, 'submitted',   'under_review', 'Reviewing sports data accuracy.'),
  (8, 3, 'draft',       'assigned',     'Assigned to Rahul for entertainment.'),
  (8, 5, 'assigned',    'in_progress',  'Collecting box office numbers.'),
  (8, 5, 'in_progress', 'submitted',    'Article submitted.'),
  (8, 3, 'submitted',   'rejected',     'Story angle is too promotional. Rewrite needed with editorial balance.');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, type, title, message, story_id, is_read) VALUES
  (4, 'story_assigned',   'New Story Assigned',           'You have been assigned the story: "Telangana Budget 2026".',              1, 1),
  (4, 'story_assigned',   'New Story Assigned',           'You have been assigned: "Hyderabad Metro Phase 3 Expansion".',            2, 1),
  (5, 'story_assigned',   'New Story Assigned',           'You have been assigned the story: "IPL 2026: SRH Preview".',              3, 1),
  (4, 'status_changed',   'Story Published',              'Your story "Telangana Budget 2026" has been published!',                  1, 1),
  (4, 'status_changed',   'Story Approved',               'Your story "Hyderabad Metro Phase 3" has been approved.',                 2, 0),
  (5, 'status_changed',   'Story Under Review',           'Your story "IPL 2026: SRH Preview" is now under editorial review.',       3, 0),
  (5, 'story_rejected',   'Story Rejected',               'Your story on Tollywood box office has been rejected. See comments.',     8, 0),
  (3, 'story_submitted',  'Story Submitted for Review',   'Priya Sharma submitted: "KCR Meets Prime Minister".',                    4, 0),
  (3, 'story_submitted',  'Story Submitted for Review',   'Rahul Verma submitted: "IPL 2026: SRH Preview".',                        3, 1),
  (2, 'story_approved',   'Story Ready to Publish',       '"Telangana Budget 2026" has been approved and is ready to publish.',      1, 1);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES
  (2, 'CREATE_STORY',   'story', 1, JSON_OBJECT('title', 'Telangana Budget 2026', 'status', 'draft'),          '127.0.0.1'),
  (3, 'UPDATE_STATUS',  'story', 1, JSON_OBJECT('old_status', 'draft', 'new_status', 'assigned'),              '127.0.0.1'),
  (4, 'UPDATE_STATUS',  'story', 1, JSON_OBJECT('old_status', 'assigned', 'new_status', 'in_progress'),        '192.168.1.10'),
  (4, 'UPDATE_STATUS',  'story', 1, JSON_OBJECT('old_status', 'in_progress', 'new_status', 'submitted'),       '192.168.1.10'),
  (2, 'PUBLISH_STORY',  'story', 1, JSON_OBJECT('title', 'Telangana Budget 2026', 'status', 'published'),      '127.0.0.1'),
  (3, 'CREATE_STORY',   'story', 2, JSON_OBJECT('title', 'Hyderabad Metro Phase 3', 'status', 'draft'),        '127.0.0.1'),
  (3, 'ASSIGN_STORY',   'story', 2, JSON_OBJECT('reporter_id', 4, 'reporter_name', 'Priya Sharma'),            '127.0.0.1'),
  (3, 'CREATE_STORY',   'story', 3, JSON_OBJECT('title', 'IPL 2026: SRH Preview', 'status', 'draft'),         '127.0.0.1'),
  (5, 'UPDATE_STATUS',  'story', 3, JSON_OBJECT('old_status', 'in_progress', 'new_status', 'submitted'),       '192.168.1.11'),
  (1, 'CREATE_USER',    'user',  5, JSON_OBJECT('name', 'Rahul Verma', 'role', 'reporter', 'email', 'reporter2@telanganatoday.com'), '127.0.0.1'),
  (1, 'CREATE_CATEGORY','category', 1, JSON_OBJECT('name', 'Breaking News', 'color', '#E11D48'),               '127.0.0.1'),
  (3, 'REJECT_STORY',   'story', 8, JSON_OBJECT('reason', 'Too promotional, lacks editorial balance'),          '127.0.0.1');
