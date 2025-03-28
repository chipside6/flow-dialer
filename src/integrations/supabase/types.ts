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
      campaigns: {
        Row: {
          answered_calls: number | null
          contact_list_id: string | null
          created_at: string
          description: string | null
          failed_calls: number | null
          greeting_file_name: string | null
          greeting_file_url: string | null
          id: string
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
          contact_list_id?: string | null
          created_at?: string
          description?: string | null
          failed_calls?: number | null
          greeting_file_name?: string | null
          greeting_file_url?: string | null
          id?: string
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
          contact_list_id?: string | null
          created_at?: string
          description?: string | null
          failed_calls?: number | null
          greeting_file_name?: string | null
          greeting_file_url?: string | null
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
        }
        Returns: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
