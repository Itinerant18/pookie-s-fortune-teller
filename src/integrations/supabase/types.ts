export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      astrologer_profiles: {
        Row: {
          average_rating: number | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          languages: string[] | null
          max_consultation_duration_minutes: number | null
          min_consultation_duration_minutes: number | null
          qualifications: string | null
          review_count: number | null
          specialty: string | null
          total_consultations: number | null
          total_earnings: number | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id: string
          is_available?: boolean | null
          languages?: string[] | null
          max_consultation_duration_minutes?: number | null
          min_consultation_duration_minutes?: number | null
          qualifications?: string | null
          review_count?: number | null
          specialty?: string | null
          total_consultations?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          max_consultation_duration_minutes?: number | null
          min_consultation_duration_minutes?: number | null
          qualifications?: string | null
          review_count?: number | null
          specialty?: string | null
          total_consultations?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      astrologer_ratings: {
        Row: {
          astrologer_id: string
          consultation_id: string
          created_at: string | null
          id: string
          is_helpful: boolean | null
          rating: number | null
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          astrologer_id: string
          consultation_id: string
          created_at?: string | null
          id?: string
          is_helpful?: boolean | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          astrologer_id?: string
          consultation_id?: string
          created_at?: string | null
          id?: string
          is_helpful?: boolean | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "astrologer_ratings_astrologer_id_fkey"
            columns: ["astrologer_id"]
            isOneToOne: false
            referencedRelation: "astrologer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astrologer_ratings_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      astrology_article_embeddings: {
        Row: {
          article_id: string
          category: string | null
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string
          tags: string[] | null
          title: string | null
        }
        Insert: {
          article_id: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title?: string | null
        }
        Update: {
          article_id?: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      birth_charts: {
        Row: {
          birth_date: string
          birth_location_lat: number | null
          birth_location_lng: number | null
          birth_location_name: string | null
          birth_time: string | null
          birth_time_accuracy: string | null
          birth_timezone: string | null
          created_at: string | null
          current_dasha: Json | null
          dasha_sequence: Json | null
          divisional_charts: Json | null
          doshas: Json | null
          houses: Json | null
          id: string
          planets: Json | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          yogas: Json | null
        }
        Insert: {
          birth_date: string
          birth_location_lat?: number | null
          birth_location_lng?: number | null
          birth_location_name?: string | null
          birth_time?: string | null
          birth_time_accuracy?: string | null
          birth_timezone?: string | null
          created_at?: string | null
          current_dasha?: Json | null
          dasha_sequence?: Json | null
          divisional_charts?: Json | null
          doshas?: Json | null
          houses?: Json | null
          id?: string
          planets?: Json | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          yogas?: Json | null
        }
        Update: {
          birth_date?: string
          birth_location_lat?: number | null
          birth_location_lng?: number | null
          birth_location_name?: string | null
          birth_time?: string | null
          birth_time_accuracy?: string | null
          birth_timezone?: string | null
          created_at?: string | null
          current_dasha?: Json | null
          dasha_sequence?: Json | null
          divisional_charts?: Json | null
          doshas?: Json | null
          houses?: Json | null
          id?: string
          planets?: Json | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          yogas?: Json | null
        }
        Relationships: []
      }
      consultation_messages: {
        Row: {
          consultation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_url: string | null
          message_text: string | null
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_text?: string | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_text?: string | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          amount_charged: number | null
          astrologer_id: string
          astrologer_notes: string | null
          call_recording_url: string | null
          consultation_type: string | null
          created_at: string | null
          currency: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          payment_status: string | null
          recording_duration_seconds: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          amount_charged?: number | null
          astrologer_id: string
          astrologer_notes?: string | null
          call_recording_url?: string | null
          consultation_type?: string | null
          created_at?: string | null
          currency?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          payment_status?: string | null
          recording_duration_seconds?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          amount_charged?: number | null
          astrologer_id?: string
          astrologer_notes?: string | null
          call_recording_url?: string | null
          consultation_type?: string | null
          created_at?: string | null
          currency?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          payment_status?: string | null
          recording_duration_seconds?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          associated_conditions: string[] | null
          associated_doshas: string[] | null
          associated_planets: string[] | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          image_urls: string[] | null
          name: string
          price: number | null
          quantity_available: number | null
          seller_id: string | null
          updated_at: string | null
        }
        Insert: {
          associated_conditions?: string[] | null
          associated_doshas?: string[] | null
          associated_planets?: string[] | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          name: string
          price?: number | null
          quantity_available?: number | null
          seller_id?: string | null
          updated_at?: string | null
        }
        Update: {
          associated_conditions?: string[] | null
          associated_doshas?: string[] | null
          associated_planets?: string[] | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          name?: string
          price?: number | null
          quantity_available?: number | null
          seller_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      model_registry: {
        Row: {
          created_at: string | null
          features_config: Json | null
          id: string
          name: string
          parameters: Json | null
          status: string | null
          training_metrics: Json | null
          type: string | null
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          features_config?: Json | null
          id?: string
          name: string
          parameters?: Json | null
          status?: string | null
          training_metrics?: Json | null
          type?: string | null
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          features_config?: Json | null
          id?: string
          name?: string
          parameters?: Json | null
          status?: string | null
          training_metrics?: Json | null
          type?: string | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          items: Json | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string | null
          stripe_payment_id: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          items?: Json | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          stripe_payment_id?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          stripe_payment_id?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          accuracy_score: number | null
          actual_outcome: Json | null
          astrology_confidence: number | null
          astrology_prediction: Json | null
          behavior_confidence: number | null
          behavior_prediction: Json | null
          category: string
          combined_prediction: Json | null
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          model_id: string | null
          overall_confidence: number | null
          period_end: string | null
          period_start: string | null
          prediction_type: string | null
          timeframe: string | null
          updated_at: string | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          astrology_confidence?: number | null
          astrology_prediction?: Json | null
          behavior_confidence?: number | null
          behavior_prediction?: Json | null
          category: string
          combined_prediction?: Json | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          model_id?: string | null
          overall_confidence?: number | null
          period_end?: string | null
          period_start?: string | null
          prediction_type?: string | null
          timeframe?: string | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          astrology_confidence?: number | null
          astrology_prediction?: Json | null
          behavior_confidence?: number | null
          behavior_prediction?: Json | null
          category?: string
          combined_prediction?: Json | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          model_id?: string | null
          overall_confidence?: number | null
          period_end?: string | null
          period_start?: string | null
          prediction_type?: string | null
          timeframe?: string | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_prediction_model"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          features: Json | null
          id: string
          started_at: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          executed_at: string | null
          id: string
          logs: string | null
          model_id: string | null
          performance_improvement: number | null
          previous_model_version: string | null
          sample_size: number | null
          status: string | null
          training_data_end_date: string | null
          training_data_start_date: string | null
        }
        Insert: {
          executed_at?: string | null
          id?: string
          logs?: string | null
          model_id?: string | null
          performance_improvement?: number | null
          previous_model_version?: string | null
          sample_size?: number | null
          status?: string | null
          training_data_end_date?: string | null
          training_data_start_date?: string | null
        }
        Update: {
          executed_at?: string | null
          id?: string
          logs?: string | null
          model_id?: string | null
          performance_improvement?: number | null
          previous_model_version?: string | null
          sample_size?: number | null
          status?: string | null
          training_data_end_date?: string | null
          training_data_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          payment_method: string | null
          related_id: string | null
          status: string | null
          stripe_payment_id: string | null
          transaction_type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          related_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          transaction_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          related_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          transaction_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_metrics: {
        Row: {
          category: string | null
          id: number
          metric_date: string
          metric_type: string
          metric_value: number | null
          notes: string | null
          recorded_at: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          id?: number
          metric_date: string
          metric_type: string
          metric_value?: number | null
          notes?: string | null
          recorded_at?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          id?: number
          metric_date?: string
          metric_type?: string
          metric_value?: number | null
          notes?: string | null
          recorded_at?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_predictions: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          prediction_frequency: string | null
          profile_public: boolean | null
          push_notifications: boolean | null
          show_birth_chart_public: boolean | null
          sms_alerts: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_predictions?: boolean | null
          id: string
          language?: string | null
          notifications_enabled?: boolean | null
          prediction_frequency?: string | null
          profile_public?: boolean | null
          push_notifications?: boolean | null
          show_birth_chart_public?: boolean | null
          sms_alerts?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_predictions?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          prediction_frequency?: string | null
          profile_public?: boolean | null
          push_notifications?: boolean | null
          show_birth_chart_public?: boolean | null
          sms_alerts?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          birth_lat: number | null
          birth_lon: number | null
          birth_place: string | null
          created_at: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          profile_image_url: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_tier: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          profile_image_url?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          profile_image_url?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
