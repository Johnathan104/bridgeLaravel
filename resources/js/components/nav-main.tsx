import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { FileArchiveIcon, FileClockIcon } from 'lucide-react'; // 1. Import new icon

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { url, props } = usePage();
    const user = props.auth.user; // 2. Get user from page props
    const isAdmin = user?.role === 'admin';
    const isUser = user && !isAdmin;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {/* This will render the default items like Dashboard */}
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={url.startsWith(
                                typeof item.href === 'string'
                                    ? item.href
                                    : item.href.url,
                            )}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                
                {/* 3. Admin-only links */}
                {isAdmin && (
                    <>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={url.startsWith('/admin/changes')}
                                tooltip={{ children: 'Pending Changes' }}
                            >
                                <Link href="/admin/changes" prefetch>
                                    <FileArchiveIcon />
                                    <span>Pending changes</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={url.startsWith('/requests/pending')}
                                tooltip={{ children: 'Pending Requests' }}
                            >
                                <Link href="/requests/pending" prefetch>
                                    <FileArchiveIcon />
                                    <span>Pending Requests</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={url.startsWith('/requests/processed')}
                                tooltip={{ children: 'Processed Requests' }}
                            >
                                <Link href="/requests/processed" prefetch>
                                    <FileArchiveIcon />
                                    <span>Processed Requests</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </>
                )}

                {/* 4. User-only link */}
                {isUser && (
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={url.startsWith('/requests/self')}
                            tooltip={{ children: 'My Requests' }}
                        >
                            <Link href="/requests/self" prefetch>
                                <FileClockIcon />
                                <span>My Requests</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}