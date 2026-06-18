export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; slug: string; created_at: string }
        Insert: { id?: string; name: string; slug: string; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; created_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; org_id: string | null; role: 'hr' | 'superadmin'; created_at: string }
        Insert: { id: string; org_id?: string | null; role?: 'hr' | 'superadmin'; created_at?: string }
        Update: { id?: string; org_id?: string | null; role?: 'hr' | 'superadmin'; created_at?: string }
        Relationships: [
          {
            foreignKeyName: 'profiles_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      campaigns: {
        Row: { id: string; org_id: string; name: string; access_code: string; status: 'active' | 'closed'; created_at: string; closed_at: string | null }
        Insert: { id?: string; org_id: string; name: string; access_code: string; status?: 'active' | 'closed'; created_at?: string; closed_at?: string | null }
        Update: { id?: string; org_id?: string; name?: string; access_code?: string; status?: 'active' | 'closed'; created_at?: string; closed_at?: string | null }
        Relationships: [
          {
            foreignKeyName: 'campaigns_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      responses: {
        Row: { id: string; campaign_id: string; answers: Record<string, number>; role: string; open_answer: string | null; created_at: string }
        Insert: { id?: string; campaign_id: string; answers: Record<string, number>; role?: string; open_answer?: string | null; created_at?: string }
        Update: { id?: string; campaign_id?: string; answers?: Record<string, number>; role?: string; open_answer?: string | null; created_at?: string }
        Relationships: [
          {
            foreignKeyName: 'responses_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Response = Database['public']['Tables']['responses']['Row']

export const ITEMS = [
  { id: 1, text: "So chiaramente quali sono i miei obiettivi sul lavoro.", dim: "Chiarezza" },
  { id: 2, text: "Mi sento capace di svolgere bene il mio lavoro.", dim: "Competenza" },
  { id: 3, text: "Ricevo riconoscimento per ciò che faccio.", dim: "Riconoscimento" },
  { id: 4, text: "Ho buone relazioni con colleghi e superiori.", dim: "Relazioni" },
  { id: 5, text: "Sento che il mio lavoro ha un significato.", dim: "Significato" },
  { id: 6, text: "Posso esprimere le mie idee e sentirmi ascoltato.", dim: "Voce" },
  { id: 7, text: "Mi sento parte di un team che lavora bene insieme.", dim: "Team" },
  { id: 8, text: "Sento di crescere e svilupparmi professionalmente.", dim: "Crescita" },
  { id: 9, text: "Ho l'energia necessaria per svolgere le mie attività.", dim: "Energia" },
  { id: 10, text: "Il mio lavoro mi dà soddisfazione complessiva.", dim: "Soddisfazione" },
] as const

export type ItemId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type Answers = Record<ItemId, number>
