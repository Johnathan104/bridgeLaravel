import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}
export interface Evaluation {
    id: number;
    change_id: number; // The foreign key linking to Course
    ratings: number; // Stored as integer
    comments: string | null;
    evaluated_by: string;
    evaluation_date: date; // Typically returned as an ISO date string (e.g., "YYYY-MM-DD")
    variansi_rencana: string;
    created_at: string; // Laravel timestamps are usually ISO strings
    updated_at: string; // Laravel timestamps are usually ISO strings

}

export interface Risk{
  risk_code: string;
  project_name: string;
  tanggal_kejadian: string;
  deskripsi_risiko: string;
  penyebab: string;
  dampak: string;
  tindakan_mitigasi: string;
  status: string;
  urn: string;
  object_id: string;
}
// Represents the Change model with all its fillable properties, plus timestamps and ID.
export interface Change {
    id: number;
    date: string; // Assuming a date string format (e.g., YYYY-MM-DD)
    title: string;
    description: string;
    pelapor: string;
    status: string;
    object_id: number; // Assuming this represents a related ID
    urn: string;
    impact_analysis: string | null; // Made nullable for flexibility
    mitigation_plan: string | null; // Made nullable for flexibility
    approved_by: string | null; // Made nullable for flexibility
    implemented_by: string | null; // Made nullable for flexibility
    evaluation_notes: string | null; // Made nullable for flexibility
    created_at: string;
    updated_at: string;
}
export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
