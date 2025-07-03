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
      saved_food_items: {
        Row: {
          carbs_per_serving: number
          category: string | null
          created_at: string
          id: string
          name: string
          serving_size: string | null
          sodium_per_serving: number
          updated_at: string
          user_id: string
          water_per_serving: number
        }
        Insert: {
          carbs_per_serving?: number
          category?: string | null
          created_at?: string
          id?: string
          name: string
          serving_size?: string | null
          sodium_per_serving?: number
          updated_at?: string
          user_id: string
          water_per_serving?: number
        }
        Update: {
          carbs_per_serving?: number
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          serving_size?: string | null
          sodium_per_serving?: number
          updated_at?: string
          user_id?: string
          water_per_serving?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_food_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_nutrition_items: {
        Row: {
          calories_per_hour: number | null
          carbs_per_hour: number
          category: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          sodium_per_hour: number
          updated_at: string | null
          user_id: string
          water_per_hour: number
        }
        Insert: {
          calories_per_hour?: number | null
          carbs_per_hour?: number
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          sodium_per_hour?: number
          updated_at?: string | null
          user_id: string
          water_per_hour?: number
        }
        Update: {
          calories_per_hour?: number | null
          carbs_per_hour?: number
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          sodium_per_hour?: number
          updated_at?: string | null
          user_id?: string
          water_per_hour?: number
        }
        Relationships: []
      }
      saved_race_reports: {
        Row: {
          aid_stations: Json
          created_at: string | null
          id: string
          nutrition_plan: Json
          race_name: string
          race_profile: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aid_stations: Json
          created_at?: string | null
          id?: string
          nutrition_plan: Json
          race_name: string
          race_profile: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aid_stations?: Json
          created_at?: string | null
          id?: string
          nutrition_plan?: Json
          race_name?: string
          race_profile?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_races: {
        Row: {
          aid_stations: Json | null
          created_at: string
          distance: number
          elevation_gain: number | null
          estimated_time: unknown
          id: string
          nutrition_plan: Json | null
          race_date: string | null
          race_name: string
          start_time: string | null
          unit_preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          aid_stations?: Json | null
          created_at?: string
          distance: number
          elevation_gain?: number | null
          estimated_time: unknown
          id?: string
          nutrition_plan?: Json | null
          race_date?: string | null
          race_name: string
          start_time?: string | null
          unit_preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          aid_stations?: Json | null
          created_at?: string
          distance?: number
          elevation_gain?: number | null
          estimated_time?: unknown
          id?: string
          nutrition_plan?: Json | null
          race_date?: string | null
          race_name?: string
          start_time?: string | null
          unit_preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_races_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string | null
          email: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          location: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          email: string
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          location?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          location?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
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
