import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Newspaper, ArrowRight, CheckCircle, BarChart3, Bell, Users,
  FileText, Shield, Zap, BookOpen, Clock, AlertTriangle,
  MessageSquare, Phone, Table2, Star, ChevronRight,
  Play, TrendingUp, Globe
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
}

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
}

const FEATURES = [
  { icon: BookOpen, title: 'Story Assignment', desc: 'Assign stories to reporters with one click. Set priorities, deadlines, and categories instantly.', color: '#E11D48' },
  { icon: Zap, title: 'Kanban Workflow', desc: 'Visual pipeline boards showing every story stage from assignment to publication.', color: '#2563EB' },
  { icon: Bell, title: 'Real-time Updates', desc: 'Live notifications via Socket.io. Never miss a status change or deadline alert.', color: '#7C3AED' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Deep insights on reporter performance, story completion rates, and deadline compliance.', color: '#16A34A' },
  { icon: FileText, title: 'Report Generation', desc: 'Generate daily, weekly, monthly reports. Export to PDF or Excel with one click.', color: '#D97706' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Granular permissions for Admin, Chief Editor, Editor, and Reporter roles.', color: '#0891B2' },
]

const PROBLEMS = [
  { icon: MessageSquare, title: 'WhatsApp Chaos', desc: 'Story assignments buried in group chats. No tracking, no accountability, no history.', color: '#ef4444' },
  { icon: Table2, title: 'Excel Confusion', desc: 'Outdated spreadsheets with version conflicts. Manual status updates leading to errors.', color: '#f97316' },
  { icon: Phone, title: 'Phone Coordination', desc: 'Hours wasted on calls chasing story status. No centralized view of the newsroom pipeline.', color: '#eab308' },
]

const WORKFLOW = [
  { step: 1, label: 'Assigned', desc: 'Story assigned to reporter by editor', color: '#3b82f6' },
  { step: 2, label: 'In Progress', desc: 'Reporter actively working on the story', color: '#6366f1' },
  { step: 3, label: 'Submitted', desc: 'Reporter submits completed story', color: '#f59e0b' },
  { step: 4, label: 'Under Review', desc: 'Editor reviewing the submitted story', color: '#f97316' },
  { step: 5, label: 'Approved', desc: 'Story approved, ready for publication', color: '#14b8a6' },
  { step: 6, label: 'Published', desc: 'Story live on Telangana Today', color: '#22c55e' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Senior Reporter', quote: 'Pipeline Manager completely transformed how I manage my assignments. I always know exactly what is expected of me and when.', stars: 5 },
  { name: 'Kiran Reddy', role: 'Chief Editor', quote: 'We went from WhatsApp chaos to a professional editorial workflow in days. Story publication speed improved by 40%.', stars: 5 },
  { name: 'Suresh Kumar', role: 'News Editor', quote: 'The real-time notifications and analytics helped us identify bottlenecks we never knew existed. Exceptional tool.', stars: 5 },
]

const DASHBOARD_STATS = [
  { label: 'Total Stories', val: '248', color: '#E11D48' },
  { label: 'Published', val: '156', color: '#22c55e' },
  { label: 'In Review', val: '34', color: '#f97316' },
  { label: 'Reporters', val: '12', color: '#2563EB' },
]

const CATEGORIES = ['Breaking News', 'Politics', 'Sports', 'Technology', 'Entertainment', 'Business']
const CATEGORY_COUNTS = [42, 28, 31, 19, 23, 35]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-primary">
              <Newspaper size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-surface-800 dark:text-white leading-none">Telangana Today</p>
              <p className="text-xs text-surface-500">Pipeline Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
            <Link to="/login" className="btn btn-primary btn-sm">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div {...fadeUp} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-sm font-semibold border border-primary-100 dark:border-primary-900">
              <Zap size={14} /> Enterprise Editorial Workflow
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-5xl md:text-7xl font-extrabold text-surface-900 dark:text-white leading-tight mb-6"
          >
            The Modern{' '}
            <span className="gradient-text">Newsroom</span>
            <br />Pipeline
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10"
          >
            Replace WhatsApp groups, Excel sheets, and phone chaos with a professional
            story assignment and workflow management platform built for Telangana Today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/login" className="btn btn-primary btn-lg">
              Start Managing Stories <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-ghost btn-lg">
              <Play size={16} className="text-primary-500" /> See How It Works
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mt-14"
          >
            {[['100+', 'Stories Managed'], ['4', 'User Roles'], ['Real-time', 'Notifications'], ['PDF/Excel', 'Export']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-surface-800 dark:text-white">{val}</p>
                <p className="text-xs text-surface-400 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mock Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-4xl mx-auto mt-16 relative"
        >
          <div className="bg-surface-900 rounded-2xl shadow-2xl overflow-hidden border border-surface-700">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-700">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-surface-400">Pipeline Manager — Dashboard</span>
            </div>
            {/* Stat cards */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {DASHBOARD_STATS.map((s) => (
                <div key={s.label} className="bg-surface-800 rounded-xl p-4">
                  <p className="text-xs text-surface-400">{s.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
            {/* Category chips */}
            <div className="px-6 pb-6 grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat, i) => (
                <div key={cat} className="bg-surface-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-surface-300">{cat}</span>
                  <span className="text-xs font-bold text-primary-400">{CATEGORY_COUNTS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-6 bg-surface-50 dark:bg-surface-900">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-800 dark:text-white mb-4">
              The Problem With <span className="gradient-text">Traditional Methods</span>
            </h2>
            <p className="text-surface-500 dark:text-surface-400">
              Every newsroom faces the same challenges when relying on outdated tools
            </p>
          </motion.div>
          <motion.div
            initial={{}}
            whileInView={{ transition: { staggerChildren: 0.1 } }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {PROBLEMS.map((p) => (
              <motion.div key={p.title} {...fadeUp} className="card p-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: p.color + '20', color: p.color }}
                >
                  <p.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-surface-800 dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-800 dark:text-white mb-4">
              How Pipeline Manager <span className="gradient-text">Solves It</span>
            </h2>
            <p className="text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              A unified platform that brings order, visibility, and accountability to your entire editorial workflow.
            </p>
          </motion.div>
          <motion.div
            initial={{}}
            whileInView={{ transition: { staggerChildren: 0.12 } }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: CheckCircle, title: 'One Source of Truth', desc: 'All story assignments, statuses, and communications live in one place. No more hunting through chats.', color: '#22c55e' },
              { icon: TrendingUp, title: 'Full Visibility', desc: 'Every stakeholder — editors, reporters, management — can see exactly where every story stands.', color: '#2563EB' },
              { icon: Clock, title: 'Deadline Compliance', desc: 'Automated reminders and escalation ensure stories never miss their publication window.', color: '#E11D48' },
            ].map((s) => (
              <motion.div key={s.title} {...fadeUp} className="card p-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: s.color + '15', color: s.color }}
                >
                  <s.icon size={26} />
                </div>
                <h3 className="font-bold text-surface-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-surface-50 dark:bg-surface-900">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-800 dark:text-white mb-4">
              Everything Your <span className="gradient-text">Newsroom Needs</span>
            </h2>
            <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto">
              A complete suite of tools to manage your editorial workflow from story idea to publication
            </p>
          </motion.div>
          <motion.div
            initial={{}}
            whileInView={{ transition: { staggerChildren: 0.1 } }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                className="card p-6 hover:-translate-y-1 transition-transform duration-300"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: f.color + '15', color: f.color }}
                >
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-surface-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-800 dark:text-white mb-4">
              The <span className="gradient-text">Story Lifecycle</span>
            </h2>
            <p className="text-surface-500 dark:text-surface-400">
              Every story moves through a structured pipeline ensuring quality and accountability
            </p>
          </motion.div>
          <div className="space-y-0">
            {WORKFLOW.map((w, i) => (
              <motion.div
                key={w.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-4 relative pb-8"
              >
                {i < WORKFLOW.length - 1 && (
                  <div
                    className="absolute left-5 top-10 bottom-0 w-0.5"
                    style={{ backgroundColor: w.color + '40' }}
                  />
                )}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg"
                  style={{ backgroundColor: w.color }}
                >
                  {w.step}
                </div>
                <div className="card flex-1 p-4">
                  <p className="font-semibold text-surface-800 dark:text-white">{w.label}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{w.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-surface-50 dark:bg-surface-900">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-800 dark:text-white mb-4">
              Loved by the <span className="gradient-text">Newsroom Team</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{}}
            whileInView={{ transition: { staggerChildren: 0.1 } }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} {...fadeUp} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800 dark:text-white">{t.name}</p>
                    <p className="text-xs text-surface-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-primary">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ready to Modernize Your Newsroom?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join Telangana Today&apos;s digital editorial revolution. Manage stories smarter, faster, and better.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 transition shadow-lg"
            >
              Get Started Today <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-surface-900 text-surface-400 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
            <Newspaper size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm">Telangana Today — Pipeline Manager</span>
        </div>
        <p className="text-xs">&copy; 2024 Telangana Today. Enterprise Editorial Workflow System.</p>
      </footer>
    </div>
  )
}
