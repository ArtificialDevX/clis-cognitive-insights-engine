
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Brain } from 'lucide-react';

interface Prediction {
  id: string;
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  created_at: string;
  students?: { name: string };
}

interface PredictionHistoryProps {
  predictions: Prediction[];
}

const PredictionHistory = ({ predictions }: PredictionHistoryProps) => {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-green-600';
    if (score >= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          Prediction History
        </CardTitle>
        <CardDescription>
          Recent AI model predictions and outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictions.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="p-3 border rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      {prediction.students?.name || 'Unknown Student'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(prediction.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Score:</span>
                    <span className={`ml-1 font-bold ${getScoreColor(prediction.predicted_score)}`}>
                      {prediction.predicted_score}/20
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-1 font-medium">
                      {prediction.confidence_level?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Badge variant={getRiskBadgeColor(prediction.risk_level)} className="text-xs">
                      {prediction.risk_level}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No prediction history yet.</p>
            <p className="text-sm">Generate predictions to see history here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionHistory;
