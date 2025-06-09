
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Prediction {
  id: string;
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  students?: { name: string };
}

interface StudentMetricsProps {
  predictions: Prediction[];
}

const StudentMetrics = ({ predictions }: StudentMetricsProps) => {
  const chartData = predictions
    .slice(0, 6)
    .map(p => ({
      name: p.students?.name?.split(' ')[0] || 'Unknown',
      score: p.predicted_score,
      confidence: p.confidence_level,
      risk: p.risk_level
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

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Student Performance Analytics
        </CardTitle>
        <CardDescription>
          Recent AI predictions and risk assessments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictions.length > 0 ? (
          <>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600"
                  />
                  <YAxis 
                    domain={[0, 20]}
                    tick={{ fontSize: 12 }}
                    className="text-gray-600"
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <p className="text-blue-600">Score: {data.score}/20</p>
                            <p className="text-green-600">Confidence: {data.confidence?.toFixed(1)}%</p>
                            <p className="flex items-center gap-2">
                              Risk: 
                              <Badge variant={getRiskBadgeColor(data.risk)}>
                                {data.risk}
                              </Badge>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="url(#blueGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Recent Predictions</h4>
              {predictions.slice(0, 5).map((prediction, index) => (
                <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(prediction.risk_level)}`}></div>
                    <span className="font-medium">
                      {prediction.students?.name || 'Unknown Student'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {prediction.predicted_score}/20
                    </span>
                    <Badge variant={getRiskBadgeColor(prediction.risk_level)}>
                      {prediction.risk_level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No predictions yet. Generate your first AI prediction!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMetrics;
