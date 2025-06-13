
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Brain, Zap, Database, Target, Activity, TrendingUp, Gauge } from 'lucide-react';

interface Prediction {
  id: string;
  student_id: string;
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  created_at: string;
  g1: number;
  g2: number;
  age?: number;
  studytime?: number;
  absences?: number;
  effort_score?: number;
  emotional_sentiment?: number;
  participation_index?: number;
  family_support?: number;
  health_score?: number;
  social_activity?: number;
  alcohol_consumption?: number;
  attendance_rate?: number;
  motivation_level?: number;
  stress_level?: number;
}

interface ColabMetricsDashboardProps {
  predictions: Prediction[];
}

const ColabMetricsDashboard = ({ predictions }: ColabMetricsDashboardProps) => {
  // Performance metrics calculation
  const avgScore = predictions.length > 0 
    ? (predictions.reduce((sum, p) => sum + p.predicted_score, 0) / predictions.length).toFixed(2)
    : '0';
    
  const avgConfidence = predictions.length > 0 
    ? (predictions.reduce((sum, p) => sum + (p.confidence_level || 0), 0) / predictions.length).toFixed(1)
    : '0';

  const highPerformers = predictions.filter(p => p.predicted_score >= 16).length;
  const atRiskStudents = predictions.filter(p => p.predicted_score < 10).length;
  const improvingStudents = predictions.filter(p => p.g2 > p.g1).length;

  // Radar chart data for student factors
  const factorAnalysis = predictions.length > 0 ? [
    {
      factor: 'Study Time',
      average: predictions.reduce((sum, p) => sum + (p.studytime || 0), 0) / predictions.length,
      max: 15
    },
    {
      factor: 'Attendance',
      average: predictions.reduce((sum, p) => sum + (p.attendance_rate || 0), 0) / predictions.length,
      max: 100
    },
    {
      factor: 'Effort',
      average: predictions.reduce((sum, p) => sum + (p.effort_score || 0), 0) / predictions.length,
      max: 10
    },
    {
      factor: 'Motivation',
      average: predictions.reduce((sum, p) => sum + (p.motivation_level || 0), 0) / predictions.length,
      max: 10
    },
    {
      factor: 'Family Support',
      average: predictions.reduce((sum, p) => sum + (p.family_support || 0), 0) / predictions.length,
      max: 5
    },
    {
      factor: 'Health',
      average: predictions.reduce((sum, p) => sum + (p.health_score || 0), 0) / predictions.length,
      max: 5
    },
  ] : [];

  // Normalize values for radar chart (0-100 scale)
  const normalizedFactors = factorAnalysis.map(factor => ({
    ...factor,
    normalizedAverage: (factor.average / factor.max) * 100
  }));

  // Performance distribution
  const performanceDistribution = [
    { range: 'Excellent (16-20)', count: predictions.filter(p => p.predicted_score >= 16).length, color: '#10b981' },
    { range: 'Good (12-15)', count: predictions.filter(p => p.predicted_score >= 12 && p.predicted_score < 16).length, color: '#3b82f6' },
    { range: 'Average (8-11)', count: predictions.filter(p => p.predicted_score >= 8 && p.predicted_score < 12).length, color: '#f59e0b' },
    { range: 'Poor (0-7)', count: predictions.filter(p => p.predicted_score < 8).length, color: '#ef4444' },
  ];

  // Confidence distribution
  const confidenceRanges = [
    { range: 'High (90-100%)', count: predictions.filter(p => (p.confidence_level || 0) >= 90).length },
    { range: 'Good (80-89%)', count: predictions.filter(p => (p.confidence_level || 0) >= 80 && (p.confidence_level || 0) < 90).length },
    { range: 'Medium (70-79%)', count: predictions.filter(p => (p.confidence_level || 0) >= 70 && (p.confidence_level || 0) < 80).length },
    { range: 'Low (<70%)', count: predictions.filter(p => (p.confidence_level || 0) < 70).length },
  ];

  if (predictions.length === 0) {
    return (
      <Card className="bg-white border border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Colab Metrics Available</h3>
          <p className="text-slate-500 text-center">Generate predictions using your Colab backend to see detailed metrics and analytics here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Database className="w-7 h-7 text-blue-600" />
          <Zap className="w-6 h-6 text-green-600" />
          Colab Backend Performance Metrics
        </h2>
        <p className="text-slate-600 mt-2">
          Advanced analytics and performance insights from {predictions.length} Colab predictions
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-blue-600 text-sm font-medium">Avg Score</p>
            <p className="text-2xl font-bold text-blue-800">{avgScore}/20</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Gauge className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-purple-600 text-sm font-medium">Avg Confidence</p>
            <p className="text-2xl font-bold text-purple-800">{avgConfidence}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-600 text-sm font-medium">High Performers</p>
            <p className="text-2xl font-bold text-green-800">{highPerformers}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-600 text-sm font-medium">At Risk</p>
            <p className="text-2xl font-bold text-red-800">{atRiskStudents}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-yellow-600 text-sm font-medium">Improving</p>
            <p className="text-2xl font-bold text-yellow-800">{improvingStudents}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Target className="w-5 h-5 text-blue-600" />
              Performance Distribution
            </CardTitle>
            <CardDescription>Distribution of predicted scores across performance levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Factors Radar Chart */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5 text-green-600" />
              Student Factors Analysis
            </CardTitle>
            <CardDescription>Average student characteristics from Colab predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={normalizedFactors}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar
                    name="Average Score"
                    dataKey="normalizedAverage"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Gauge className="w-5 h-5 text-purple-600" />
              Model Confidence Distribution
            </CardTitle>
            <CardDescription>Distribution of confidence levels across predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {confidenceRanges.map((range, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{range.range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${predictions.length > 0 ? (range.count / predictions.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-slate-800 w-8">{range.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Predictions Summary */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Brain className="w-5 h-5 text-blue-600" />
              Recent Colab Predictions
            </CardTitle>
            <CardDescription>Latest predictions from your backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {predictions.slice(0, 5).map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-800">Student {prediction.student_id.slice(-6)}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(prediction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{prediction.predicted_score}/20</p>
                    <p className="text-xs text-slate-600">{prediction.confidence_level}% conf.</p>
                  </div>
                  <Badge 
                    variant={prediction.risk_level === 'high' ? 'destructive' : prediction.risk_level === 'medium' ? 'default' : 'secondary'}
                  >
                    {prediction.risk_level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColabMetricsDashboard;
