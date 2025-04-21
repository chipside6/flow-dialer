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
      active_calls: {
        Row: {
          call_result: string | null
          campaign_id: string | null
          contact_id: string | null
          created_at: string | null
          end_time: string | null
          id: string
          port_id: string | null
          start_time: string | null
          status: string
          transfer_number_id: string | null
        }
        Insert: {
          call_result?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          port_id?: string | null
          start_time?: string | null
          status: string
          transfer_number_id?: string | null
        }
        Update: {
          call_result?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          port_id?: string | null
          start_time?: string | null
          status?: string
          transfer_number_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_calls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_calls_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "goip_ports"
            referencedColumns: ["id"]
          },
        ]
      }
      asterisk_configs: {
        Row: {
          active: boolean | null
          config_content: string
          config_name: string
          config_type: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          config_content: string
          config_name: string
          config_type: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          config_content?: string
          config_name?: string
          config_type?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          duration: number | null
          id: string
          notes: string | null
          phone_number: string
          status: string
          transfer_requested: boolean | null
          transfer_successful: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          phone_number: string
          status: string
          transfer_requested?: boolean | null
          transfer_successful?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          phone_number?: string
          status?: string
          transfer_requested?: boolean | null
          transfer_successful?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      call_quality_metrics: {
        Row: {
          call_id: string
          created_at: string
          device_id: string
          id: string
          jitter_ms: number
          latency_ms: number
          mos_score: number
          packet_loss_percent: number
          port_id: string
        }
        Insert: {
          call_id: string
          created_at?: string
          device_id: string
          id?: string
          jitter_ms: number
          latency_ms: number
          mos_score: number
          packet_loss_percent: number
          port_id: string
        }
        Update: {
          call_id?: string
          created_at?: string
          device_id?: string
          id?: string
          jitter_ms?: number
          latency_ms?: number
          mos_score?: number
          packet_loss_percent?: number
          port_id?: string
        }
        Relationships: []
      }
      campaign_ports: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          port_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          port_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          port_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_ports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_ports_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "goip_ports"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          answered_calls: number | null
          audio_file_path: string | null
          caller_id: string | null
          contact_list_id: string | null
          created_at: string
          description: string | null
          failed_calls: number | null
          goip_device_id: string | null
          greeting_file_name: string | null
          greeting_file_url: string | null
          id: string
          max_concurrent_calls: number | null
          port_number: number | null
          progress: number | null
          sip_provider_id: string | null
          status: string | null
          title: string
          total_calls: number | null
          transfer_number: string | null
          transferred_calls: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answered_calls?: number | null
          audio_file_path?: string | null
          caller_id?: string | null
          contact_list_id?: string | null
          created_at?: string
          description?: string | null
          failed_calls?: number | null
          goip_device_id?: string | null
          greeting_file_name?: string | null
          greeting_file_url?: string | null
          id?: string
          max_concurrent_calls?: number | null
          port_number?: number | null
          progress?: number | null
          sip_provider_id?: string | null
          status?: string | null
          title: string
          total_calls?: number | null
          transfer_number?: string | null
          transferred_calls?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answered_calls?: number | null
          audio_file_path?: string | null
          caller_id?: string | null
          contact_list_id?: string | null
          created_at?: string
          description?: string | null
          failed_calls?: number | null
          goip_device_id?: string | null
          greeting_file_name?: string | null
          greeting_file_url?: string | null
          id?: string
          max_concurrent_calls?: number | null
          port_number?: number | null
          progress?: number | null
          sip_provider_id?: string | null
          status?: string | null
          title?: string
          total_calls?: number | null
          transfer_number?: string | null
          transferred_calls?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_goip_device_id_fkey"
            columns: ["goip_device_id"]
            isOneToOne: false
            referencedRelation: "goip_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_sip_provider_id_fkey"
            columns: ["sip_provider_id"]
            isOneToOne: false
            referencedRelation: "sip_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_list_items: {
        Row: {
          contact_id: string
          contact_list_id: string
          created_at: string
          id: string
        }
        Insert: {
          contact_id: string
          contact_list_id: string
          created_at?: string
          id?: string
        }
        Update: {
          contact_id?: string
          contact_list_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_items_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_items_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dialer_jobs: {
        Row: {
          campaign_id: string | null
          completed_calls: number | null
          created_at: string | null
          end_time: string | null
          failed_calls: number | null
          id: string
          start_time: string | null
          status: string
          successful_calls: number | null
          total_calls: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          completed_calls?: number | null
          created_at?: string | null
          end_time?: string | null
          failed_calls?: number | null
          id?: string
          start_time?: string | null
          status?: string
          successful_calls?: number | null
          total_calls?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          completed_calls?: number | null
          created_at?: string | null
          end_time?: string | null
          failed_calls?: number | null
          id?: string
          start_time?: string | null
          status?: string
          successful_calls?: number | null
          total_calls?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialer_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      dialer_queue: {
        Row: {
          attempts: number | null
          campaign_id: string | null
          created_at: string | null
          id: string
          job_id: string
          last_attempt: string | null
          phone_number: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          last_attempt?: string | null
          phone_number: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          last_attempt?: string | null
          phone_number?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dialer_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialer_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "dialer_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      goip_devices: {
        Row: {
          created_at: string | null
          device_name: string
          id: string
          ip_address: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name: string
          id?: string
          ip_address?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string
          id?: string
          ip_address?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goip_ports: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          last_used: string | null
          port_number: number
          sip_password: string
          sip_username: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          last_used?: string | null
          port_number: number
          sip_password: string
          sip_username: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          last_used?: string | null
          port_number?: number
          sip_password?: string
          sip_username?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goip_ports_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "goip_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      greeting_files: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          filename: string
          id: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          filename: string
          id?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          campaign_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone_number: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone_number: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone_number?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_details: Json | null
          payment_method: string
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method: string
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      port_activity: {
        Row: {
          activity_type: string
          call_id: string | null
          call_status: string | null
          campaign_id: string | null
          created_at: string
          error_details: Json | null
          id: string
          port_id: string
          status: string
          user_id: string
        }
        Insert: {
          activity_type: string
          call_id?: string | null
          call_status?: string | null
          campaign_id?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          port_id: string
          status: string
          user_id: string
        }
        Update: {
          activity_type?: string
          call_id?: string | null
          call_status?: string | null
          campaign_id?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          port_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_affiliate: boolean | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_affiliate?: boolean | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_affiliate?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      sip_providers: {
        Row: {
          active: boolean | null
          created_at: string
          host: string
          id: string
          name: string
          password: string
          port: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          host: string
          id?: string
          name: string
          password: string
          port: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          host?: string
          id?: string
          name?: string
          password?: string
          port?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string
          plan_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id: string
          plan_name: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          plan_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transfer_numbers: {
        Row: {
          call_count: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          call_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          call_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_trunks: {
        Row: {
          created_at: string
          current_call_id: string | null
          current_campaign_id: string | null
          error_code: string | null
          error_message: string | null
          error_timestamp: string | null
          id: string
          last_quality_issue: string | null
          last_used: string | null
          port_number: number
          quality_warning: boolean | null
          sip_pass: string
          sip_user: string
          status: string | null
          trunk_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_call_id?: string | null
          current_campaign_id?: string | null
          error_code?: string | null
          error_message?: string | null
          error_timestamp?: string | null
          id?: string
          last_quality_issue?: string | null
          last_used?: string | null
          port_number: number
          quality_warning?: boolean | null
          sip_pass: string
          sip_user: string
          status?: string | null
          trunk_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_call_id?: string | null
          current_campaign_id?: string | null
          error_code?: string | null
          error_message?: string | null
          error_timestamp?: string | null
          id?: string
          last_quality_issue?: string | null
          last_used?: string | null
          port_number?: number
          quality_warning?: boolean | null
          sip_pass?: string
          sip_user?: string
          status?: string | null
          trunk_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      create_admin_user: {
        Args: { admin_email: string; admin_password: string }
        Returns: string
      }
      get_port_status: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          device_name: string
          port_number: number
          status: string
          campaign_name: string
        }[]
      }
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
