import React from 'react';
import { Info, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

// --- Interface & Type Definitions ---
interface Request {
    id: number;
    type: 'risk' | 'change';
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    risk_id: number | null;
    change_id: number | null;
    created_at: string; // Added for submission date
}

// Props for this specific page
interface SelfRequestProps {
    requests: Request[];
}

// Page props from Inertia
interface PageProps {
    requests: Request[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'requests',
        href: '/requests/self',
    },
];

/**
 * A component for users to view their own submitted change requests.
 */
function SelfRequests() {
    const { props } = usePage<PageProps>(); 
    const { requests } = props;

    // Helper to format date string
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Helper to get status details
    const getStatusDetails = (status: Request['status']) => {
        switch (status) {
            case 'approved':
                return { 
                    text: 'Diterima', 
                    className: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
                    icon: <CheckCircle2 className="w-4 h-4 mr-1.5" /> 
                };
            case 'rejected':
                return { 
                    text: 'Ditolak', 
                    className: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
                    icon: <XCircle className="w-4 h-4 mr-1.5" />
                };
            default: // pending
                return { 
                    text: 'Tertunda', 
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
                    icon: <Clock className="w-4 h-4 mr-1.5" />
                };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permintaan Perubahan Saya" />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Permintaan Perubahan Saya
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total: {requests.length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Info className="w-8 h-8 mx-auto mb-3 text-sky-500" />
                            <p className="font-semibold">
                                Anda belum pernah mengajukan permintaan perubahan.
                            </p>
                            <p className="text-sm mt-1">
                                Anda dapat mengajukan permintaan dari halaman detail Risiko atau Perubahan.
                            </p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tanggal Diajukan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Item Terkait
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Deskripsi Permintaan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {requests.map((request: Request) => {
                                    const statusDetails = getStatusDetails(request.status);
                                    return (
                                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 ease-in-out">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {formatDate(request.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.type === 'risk' 
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100' 
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                                }`}>
                                                    {request.type === 'risk' ? 'Risiko' : 'Perubahan'} ID: {request.risk_id || request.change_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 max-w-md" title={request.description}>
                                                <p className="truncate">{request.description}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDetails.className}`}>
                                                    {statusDetails.icon}
                                                    {statusDetails.text}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export default SelfRequests;