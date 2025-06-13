
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
  address?: string;
  famsize?: string;
  Pstatus?: string;
  Mjob?: string;
  Fjob?: string;
  reason?: string;
  guardian?: string;
  traveltime?: number;
  failures?: string;
  schoolsup?: string;
  famsup?: string;
  paid?: string;
  activities?: string;
  nursery?: string;
  higher?: string;
  internet?: string;
  romantic?: string;
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
      
      console.log('Fetching student data from Supabase...');
      
      // Fetch student data with multiple fallback strategies
      console.log('Attempting to fetch student records...');
      const { data: studentsData, error: studentsError } = await supabase
        .from('student')
        .select('*')
        .limit(1000);
      
      if (studentsError) {
        console.error('Student fetch error:', studentsError);
        
        // Check if it's a permission issue
        if (studentsError.code === 'PGRST116' || studentsError.message.includes('permission')) {
          toast({
            title: "Database Permission Issue",
            description: "Cannot access student table. Please check your Row Level Security (RLS) policies in Supabase.",
            variant: "destructive",
          });
        } else {
          throw studentsError;
        }
      } else {
        console.log('Student data fetched successfully:', studentsData?.length || 0);
      }

      console.log('Student fetch result:', { 
        data: studentsData, 
        dataLength: studentsData?.length 
      });

      setStudents(studentsData || []);

      // Fetch recent predictions
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (predictionsError) {
        console.error('Predictions fetch error:', predictionsError);
      } else {
        console.log('Predictions loaded:', predictionsData?.length || 0);
      }

      // Fetch unresolved alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (alertsError) {
        console.error('Alerts fetch error:', alertsError);
      } else {
        console.log('Alerts loaded:', alertsData?.length || 0);
      }

      setPredictions(predictionsData || []);
      setAlerts(alertsData || []);
      
      console.log('Dashboard data summary:', {
        students: studentsData?.length || 0,
        predictions: predictionsData?.length || 0,
        alerts: alertsData?.length || 0
      });

      // Show success message if we have student data
      if (studentsData && studentsData.length > 0) {
        toast({
          title: "Database Connected Successfully",
          description: `Loaded ${studentsData.length} real student records from Supabase`,
        });
      } else if (!studentsError) {
        toast({
          title: "No Student Data",
          description: "Connected to database but no student records found. Please add some data to the student table.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Database Connection Error",
        description: `Failed to fetch data: ${error.message}`,
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-lg text-slate-900">Loading CLIS Dashboard...</p>
          <p className="text-sm text-slate-600 mt-2">Connecting to Supabase database...</p>
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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900">
              CLIS Dashboard
            </h1>
          </div>
          <p className="text-xl text-slate-700">Cognitive Learning Intelligence System</p>
          <p className="text-sm text-slate-600 mt-2">
            AI-Powered Student Performance Prediction & Intervention Platform
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-2 border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Connected Students</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{students.length}</div>
              <p className="text-xs text-slate-600">
                {students.length > 0 ? "Database Connected" : "No Data Found"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">High Risk Students</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highRiskStudents}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeAlerts}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Avg Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{avgConfidence}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid - Student Analytics Form */}
        <div className="grid grid-cols-1 gap-6">
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

        {/* Database Connection Status */}
        <Card className={`border-2 ${students.length > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <CardHeader>
            <CardTitle className={students.length > 0 ? 'text-green-800' : 'text-red-800'}>
              {students.length > 0 ? 'Supabase Database Connected' : 'Database Connection Issue'}
            </CardTitle>
            <CardDescription className={students.length > 0 ? 'text-green-700' : 'text-red-700'}>
              {students.length > 0 
                ? `Successfully connected to your Supabase database with ${students.length} student records`
                : 'Unable to fetch student data from your Supabase database - this might be a permissions issue'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-green-800">Database Status:</strong>
                  <ul className="mt-1 space-y-1 text-green-700">
                    <li>• Connected to Supabase</li>
                    <li>• Real-time updates active</li>
                    <li>• {students.length} student records loaded</li>
                    <li>• All data fields accessible</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-green-800">Available Data:</strong>
                  <ul className="mt-1 space-y-1 text-green-700">
                    <li>• Academic scores (G1, G2, G3)</li>
                    <li>• Demographics & behavior</li>
                    <li>• Family background</li>
                    <li>• Social factors</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-green-800">AI Features:</strong>
                  <ul className="mt-1 space-y-1 text-green-700">
                    <li>• Performance predictions</li>
                    <li>• Risk assessments</li>
                    <li>• Intervention recommendations</li>
                    <li>• Real-time analytics</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-700 mb-2">
                  Cannot access student data. This could be due to:
                </p>
                <ul className="text-sm text-red-600 text-left max-w-md mx-auto">
                  <li>• Row Level Security (RLS) policies blocking access</li>
                  <li>• No SELECT permissions for anonymous users</li>
                  <li>• Empty student table</li>
                  <li>• Network connection issues</li>
                </ul>
                <p className="text-red-700 mt-4 text-sm">
                  Check your Supabase project settings and RLS policies.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
