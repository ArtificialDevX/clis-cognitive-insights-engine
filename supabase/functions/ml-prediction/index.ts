
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionRequest {
  student_id: string;
  features: {
    age: number;
    studytime: number;
    g1: number;
    g2: number;
    absences: number;
    effort_score: number;
    emotional_sentiment: number;
    participation_index: number;
    family_support: number;
    health_score: number;
    social_activity: number;
    alcohol_consumption: number;
    attendance_rate: number;
    motivation_level: number;
    stress_level: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { student_id, features }: PredictionRequest = await req.json();

    console.log('Making prediction for student:', student_id);
    console.log('Features:', features);

    // Your Colab backend URL - replace with your actual ngrok or Colab URL
    const colabBackendUrl = Deno.env.get('COLAB_BACKEND_URL') || 'https://your-colab-url.ngrok.io';
    
    console.log('Calling Colab backend at:', colabBackendUrl);
    
    // Call your Colab backend
    const response = await fetch(`${colabBackendUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        features: [
          features.age,
          features.studytime,
          features.g1,
          features.g2,
          features.absences,
          features.effort_score,
          features.emotional_sentiment,
          features.participation_index,
          features.family_support,
          features.health_score,
          features.social_activity,
          features.alcohol_consumption,
          features.attendance_rate,
          features.motivation_level,
          features.stress_level
        ]
      }),
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    if (!response.ok) {
      throw new Error(`Colab backend responded with status: ${response.status}`);
    }

    const colabResult = await response.json();
    console.log('Colab prediction result:', colabResult);
    
    const prediction = {
      predicted_score: colabResult.predicted_score || colabResult.prediction,
      confidence_level: colabResult.confidence || 85,
      risk_level: colabResult.risk_level || (colabResult.predicted_score < 10 ? 'high' : colabResult.predicted_score < 14 ? 'medium' : 'low'),
      intervention_summary: colabResult.intervention || generateIntervention(colabResult.predicted_score || colabResult.prediction, features),
      model_version: 'colab-backend-v1.0',
      backend_source: 'colab'
    };

    // Store prediction in database
    const { data: insertedData, error: insertError } = await supabase
      .from('predictions')
      .insert({
        student_id,
        ...features,
        ...prediction
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    // Create alert if high risk
    if (prediction.risk_level === 'high') {
      await supabase
        .from('alerts')
        .insert({
          student_id,
          alert_type: 'performance_risk',
          severity: 'high',
          message: `HIGH RISK: Student ${student_id} predicted score ${prediction.predicted_score}/20. ${prediction.intervention_summary}`
        });
    }

    console.log('Prediction completed successfully:', insertedData);

    return new Response(
      JSON.stringify({
        success: true,
        prediction: insertedData,
        backend_used: 'colab'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ml-prediction function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Colab backend connection failed', 
        details: error.message,
        message: 'Please ensure your Colab backend is running and accessible'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateIntervention(score: number, features: any): string {
  const interventions = [];
  
  if (features.studytime < 3) interventions.push("Increase study time");
  if (features.attendance_rate < 80) interventions.push("Improve attendance");
  if (features.effort_score < 6) interventions.push("Motivational support needed");
  if (features.stress_level > 0.7) interventions.push("Stress management required");
  if (features.emotional_sentiment < 0.4) interventions.push("Emotional support needed");
  
  if (interventions.length === 0) {
    return "Student performing well. Continue current approach.";
  }
  
  return `Recommended interventions: ${interventions.join(", ")}.`;
}
