
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  students?: { name: string };
}

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertsUpdate: () => void;
}

const AlertsPanel = ({ alerts, onAlertsUpdate }: AlertsPanelProps) => {
  const [resolvingAlerts, setResolvingAlerts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setResolvingAlerts(prev => new Set(prev).add(alertId));
    
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;

      onAlertsUpdate();
      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    } finally {
      setResolvingAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Active Alerts
        </CardTitle>
        <CardDescription>
          Student interventions and risk notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg bg-white/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <span className="font-medium">
                      {alert.students?.name || 'Unknown Student'}
                    </span>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(alert.id)}
                    disabled={resolvingAlerts.has(alert.id)}
                    className="text-xs"
                  >
                    {resolvingAlerts.has(alert.id) ? (
                      <>
                        <Clock className="w-3 h-3 mr-1 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{alert.alert_type.replace('_', ' ')}</span>
                  <span>{formatDate(alert.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p>No active alerts. All students are on track!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
