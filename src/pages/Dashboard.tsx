
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StudentMetrics from '@/components/StudentMetrics';
import AlertsPanel from '@/components/AlertsPanel';
import PredictionHistory from '@/components/PredictionHistory';
import StudentAnalyticsForm from '@/components/StudentAnalyticsForm';

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
            title: "Real Data Updated",
            description: "Student database has been updated in real-time",
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
      
      // Fetch students from the actual student table with all their data
      const { data: studentsData, error: studentsError } = await supabase
        .from('student')
        .select('*')
        .order('id');

      if (studentsError) {
        console.error('Students fetch error:', studentsError);
        throw studentsError;
      }

      console.log('Fetched real student data:', studentsData);

      // Fetch recent predictions
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
      
      console.log('Dashboard data loaded:', {
        students: studentsData?.length || 0,
        predictions: predictionsData?.length || 0,
        alerts: alertsData?.length || 0
      });
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
  };

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
            AI-Powered Student Performance Prediction & Intervention Platform - Using Real Student Database
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <p className="text-xs text-gray-500">From actual database</p>
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

        {/* Main Dashboard Grid - Only Student Analytics Form */}
        <div className="grid grid-cols-1 gap-6">
          {/* Enhanced Student Analytics with Real Database Integration */}
          <StudentAnalyticsForm 
            students={students}
            onPredictionComplete={handleNewPrediction}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Metrics */}
          <StudentMetrics predictions={predictions} />

          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} onAlertsUpdate={fetchData} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Prediction History */}
          <PredictionHistory predictions={predictions} />
        </div>

        {/* Integration Info */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">🔗 Real Student Data Integration Active</CardTitle>
            <CardDescription className="text-blue-100">
              Connected to actual student database with {students.length} real student records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Real Database Fields:</strong>
                <ul className="mt-1 space-y-1 text-blue-100">
                  <li>• Academic: G1, G2, G3 scores</li>
                  <li>• Behavior: studytime, absences</li>
                  <li>• Demographics: age, sex, address</li>
                  <li>• Family: Medu, Fedu, famrel</li>
                </ul>
              </div>
              <div>
                <strong>ML Analytics:</strong>
                <ul className="mt-1 space-y-1 text-blue-100">
                  <li>• Real-time data updates</li>
                  <li>• Flexible input form</li>
                  <li>• Any student analytics</li>
                  <li>• Custom ML predictions</li>
                </ul>
              </div>
              <div>
                <strong>Outputs:</strong>
                <ul className="mt-1 space-y-1 text-blue-100">
                  <li>• Performance predictions</li>
                  <li>• Risk assessments</li>
                  <li>• Intervention plans</li>
                  <li>• Real-time alerts</li>
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
