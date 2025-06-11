
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Prediction {
  id: string;
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  created_at: string;
  g1: number;
  g2: number;
  model_version: string;
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
      case 'high': return 'bg-rose-400';
      case 'medium': return 'bg-amber-400';
      case 'low': return 'bg-emerald-400';
      default: return 'bg-slate-400';
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
    if (score >= 16) return '#10b981'; // emerald
    if (score >= 12) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.5) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (trend < -0.5) return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <div className="w-3 h-3 bg-slate-400 rounded-full" />;
  };

  // Calculate statistics
  const avgScore = predictions.length > 0 
    ? (predictions.reduce((sum, p) => sum + p.predicted_score, 0) / predictions.length).toFixed(1)
    : '0';
  
  const highRiskCount = predictions.filter(p => p.risk_level === 'high').length;
  const improvingStudents = predictions.filter(p => p.g2 > p.g1).length;

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <TrendingUp className="w-5 h-5 text-slate-600" />
          Student Analytics
        </CardTitle>
        <CardDescription className="text-slate-600">
          AI predictions with trend analysis and risk assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictions.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
                <div className="text-2xl font-bold text-slate-700">{avgScore}</div>
                <div className="text-xs text-slate-600">Avg Score</div>
              </div>
              <div className="bg-rose-50 p-3 rounded-lg text-center border border-rose-200">
                <div className="text-2xl font-bold text-rose-600">{highRiskCount}</div>
                <div className="text-xs text-rose-700">High Risk</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-600">{improvingStudents}</div>
                <div className="text-xs text-emerald-700">Improving</div>
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
                    className="text-slate-600"
                  />
                  <YAxis 
                    domain={[0, 20]}
                    tick={{ fontSize: 11 }}
                    className="text-slate-600"
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-lg text-slate-800">{label}</p>
                            <div className="space-y-1">
                              <p className="text-slate-700">
                                Predicted: <strong>{data.score}/20</strong>
                              </p>
                              <p className="text-slate-700">
                                Confidence: <strong>{data.confidence?.toFixed(1)}%</strong>
                              </p>
                              <p className="text-slate-700">
                                G1→G2: <strong>{data.g1}→{data.g2}</strong> 
                                {getTrendIcon(data.trend)}
                              </p>
                              <p className="flex items-center gap-2">
                                Risk: 
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
                    fill="#64748b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Student List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                Recent Predictions & Trends
              </h4>
              {predictions.slice(0, 6).map((prediction) => {
                const trend = prediction.g2 - prediction.g1;
                const isImproving = trend > 0.5;
                const isDeclining = trend < -0.5;
                
                return (
                  <div key={prediction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${getRiskColor(prediction.risk_level)} flex-shrink-0`}></div>
                      <div>
                        <span className="font-medium text-slate-800">
                          {prediction.students?.name || 'Unknown Student'}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                          <span>G1: {prediction.g1}</span>
                          <span>→</span>
                          <span>G2: {prediction.g2}</span>
                          {getTrendIcon(trend)}
                          {isImproving && <span className="text-emerald-600 font-medium">Improving</span>}
                          {isDeclining && <span className="text-rose-600 font-medium">Declining</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold text-lg" style={{ color: getScoreColor(prediction.predicted_score) }}>
                          {prediction.predicted_score}/20
                        </div>
                        <div className="text-xs text-slate-500">
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
          <div className="text-center py-12 text-slate-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No predictions yet</p>
            <p className="text-sm">Generate your first AI prediction to see analytics here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMetrics;
