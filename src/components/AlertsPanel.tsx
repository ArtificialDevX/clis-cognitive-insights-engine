
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Zap, Shield } from 'lucide-react';
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
        return <Zap className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSeverityEmoji = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔔';
      case 'low': return 'ℹ️';
      default: return '📌';
    }
  };

  const getAlertTypeEmoji = (alertType: string) => {
    switch (alertType) {
      case 'performance_drop': return '📉';
      case 'attendance_risk': return '🏫';
      case 'engagement_low': return '💭';
      default: return '📊';
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setResolvingAlerts(prev => new Set(prev).add(alertId));
    
    try {
      console.log('Resolving alert:', alertId);
      
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error resolving alert:', error);
        throw error;
      }

      console.log('Alert resolved successfully');
      onAlertsUpdate();
      
      toast({
        title: "✅ Alert Resolved",
        description: "Alert has been successfully resolved and archived",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
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
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    // Sort by severity first, then by date
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                        (severityOrder[a.severity as keyof typeof severityOrder] || 0);
    
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            🚨 Smart Alert System
          </div>
          {(criticalCount > 0 || highCount > 0) && (
            <div className="flex gap-2">
              {criticalCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {criticalCount} Critical
                </Badge>
              )}
              {highCount > 0 && (
                <Badge variant="destructive">
                  {highCount} High
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered real-time student risk monitoring and intervention alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedAlerts.length > 0 ? (
          <div className="space-y-4">
            {sortedAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200 animate-pulse' :
                  alert.severity === 'high' ? 'bg-red-50 border-red-100' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                  'bg-blue-50 border-blue-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {getSeverityIcon(alert.severity)}
                      <span className="text-lg">
                        {getSeverityEmoji(alert.severity)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">
                        {alert.students?.name || 'Unknown Student'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          {getAlertTypeEmoji(alert.alert_type)}
                          {alert.alert_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(alert.id)}
                    disabled={resolvingAlerts.has(alert.id)}
                    className={`text-xs transition-all ${
                      alert.severity === 'critical' ? 'border-red-300 hover:bg-red-100' :
                      alert.severity === 'high' ? 'border-red-200 hover:bg-red-50' :
                      'hover:bg-gray-50'
                    }`}
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
                
                <div className={`p-3 rounded-md mb-3 ${
                  alert.severity === 'critical' ? 'bg-red-100/50' :
                  alert.severity === 'high' ? 'bg-red-50/50' :
                  alert.severity === 'medium' ? 'bg-yellow-50/50' :
                  'bg-blue-50/50'
                }`}>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize font-medium">
                    📂 {alert.alert_type.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(alert.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 mx-auto opacity-50 text-green-500" />
            </div>
            <p className="text-lg mb-2">🎉 All Clear!</p>
            <p className="text-sm">No active alerts. All students are performing well!</p>
            <div className="mt-4 text-xs text-gray-400">
              The AI monitoring system is actively watching for performance drops,
              attendance issues, and engagement problems.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
