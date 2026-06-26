/**
 * Analytics Controller
 * Reporting and performance metrics for the newsroom
 * Telangana Today - Pipeline Server
 */

const pool = require('../config/db');

// ---------------------------------------------------------------
// GET /api/analytics/reporter-performance
// Story counts per reporter, grouped by status
// ---------------------------------------------------------------
const getReporterPerformance = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.avatar,
         COUNT(s.id)                                              AS total,
         SUM(s.status = 'published')                             AS published,
         SUM(s.status = 'in_progress')                           AS in_progress,
         SUM(s.status = 'submitted')                             AS submitted,
         SUM(s.status = 'under_review')                          AS under_review,
         SUM(s.status = 'approved')                              AS approved,
         SUM(s.status = 'rejected')                              AS rejected,
         SUM(s.status = 'assigned')                              AS assigned,
         SUM(s.status = 'draft')                                 AS draft,
         ROUND(SUM(s.status = 'published') / COUNT(s.id) * 100, 1) AS completion_rate
       FROM users u
       LEFT JOIN stories s ON s.reporter_id = u.id
       WHERE u.role = 'reporter' AND u.is_active = 1
       GROUP BY u.id, u.name, u.email, u.avatar
       ORDER BY total DESC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/analytics/completion-rate
// % of published vs total stories per month (last 12 months)
// ---------------------------------------------------------------
const getCompletionRate = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(s.created_at, '%Y-%m')        AS month,
         COUNT(*)                                   AS total,
         SUM(s.status = 'published')                AS published,
         ROUND(SUM(s.status = 'published') / COUNT(*) * 100, 1) AS completion_rate
       FROM stories s
       WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month
       ORDER BY month ASC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/analytics/deadline-compliance
// % of stories submitted before deadline per reporter
// ---------------------------------------------------------------
const getDeadlineCompliance = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.id, u.name,
         COUNT(s.id)                              AS total_with_deadline,
         SUM(
           s.deadline IS NOT NULL AND
           s.status IN ('submitted','under_review','approved','published') AND
           s.updated_at <= s.deadline
         )                                        AS on_time,
         ROUND(
           SUM(
             s.deadline IS NOT NULL AND
             s.status IN ('submitted','under_review','approved','published') AND
             s.updated_at <= s.deadline
           ) / NULLIF(COUNT(s.id), 0) * 100, 1
         )                                        AS compliance_rate
       FROM users u
       JOIN stories s ON s.reporter_id = u.id AND s.deadline IS NOT NULL
       WHERE u.role = 'reporter' AND u.is_active = 1
       GROUP BY u.id, u.name
       ORDER BY compliance_rate DESC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/analytics/category-wise
// Story count grouped by category
// ---------------------------------------------------------------
const getCategoryWise = async (req, res, next) => {
  try {
    const isReporter = req.user.role === 'reporter';
    const reporterFilter = isReporter ? 'AND s.reporter_id = ?' : '';
    const reporterParam  = isReporter ? [req.user.id] : [];

    const [rows] = await pool.query(
      `SELECT
         c.id, c.name AS category, c.color,
         COUNT(s.id)                         AS count,
         SUM(s.status = 'published')         AS published,
         SUM(s.status = 'in_progress')       AS in_progress,
         SUM(s.status = 'draft')             AS draft,
         SUM(s.status = 'rejected')          AS rejected
       FROM categories c
       LEFT JOIN stories s ON s.category_id = c.id ${reporterFilter}
       GROUP BY c.id
       ORDER BY count DESC`,
       reporterParam
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/analytics/monthly-productivity
// Stories created per month for the last 12 months
// ---------------------------------------------------------------
const getMonthlyProductivity = async (req, res, next) => {
  try {
    const isReporter = req.user.role === 'reporter';
    const reporterFilter = isReporter ? 'AND reporter_id = ?' : '';
    const reporterParam  = isReporter ? [req.user.id] : [];

    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(created_at, '%Y-%m')  AS month,
         DATE_FORMAT(created_at, '%b %Y')  AS month_label,
         COUNT(*)                          AS count,
         SUM(status = 'published')         AS published,
         SUM(status = 'rejected')          AS rejected,
         SUM(status = 'in_progress')       AS in_progress
       FROM stories
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         ${reporterFilter}
       GROUP BY month, month_label
       ORDER BY month ASC`,
       reporterParam
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/analytics/dashboard-stats
// Summary stats for the main dashboard
// ---------------------------------------------------------------
const getDashboardStats = async (req, res, next) => {
  try {
    // Adjust query scope for reporters (only their own stories)
    const isReporter = req.user.role === 'reporter';
    const reporterFilter = isReporter ? 'AND s.reporter_id = ?' : '';
    const reporterParam  = isReporter ? [req.user.id] : [];

    // Total stories count
    const [[storyStats]] = await pool.query(
      `SELECT
         COUNT(*)                              AS total_stories,
         SUM(status = 'published')             AS published,
         SUM(status = 'in_progress')           AS in_progress,
         SUM(status IN ('submitted','under_review')) AS pending_review,
         SUM(status = 'rejected')              AS rejected,
         SUM(status = 'draft')                 AS draft,
         SUM(status = 'assigned')              AS assigned
       FROM stories s WHERE 1=1 ${reporterFilter}`,
      reporterParam
    );

    // Active reporters count (not filtered by reporter role)
    const [[{ active_reporters }]] = await pool.query(
      `SELECT COUNT(*) AS active_reporters
       FROM users
       WHERE role = 'reporter' AND is_active = 1`
    );

    // Priority breakdown
    const [priorityBreakdown] = await pool.query(
      `SELECT priority, COUNT(*) AS count
       FROM stories s
       WHERE status NOT IN ('published','rejected') ${reporterFilter}
       GROUP BY priority`,
      reporterParam
    );

    // Recent activity (last 10 story updates)
    const [recentActivity] = await pool.query(
      `SELECT su.id, su.old_status, su.new_status, su.comment, su.created_at,
              s.title AS story_title, s.id AS story_id,
              u.name AS user_name, u.role AS user_role, u.avatar AS user_avatar
       FROM story_updates su
       JOIN stories s ON su.story_id = s.id
       JOIN users u   ON su.user_id  = u.id
       ORDER BY su.created_at DESC
       LIMIT 10`
    );

    // Stories by deadline urgency (due within 24h, not yet published)
    const [overdueStories] = await pool.query(
      `SELECT s.id, s.title, s.priority, s.deadline, u.name AS reporter_name
       FROM stories s
       LEFT JOIN users u ON s.reporter_id = u.id
       WHERE s.deadline IS NOT NULL
         AND s.deadline <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
         AND s.status NOT IN ('published','rejected','approved')
         ${reporterFilter}`,
      reporterParam
    );

    return res.status(200).json({
      success: true,
      data: {
        storyStats,
        active_reporters,
        overdueStories,
        priorityBreakdown,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReporterPerformance,
  getCompletionRate,
  getDeadlineCompliance,
  getCategoryWise,
  getMonthlyProductivity,
  getDashboardStats
};
