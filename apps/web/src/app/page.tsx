import Link from 'next/link';
import { Zap, GitBranch, Activity, Shield, BarChart3, Terminal, ArrowRight } from 'lucide-react';

const features = [
  { icon: <GitBranch size={20} />, title: 'Deployment Pipeline', desc: 'Clone → Validate → Build → Health check. Full pipeline with status tracking and history.' },
  { icon: <Terminal size={20} />, title: 'Real-Time Logs', desc: 'Live build logs streamed via WebSocket. Watch every step as it happens.' },
  { icon: <Activity size={20} />, title: 'Queue Architecture', desc: 'BullMQ workers process deployments asynchronously with automatic retries.' },
  { icon: <BarChart3 size={20} />, title: 'Observability', desc: 'Prometheus metrics, Grafana dashboards, and structured Pino logging built-in.' },
  { icon: <Shield size={20} />, title: 'Security First', desc: 'JWT auth, RBAC, Helmet headers, rate limiting, and Zod input validation.' },
  { icon: <Zap size={20} />, title: 'Production Ready', desc: 'Docker Compose, multi-stage builds, graceful shutdown, and health checks.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold">Ignite</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Sign in</Link>
            <Link href="/signup" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Open Source · Built for engineers
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none mb-6">
            Deploy with<br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              confidence
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Ignite is a full-stack deployment platform showcasing modern backend engineering —
            queues, real-time logs, Prometheus metrics, and production-grade architecture.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/20">
              Start deploying <ArrowRight size={16} />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-accent transition text-sm font-medium">
              Sign in
            </Link>
          </div>
        </section>

        {/* Terminal preview */}
        <section className="max-w-3xl mx-auto px-4 mb-24">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">deployment logs</span>
            </div>
            <div className="p-5 font-mono text-xs space-y-1.5">
              {[
                ['16:42:01', 'info',    'Cloning repository: https://github.com/user/my-app'],
                ['16:42:02', 'info',    'remote: Counting objects: 100% (147/147), done.'],
                ['16:42:03', 'success', '✓ Repository cloned successfully'],
                ['16:42:04', 'info',    'Detected runtime: Node.js 20'],
                ['16:42:04', 'success', '✓ Project structure valid'],
                ['16:42:05', 'info',    'Step 1/8 : FROM node:20-alpine'],
                ['16:42:07', 'info',    'Step 4/8 : RUN npm ci --only=production'],
                ['16:42:12', 'info',    'added 247 packages in 8.432s'],
                ['16:42:14', 'success', '✓ Docker image built successfully'],
                ['16:42:15', 'info',    'Health probe 3/3: GET http://localhost:3000/health'],
                ['16:42:16', 'info',    '  → 200 OK (142ms)'],
                ['16:42:16', 'success', '🚀 Deployment complete! Duration: 15s'],
              ].map(([time, level, msg], i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-zinc-600 w-16 flex-shrink-0">{time}</span>
                  <span className={level === 'success' ? 'text-green-400' : level === 'warn' ? 'text-yellow-400' : 'text-zinc-300'}>
                    {msg}
                  </span>
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <span className="text-zinc-600 w-16 flex-shrink-0" />
                <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <h2 className="text-2xl font-bold text-center mb-12">Built to impress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                  {icon}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>Ignite — Portfolio project demonstrating production backend engineering</p>
      </footer>
    </div>
  );
}
