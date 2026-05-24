'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { projectsApi } from '@/lib/api';
import {
  Zap, Plus, LogOut, Clock, CheckCircle2, XCircle, Loader2,
  GitBranch, Activity, FolderGit2, ChevronRight, ExternalLink, Trash2,
} from 'lucide-react';
import Loading from '@/components/ui/Loading';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

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
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Delete this project?')) return;
    try {
      await projectsApi.delete(project.id);
      location.reload();
    } catch {
      // noop
    }
  };

  return (
    <div className="relative">
      <Link href={`/projects/${project.id}`}
        className="group block bg-card border border-border/80 rounded-xl p-4 hover:border-primary/40 transition-colors duration-150">
        <div className="flex items-start justify-between gap-4 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary border border-primary/10">
              <FolderGit2 size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-[0.95rem] leading-tight group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono tracking-tight">{repoName}</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform mt-1" />
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <GitBranch size={12} />
            <span className="truncate">{project.branch}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">{project.deploymentCount} deploys</span>
            {project.lastDeployment ? (
              <StatusBadge status={project.lastDeployment.status} />
            ) : (
              <span className="text-xs text-muted-foreground">No deployments</span>
            )}
          </div>
        </div>

        {isActive && (
          <div className="mt-3 h-1 rounded-full bg-border overflow-hidden">
            <div className="h-full bg-blue-500/80 rounded-full" style={{ width: '58%' }} />
          </div>
        )}
      </Link>

      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <a onClick={(e) => e.stopPropagation()} href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:bg-accent transition-colors">
          <ExternalLink size={13} />
        </a>
        <button onClick={(e) => { e.stopPropagation(); router.push(`/projects/${project.id}`); }} title="Open" className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:bg-accent transition-colors">
          <ChevronRight size={13} />
        </button>
        <button onClick={handleDelete} title="Delete" className="p-1.5 rounded-md bg-card border border-border text-destructive hover:bg-destructive/10 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
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
      <Loading />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/55 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm">Ignite</span>
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

      <main className="max-w-6xl mx-auto px-4 py-7 sm:py-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-7 sm:mb-8">
          <div>
            <h1 className="text-[1.6rem] sm:text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              {projects.length === 0 ? 'No projects yet' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            New project
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-24 rounded bg-muted/70" />
                    </div>
                  </div>
                  <div className="h-4 w-4 rounded bg-muted" />
                </div>
                <div className="h-10 rounded bg-muted/70 mb-4" />
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="h-3 w-14 rounded bg-muted/70" />
                  <div className="h-4 w-20 rounded bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Connect a GitHub repository to start deploying"
            action={(
              <Link href="/projects/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
                <Plus size={16} /> Create your first project
              </Link>
            )}
          />
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
