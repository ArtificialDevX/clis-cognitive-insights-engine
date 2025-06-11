
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Brain, TrendingUp, TrendingDown } from 'lucide-react';

interface Prediction {
  id: string;
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  created_at: string;
  g1: number;
  g2: number;
  model_version: string;
  intervention_summary?: string;
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
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-emerald-600';
    if (score >= 12) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getModelBadge = (version: string) => {
    if (version?.includes('enhanced') || version?.includes('v2')) {
      return <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-800">Enhanced AI</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Standard</Badge>;
  };

  const getTrendIcon = (prediction: Prediction) => {
    if (!prediction.g1 || !prediction.g2) return null;
    const trend = prediction.g2 - prediction.g1;
    
    if (trend > 0.5) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (trend < -0.5) return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <div className="w-3 h-3 bg-slate-400 rounded-full" />;
  };

  const sortedPredictions = [...predictions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <History className="w-5 h-5 text-slate-600" />
          Prediction History
        </CardTitle>
        <CardDescription className="text-slate-600">
          Complete timeline of AI model predictions with trend analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedPredictions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedPredictions.map((prediction, index) => (
              <div key={prediction.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all duration-200 hover:shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-slate-600" />
                      {index === 0 && <Badge variant="secondary" className="text-xs animate-pulse">Latest</Badge>}
                    </div>
                    <div>
                      <span className="font-medium text-sm text-slate-800">
                        {prediction.students?.name || 'Unknown Student'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        {getModelBadge(prediction.model_version)}
                        {getTrendIcon(prediction)}
                        {prediction.g1 && prediction.g2 && (
                          <span className="text-xs text-slate-500">
                            G1:{prediction.g1} → G2:{prediction.g2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">
                    {formatDate(prediction.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div className="text-center bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-600 text-xs block">Predicted Score</span>
                    <span className={`text-lg font-bold ${getScoreColor(prediction.predicted_score)}`}>
                      {prediction.predicted_score}/20
                    </span>
                  </div>
                  <div className="text-center bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-600 text-xs block">Confidence</span>
                    <span className="text-lg font-bold text-slate-700">
                      {prediction.confidence_level?.toFixed(0) || 'N/A'}%
                    </span>
                  </div>
                  <div className="text-center bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-600 text-xs block">Risk Level</span>
                    <Badge variant={getRiskBadgeColor(prediction.risk_level)} className="text-xs mt-1">
                      {prediction.risk_level?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>

                {prediction.model_version?.includes('enhanced') && (
                  <div className="bg-violet-50 p-2 rounded text-xs border border-violet-200">
                    <span className="text-violet-700 font-medium">
                      Enhanced AI Analysis: 
                    </span>
                    <span className="text-violet-600 ml-1">
                      Advanced feature weighting with SHAP explainability
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No prediction history yet</p>
            <p className="text-sm mb-4">Generate predictions to see timeline here</p>
            <div className="text-xs text-slate-400 max-w-md mx-auto">
              Each prediction will be stored with full context including:
              student data, confidence levels, risk assessments, and intervention recommendations.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionHistory;
