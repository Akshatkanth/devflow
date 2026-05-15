'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { projectsApi } from '@/lib/api';
import { Zap, ArrowLeft, Loader2, GitBranch, Link2, Tag, AlignLeft } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', repoUrl: '', branch: 'main', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setIsLoading(true);

    try {
      const res = await projectsApi.create({
        name: form.name,
        repoUrl: form.repoUrl,
        branch: form.branch || 'main',
        description: form.description || undefined,
      });
      router.push(`/projects/${res.data.data.project.id}`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; details?: Array<{ field: string; message: string }> } } };
      const details = apiErr?.response?.data?.details;
      if (details?.length) {
        const fieldErrors: Record<string, string> = {};
        details.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setGlobalError(apiErr?.response?.data?.error ?? 'Failed to create project');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
            <Zap size={14} strokeWidth={2.5} />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-sm">New Project</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-8">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">New project</h1>
          <p className="text-muted-foreground text-sm mt-1">Connect a GitHub repository to start deploying</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <label htmlFor="proj-name" className="flex items-center gap-1.5 text-sm font-medium">
              <Tag size={14} className="text-muted-foreground" /> Project name
            </label>
            <input id="proj-name" type="text" value={form.name} onChange={set('name')} required
              placeholder="my-awesome-app"
              className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Repo URL */}
          <div className="space-y-2">
            <label htmlFor="repo-url" className="flex items-center gap-1.5 text-sm font-medium">
              <Link2 size={14} className="text-muted-foreground" /> Repository URL
            </label>
            <input id="repo-url" type="url" value={form.repoUrl} onChange={set('repoUrl')} required
              placeholder="https://github.com/owner/repo"
              className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
            {errors.repoUrl && <p className="text-xs text-destructive">{errors.repoUrl}</p>}
            <p className="text-xs text-muted-foreground">Must be a public GitHub repository URL</p>
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <label htmlFor="branch" className="flex items-center gap-1.5 text-sm font-medium">
              <GitBranch size={14} className="text-muted-foreground" /> Branch
            </label>
            <input id="branch" type="text" value={form.branch} onChange={set('branch')}
              placeholder="main"
              className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium">
              <AlignLeft size={14} className="text-muted-foreground" /> Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea id="description" value={form.description} onChange={set('description')} rows={3}
              placeholder="A short description of this project..."
              className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>

          {globalError && (
            <div className="px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{globalError}</div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button id="create-project-submit" type="submit" disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition">
              {isLoading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create project'}
            </button>
            <Link href="/dashboard"
              className="px-5 py-2.5 rounded-lg border border-border text-sm hover:bg-accent transition">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
