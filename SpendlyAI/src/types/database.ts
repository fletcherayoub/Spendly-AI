export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          default_currency: string
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          icon: string | null
          color: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          merchant: string
          amount: number
          currency: string
          category_id: string | null
          expense_date: string
          notes: string | null
          receipt_id: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          merchant: string
          amount: number
          currency?: string
          category_id?: string | null
          expense_date?: string
          notes?: string | null
          receipt_id?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          merchant?: string
          amount?: number
          currency?: string
          category_id?: string | null
          expense_date?: string
          notes?: string | null
          receipt_id?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          storage_path: string | null
          merchant: string | null
          receipt_date: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          currency: string
          category_id: string | null
          ocr_status: string
          ai_status: string
          raw_ocr_text: string | null
          ai_confidence: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          storage_path?: string | null
          merchant?: string | null
          receipt_date?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          currency?: string
          category_id?: string | null
          ocr_status?: string
          ai_status?: string
          raw_ocr_text?: string | null
          ai_confidence?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          storage_path?: string | null
          merchant?: string | null
          receipt_date?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          currency?: string
          category_id?: string | null
          ocr_status?: string
          ai_status?: string
          raw_ocr_text?: string | null
          ai_confidence?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      receipt_items: {
        Row: {
          id: string
          receipt_id: string
          name: string
          quantity: number
          unit_price: number | null
          total_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          name: string
          quantity?: number
          unit_price?: number | null
          total_price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          name?: string
          quantity?: number
          unit_price?: number | null
          total_price?: number | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          currency: string
          period: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          currency?: string
          period?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          currency?: string
          period?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          currency: string
          target_date: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          currency?: string
          target_date?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          currency?: string
          target_date?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: string
          severity: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: string
          severity?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: string
          severity?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          currency: string
          language: string
          notifications_enabled: boolean
          dark_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          currency?: string
          language?: string
          notifications_enabled?: boolean
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          currency?: string
          language?: string
          notifications_enabled?: boolean
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
