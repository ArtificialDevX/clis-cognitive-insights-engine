import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PredictionForm from '@/components/PredictionForm';
import StudentMetrics from '@/components/StudentMetrics';
import AlertsPanel from '@/components/AlertsPanel';
import PredictionHistory from '@/components/PredictionHistory';

interface Student {
  id: number;
  age?: number;
  sex?: string;
  studytime?: number;
  absences?: number;
  G1?: string;
  G2?: number;
  G3?: number;
  school?: string;
  Fedu?: number;
  Medu?: number;
  famrel?: number;
  freetime?: number;
  goout?: number;
  Dalc?: number;
  Walc?: number;
  health?: number;
}

interface Prediction {
  id: string;
  student_id: string;
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  intervention_summary: string;
  created_at: string;
  g1: number;
  g2: number;
  model_version: string;
  students?: { name: string };
}

interface Alert {
  id: string;
  student_id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  students?: { name: string };
}

const Dashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription for student table changes
    const studentChannel = supabase
      .channel('student-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student' },
        (payload) => {
          console.log('Student data changed:', payload);
          fetchData(); // Refresh data when student table changes
          toast({
            title: "Data Updated",
            description: "Student data has been updated in real-time",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentChannel);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students from the main student table
      const { data: studentsData, error: studentsError } = await supabase
        .from('student')
        .select('*')
        .order('id');

      if (studentsError) throw studentsError;

      // Fetch recent predictions (keeping the existing predictions table structure)
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (predictionsError) throw predictionsError;

      // Fetch unresolved alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      setStudents(studentsData || []);
      setPredictions(predictionsData || []);
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrediction = () => {
    fetchData();
    toast({
      title: "Success",
      description: "New prediction generated successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-lg text-gray-600">Loading CLIS Dashboard...</p>
        </div>
      </div>
    );
  }

  const highRiskStudents = predictions.filter(p => p.risk_level === 'high').length;
  const totalPredictions = predictions.length;
  const activeAlerts = alerts.length;
  const avgConfidence = predictions.length > 0 
    ? (predictions.reduce((sum, p) => sum + (p.confidence_level || 0), 0) / predictions.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CLIS Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600">Cognitive Learning Intelligence System</p>
          <p className="text-sm text-gray-500 mt-2">
            AI-Powered Student Performance Prediction & Intervention Platform - Connected to Real Student Data
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Students</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{highRiskStudents}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{activeAlerts}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{avgConfidence}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prediction Form */}
          <PredictionForm 
            students={students} 
            onPredictionComplete={handleNewPrediction}
          />

          {/* Student Metrics */}
          <StudentMetrics predictions={predictions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} onAlertsUpdate={fetchData} />

          {/* Prediction History */}
          <PredictionHistory predictions={predictions} />
        </div>

        {/* Integration Info */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">🔗 ML Model Integration - Connected to Real Data</CardTitle>
            <CardDescription className="text-blue-100">
              Now using actual student data from database: https://colab.research.google.com/drive/1H8DreCEjx53QLB-qruN_xiYIrSpRDSGW
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Real Student Data:</strong>
                <ul className="mt-1 space-y-1 text-blue-100">
                  <li>• Academic Performance (G1, G2, G3)</li>
                  <li>• Study Time & Absences</li>
                  <li>• Demographics & Family Info</li>
                </ul>
              </div>
              <div>
                <strong>AI Components:</strong>
                <ul className="mt-1 space-y-1 text-blue-100">
                  <li>• Enhanced Neural Network</li>
                  <li>• SHAP + LIME Explainability</li>
                  <li>• Real-time Data Updates</li>
                </ul>
              </div>
              <div>
                <strong>Output:</strong>
                <ul className="mt-1 space-y-1 text-blue-100">
                  <li>• Performance Score Prediction</li>
                  <li>• Risk Assessment</li>
                  <li>• Personalized Interventions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
