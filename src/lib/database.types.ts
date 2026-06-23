export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      settings: {
        Row: {
          id: number
          order_cutoff_hour: number
          report_email_wz: string | null
          report_email_prod: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          order_cutoff_hour?: number
          report_email_wz?: string | null
          report_email_prod?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          order_cutoff_hour?: number
          report_email_wz?: string | null
          report_email_prod?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_prices: {
        Row: {
          client_id: string
          created_at: string
          custom_price: number
          id: string
          product_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          custom_price: number
          id?: string
          product_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          custom_price?: number
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_prices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          discount_pct: number
          id: string
          internal_notes: string | null
          is_active: boolean
          min_order_value: number
          name: string
          nip: string | null
          orders_suspended: boolean
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          discount_pct?: number
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          min_order_value?: number
          name: string
          nip?: string | null
          orders_suspended?: boolean
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          discount_pct?: number
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          min_order_value?: number
          name?: string
          nip?: string | null
          orders_suspended?: boolean
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string
          created_at: string
          file_url: string | null
          id: string
          number: string | null
          order_id: string | null
          type: Database["public"]["Enums"]["document_type"]
        }
        Insert: {
          client_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          number?: string | null
          order_id?: string | null
          type: Database["public"]["Enums"]["document_type"]
        }
        Update: {
          client_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          number?: string | null
          order_id?: string | null
          type?: Database["public"]["Enums"]["document_type"]
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          vat_rate?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          archived_at: string | null
          client_id: string
          created_at: string
          created_by: string | null
          delivery_date: string
          delivery_slot: Database["public"]["Enums"]["delivery_slot"]
          id: string
          notes: string | null
          recurring_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          wz_number: string | null
        }
        Insert: {
          archived_at?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          delivery_date: string
          delivery_slot: Database["public"]["Enums"]["delivery_slot"]
          id?: string
          notes?: string | null
          recurring_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          wz_number?: string | null
        }
        Update: {
          archived_at?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string
          delivery_slot?: Database["public"]["Enums"]["delivery_slot"]
          id?: string
          notes?: string | null
          recurring_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          wz_number?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          min_order_qty: number
          name: string
          pdf_url: string | null
          sort_order: number
          unit: string
          vat_rate: number
        }
        Insert: {
          base_price?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_order_qty?: number
          name: string
          pdf_url?: string | null
          sort_order?: number
          unit?: string
          vat_rate?: number
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_order_qty?: number
          name?: string
          pdf_url?: string | null
          sort_order?: number
          unit?: string
          vat_rate?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          is_promo_of_day: boolean
          product_id: string
          promo_price: number
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          is_promo_of_day?: boolean
          product_id: string
          promo_price: number
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          is_promo_of_day?: boolean
          product_id?: string
          promo_price?: number
          start_date?: string
        }
        Relationships: []
      }
      recurring_order_items: {
        Row: {
          id: string
          product_id: string
          quantity: number
          recurring_order_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          recurring_order_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          recurring_order_id?: string
        }
        Relationships: []
      }
      recurring_orders: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          delivery_slot: Database["public"]["Enums"]["delivery_slot"]
          end_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          start_date: string
          weekdays: number[]
          excluded_dates: string[]
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          delivery_slot: Database["public"]["Enums"]["delivery_slot"]
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date: string
          weekdays?: number[]
          excluded_dates?: string[]
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          delivery_slot?: Database["public"]["Enums"]["delivery_slot"]
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date?: string
          weekdays?: number[]
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      current_client_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      delivery_slot: "06-09" | "09-12" | "12-15" | "15-18" | "18-21"
      document_type: "wz" | "faktura"
      order_status:
        | "nowe"
        | "potwierdzone"
        | "w_realizacji"
        | "wyslane"
        | "dostarczone"
        | "anulowane"
      product_category:
        | "ciasta"
        | "torty"
        | "ciastka"
        | "desery"
        | "pieczywo_slodkie"
      user_role: "admin" | "client"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]
