import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
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

export interface Change{
    id?:number;
    date:string;
    title:string;
    description:string;
    pelapor:string;
    status:string;
    object_id:string;
    created_at?: string;
    updated_at?: string;
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
