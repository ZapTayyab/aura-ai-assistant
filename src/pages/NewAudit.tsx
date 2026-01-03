import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Globe, FileText, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function NewAuditPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'url' | 'content'>('url');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetQuery, setTargetQuery] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const body = mode === 'url' 
        ? { mode: 'url', url, targetQuery, language: 'en' }
        : { mode: 'content', title, content, targetQuery, language: 'en' };
      const { data } = await api.post(`/api/projects/${projectId}/audits`, body);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Audit started!');
      navigate(`/app/audits/${data.auditId}`);
    },
    onError: () => {
      toast.error('Failed to start audit');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'url' && !url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (mode === 'content' && !content.trim()) {
      toast.error('Please enter content');
      return;
    }
    if (!targetQuery.trim()) {
      toast.error('Please enter a target query');
      return;
    }
    createMutation.mutate();
  };

  const fillExample = () => {
    setUrl('https://example.com/blog/ai-seo-guide');
    setTargetQuery('how to optimize content for AI search');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/app/projects/${projectId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Audit</h1>
          <p className="text-muted-foreground">Analyze content for AI visibility</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Source</CardTitle>
          <CardDescription>Choose how to provide your content</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'url' | 'content')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="gap-2"><Globe className="h-4 w-4" />URL</TabsTrigger>
                <TabsTrigger value="content" className="gap-2"><FileText className="h-4 w-4" />Paste Content</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Page URL</Label>
                  <Input id="url" placeholder="https://example.com/page" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
              </TabsContent>
              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input id="title" placeholder="Article title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" placeholder="Paste your content here..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="query">Target Query</Label>
              <Input id="query" placeholder="What query should this content rank for?" value={targetQuery} onChange={(e) => setTargetQuery(e.target.value)} />
              <p className="text-xs text-muted-foreground">The question or search query you want AI to answer with your content</p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button type="button" variant="outline" onClick={fillExample}>
                <Sparkles className="h-4 w-4 mr-2" />Try Example
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Run Audit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
