
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface Prediction {
  id: string;
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  created_at: string;
  g1: number;
  g2: number;
  students?: { name: string };
}

interface StudentMetricsProps {
  predictions: Prediction[];
}

const StudentMetrics = ({ predictions }: StudentMetricsProps) => {
  const chartData = predictions
    .slice(0, 8)
    .map(p => ({
      name: p.students?.name?.split(' ')[0] || 'Unknown',
      score: p.predicted_score,
      confidence: p.confidence_level,
      risk: p.risk_level,
      g1: p.g1,
      g2: p.g2,
      trend: p.g2 - p.g1
    }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return '#10b981'; // green
    if (score >= 12) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.5) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend < -0.5) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  // Calculate statistics
  const avgScore = predictions.length > 0 
    ? (predictions.reduce((sum, p) => sum + p.predicted_score, 0) / predictions.length).toFixed(1)
    : '0';
  
  const highRiskCount = predictions.filter(p => p.risk_level === 'high').length;
  const improvingStudents = predictions.filter(p => p.g2 > p.g1).length;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          📊 Enhanced Student Analytics
        </CardTitle>
        <CardDescription>
          Advanced AI predictions with trend analysis and risk assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictions.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{avgScore}</div>
                <div className="text-xs text-blue-800">Avg Score</div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
                <div className="text-xs text-red-800">High Risk</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{improvingStudents}</div>
                <div className="text-xs text-green-800">Improving</div>
              </div>
            </div>

            {/* Enhanced Chart */}
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    className="text-gray-600"
                  />
                  <YAxis 
                    domain={[0, 20]}
                    tick={{ fontSize: 11 }}
                    className="text-gray-600"
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border rounded-lg shadow-lg">
                            <p className="font-semibold text-lg">{label}</p>
                            <div className="space-y-1">
                              <p className="text-blue-600">
                                🎯 Predicted: <strong>{data.score}/20</strong>
                              </p>
                              <p className="text-green-600">
                                📊 Confidence: <strong>{data.confidence?.toFixed(1)}%</strong>
                              </p>
                              <p className="text-purple-600">
                                📈 G1→G2: <strong>{data.g1}→{data.g2}</strong> 
                                {getTrendIcon(data.trend)}
                              </p>
                              <p className="flex items-center gap-2">
                                ⚠️ Risk: 
                                <Badge variant={getRiskBadgeColor(data.risk)}>
                                  {data.risk}
                                </Badge>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill={(entry) => getScoreColor(entry?.score || 0)}
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Student List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                🎓 Recent Predictions & Trends
              </h4>
              {predictions.slice(0, 6).map((prediction, index) => {
                const trend = prediction.g2 - prediction.g1;
                const isImproving = trend > 0.5;
                const isDeclining = trend < -0.5;
                
                return (
                  <div key={prediction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${getRiskColor(prediction.risk_level)} flex-shrink-0`}></div>
                      <div>
                        <span className="font-medium text-gray-800">
                          {prediction.students?.name || 'Unknown Student'}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <span>G1: {prediction.g1}</span>
                          <span>→</span>
                          <span>G2: {prediction.g2}</span>
                          {getTrendIcon(trend)}
                          {isImproving && <span className="text-green-600 font-medium">Improving</span>}
                          {isDeclining && <span className="text-red-600 font-medium">Declining</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold text-lg" style={{ color: getScoreColor(prediction.predicted_score) }}>
                          {prediction.predicted_score}/20
                        </div>
                        <div className="text-xs text-gray-500">
                          {prediction.confidence_level?.toFixed(0)}% confidence
                        </div>
                      </div>
                      <Badge variant={getRiskBadgeColor(prediction.risk_level)} className="text-xs">
                        {prediction.risk_level}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No predictions yet</p>
            <p className="text-sm">Generate your first AI prediction to see analytics here!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMetrics;
