
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterPlot, Scatter } from 'recharts';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Activity, BarChart3 } from 'lucide-react';

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
  backend_source?: string;
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

interface PredictionVisualizationProps {
  predictions: Prediction[];
}

const PredictionVisualization = ({ predictions }: PredictionVisualizationProps) => {
  // Data processing for various charts
  const riskDistribution = [
    { name: 'Low Risk', value: predictions.filter(p => p.risk_level === 'low').length, color: '#10b981' },
    { name: 'Medium Risk', value: predictions.filter(p => p.risk_level === 'medium').length, color: '#f59e0b' },
    { name: 'High Risk', value: predictions.filter(p => p.risk_level === 'high').length, color: '#ef4444' },
  ];

  const scoreDistribution = predictions.map(p => ({
    name: `Student ${p.student_id.slice(-4)}`,
    predicted_score: p.predicted_score,
    confidence: p.confidence_level,
    risk_level: p.risk_level,
    g1: p.g1,
    g2: p.g2,
    trend: p.g2 - p.g1,
  }));

  const confidenceAnalysis = predictions.map(p => ({
    score: p.predicted_score,
    confidence: p.confidence_level,
    risk: p.risk_level,
    name: `Student ${p.student_id.slice(-4)}`,
  }));

  const timeSeriesData = predictions
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((p, index) => ({
      index: index + 1,
      score: p.predicted_score,
      confidence: p.confidence_level,
      date: new Date(p.created_at).toLocaleDateString(),
    }));

  const factorAnalysis = predictions.length > 0 ? [
    { factor: 'Study Time', avg: predictions.reduce((sum, p) => sum + (p.studytime || 0), 0) / predictions.length },
    { factor: 'Attendance', avg: predictions.reduce((sum, p) => sum + (p.attendance_rate || 0), 0) / predictions.length },
    { factor: 'Effort Score', avg: predictions.reduce((sum, p) => sum + (p.effort_score || 0), 0) / predictions.length },
    { factor: 'Motivation', avg: predictions.reduce((sum, p) => sum + (p.motivation_level || 0), 0) / predictions.length },
    { factor: 'Family Support', avg: predictions.reduce((sum, p) => sum + (p.family_support || 0), 0) / predictions.length },
    { factor: 'Health Score', avg: predictions.reduce((sum, p) => sum + (p.health_score || 0), 0) / predictions.length },
  ] : [];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return '#10b981';
    if (score >= 12) return '#f59e0b';
    return '#ef4444';
  };

  if (predictions.length === 0) {
    return (
      <Card className="bg-white border border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Colab Predictions Yet</h3>
          <p className="text-slate-500 text-center">Generate predictions using your Colab backend to see comprehensive visualizations here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Brain className="w-7 h-7 text-blue-600" />
          <Zap className="w-6 h-6 text-green-600" />
          Colab Backend ML Predictions Visualization
        </h2>
        <p className="text-slate-600 mt-2">
          Comprehensive analytics from {predictions.length} real backend predictions
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Predictions</p>
                <p className="text-2xl font-bold text-blue-800">{predictions.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Avg Score</p>
                <p className="text-2xl font-bold text-green-800">
                  {(predictions.reduce((sum, p) => sum + p.predicted_score, 0) / predictions.length).toFixed(1)}/20
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Avg Confidence</p>
                <p className="text-2xl font-bold text-purple-800">
                  {(predictions.reduce((sum, p) => sum + (p.confidence_level || 0), 0) / predictions.length).toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">High Risk</p>
                <p className="text-2xl font-bold text-red-800">
                  {predictions.filter(p => p.risk_level === 'high').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Bar Chart */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Predicted Scores Distribution
            </CardTitle>
            <CardDescription>Individual student performance predictions from Colab backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 20]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-slate-800">{label}</p>
                            <p className="text-blue-600">Score: <strong>{data.predicted_score}/20</strong></p>
                            <p className="text-purple-600">Confidence: <strong>{data.confidence}%</strong></p>
                            <p className="text-slate-600">Risk: <Badge style={{ backgroundColor: getRiskColor(data.risk_level) }}>{data.risk_level}</Badge></p>
                            <p className="text-slate-600">Trend: {data.g1}→{data.g2} ({data.trend > 0 ? '+' : ''}{data.trend})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="predicted_score" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Level Distribution Pie Chart */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Risk Level Distribution
            </CardTitle>
            <CardDescription>Breakdown of student risk categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Confidence vs Score Scatter Plot */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5 text-purple-600" />
              Confidence vs Predicted Score
            </CardTitle>
            <CardDescription>Relationship between model confidence and predicted scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterPlot>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="score" 
                    domain={[0, 20]} 
                    name="Predicted Score"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="confidence" 
                    domain={[0, 100]} 
                    name="Confidence %"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                            <p className="font-semibold">{data.name}</p>
                            <p>Score: <strong>{data.score}/20</strong></p>
                            <p>Confidence: <strong>{data.confidence}%</strong></p>
                            <p>Risk: <Badge style={{ backgroundColor: getRiskColor(data.risk) }}>{data.risk}</Badge></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    data={confidenceAnalysis} 
                    fill="#8b5cf6"
                  />
                </ScatterPlot>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Factor Analysis */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Average Factor Analysis
            </CardTitle>
            <CardDescription>Key factors influencing student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={factorAnalysis} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="factor" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Analysis */}
      {timeSeriesData.length > 1 && (
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Prediction Timeline Analysis
            </CardTitle>
            <CardDescription>Score and confidence trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis yAxisId="left" domain={[0, 20]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Predicted Score"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Confidence %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Prediction List */}
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Brain className="w-5 h-5 text-blue-600" />
            Detailed Colab Backend Predictions
          </CardTitle>
          <CardDescription>Complete list of all backend predictions with interventions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getRiskColor(prediction.risk_level) }}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Student {prediction.student_id.slice(-8)}</h4>
                      <p className="text-sm text-slate-600">
                        {new Date(prediction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: getScoreColor(prediction.predicted_score) }}>
                      {prediction.predicted_score}/20
                    </div>
                    <div className="text-sm text-slate-600">{prediction.confidence_level}% confidence</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Academic Progress</p>
                    <p className="text-sm">G1: {prediction.g1} → G2: {prediction.g2}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {prediction.g2 > prediction.g1 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span>{prediction.g2 > prediction.g1 ? 'Improving' : 'Declining'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Risk Assessment</p>
                    <Badge 
                      className="text-white"
                      style={{ backgroundColor: getRiskColor(prediction.risk_level) }}
                    >
                      {prediction.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Model Info</p>
                    <p className="text-sm">{prediction.model_version}</p>
                    {prediction.backend_source && (
                      <p className="text-xs text-green-600">✓ {prediction.backend_source}</p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3 rounded border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Colab Backend Intervention Plan:</p>
                  <p className="text-sm text-slate-800">{prediction.intervention_summary}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionVisualization;
