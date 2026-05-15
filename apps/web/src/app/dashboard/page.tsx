'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { projectsApi } from '@/lib/api';
import {
  Zap, Plus, LogOut, Clock, CheckCircle2, XCircle, Loader2,
  GitBranch, Activity, FolderGit2, ChevronRight,
} from 'lucide-react';

interface Deployment {
  id: string; status: string; createdAt: string; duration: number | null; commitMessage: string | null;
}
interface Project {
  id: string; name: string; repoUrl: string; branch: string;
  description: string | null; deploymentCount: number; lastDeployment: Deployment | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; pulse?: boolean }> = {
  HEALTHY:      { label: 'Healthy',    color: 'text-green-400',  icon: <CheckCircle2 size={14} /> },
  FAILED:       { label: 'Failed',     color: 'text-red-400',    icon: <XCircle size={14} /> },
  QUEUED:       { label: 'Queued',     color: 'text-yellow-400', icon: <Clock size={14} />, pulse: true },
  BUILDING:     { label: 'Building',   color: 'text-blue-400',   icon: <Loader2 size={14} className="animate-spin" />, pulse: true },
  CLONING:      { label: 'Cloning',    color: 'text-blue-400',   icon: <Loader2 size={14} className="animate-spin" />, pulse: true },
  VALIDATING:   { label: 'Validating', color: 'text-blue-400',   icon: <Loader2 size={14} className="animate-spin" />, pulse: true },
  HEALTH_CHECK: { label: 'Checking',  color: 'text-blue-400',   icon: <Loader2 size={14} className="animate-spin" />, pulse: true },
  CANCELLED:    { label: 'Cancelled',  color: 'text-zinc-400',   icon: <XCircle size={14} /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: 'text-zinc-400', icon: <Activity size={14} /> };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const repoName = project.repoUrl.split('/').slice(-2).join('/');
  const isActive = project.lastDeployment && ['QUEUED', 'CLONING', 'VALIDATING', 'BUILDING', 'HEALTH_CHECK'].includes(project.lastDeployment.status);

  return (
    <Link href={`/projects/${project.id}`}
      className="group block bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
            <FolderGit2 size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{project.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{repoName}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
      </div>

      {project.description && (
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <GitBranch size={12} />
          <span>{project.branch}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{project.deploymentCount} deploys</span>
          {project.lastDeployment ? (
            <StatusBadge status={project.lastDeployment.status} />
          ) : (
            <span className="text-xs text-muted-foreground">No deployments</span>
          )}
        </div>
      </div>

      {isActive && (
        <div className="mt-3 h-1 rounded-full bg-border overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    projectsApi.list()
      .then((res) => setProjects(res.data.data.projects))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm">DevFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-2 py-1 rounded-lg hover:bg-accent">
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {projects.length === 0 ? 'No projects yet' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
            <Plus size={16} />
            New project
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : error ? (
          <div className="text-center py-24 text-muted-foreground">{error}</div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FolderGit2 size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">No projects yet</h2>
              <p className="text-muted-foreground text-sm mt-1">Connect a GitHub repository to start deploying</p>
            </div>
            <Link href="/projects/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
              <Plus size={16} /> Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
