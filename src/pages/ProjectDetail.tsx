import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Project, Audit } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  FileSearch,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

const statusConfig: Record<string, { icon: any; label: string; variant: 'secondary' | 'warning' | 'success' | 'destructive'; animate?: boolean }> = {
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' },
  processing: { icon: Loader2, label: 'Processing', variant: 'warning', animate: true },
  done: { icon: CheckCircle, label: 'Complete', variant: 'success' },
  failed: { icon: XCircle, label: 'Failed', variant: 'destructive' },
};

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDomain, setEditDomain] = useState('');

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await api.get<Project>(`/api/projects/${projectId}`);
      return data;
    },
  });

  const { data: audits, isLoading: isLoadingAudits } = useQuery({
    queryKey: ['project-audits', projectId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Audit[] }>(`/api/projects/${projectId}/audits`);
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; domain?: string }) => {
      const { data: updated } = await api.patch<Project>(`/api/projects/${projectId}`, data);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsEditOpen(false);
      toast.success('Project updated');
    },
    onError: () => {
      toast.error('Failed to update project');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/app/projects');
      toast.success('Project deleted');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleEdit = () => {
    if (project) {
      setEditName(project.name);
      setEditDomain(project.domain || '');
      setIsEditOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast.error('Project name is required');
      return;
    }
    updateMutation.mutate({
      name: editName.trim(),
      domain: editDomain.trim() || undefined,
    });
  };

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Link to="/app/projects">
          <Button variant="link">Back to projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            {project.domain && (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <Globe className="h-4 w-4" />
                {project.domain}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/app/projects/${projectId}/audits/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{audits?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Audits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {audits?.filter((a) => a.status === 'done').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {audits?.filter((a) => a.status === 'processing').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {project.createdAt ? format(new Date(project.createdAt), 'MMM d') : '-'}
            </div>
            <p className="text-sm text-muted-foreground">Created</p>
          </CardContent>
        </Card>
      </div>

      {/* Audits List */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Audits</h2>
        {isLoadingAudits ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : audits?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileSearch className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No audits yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Run your first audit to analyze your content's AI visibility.
              </p>
              <Link to={`/app/projects/${projectId}/audits/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Run First Audit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {audits?.map((audit) => {
              const status = statusConfig[audit.status];
              const StatusIcon = status.icon;
              return (
                <Link key={audit.id} to={`/app/audits/${audit.id}`}>
                  <Card className="group hover:border-primary/50 transition-all duration-200 cursor-pointer">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <FileSearch className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {audit.url || audit.targetQuery}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className={`h-3 w-3 ${status.animate ? 'animate-spin' : ''}`} />
                          {status.label}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-domain">Domain (optional)</Label>
              <Input
                id="edit-domain"
                value={editDomain}
                onChange={(e) => setEditDomain(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will delete all associated audits.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
