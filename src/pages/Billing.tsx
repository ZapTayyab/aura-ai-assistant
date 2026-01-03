import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You're currently on the Free plan</CardDescription>
            </div>
            <Badge variant="secondary">Free</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Audits used this month</span>
            <span className="font-medium">2 / 3</span>
          </div>
          <Button className="w-full"><CreditCard className="h-4 w-4 mr-2" />Upgrade to Pro</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pro Plan Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {['50 audits per month', 'Full AI visibility analytics', 'AI-generated optimizations', 'Shareable reports'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" />{f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
