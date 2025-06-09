
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Brain, Calculator } from 'lucide-react';
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
  const [prediction, setPrediction] = useState<any>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const mockMLPrediction = (data: typeof formData) => {
    // Simulate ML model prediction based on input features
    const weightedScore = (
      data.g1 * 0.3 +
      data.g2 * 0.35 +
      data.studytime * 1.2 +
      data.effort_score * 0.8 +
      data.participation_index * 0.6 +
      (10 - data.absences) * 0.4 +
      data.emotional_sentiment * 5
    );

    const predicted_score = Math.max(0, Math.min(20, weightedScore));
    const confidence_level = Math.random() * 30 + 70; // 70-100%
    
    let risk_level = 'low';
    if (predicted_score < 10) risk_level = 'high';
    else if (predicted_score < 14) risk_level = 'medium';

    const intervention_summary = generateInterventionSummary(data, predicted_score, risk_level);

    return {
      predicted_score: Math.round(predicted_score * 100) / 100,
      confidence_level: Math.round(confidence_level * 100) / 100,
      risk_level,
      intervention_summary,
      shap_explanation: {
        features: {
          g1: data.g1 * 0.3,
          g2: data.g2 * 0.35,
          studytime: data.studytime * 1.2,
          effort_score: data.effort_score * 0.8,
          participation_index: data.participation_index * 0.6,
          absences: (10 - data.absences) * 0.4,
          emotional_sentiment: data.emotional_sentiment * 5
        }
      }
    };
  };

  const generateInterventionSummary = (data: typeof formData, score: number, risk: string) => {
    const interventions = [];
    
    if (data.studytime < 3) interventions.push("Increase study time allocation");
    if (data.absences > 5) interventions.push("Address attendance issues");
    if (data.effort_score < 6) interventions.push("Motivational support needed");
    if (data.participation_index < 6) interventions.push("Encourage class participation");
    if (data.emotional_sentiment < 0.4) interventions.push("Emotional support recommended");
    
    if (interventions.length === 0) {
      return "Student is performing well. Continue current approach.";
    }
    
    return `Recommended interventions: ${interventions.join(", ")}. ${risk === 'high' ? 'Immediate attention required.' : 'Monitor progress closely.'}`;
  };

  const handlePredict = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to your Colab ML model
      const predictionResult = mockMLPrediction(formData);
      
      // Store prediction in Supabase
      const { error } = await supabase
        .from('predictions')
        .insert({
          student_id: selectedStudent,
          ...formData,
          ...predictionResult,
          model_version: 'v1.0'
        });

      if (error) throw error;

      // Create alert if high risk
      if (predictionResult.risk_level === 'high') {
        await supabase
          .from('alerts')
          .insert({
            student_id: selectedStudent,
            alert_type: 'performance_drop',
            severity: 'high',
            message: `Student predicted to score ${predictionResult.predicted_score}/20. ${predictionResult.intervention_summary}`
          });
      }

      setPrediction(predictionResult);
      onPredictionComplete();
      
      toast({
        title: "Success",
        description: "Prediction generated successfully",
      });
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast({
        title: "Error",
        description: "Failed to generate prediction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          AI Performance Prediction
        </CardTitle>
        <CardDescription>
          Input student data to generate ML-powered performance predictions
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
            <Label>Study Time (hours/week): {formData.studytime}</Label>
            <Slider
              value={[formData.studytime]}
              onValueChange={([value]) => handleInputChange('studytime', value)}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Previous Grade 1 (G1): {formData.g1}</Label>
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
            <Label>Previous Grade 2 (G2): {formData.g2}</Label>
            <Slider
              value={[formData.g2]}
              onValueChange={([value]) => handleInputChange('g2', value)}
              min={0}
              max={20}
              step={0.5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Absences: {formData.absences}</Label>
            <Slider
              value={[formData.absences]}
              onValueChange={([value]) => handleInputChange('absences', value)}
              min={0}
              max={20}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Effort Score: {formData.effort_score}</Label>
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
            <Label>Emotional Sentiment: {formData.emotional_sentiment}</Label>
            <Slider
              value={[formData.emotional_sentiment]}
              onValueChange={([value]) => handleInputChange('emotional_sentiment', value)}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Participation Index: {formData.participation_index}</Label>
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
              Generating Prediction...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate AI Prediction
            </>
          )}
        </Button>

        {prediction && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            <h4 className="font-semibold text-blue-800 mb-2">Prediction Results</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Predicted Score: <span className="font-bold">{prediction.predicted_score}/20</span></div>
              <div>Confidence: <span className="font-bold">{prediction.confidence_level}%</span></div>
              <div className="col-span-2">
                Risk Level: 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  prediction.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                  prediction.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {prediction.risk_level.toUpperCase()}
                </span>
              </div>
              <div className="col-span-2 mt-2">
                <strong>Intervention:</strong>
                <p className="text-gray-700 mt-1">{prediction.intervention_summary}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionForm;
