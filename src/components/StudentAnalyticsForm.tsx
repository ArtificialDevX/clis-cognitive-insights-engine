
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Brain, Zap, TrendingUp, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentAnalyticsFormProps {
  onPredictionComplete: () => void;
}

interface CustomAnalytic {
  name: string;
  value: number;
  description: string;
}

interface FlexiblePredictionResult {
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  intervention_summary: string;
  analytics_breakdown: Record<string, number>;
}

const StudentAnalyticsForm = ({ onPredictionComplete }: StudentAnalyticsFormProps) => {
  const [studentName, setStudentName] = useState('');
  const [customAnalytics, setCustomAnalytics] = useState<CustomAnalytic[]>([
    { name: 'Study Hours/Week', value: 5, description: 'Weekly study time' },
    { name: 'Attendance Rate', value: 85, description: 'Percentage attendance' },
    { name: 'Assignment Score', value: 75, description: 'Average assignment score' },
    { name: 'Participation Level', value: 7, description: 'Class participation (1-10)' },
    { name: 'Motivation Score', value: 6, description: 'Self-reported motivation (1-10)' }
  ]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<FlexiblePredictionResult | null>(null);
  const { toast } = useToast();

  const addCustomAnalytic = () => {
    setCustomAnalytics([
      ...customAnalytics,
      { name: '', value: 50, description: '' }
    ]);
  };

  const removeCustomAnalytic = (index: number) => {
    setCustomAnalytics(customAnalytics.filter((_, i) => i !== index));
  };

  const updateAnalytic = (index: number, field: keyof CustomAnalytic, value: string | number) => {
    const updated = [...customAnalytics];
    updated[index] = { ...updated[index], [field]: value };
    setCustomAnalytics(updated);
  };

  // Enhanced flexible ML prediction algorithm
  const flexibleMLPrediction = (analytics: CustomAnalytic[], studentName: string): FlexiblePredictionResult => {
    console.log('Running flexible ML prediction for:', studentName, analytics);
    
    // Normalize and weight different types of analytics
    const analyticsBreakdown: Record<string, number> = {};
    let totalScore = 0;
    let weightSum = 0;
    
    analytics.forEach(analytic => {
      if (analytic.name && analytic.value !== null && analytic.value !== undefined) {
        let normalizedValue = analytic.value;
        let weight = 1;
        
        // Auto-detect data type and apply appropriate weighting
        const name = analytic.name.toLowerCase();
        
        if (name.includes('grade') || name.includes('score') || name.includes('mark')) {
          // Academic scores (0-100 scale)
          normalizedValue = Math.max(0, Math.min(100, analytic.value)) / 5; // Convert to 0-20 scale
          weight = 2.5; // Higher weight for academic measures
        } else if (name.includes('attendance') || name.includes('present')) {
          // Attendance (percentage)
          normalizedValue = Math.max(0, Math.min(100, analytic.value)) / 5;
          weight = 2.0;
        } else if (name.includes('hour') || name.includes('time') || name.includes('study')) {
          // Study hours
          normalizedValue = Math.min(15, Math.max(0, analytic.value)) * 1.2;
          weight = 1.8;
        } else if (name.includes('motivation') || name.includes('engagement') || name.includes('participation')) {
          // Behavioral factors (1-10 scale)
          normalizedValue = Math.max(1, Math.min(10, analytic.value)) * 2;
          weight = 1.5;
        } else if (name.includes('absence') || name.includes('miss')) {
          // Negative factors (absences)
          normalizedValue = Math.max(0, 20 - analytic.value); // Invert absences
          weight = 1.5;
        } else {
          // Generic analytics - try to auto-scale
          if (analytic.value <= 10) {
            // Assume 1-10 scale
            normalizedValue = analytic.value * 2;
          } else if (analytic.value <= 100) {
            // Assume percentage
            normalizedValue = analytic.value / 5;
          } else {
            // Large numbers - normalize to reasonable range
            normalizedValue = Math.min(20, analytic.value / 10);
          }
          weight = 1.0;
        }
        
        analyticsBreakdown[analytic.name] = normalizedValue;
        totalScore += normalizedValue * weight;
        weightSum += weight;
      }
    });
    
    // Calculate weighted average
    const baseScore = weightSum > 0 ? totalScore / weightSum : 10;
    
    // Add variance and improvement factors
    const valueVariance = analytics.length > 1 
      ? analytics.reduce((sum, a) => sum + Math.abs(a.value - (analytics.reduce((s, b) => s + b.value, 0) / analytics.length)), 0) / analytics.length
      : 0;
    
    const consistencyBonus = Math.max(0, 2 - (valueVariance / 20));
    const diversityBonus = Math.min(2, analytics.length * 0.3); // Bonus for more analytics
    
    let predicted_score = Math.max(2, Math.min(20, baseScore + consistencyBonus + diversityBonus));
    
    // Calculate confidence based on data quality
    const dataQuality = analytics.filter(a => a.name && a.description).length / Math.max(1, analytics.length);
    const base_confidence = 75 + (dataQuality * 20) + (analytics.length * 2);
    const confidence_level = Math.min(99, Math.max(60, base_confidence - (valueVariance * 2)));
    
    // Risk assessment
    let risk_level = 'low';
    if (predicted_score < 8) risk_level = 'high';
    else if (predicted_score < 12) risk_level = 'medium';
    else if (valueVariance > 30) risk_level = 'medium'; // High variance is risky
    
    // Generate intervention summary
    const intervention_summary = generateFlexibleIntervention(analytics, predicted_score, risk_level, studentName);
    
    return {
      predicted_score: Math.round(predicted_score * 100) / 100,
      confidence_level: Math.round(confidence_level * 100) / 100,
      risk_level,
      intervention_summary,
      analytics_breakdown: analyticsBreakdown
    };
  };

  const generateFlexibleIntervention = (analytics: CustomAnalytic[], score: number, risk: string, studentName: string): string => {
    const interventions = [];
    const strengths = [];
    
    analytics.forEach(analytic => {
      const name = analytic.name.toLowerCase();
      const value = analytic.value;
      
      if (name.includes('study') || name.includes('hour')) {
        if (value < 3) {
          interventions.push(`📚 Increase study time - currently ${value} hours/week`);
        } else if (value > 8) {
          strengths.push(`Strong study commitment (${value} hours/week)`);
        }
      } else if (name.includes('attendance')) {
        if (value < 80) {
          interventions.push(`🏫 Improve attendance - currently ${value}%`);
        } else if (value > 90) {
          strengths.push(`Excellent attendance (${value}%)`);
        }
      } else if (name.includes('score') || name.includes('grade')) {
        if (value < 60) {
          interventions.push(`📈 Focus on improving ${analytic.name} - currently ${value}`);
        } else if (value > 80) {
          strengths.push(`Strong performance in ${analytic.name} (${value})`);
        }
      } else if (name.includes('motivation') || name.includes('engagement')) {
        if (value < 5) {
          interventions.push(`💪 Boost motivation and engagement in ${analytic.name}`);
        } else if (value > 7) {
          strengths.push(`High ${analytic.name} (${value}/10)`);
        }
      } else {
        // Generic analytics
        if (value < 50) {
          interventions.push(`⚡ Improve ${analytic.name} - current level: ${value}`);
        } else if (value > 80) {
          strengths.push(`Good ${analytic.name} performance (${value})`);
        }
      }
    });
    
    let summary = `Analysis for ${studentName || 'Student'}: `;
    
    if (strengths.length > 0) {
      summary += `Strengths: ${strengths.join(", ")}. `;
    }
    
    if (interventions.length === 0) {
      summary += "Overall performance is good across all measured analytics. Continue current approach with minor optimizations.";
    } else {
      summary += `Recommended interventions: ${interventions.join("; ")}. `;
      if (risk === 'high') {
        summary += "⚠️ HIGH PRIORITY - Immediate intervention required.";
      } else if (risk === 'medium') {
        summary += "⚡ Monitor progress and implement changes within 2 weeks.";
      }
    }
    
    return summary;
  };

  const handlePredict = async () => {
    if (!studentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a student name",
        variant: "destructive",
      });
      return;
    }

    if (customAnalytics.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one analytic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting flexible prediction for:', studentName, customAnalytics);
      
      // Generate flexible ML prediction
      const predictionResult = flexibleMLPrediction(customAnalytics, studentName);
      
      console.log('Storing flexible prediction in database...');
      
      // Store prediction in Supabase
      const { data: insertedData, error } = await supabase
        .from('predictions')
        .insert({
          student_id: studentName, // Use name as ID for custom students
          studytime: customAnalytics.find(a => a.name.toLowerCase().includes('study'))?.value || 5,
          g1: customAnalytics.find(a => a.name.toLowerCase().includes('grade') || a.name.toLowerCase().includes('score'))?.value || 12,
          g2: customAnalytics.find(a => a.name.toLowerCase().includes('grade') || a.name.toLowerCase().includes('score'))?.value || 12,
          absences: customAnalytics.find(a => a.name.toLowerCase().includes('absence'))?.value || 3,
          effort_score: customAnalytics.find(a => a.name.toLowerCase().includes('effort') || a.name.toLowerCase().includes('motivation'))?.value || 7,
          emotional_sentiment: 0.7,
          participation_index: customAnalytics.find(a => a.name.toLowerCase().includes('participation'))?.value || 7,
          predicted_score: predictionResult.predicted_score,
          confidence_level: predictionResult.confidence_level,
          risk_level: predictionResult.risk_level,
          intervention_summary: predictionResult.intervention_summary,
          model_version: 'v4.0-flexible-analytics',
          shap_explanation: {
            features: predictionResult.analytics_breakdown,
            total_contribution: predictionResult.predicted_score,
            analytics_used: customAnalytics.map(a => ({ name: a.name, value: a.value, description: a.description }))
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Flexible prediction stored successfully:', insertedData);

      // Create alert if high risk
      if (predictionResult.risk_level === 'high') {
        await supabase
          .from('alerts')
          .insert({
            student_id: studentName,
            alert_type: 'custom_analytics_risk',
            severity: 'high',
            message: `🚨 URGENT: Student ${studentName} predicted to score ${predictionResult.predicted_score}/20 based on custom analytics. ${predictionResult.intervention_summary}`
          });
      }

      setPrediction(predictionResult);
      onPredictionComplete();
      
      toast({
        title: "🎯 Flexible Analytics Prediction Generated",
        description: `${studentName}: ${predictionResult.predicted_score}/20 | Risk: ${predictionResult.risk_level} | Confidence: ${predictionResult.confidence_level}%`,
      });
    } catch (error) {
      console.error('Error generating flexible prediction:', error);
      toast({
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <Brain className="w-5 h-5 text-blue-600" />
          🚀 Flexible Student Analytics
        </CardTitle>
        <CardDescription>
          Input ANY kind of student analytics for ML prediction - completely customizable
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="studentName">Student Name/ID</Label>
          <Input
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name or identifier..."
            className="mt-2"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Custom Analytics</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomAnalytic}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Analytic
            </Button>
          </div>

          {customAnalytics.map((analytic, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="Analytics name (e.g., 'Test Scores', 'Study Hours')"
                  value={analytic.name}
                  onChange={(e) => updateAnalytic(index, 'name', e.target.value)}
                  className="flex-1 mr-2"
                />
                {customAnalytics.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomAnalytic(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label>Value: {analytic.value}</Label>
                <Slider
                  value={[analytic.value]}
                  onValueChange={([value]) => updateAnalytic(index, 'value', value)}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <Input
                placeholder="Description (e.g., 'Percentage score', 'Hours per week')"
                value={analytic.description}
                onChange={(e) => updateAnalytic(index, 'description', e.target.value)}
              />
            </div>
          ))}
        </div>

        <Button 
          onClick={handlePredict} 
          disabled={loading || !studentName.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {loading ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-spin" />
              🔮 Analyzing Custom Analytics...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              <Brain className="w-4 h-4 mr-2" />
              🚀 Generate Flexible ML Prediction
            </>
          )}
        </Button>

        {prediction && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              🎯 Flexible Analytics Prediction Results
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="bg-white/50 p-2 rounded">
                <strong>Predicted Score:</strong> 
                <span className="text-lg font-bold ml-2">{prediction.predicted_score}/20</span>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <strong>Confidence:</strong> 
                <span className="text-lg font-bold ml-2">{prediction.confidence_level}%</span>
              </div>
              <div className="col-span-2 bg-white/50 p-2 rounded">
                <strong>Risk Level:</strong>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(prediction.risk_level)}`}>
                  {prediction.risk_level.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="mb-3 bg-white/50 p-3 rounded">
              <strong className="text-sm">📊 Analytics Breakdown:</strong>
              <div className="grid grid-cols-1 gap-1 text-xs mt-2">
                {Object.entries(prediction.analytics_breakdown).map(([analytic, value]) => (
                  <div key={analytic} className="flex justify-between">
                    <span>{analytic}:</span>
                    <span className="font-mono">{Number(value).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/50 p-3 rounded">
              <strong className="text-sm">📋 Flexible Intervention Plan:</strong>
              <p className="text-gray-700 mt-2 text-sm leading-relaxed">{prediction.intervention_summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAnalyticsForm;
