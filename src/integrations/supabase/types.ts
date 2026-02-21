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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string
          category: Database["public"]["Enums"]["achievement_category"]
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          badge_color: string
          category: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Update: {
          badge_color?: string
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      backtesting_sessions: {
        Row: {
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          description: string | null
          id: string
          running_pl: number
          session_name: string
          starting_balance: number
          strategy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          description?: string | null
          id?: string
          running_pl?: number
          session_name: string
          starting_balance?: number
          strategy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          description?: string | null
          id?: string
          running_pl?: number
          session_name?: string
          starting_balance?: number
          strategy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_reviews: {
        Row: {
          created_at: string
          id: string
          lessons_learned: string | null
          missed_opportunities: string | null
          missed_opportunities_screenshots: string[] | null
          review_date: string
          total_pl: number | null
          updated_at: string
          user_id: string
          what_went_well: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lessons_learned?: string | null
          missed_opportunities?: string | null
          missed_opportunities_screenshots?: string[] | null
          review_date: string
          total_pl?: number | null
          updated_at?: string
          user_id: string
          what_went_well?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lessons_learned?: string | null
          missed_opportunities?: string | null
          missed_opportunities_screenshots?: string[] | null
          review_date?: string
          total_pl?: number | null
          updated_at?: string
          user_id?: string
          what_went_well?: string | null
        }
        Relationships: []
      }
      dream_profiles: {
        Row: {
          created_at: string
          diet_lifestyle: string | null
          dream_type: string
          id: string
          living_image_url: string | null
          living_situation: string | null
          luxury_approach: string | null
          professional_help: string | null
          style: string | null
          style_image_url: string | null
          timescale: string | null
          title: string
          travel: string | null
          travel_image_url: string | null
          updated_at: string
          user_id: string
          vehicle: string | null
          vehicle_image_url: string | null
          why_motivation: string | null
        }
        Insert: {
          created_at?: string
          diet_lifestyle?: string | null
          dream_type: string
          id?: string
          living_image_url?: string | null
          living_situation?: string | null
          luxury_approach?: string | null
          professional_help?: string | null
          style?: string | null
          style_image_url?: string | null
          timescale?: string | null
          title: string
          travel?: string | null
          travel_image_url?: string | null
          updated_at?: string
          user_id: string
          vehicle?: string | null
          vehicle_image_url?: string | null
          why_motivation?: string | null
        }
        Update: {
          created_at?: string
          diet_lifestyle?: string | null
          dream_type?: string
          id?: string
          living_image_url?: string | null
          living_situation?: string | null
          luxury_approach?: string | null
          professional_help?: string | null
          style?: string | null
          style_image_url?: string | null
          timescale?: string | null
          title?: string
          travel?: string | null
          travel_image_url?: string | null
          updated_at?: string
          user_id?: string
          vehicle?: string | null
          vehicle_image_url?: string | null
          why_motivation?: string | null
        }
        Relationships: []
      }
      dream_purchases: {
        Row: {
          created_at: string
          down_payment: number | null
          dream_profile_id: string
          id: string
          image_url: string | null
          is_selected: boolean | null
          item_name: string
          payment_period_years: number | null
          price: number
          tax_interest_buffer: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          down_payment?: number | null
          dream_profile_id: string
          id?: string
          image_url?: string | null
          is_selected?: boolean | null
          item_name: string
          payment_period_years?: number | null
          price: number
          tax_interest_buffer?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          down_payment?: number | null
          dream_profile_id?: string
          id?: string
          image_url?: string | null
          is_selected?: boolean | null
          item_name?: string
          payment_period_years?: number | null
          price?: number
          tax_interest_buffer?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_purchases_dream_profile_id_fkey"
            columns: ["dream_profile_id"]
            isOneToOne: false
            referencedRelation: "dream_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          account_size: string
          company: string
          created_at: string
          id: string
          max_loss: number
          profit_target: number
          running_pl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_size: string
          company: string
          created_at?: string
          id?: string
          max_loss?: number
          profit_target: number
          running_pl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_size?: string
          company?: string
          created_at?: string
          id?: string
          max_loss?: number
          profit_target?: number
          running_pl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      funded_accounts: {
        Row: {
          account_size: string
          company: string
          created_at: string
          funded_accounts_count: number
          funded_accounts_goal: number
          id: string
          max_loss: number
          running_pl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_size: string
          company: string
          created_at?: string
          funded_accounts_count?: number
          funded_accounts_goal: number
          id?: string
          max_loss?: number
          running_pl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_size?: string
          company?: string
          created_at?: string
          funded_accounts_count?: number
          funded_accounts_goal?: number
          id?: string
          max_loss?: number
          running_pl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals_checklist: {
        Row: {
          category: string
          created_at: string
          id: string
          is_completed: boolean
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_completed?: boolean
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          is_completed: boolean
          milestone_type: Database["public"]["Enums"]["milestone_type"]
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          is_completed?: boolean
          milestone_type: Database["public"]["Enums"]["milestone_type"]
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          is_completed?: boolean
          milestone_type?: Database["public"]["Enums"]["milestone_type"]
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_accounts: {
        Row: {
          account_name: string
          account_size: number
          broker: string | null
          created_at: string
          id: string
          running_pl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_size?: number
          broker?: string | null
          created_at?: string
          id?: string
          running_pl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_size?: number
          broker?: string | null
          created_at?: string
          id?: string
          running_pl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playbook_setups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          playbook_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          playbook_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          playbook_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_setups_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          created_at: string
          description: string | null
          documentation_notes: string | null
          file_urls: string[] | null
          id: string
          is_purchased: boolean
          name: string
          purchased_playbook_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          documentation_notes?: string | null
          file_urls?: string[] | null
          id?: string
          is_purchased?: boolean
          name: string
          purchased_playbook_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          documentation_notes?: string | null
          file_urls?: string[] | null
          id?: string
          is_purchased?: boolean
          name?: string
          purchased_playbook_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_management_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          rule_order: number
          rule_text: string
          strategy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          rule_order?: number
          rule_text: string
          strategy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          rule_order?: number
          rule_text?: string
          strategy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_management_rules_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_checklist: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          rule_order: number
          rule_text: string
          strategy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          rule_order?: number
          rule_text: string
          strategy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          rule_order?: number
          rule_text?: string
          strategy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_checklist_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_review_slides: {
        Row: {
          created_at: string
          daily_review_id: string
          id: string
          markers: Json | null
          reflection: string | null
          screenshot_slots: Json | null
          screenshot_url: string | null
          slide_order: number
          trade_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_review_id: string
          id?: string
          markers?: Json | null
          reflection?: string | null
          screenshot_slots?: Json | null
          screenshot_url?: string | null
          slide_order?: number
          trade_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_review_id?: string
          id?: string
          markers?: Json | null
          reflection?: string | null
          screenshot_slots?: Json | null
          screenshot_url?: string | null
          slide_order?: number
          trade_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_review_slides_daily_review_id_fkey"
            columns: ["daily_review_id"]
            isOneToOne: false
            referencedRelation: "daily_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_review_slides_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          account_id: string | null
          account_type: string | null
          asset_class: string | null
          buy_sell: string
          created_at: string
          day_of_week: string | null
          duration: string | null
          entry_price: number | null
          entry_timeframe: string | null
          entry_type: string | null
          exit_price: number | null
          fees: number | null
          id: string
          import_batch_id: string | null
          max_drawdown_pips: number | null
          notes: string | null
          original_take_profit_percent: number | null
          outcome: string
          pair: string | null
          pips: number | null
          profit: number | null
          risk_reward_ratio: string | null
          risk_to_pay: number | null
          screenshots: string[] | null
          session: string | null
          setup_id: string | null
          size: number | null
          stop_loss: number | null
          strategy_type: string | null
          symbol: string | null
          time_closed: string | null
          time_opened: string | null
          total_pips_secured: number | null
          trade_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          asset_class?: string | null
          buy_sell: string
          created_at?: string
          day_of_week?: string | null
          duration?: string | null
          entry_price?: number | null
          entry_timeframe?: string | null
          entry_type?: string | null
          exit_price?: number | null
          fees?: number | null
          id?: string
          import_batch_id?: string | null
          max_drawdown_pips?: number | null
          notes?: string | null
          original_take_profit_percent?: number | null
          outcome: string
          pair?: string | null
          pips?: number | null
          profit?: number | null
          risk_reward_ratio?: string | null
          risk_to_pay?: number | null
          screenshots?: string[] | null
          session?: string | null
          setup_id?: string | null
          size?: number | null
          stop_loss?: number | null
          strategy_type?: string | null
          symbol?: string | null
          time_closed?: string | null
          time_opened?: string | null
          total_pips_secured?: number | null
          trade_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          asset_class?: string | null
          buy_sell?: string
          created_at?: string
          day_of_week?: string | null
          duration?: string | null
          entry_price?: number | null
          entry_timeframe?: string | null
          entry_type?: string | null
          exit_price?: number | null
          fees?: number | null
          id?: string
          import_batch_id?: string | null
          max_drawdown_pips?: number | null
          notes?: string | null
          original_take_profit_percent?: number | null
          outcome?: string
          pair?: string | null
          pips?: number | null
          profit?: number | null
          risk_reward_ratio?: string | null
          risk_to_pay?: number | null
          screenshots?: string[] | null
          session?: string | null
          setup_id?: string | null
          size?: number | null
          stop_loss?: number | null
          strategy_type?: string | null
          symbol?: string | null
          time_closed?: string | null
          time_opened?: string | null
          total_pips_secured?: number | null
          trade_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_setup_id_fkey"
            columns: ["setup_id"]
            isOneToOne: false
            referencedRelation: "playbook_setups"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_income_sources: {
        Row: {
          account_size: number
          created_at: string
          dream_profile_id: string
          id: string
          monthly_return_percent: number
          profit_split_percent: number
          source_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_size: number
          created_at?: string
          dream_profile_id: string
          id?: string
          monthly_return_percent: number
          profit_split_percent: number
          source_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_size?: number
          created_at?: string
          dream_profile_id?: string
          id?: string
          monthly_return_percent?: number
          profit_split_percent?: number
          source_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_income_sources_dream_profile_id_fkey"
            columns: ["dream_profile_id"]
            isOneToOne: false
            referencedRelation: "dream_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          progress: number
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          progress?: number
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          progress?: number
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          current_streak_days: number
          experience_points: number
          last_trade_date: string | null
          level: number
          longest_streak: number
          onboarding_completed: boolean
          primary_dream_id: string | null
          timezone: string | null
          total_achievements_unlocked: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak_days?: number
          experience_points?: number
          last_trade_date?: string | null
          level?: number
          longest_streak?: number
          onboarding_completed?: boolean
          primary_dream_id?: string | null
          timezone?: string | null
          total_achievements_unlocked?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak_days?: number
          experience_points?: number
          last_trade_date?: string | null
          level?: number
          longest_streak?: number
          onboarding_completed?: boolean
          primary_dream_id?: string | null
          timezone?: string | null
          total_achievements_unlocked?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_primary_dream_id_fkey"
            columns: ["primary_dream_id"]
            isOneToOne: false
            referencedRelation: "dream_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
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
      achievement_category: "trading" | "consistency" | "profit" | "streak"
      milestone_type: "profit_target" | "trade_count" | "win_rate" | "streak"
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
    Enums: {
      achievement_category: ["trading", "consistency", "profit", "streak"],
      milestone_type: ["profit_target", "trade_count", "win_rate", "streak"],
    },
  },
} as const
