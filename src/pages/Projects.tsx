import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FolderKanban, Globe, ArrowRight, Loader2, FileSearch } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState('');
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get<Project[]>('/api/projects');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (projectData: { name: string; domain?: string }) => {
      const { data } = await api.post<Project>('/api/projects', projectData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      setNewProjectName('');
      setNewProjectDomain('');
      toast.success('Project created successfully!');
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    createMutation.mutate({
      name: newProjectName.trim(),
      domain: newProjectDomain.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your SEO audit projects</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to organize your SEO audits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Website"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain (optional)</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newProjectDomain}
                  onChange={(e) => setNewProjectDomain(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first project to start analyzing and optimizing your content for AI search engines.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Link key={project.id} to={`/app/projects/${project.id}`}>
              <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-lg mt-3">{project.name}</CardTitle>
                  {project.domain && (
                    <CardDescription className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {project.domain}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FileSearch className="h-4 w-4" />
                      {project.auditCount || 0} audits
                    </span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
