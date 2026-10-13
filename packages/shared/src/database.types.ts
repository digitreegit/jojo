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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      appeals: {
        Row: {
          action_id: string
          created_at: string
          decided_at: string | null
          decision_note: string | null
          due_at: string
          id: string
          message: string
          status: Database["public"]["Enums"]["appeal_status"]
          user_id: string
        }
        Insert: {
          action_id: string
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          due_at?: string
          id?: string
          message: string
          status?: Database["public"]["Enums"]["appeal_status"]
          user_id: string
        }
        Update: {
          action_id?: string
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          due_at?: string
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["appeal_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appeals_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: true
            referencedRelation: "moderation_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closed_reason:
            | Database["public"]["Enums"]["match_close_reason"]
            | null
          created_at: string
          id: string
          last_message_at: string | null
          user_a: string
          user_b: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closed_reason?:
            | Database["public"]["Enums"]["match_close_reason"]
            | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_a: string
          user_b: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closed_reason?:
            | Database["public"]["Enums"]["match_close_reason"]
            | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          match_id: string
          media_path: string | null
          risk_score: number | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          match_id: string
          media_path?: string | null
          risk_score?: number | null
          sender_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          match_id?: string
          media_path?: string | null
          risk_score?: number | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          created_at: string
          evidence: Json
          expires_at: string | null
          id: string
          level: Database["public"]["Enums"]["strike_level"]
          reason: string
          report_id: string | null
          reviewer_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["strike_level"]
          reason: string
          report_id?: string | null
          reviewer_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["strike_level"]
          reason?: string
          report_id?: string | null
          reviewer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string
          face_match_score: number | null
          id: string
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          position: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          face_match_score?: number | null
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          position: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          face_match_score?: number | null
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          position?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      preferences: {
        Row: {
          age_max: number
          age_min: number
          distance_km: number
          genders: Database["public"]["Enums"]["gender"][]
          i_message_first: boolean
          intents: Database["public"]["Enums"]["intent"][]
          user_id: string
        }
        Insert: {
          age_max?: number
          age_min?: number
          distance_km?: number
          genders: Database["public"]["Enums"]["gender"][]
          i_message_first?: boolean
          intents?: Database["public"]["Enums"]["intent"][]
          user_id: string
        }
        Update: {
          age_max?: number
          age_min?: number
          distance_km?: number
          genders?: Database["public"]["Enums"]["gender"][]
          i_message_first?: boolean
          intents?: Database["public"]["Enums"]["intent"][]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profile_prompts: {
        Row: {
          answer: string
          id: string
          position: number
          prompt_key: string
          user_id: string
        }
        Insert: {
          answer: string
          id?: string
          position: number
          prompt_key: string
          user_id: string
        }
        Update: {
          answer?: string
          id?: string
          position?: number
          prompt_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          birthdate: string
          created_at: string
          display_name: string
          face_verified_at: string | null
          gender: Database["public"]["Enums"]["gender"]
          height_cm: number | null
          identity_verified_at: string | null
          intent: Database["public"]["Enums"]["intent"]
          job: string | null
          last_active_at: string
          locale: string
          location: unknown
          school: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          birthdate: string
          created_at?: string
          display_name: string
          face_verified_at?: string | null
          gender: Database["public"]["Enums"]["gender"]
          height_cm?: number | null
          identity_verified_at?: string | null
          intent: Database["public"]["Enums"]["intent"]
          job?: string | null
          last_active_at?: string
          locale?: string
          location?: unknown
          school?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          birthdate?: string
          created_at?: string
          display_name?: string
          face_verified_at?: string | null
          gender?: Database["public"]["Enums"]["gender"]
          height_cm?: number | null
          identity_verified_at?: string | null
          intent?: Database["public"]["Enums"]["intent"]
          job?: string | null
          last_active_at?: string
          locale?: string
          location?: unknown
          school?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          note: string | null
          photo_id: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          note?: string | null
          photo_id?: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          note?: string | null
          photo_id?: string | null
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          product_id: string
          provider: string
          status: string
          updated_at: string
          user_id: string
          will_renew: boolean
        }
        Insert: {
          current_period_end?: string | null
          product_id: string
          provider: string
          status: string
          updated_at?: string
          user_id: string
          will_renew?: boolean
        }
        Update: {
          current_period_end?: string | null
          product_id?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
          will_renew?: boolean
        }
        Relationships: []
      }
      swipes: {
        Row: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at: string
          swiper_id: string
          target_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at?: string
          swiper_id: string
          target_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["swipe_action"]
          created_at?: string
          swiper_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_status: "active" | "limited" | "suspended" | "banned" | "deleted"
      appeal_status: "in_review" | "approved" | "denied"
      gender: "woman" | "man" | "nonbinary"
      intent: "long_term" | "short_term" | "casual" | "friends" | "figuring_out"
      match_close_reason:
        | "polite_close"
        | "unmatch"
        | "block"
        | "inactive"
        | "moderation"
      moderation_status: "pending" | "approved" | "rejected"
      report_reason:
        | "fake_profile"
        | "scam_or_money"
        | "external_contact_push"
        | "harassment"
        | "sexual_content"
        | "underage"
        | "hate_speech"
        | "offline_safety"
        | "other"
      report_status: "open" | "reviewing" | "actioned" | "dismissed"
      strike_level: "warning" | "limited" | "suspended" | "banned"
      swipe_action: "like" | "superlike" | "pass"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "limited", "suspended", "banned", "deleted"],
      appeal_status: ["in_review", "approved", "denied"],
      gender: ["woman", "man", "nonbinary"],
      intent: ["long_term", "short_term", "casual", "friends", "figuring_out"],
      match_close_reason: [
        "polite_close",
        "unmatch",
        "block",
        "inactive",
        "moderation",
      ],
      moderation_status: ["pending", "approved", "rejected"],
      report_reason: [
        "fake_profile",
        "scam_or_money",
        "external_contact_push",
        "harassment",
        "sexual_content",
        "underage",
        "hate_speech",
        "offline_safety",
        "other",
      ],
      report_status: ["open", "reviewing", "actioned", "dismissed"],
      strike_level: ["warning", "limited", "suspended", "banned"],
      swipe_action: ["like", "superlike", "pass"],
    },
  },
} as const
