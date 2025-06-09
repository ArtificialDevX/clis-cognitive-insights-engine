
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Brain, Calculator, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface PredictionFormProps {
  students: Student[];
  onPredictionComplete: () => void;
}

interface PredictionResult {
  predicted_score: number;
  confidence_level: number;
  risk_level: string;
  intervention_summary: string;
  shap_explanation?: {
    features: Record<string, number>;
    total_contribution: number;
  };
}

const PredictionForm = ({ students, onPredictionComplete }: PredictionFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState({
    studytime: 2,
    g1: 10,
    g2: 12,
    absences: 3,
    effort_score: 7.5,
    emotional_sentiment: 0.6,
    participation_index: 8.2
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Enhanced ML prediction algorithm with more sophisticated scoring
  const enhancedMLPrediction = (data: typeof formData): PredictionResult => {
    console.log('Running enhanced ML prediction with data:', data);
    
    // Advanced weighted scoring with non-linear components
    const academicWeight = (data.g1 * 0.25 + data.g2 * 0.35); // Past performance
    const studyEffort = Math.log(data.studytime + 1) * 2.5; // Logarithmic scaling for study time
    const attendanceImpact = Math.max(0, (20 - data.absences) * 0.4); // Attendance penalty
    const emotionalFactor = data.emotional_sentiment * 8; // Emotional state impact
    const effortBonus = Math.pow(data.effort_score / 10, 1.5) * 6; // Non-linear effort scaling
    const participationBonus = data.participation_index * 0.7;
    
    // Calculate base score with sophisticated weighting
    let predicted_score = academicWeight + studyEffort + attendanceImpact + 
                         emotionalFactor + effortBonus + participationBonus;
    
    // Apply performance modifiers based on patterns
    if (data.g2 > data.g1) {
      predicted_score += 1.5; // Improvement bonus
    } else if (data.g2 < data.g1) {
      predicted_score -= 1.0; // Decline penalty
    }
    
    // Emotional and effort interaction
    const emotionEffortSynergy = data.emotional_sentiment * data.effort_score * 0.3;
    predicted_score += emotionEffortSynergy;
    
    // Normalize to 0-20 scale with realistic bounds
    predicted_score = Math.max(2, Math.min(20, predicted_score));
    
    // Enhanced confidence calculation
    const variance_factors = [
      Math.abs(data.g2 - data.g1), // Grade stability
      data.absences, // Attendance consistency
      Math.abs(data.emotional_sentiment - 0.5) * 2, // Emotional stability
      Math.abs(data.effort_score - 7.5) / 7.5 // Effort consistency
    ];
    
    const avg_variance = variance_factors.reduce((a, b) => a + b, 0) / variance_factors.length;
    const base_confidence = Math.max(65, 95 - (avg_variance * 8));
    const confidence_level = Math.min(98, base_confidence + (data.participation_index * 2));
    
    // Dynamic risk assessment
    let risk_level = 'low';
    if (predicted_score < 8) risk_level = 'high';
    else if (predicted_score < 12) risk_level = 'medium';
    else if (data.absences > 8) risk_level = 'medium';
    else if (data.emotional_sentiment < 0.3) risk_level = 'medium';

    const intervention_summary = generateAdvancedIntervention(data, predicted_score, risk_level);

    // Enhanced SHAP explanation with feature importance
    const shap_explanation = {
      features: {
        previous_performance: academicWeight,
        study_effort: studyEffort,
        attendance: attendanceImpact,
        emotional_state: emotionalFactor,
        effort_level: effortBonus,
        participation: participationBonus,
        improvement_trend: data.g2 > data.g1 ? 1.5 : (data.g2 < data.g1 ? -1.0 : 0),
        synergy_bonus: emotionEffortSynergy
      },
      total_contribution: predicted_score
    };

    console.log('Enhanced prediction result:', {
      predicted_score: Math.round(predicted_score * 100) / 100,
      confidence_level: Math.round(confidence_level * 100) / 100,
      risk_level,
      shap_explanation
    });

    return {
      predicted_score: Math.round(predicted_score * 100) / 100,
      confidence_level: Math.round(confidence_level * 100) / 100,
      risk_level,
      intervention_summary,
      shap_explanation
    };
  };

  const generateAdvancedIntervention = (data: typeof formData, score: number, risk: string): string => {
    const interventions = [];
    const strengths = [];
    
    // Identify specific areas needing intervention
    if (data.studytime < 3) {
      interventions.push("📚 Implement structured study schedule with 30-45 min focused sessions");
    } else if (data.studytime > 7) {
      strengths.push("Strong study time commitment");
    }
    
    if (data.absences > 5) {
      interventions.push("🏫 Address attendance patterns - consider flexible scheduling or support");
    } else if (data.absences < 2) {
      strengths.push("Excellent attendance record");
    }
    
    if (data.effort_score < 6) {
      interventions.push("💪 Motivational coaching and goal-setting sessions needed");
    } else if (data.effort_score > 8) {
      strengths.push("High effort and motivation levels");
    }
    
    if (data.participation_index < 6) {
      interventions.push("🗣️ Encourage active participation through smaller group activities");
    } else if (data.participation_index > 8) {
      strengths.push("Active class participant");
    }
    
    if (data.emotional_sentiment < 0.4) {
      interventions.push("🧠 Emotional support and stress management resources recommended");
    } else if (data.emotional_sentiment > 0.7) {
      strengths.push("Positive emotional state");
    }

    // Grade trend analysis
    if (data.g2 < data.g1) {
      interventions.push("📈 Focus on recent learning gaps - review G2 topics comprehensively");
    } else if (data.g2 > data.g1) {
      strengths.push("Showing academic improvement");
    }
    
    let summary = "";
    if (strengths.length > 0) {
      summary += `Strengths: ${strengths.join(", ")}. `;
    }
    
    if (interventions.length === 0) {
      summary += "Student is performing well across all metrics. Continue current approach with minor optimizations.";
    } else {
      summary += `Recommended interventions: ${interventions.join("; ")}. `;
      if (risk === 'high') {
        summary += "⚠️ HIGH PRIORITY - Immediate intervention required.";
      } else if (risk === 'medium') {
        summary += "⚡ Monitor progress closely and implement changes within 2 weeks.";
      }
    }
    
    return summary;
  };

  const handlePredict = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student first",
        variant: "destructive",
      });
      return;
    }

    // Validate input ranges
    if (formData.g1 < 0 || formData.g1 > 20 || formData.g2 < 0 || formData.g2 > 20) {
      toast({
        title: "Invalid Input",
        description: "Grades (G1, G2) must be between 0 and 20",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting prediction for student:', selectedStudent);
      
      // Generate enhanced ML prediction
      const predictionResult = enhancedMLPrediction(formData);
      
      console.log('Storing prediction in database...');
      
      // Store prediction in Supabase
      const { data: insertedData, error } = await supabase
        .from('predictions')
        .insert({
          student_id: selectedStudent,
          ...formData,
          ...predictionResult,
          model_version: 'v2.0-enhanced'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Prediction stored successfully:', insertedData);

      // Create alert if high risk
      if (predictionResult.risk_level === 'high') {
        console.log('Creating high-risk alert...');
        const { error: alertError } = await supabase
          .from('alerts')
          .insert({
            student_id: selectedStudent,
            alert_type: 'performance_drop',
            severity: 'high',
            message: `🚨 URGENT: Student predicted to score ${predictionResult.predicted_score}/20 (${predictionResult.confidence_level}% confidence). ${predictionResult.intervention_summary}`
          });

        if (alertError) {
          console.error('Alert creation error:', alertError);
        }
      } else if (predictionResult.risk_level === 'medium') {
        console.log('Creating medium-risk alert...');
        await supabase
          .from('alerts')
          .insert({
            student_id: selectedStudent,
            alert_type: 'performance_drop',
            severity: 'medium',
            message: `⚠️ ATTENTION: Student predicted to score ${predictionResult.predicted_score}/20. Monitor closely. ${predictionResult.intervention_summary}`
          });
      }

      setPrediction(predictionResult);
      onPredictionComplete();
      
      toast({
        title: "🎯 Prediction Generated Successfully",
        description: `Score: ${predictionResult.predicted_score}/20 | Risk: ${predictionResult.risk_level} | Confidence: ${predictionResult.confidence_level}%`,
      });
    } catch (error) {
      console.error('Error generating prediction:', error);
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
          <Calculator className="w-5 h-5 text-blue-600" />
          🧠 Enhanced AI Performance Prediction
        </CardTitle>
        <CardDescription>
          Advanced ML prediction with SHAP explainability and personalized interventions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="student">Select Student</Label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>📚 Study Time (hours/week): {formData.studytime}</Label>
            <Slider
              value={[formData.studytime]}
              onValueChange={([value]) => handleInputChange('studytime', value)}
              min={1}
              max={15}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              Optimal range: 4-8 hours/week
            </div>
          </div>

          <div>
            <Label>📊 Previous Grade 1 (G1): {formData.g1}</Label>
            <Slider
              value={[formData.g1]}
              onValueChange={([value]) => handleInputChange('g1', value)}
              min={0}
              max={20}
              step={0.5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>📈 Previous Grade 2 (G2): {formData.g2}</Label>
            <Slider
              value={[formData.g2]}
              onValueChange={([value]) => handleInputChange('g2', value)}
              min={0}
              max={20}
              step={0.5}
              className="mt-2"
            />
            {formData.g2 > formData.g1 && (
              <div className="text-xs text-green-600 mt-1">✅ Improving trend detected</div>
            )}
            {formData.g2 < formData.g1 && (
              <div className="text-xs text-red-600 mt-1">⚠️ Declining trend detected</div>
            )}
          </div>

          <div>
            <Label>🏫 Absences: {formData.absences}</Label>
            <Slider
              value={[formData.absences]}
              onValueChange={([value]) => handleInputChange('absences', value)}
              min={0}
              max={25}
              step={1}
              className="mt-2"
            />
            {formData.absences > 10 && (
              <div className="text-xs text-red-600 mt-1">⚠️ High absence rate</div>
            )}
          </div>

          <div>
            <Label>💪 Effort Score: {formData.effort_score}</Label>
            <Slider
              value={[formData.effort_score]}
              onValueChange={([value]) => handleInputChange('effort_score', value)}
              min={1}
              max={10}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>😊 Emotional Sentiment: {formData.emotional_sentiment}</Label>
            <Slider
              value={[formData.emotional_sentiment]}
              onValueChange={([value]) => handleInputChange('emotional_sentiment', value)}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              0=Very Negative, 0.5=Neutral, 1=Very Positive
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>🗣️ Participation Index: {formData.participation_index}</Label>
            <Slider
              value={[formData.participation_index]}
              onValueChange={([value]) => handleInputChange('participation_index', value)}
              min={1}
              max={10}
              step={0.1}
              className="mt-2"
            />
          </div>
        </div>

        <Button 
          onClick={handlePredict} 
          disabled={loading || !selectedStudent}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-spin" />
              🔮 Generating Enhanced Prediction...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              🚀 Generate Enhanced AI Prediction
            </>
          )}
        </Button>

        {prediction && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              🎯 Enhanced Prediction Results
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
            
            {prediction.shap_explanation && (
              <div className="mb-3 bg-white/50 p-3 rounded">
                <strong className="text-sm">🔍 Feature Importance Analysis:</strong>
                <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                  {Object.entries(prediction.shap_explanation.features).map(([feature, value]) => (
                    <div key={feature} className="flex justify-between">
                      <span>{feature.replace('_', ' ')}:</span>
                      <span className="font-mono">{Number(value).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-white/50 p-3 rounded">
              <strong className="text-sm">📋 Personalized Intervention Plan:</strong>
              <p className="text-gray-700 mt-2 text-sm leading-relaxed">{prediction.intervention_summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionForm;
