
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Activity, BarChart3, Users, Award } from 'lucide-react';

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

interface PredictionVisualizationProps {
  predictions: Prediction[];
}

const PredictionVisualization = ({ predictions }: PredictionVisualizationProps) => {
  // Process data for visualizations
  const scoreDistribution = React.useMemo(() => {
    const buckets = [
      { range: '0-5', count: 0, color: '#ef4444' },
      { range: '6-10', count: 0, color: '#f97316' },
      { range: '11-15', count: 0, color: '#eab308' },
      { range: '16-20', count: 0, color: '#22c55e' }
    ];
    
    predictions.forEach(p => {
      if (p.predicted_score <= 5) buckets[0].count++;
      else if (p.predicted_score <= 10) buckets[1].count++;
      else if (p.predicted_score <= 15) buckets[2].count++;
      else buckets[3].count++;
    });
    
    return buckets;
  }, [predictions]);

  const riskAnalysis = React.useMemo(() => {
    const analysis = { high: 0, medium: 0, low: 0 };
    predictions.forEach(p => {
      analysis[p.risk_level as keyof typeof analysis]++;
    });
    
    return [
      { name: 'Low Risk', value: analysis.low, color: '#10b981', percentage: Math.round((analysis.low / predictions.length) * 100) || 0 },
      { name: 'Medium Risk', value: analysis.medium, color: '#f59e0b', percentage: Math.round((analysis.medium / predictions.length) * 100) || 0 },
      { name: 'High Risk', value: analysis.high, color: '#ef4444', percentage: Math.round((analysis.high / predictions.length) * 100) || 0 }
    ];
  }, [predictions]);

  const timelineData = React.useMemo(() => {
    return predictions
      .slice(0, 10)
      .map(p => ({
        name: p.students?.name?.split(' ')[0] || 'Student',
        score: p.predicted_score,
        confidence: p.confidence_level,
        date: new Date(p.created_at).toLocaleDateString()
      }))
      .reverse();
  }, [predictions]);

  const performanceMetrics = React.useMemo(() => {
    const avgScore = predictions.length > 0 
      ? (predictions.reduce((sum, p) => sum + p.predicted_score, 0) / predictions.length)
      : 0;
    const avgConfidence = predictions.length > 0 
      ? (predictions.reduce((sum, p) => sum + (p.confidence_level || 0), 0) / predictions.length)
      : 0;
    const highRiskCount = predictions.filter(p => p.risk_level === 'high').length;
    const improvingStudents = predictions.filter(p => p.g2 > p.g1).length;

    return { avgScore, avgConfidence, highRiskCount, improvingStudents };
  }, [predictions]);

  if (predictions.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Predictions Yet</h3>
            <p className="text-slate-600 text-center max-w-md leading-relaxed">
              Generate your first AI prediction to see comprehensive analytics and visualizations here
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ML Prediction Analytics
          </h2>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Real-time insights from your Colab ML backend with comprehensive performance analysis
        </p>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-700 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-emerald-800">
                  {performanceMetrics.avgScore.toFixed(1)}/20
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <Progress value={(performanceMetrics.avgScore / 20) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">AI Confidence</p>
                <p className="text-3xl font-bold text-blue-800">
                  {performanceMetrics.avgConfidence.toFixed(0)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={performanceMetrics.avgConfidence} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-pink-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-700 text-sm font-medium">High Risk</p>
                <p className="text-3xl font-bold text-rose-800">
                  {performanceMetrics.highRiskCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-700 text-sm font-medium">Improving</p>
                <p className="text-3xl font-bold text-violet-800">
                  {performanceMetrics.improvingStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-800">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              Score Distribution
            </CardTitle>
            <CardDescription className="text-slate-600">
              Distribution of predicted academic performance scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis Pie Chart */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-800">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              Risk Assessment
            </CardTitle>
            <CardDescription className="text-slate-600">
              Student risk level distribution with intervention priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {riskAnalysis.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{item.value}</div>
                      <div className="text-xs text-slate-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-800">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            Recent Predictions Timeline
          </CardTitle>
          <CardDescription className="text-slate-600">
            Latest student performance predictions with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  domain={[0, 20]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#1d4ed8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions List */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-800">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            Latest ML Predictions
          </CardTitle>
          <CardDescription className="text-slate-600">
            Detailed view of recent student performance predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.slice(0, 5).map((prediction, index) => (
              <div 
                key={prediction.id} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {prediction.students?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {prediction.students?.name || 'Unknown Student'}
                    </h4>
                    <p className="text-sm text-slate-600">
                      Generated {new Date(prediction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">
                      {prediction.predicted_score}/20
                    </div>
                    <div className="text-sm text-slate-500">
                      {prediction.confidence_level?.toFixed(0)}% confidence
                    </div>
                  </div>
                  <Badge 
                    variant={
                      prediction.risk_level === 'high' ? 'destructive' :
                      prediction.risk_level === 'medium' ? 'default' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {prediction.risk_level} Risk
                  </Badge>
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
