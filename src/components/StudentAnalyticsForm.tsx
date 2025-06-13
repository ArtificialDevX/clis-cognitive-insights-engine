
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Brain, Calculator, AlertTriangle, Database, Users, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: number;
  age?: number;
  sex?: string;
  studytime?: number;
  absences?: number;
  G1?: string;
  G2?: number;
  G3?: number;
  school?: string;
  Fedu?: number;
  Medu?: number;
  famrel?: number;
  freetime?: number;
  goout?: number;
  Dalc?: number;
  Walc?: number;
  health?: number;
  address?: string;
  famsize?: string;
  Pstatus?: string;
  Mjob?: string;
  Fjob?: string;
  reason?: string;
  guardian?: string;
  traveltime?: number;
  failures?: string;
  schoolsup?: string;
  famsup?: string;
  paid?: string;
  activities?: string;
  nursery?: string;
  higher?: string;
  internet?: string;
  romantic?: string;
}

interface StudentAnalyticsFormProps {
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

const StudentAnalyticsForm = ({ students, onPredictionComplete }: StudentAnalyticsFormProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [useRealData, setUseRealData] = useState(false);
  const [formData, setFormData] = useState({
    age: 16,
    studytime: 2,
    g1: 10,
    g2: 12,
    absences: 3,
    effort_score: 7.5,
    emotional_sentiment: 0.6,
    participation_index: 8.2,
    family_support: 3,
    health_score: 4,
    social_activity: 3,
    alcohol_consumption: 1,
    attendance_rate: 85,
    motivation_level: 7,
    stress_level: 0.4
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const selectedStudent = students.find(s => s.id.toString() === selectedStudentId);

  // Auto-populate form when student is selected from database
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setUseRealData(true);
    const student = students.find(s => s.id.toString() === studentId);
    
    if (student) {
      console.log('🎯 Loading real student data:', student);
      
      setFormData(prev => ({
        ...prev,
        // Use actual student data from your database
        age: student.age || 16,
        studytime: student.studytime || 2,
        g1: parseFloat(student.G1 || '0') || 10,
        g2: student.G2 || 12,
        absences: student.absences || 3,
        family_support: student.famrel || 3,
        health_score: student.health || 4,
        social_activity: student.goout || 3,
        alcohol_consumption: ((student.Dalc || 0) + (student.Walc || 0)) / 2 || 1,
        attendance_rate: Math.max(0, 100 - (student.absences || 0) * 3),
      }));
      
      toast({
        title: "✅ Real Student Data Loaded",
        description: `Loaded data for Student ID ${student.id} from your Supabase database`,
      });
    }
  };

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      console.log('Starting Colab backend prediction...');
      
      // Call the Colab backend via edge function
      const { data, error } = await supabase.functions.invoke('ml-prediction', {
        body: {
          student_id: selectedStudentId || 'custom_analytics',
          features: formData
        }
      });

      if (error) {
        console.error('Colab backend prediction error:', error);
        throw error;
      }

      console.log('Colab backend prediction result:', data);

      if (data.success) {
        setPrediction(data.prediction);
        onPredictionComplete();
        
        toast({
          title: "✅ Colab Backend Prediction Complete",
          description: `Score: ${data.prediction.predicted_score}/20 | Risk: ${data.prediction.risk_level} | Confidence: ${data.prediction.confidence_level}%`,
        });
      } else {
        throw new Error(data.error || 'Colab backend prediction failed');
      }
    } catch (error) {
      console.error('Error generating Colab prediction:', error);
      toast({
        title: "❌ Colab Backend Error",
        description: "Failed to connect to your Colab backend. Please ensure it's running and accessible.",
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
    <Card className="bg-white border-2 border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Wifi className="w-5 h-5 text-blue-600" />
          <Brain className="w-5 h-5 text-green-600" />
          <Database className="w-5 h-5 text-purple-600" />
          Real Colab Backend ML Predictions
        </CardTitle>
        <CardDescription className="text-slate-700">
          Direct integration with your Colab ML backend ({students.length} students available)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="student">Select Student from Your Database ({students.length} available)</Label>
            <Select value={selectedStudentId} onValueChange={handleStudentSelect}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose from ${students.length} students in your database...`} />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    🎓 Student ID {student.id} 
                    {student.age ? ` (Age: ${student.age})` : ''} 
                    {student.school ? ` - ${student.school}` : ''}
                    {student.G2 ? ` - G2: ${student.G2}` : ''}
                    {student.G3 ? ` - G3: ${student.G3}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedStudent && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg text-sm border border-green-200">
                <strong>📊 Your Database Student Record:</strong>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <span>📚 Study Time: {selectedStudent.studytime || 'N/A'}</span>
                  <span>🏫 Absences: {selectedStudent.absences || 'N/A'}</span>
                  <span>👤 Age: {selectedStudent.age || 'N/A'}</span>
                  <span>📝 G1: {selectedStudent.G1 || 'N/A'}</span>
                  <span>📈 G2: {selectedStudent.G2 || 'N/A'}</span>
                  <span>🎯 G3: {selectedStudent.G3 || 'N/A'}</span>
                  <span>👨‍🎓 Father Edu: {selectedStudent.Fedu || 'N/A'}</span>
                  <span>👩‍🎓 Mother Edu: {selectedStudent.Medu || 'N/A'}</span>
                  <span>🏠 Family Rel: {selectedStudent.famrel || 'N/A'}</span>
                  <span>🍺 Alcohol (D): {selectedStudent.Dalc || 'N/A'}</span>
                  <span>🍺 Alcohol (W): {selectedStudent.Walc || 'N/A'}</span>
                  <span>❤️ Health: {selectedStudent.health || 'N/A'}</span>
                </div>
                <p className="text-green-700 mt-2 font-medium">✅ This is from YOUR Supabase database!</p>
              </div>
            )}
          </div>

          <div>
            <Label>Prediction Mode</Label>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                {useRealData && selectedStudent ? 
                  "🎯 Using your database record with enhanced accuracy" : 
                  "⚡ Custom analytics mode - enter any data for prediction"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form inputs - keeping existing code structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>👤 Age: {formData.age}</Label>
            <Slider
              value={[formData.age]}
              onValueChange={([value]) => handleInputChange('age', value)}
              min={15}
              max={22}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              {selectedStudent?.age ? `🔥 Database value: ${selectedStudent.age}` : 'Manual input'}
            </div>
          </div>

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
              {selectedStudent?.studytime ? `🔥 Database value: ${selectedStudent.studytime}` : 'Manual input'}
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
            <div className="text-xs text-gray-500 mt-1">
              {selectedStudent?.G1 ? `🔥 Database value: ${selectedStudent.G1}` : 'Manual input'}
            </div>
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
            <div className="text-xs text-gray-500 mt-1">
              {selectedStudent?.G2 ? `🔥 Database value: ${selectedStudent.G2}` : 'Manual input'}
            </div>
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
            <div className="text-xs text-gray-500 mt-1">
              {selectedStudent?.absences ? `🔥 Database value: ${selectedStudent.absences}` : 'Manual input'}
            </div>
          </div>

          <div>
            <Label>📊 Attendance Rate: {formData.attendance_rate}%</Label>
            <Slider
              value={[formData.attendance_rate]}
              onValueChange={([value]) => handleInputChange('attendance_rate', value)}
              min={50}
              max={100}
              step={1}
              className="mt-2"
            />
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
            <Label>🎯 Motivation Level: {formData.motivation_level}</Label>
            <Slider
              value={[formData.motivation_level]}
              onValueChange={([value]) => handleInputChange('motivation_level', value)}
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

          <div>
            <Label>😰 Stress Level: {formData.stress_level}</Label>
            <Slider
              value={[formData.stress_level]}
              onValueChange={([value]) => handleInputChange('stress_level', value)}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              0=No Stress, 0.5=Moderate, 1=High Stress
            </div>
          </div>

          <div>
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

          <div>
            <Label>🏠 Family Support: {formData.family_support}</Label>
            <Slider
              value={[formData.family_support]}
              onValueChange={([value]) => handleInputChange('family_support', value)}
              min={1}
              max={5}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              {selectedStudent?.famrel ? `🔥 Database value: ${selectedStudent.famrel}` : 'Manual input'}
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePredict} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Wifi className="w-4 h-4 mr-2 animate-pulse" />
              Connecting to Colab Backend...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              <Brain className="w-4 h-4 mr-2" />
              Generate Colab ML Prediction
            </>
          )}
        </Button>

        {prediction && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <Brain className="w-4 h-4" />
              Real Colab Backend Results
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="bg-white p-2 rounded border border-green-200">
                <strong className="text-green-900">Predicted Score:</strong> 
                <span className="text-lg font-bold ml-2 text-green-700">{prediction.predicted_score}/20</span>
              </div>
              <div className="bg-white p-2 rounded border border-green-200">
                <strong className="text-green-900">Confidence:</strong> 
                <span className="text-lg font-bold ml-2 text-blue-700">{prediction.confidence_level}%</span>
              </div>
              <div className="col-span-2 bg-white p-2 rounded border border-green-200">
                <strong className="text-green-900">Risk Level:</strong>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(prediction.risk_level)}`}>
                  {prediction.risk_level.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border border-green-200">
              <strong className="text-sm text-green-900">Colab Intervention Plan:</strong>
              <p className="text-green-800 mt-2 text-sm leading-relaxed">{prediction.intervention_summary}</p>
            </div>
            
            <div className="mt-2 text-xs text-green-600 font-medium">
              ✅ Prediction generated by your Colab backend
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAnalyticsForm;
