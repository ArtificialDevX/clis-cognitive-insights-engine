export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean | null
          message: string
          prediction_id: string | null
          resolved_at: string | null
          severity: string
          student_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message: string
          prediction_id?: string | null
          resolved_at?: string | null
          severity: string
          student_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          prediction_id?: string | null
          resolved_at?: string | null
          severity?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          absences: number
          confidence_level: number | null
          created_at: string
          effort_score: number
          emotional_sentiment: number
          g1: number
          g2: number
          id: string
          intervention_summary: string | null
          model_version: string | null
          participation_index: number
          predicted_score: number
          risk_level: string | null
          shap_explanation: Json | null
          student_id: string | null
          studytime: number
        }
        Insert: {
          absences: number
          confidence_level?: number | null
          created_at?: string
          effort_score: number
          emotional_sentiment: number
          g1: number
          g2: number
          id?: string
          intervention_summary?: string | null
          model_version?: string | null
          participation_index: number
          predicted_score: number
          risk_level?: string | null
          shap_explanation?: Json | null
          student_id?: string | null
          studytime: number
        }
        Update: {
          absences?: number
          confidence_level?: number | null
          created_at?: string
          effort_score?: number
          emotional_sentiment?: number
          g1?: number
          g2?: number
          id?: string
          intervention_summary?: string | null
          model_version?: string | null
          participation_index?: number
          predicted_score?: number
          risk_level?: string | null
          shap_explanation?: Json | null
          student_id?: string | null
          studytime?: number
        }
        Relationships: []
      }
      student: {
        Row: {
          absences: number | null
          activities: string | null
          address: string | null
          age: number | null
          Dalc: number | null
          failures: string | null
          famrel: number | null
          famsize: string | null
          famsup: string | null
          Fedu: number | null
          Fjob: string | null
          freetime: number | null
          G1: string | null
          G2: number | null
          G3: number | null
          goout: number | null
          guardian: string | null
          health: number | null
          higher: string | null
          id: number
          internet: string | null
          Medu: number | null
          Mjob: string | null
          nursery: string | null
          paid: string | null
          Pstatus: string | null
          reason: string | null
          romantic: string | null
          school: string | null
          schoolsup: string | null
          sex: string | null
          studytime: number | null
          traveltime: number | null
          Walc: number | null
        }
        Insert: {
          absences?: number | null
          activities?: string | null
          address?: string | null
          age?: number | null
          Dalc?: number | null
          failures?: string | null
          famrel?: number | null
          famsize?: string | null
          famsup?: string | null
          Fedu?: number | null
          Fjob?: string | null
          freetime?: number | null
          G1?: string | null
          G2?: number | null
          G3?: number | null
          goout?: number | null
          guardian?: string | null
          health?: number | null
          higher?: string | null
          id?: number
          internet?: string | null
          Medu?: number | null
          Mjob?: string | null
          nursery?: string | null
          paid?: string | null
          Pstatus?: string | null
          reason?: string | null
          romantic?: string | null
          school?: string | null
          schoolsup?: string | null
          sex?: string | null
          studytime?: number | null
          traveltime?: number | null
          Walc?: number | null
        }
        Update: {
          absences?: number | null
          activities?: string | null
          address?: string | null
          age?: number | null
          Dalc?: number | null
          failures?: string | null
          famrel?: number | null
          famsize?: string | null
          famsup?: string | null
          Fedu?: number | null
          Fjob?: string | null
          freetime?: number | null
          G1?: string | null
          G2?: number | null
          G3?: number | null
          goout?: number | null
          guardian?: string | null
          health?: number | null
          higher?: string | null
          id?: number
          internet?: string | null
          Medu?: number | null
          Mjob?: string | null
          nursery?: string | null
          paid?: string | null
          Pstatus?: string | null
          reason?: string | null
          romantic?: string | null
          school?: string | null
          schoolsup?: string | null
          sex?: string | null
          studytime?: number | null
          traveltime?: number | null
          Walc?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
