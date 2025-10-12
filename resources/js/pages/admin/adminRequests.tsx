import React, { useState } from 'react';
import { Check, X, Info, Trash2 } from 'lucide-react'; // Added Trash2 icon
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import Modal from '@/components/modal';

// --- Interface & Type Definitions ---
interface Requester {
    name: string;
}

interface Request {
    id: number;
    type: 'risk' | 'change';
    description: string;
    // UPDATED: 'accepted' changed to 'approved' to match the backend status
    status: 'pending' | 'approved' | 'rejected';
    risk_id: number | null;
    change_id: number | null;
    requester: Requester;
}



// UPDATED: Mock Page Props to reflect the actual props from backend
interface PageProps {
    requests: Request[];
    filter: 'pending' | 'processed';
}


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View Risks',
        href: '/bim-view/risks/{urn}',
    },
];

function AdminRequests() {
    const { props } = usePage<PageProps>();
    const { requests: initialRequests, filter } = props;
    const changes: any[]= props.changes
    const risks:any[] =props.risks
    const [requests, setRequests] = useState<Request[]>(initialRequests);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Modal state for editing change
    const [editChangeModalOpen, setEditChangeModalOpen] = useState(false);
    const [editRiskModalOpen, setEditRiskModalOpen] = useState(false);
    const [changeForm, setChangeForm] = useState<any>({});
     const [riskForm, setRiskForm] = useState<any>({});
    const [changeFormErrors, setChangeFormErrors] = useState<string | null>(null);
    const [changeProcessing, setChangeProcessing] = useState(false);

    const handleChangeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setChangeForm({ ...changeForm, [e.target.name]: e.target.value });
    };
    const handleRiskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setRiskForm({ ...riskForm, [e.target.name]: e.target.value });
    };

    const handleEditChange = (request: Request) => {
        console.log(request)
        console.log(changes)
        changes.forEach(change=>{
            if(change.id === request.change_id){
                setChangeForm(change);
                setEditChangeModalOpen(true);
                setChangeFormErrors(null);
            }
        })
    };
    const handleDelete = (request:Request)=>{
        router.delete('/requests/'+request.id, {
            preserveScroll:true,
            onSuccess:()=>{
                alert('delete success')
                window.location.href = '/requests/processed' 
            },
            onError:(error)=>{
                console.error(error)
            }
        })
    }
    const handleEditRisk = (request: Request) => {
        console.log(request)
        console.log(risks)
        risks.forEach(risk=>{
            console.log('risk id', risk.id)
            console.log('request risk id', request.risk_id)
            if(risk.id === request.risk_id){
                console.log(risk)
                setRiskForm(risk);
                console.log(riskForm)
                setEditRiskModalOpen(true);
                setChangeFormErrors(null);
            }
        })
    };
const handleRiskEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setChangeProcessing(true);
        setChangeFormErrors(null);
        riskForm.object_id =   riskForm.object_id.toString()
        
        router.put(`/risks/${riskForm.id}`, riskForm, {
            preserveScroll: true,
            onSuccess: () => {
                setEditRiskModalOpen(false);
                setChangeProcessing(false);
                setRequests(prev =>
                    prev.map(req =>
                        req.change_id === changeForm.change_id ? { ...req, ...changeForm } : req
                    )
                );
            },
            onError: (error) => {
                console.error(error)
                setChangeFormErrors('Gagal mengupdate perubahan.');
                setChangeProcessing(false);
            },
            onFinish: () => setChangeProcessing(false),
        });
    };
    const handleAction = (request:Request, action:string)=>{
        if(action==='accept'){
            request.status='approved'
            router.put('/requests/'+request.id,{
                status:'approved'
            },{
                preserveScroll:true,
                onSuccess:()=>{
                    alert('successfully accepted')
                    window.location.href = '/requests/pending'
                },
                onError:(Error)=>{
                    console.log(Error)
                }
            })
        }else if(action==='reject'){
            console.log('rejected!!')
            router.put('/requests/'+request.id,{
                status:'rejected'
            },{
                preserveScroll:true,
                onSuccess:()=>{
                    alert('successfully rejected')
                    window.location.href = '/requests/pending'
                },
                onError:(Error)=>{
                    console.log(Error)
                }
            })
        }
    }
    const handleEditChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setChangeProcessing(true);
        setChangeFormErrors(null);
        changeForm.object_id = changeForm.object_id.toString
        router.put(`/changes/${changeForm.id}`, changeForm, {
            preserveScroll: true,
            onSuccess: () => {
                setEditChangeModalOpen(false);
                setChangeProcessing(false);
                setRequests(prev =>
                    prev.map(req =>
                        req.change_id === changeForm.change_id ? { ...req, ...changeForm } : req
                    )
                );
            },
            onError: (error) => {
                console.error(error)
                setChangeFormErrors('Gagal mengupdate perubahan.');
                setChangeProcessing(false);
            },
            onFinish: () => setChangeProcessing(false),
        });
    };

    // ...existing handleAction and handleDelete...

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={filter === 'pending' ? "Permintaan Tertunda" : "Riwayat Permintaan"} />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {filter === 'pending' ? 'Permintaan Perubahan Tertunda' : 'Riwayat Permintaan Perubahan'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total: {requests.length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Info className="w-8 h-8 mx-auto mb-3 text-green-500" />
                            <p className="font-semibold">
                                {filter === 'pending'
                                    ? 'Semua bersih! Tidak ada permintaan perubahan yang tertunda.'
                                    : 'Tidak ada riwayat permintaan yang ditemukan.'}
                            </p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID Req
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Diajukan Oleh
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Deskripsi Permintaan
                                    </th>
                                    {filter === 'processed' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tindakan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {requests.map((request: Request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 ease-in-out">
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {request.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {request.requester.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                request.type === 'risk' 
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' 
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                            }`}>
                                                {request.type === 'risk' ? 'Risiko' : 'Perubahan'} ID: {request.risk_id || request.change_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 max-w-lg truncate" title={request.description}>
                                            {request.description}
                                        </td>
                                        {filter === 'processed' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.status === 'approved' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                }`}>
                                                    {request.status === 'approved' ? 'Diterima' : 'Ditolak'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {filter === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(request, 'accept')}
                                                        className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white text-sm font-medium ${
                                                            processingId === request.id 
                                                                ? 'bg-gray-400 dark:bg-gray-600' 
                                                                : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out`}
                                                        disabled={processingId !== null}
                                                    >
                                                        {processingId === request.id ? 'Memproses...' : <><Check className="w-4 h-4 mr-1" /> Terima</>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(request, 'reject')}
                                                        className={`ml-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white text-sm font-medium ${
                                                            processingId === request.id 
                                                                ? 'bg-gray-400 dark:bg-gray-600' 
                                                                : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out`}
                                                        disabled={processingId !== null}
                                                    >
                                                        <X className="w-4 h-4 mr-1" /> Tolak
                                                    </button>
                                                    
                                                </>
                                            ) : (
                                                <>
                                                <button
                                                    onClick={() => handleDelete(request)}
                                                    className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white text-sm font-medium ${
                                                        processingId === request.id
                                                            ? 'bg-gray-400 dark:bg-gray-600'
                                                            : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out`}
                                                    disabled={processingId !== null}
                                                >
                                                    {processingId === request.id ? 'Menghapus...' : <><Trash2 className="w-4 h-4 mr-1" /> Hapus</>}
                                                </button>
                                                {request.type === 'change'? (
                                                        <button
                                                            onClick={() => handleEditChange(request)}
                                                            className="ml-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                                        >
                                                            Edit Change
                                                        </button>
                                                    ):<button
                                                            onClick={() => handleEditRisk(request)}
                                                            className="ml-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                                        >
                                                            Edit Risk
                                                        </button>}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* --- Edit Change Modal --- */}
            <Modal open={editChangeModalOpen} onClose={() => setEditChangeModalOpen(false)}>
                <h1 className="text-2xl font-bold text-black mb-4">Edit Perubahan</h1>
                {changeFormErrors && (
                    <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{changeFormErrors}</div>
                )}
                <form className="flex flex-col w-[80vh] h-[80vh] overflow-y-scroll" onSubmit={handleEditChangeSubmit}>
                    <label htmlFor="edit_change_date" className="font-semibold mb-1 text-black">Tanggal</label>
                    <input
                        id="edit_change_date"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="date"
                        name="date"
                        placeholder="Tanggal"
                        value={changeForm.date || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_title" className="font-semibold mb-1 text-black">Judul Perubahan</label>
                    <input
                        id="edit_change_title"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="title"
                        placeholder="Judul perubahan"
                        value={changeForm.title || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_description" className="font-semibold mb-1 text-black">Deskripsi Perubahan</label>
                    <textarea
                        id="edit_change_description"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="description"
                        placeholder="Deskripsi perubahan"
                        value={changeForm.description || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_pelapor" className="font-semibold mb-1 text-black">Pelapor</label>
                    <input
                        id="edit_change_pelapor"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="pelapor"
                        placeholder="Pelapor"
                        value={changeForm.pelapor || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_status" className="font-semibold mb-1 text-black">Status</label>
                    <select
                        id="edit_change_status"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        name="status"
                        value={changeForm.status || ''}
                        onChange={handleChangeFormChange}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="implemented">Implemented</option>
                        <option value="evaluated">Evaluated</option>
                        <option value="completed">Completed</option>
                    </select>
                    <label htmlFor="edit_change_object_id" className="font-semibold mb-1 text-black">Object ID</label>
                    <input
                        id="edit_change_object_id"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="object_id"
                        placeholder="Object ID"
                        value={changeForm.object_id || ''}
                        readOnly
                    />
                    <label htmlFor="edit_change_urn" className="font-semibold mb-1 text-black">URN</label>
                    <input
                        id="edit_change_urn"
                        readOnly
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="urn"
                        placeholder="URN"
                        value={changeForm.urn || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_impact_analysis" className="font-semibold mb-1 text-black">Analisis Dampak</label>
                    <textarea
                        id="edit_change_impact_analysis"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="impact_analysis"
                        placeholder="Analisis Dampak"
                        value={changeForm.impact_analysis || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_mitigation_plan" className="font-semibold mb-1 text-black">Rencana Mitigasi</label>
                    <textarea
                        id="edit_change_mitigation_plan"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="mitigation_plan"
                        placeholder="Rencana Mitigasi"
                        value={changeForm.mitigation_plan || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_approved_by" className="font-semibold mb-1 text-black">Disetujui Oleh</label>
                    <input
                        id="edit_change_approved_by"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="approved_by"
                        placeholder="Disetujui Oleh"
                        value={changeForm.approved_by || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_implemented_by" className="font-semibold mb-1 text-black">Pelaksana Perubahan</label>
                    <input
                        id="edit_change_implemented_by"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="implemented_by"
                        placeholder="Pelaksana Perubahan"
                        value={changeForm.implemented_by || ''}
                        onChange={handleChangeFormChange}
                    />
                    <label htmlFor="edit_change_evaluation_notes" className="font-semibold mb-1 text-black">Catatan Evaluasi</label>
                    <textarea
                        id="edit_change_evaluation_notes"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="evaluation_notes"
                        placeholder="Catatan Evaluasi"
                        value={changeForm.evaluation_notes || ''}
                        onChange={handleChangeFormChange}
                    />
                    <div className="text-xs text-gray-500 mb-2">
                        Object ID diambil dari seleksi di Forge Viewer.
                    </div>
                    <input
                        className="w-full p-2 border border-gray-300 rounded bg-stone-800 text-white hover:bg-stone-700 cursor-pointer"
                        type="submit"
                        value={changeProcessing ? 'Submitting...' : 'Submit'}
                        disabled={changeProcessing}
                    />
                </form>
            </Modal>
            <Modal open={editRiskModalOpen} onClose={() => setEditRiskModalOpen(false)}>
                <h1 className="text-2xl font-bold text-black mb-4">Edit Risiko</h1>
                {changeFormErrors && (
                    <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-md">{changeFormErrors}</div>
                )}
                <form className="flex flex-col w-[80vh] h-[80vh] overflow-y-scroll p-1" onSubmit={handleRiskEditSubmit}>

                    <label htmlFor="risk_code" className="font-semibold mb-1 text-black">Kode Risiko</label>
                    <input
                        id="risk_code"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="risk_code"
                        placeholder="ID atau Kode Risiko"
                        value={riskForm.risk_code || ''}
                        onChange={handleRiskFormChange}
                    />

                    <label htmlFor="project_name" className="font-semibold mb-1 text-black">Nama Proyek</label>
                    <input
                        id="project_name"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="text"
                        name="project_name"
                        placeholder="Nama Proyek"
                        value={riskForm.project_name || ''}
                        onChange={handleRiskFormChange}
                    />

                    <label htmlFor="deskripsi_risiko" className="font-semibold mb-1 text-black">Deskripsi Risiko</label>
                    <textarea
                        id="deskripsi_risiko"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="deskripsi_risiko"
                        placeholder="Deskripsi Risiko"
                        value={riskForm.deskripsi_risiko || ''}
                        onChange={handleRiskFormChange}
                    />

                    <label htmlFor="penyebab" className="font-semibold mb-1 text-black">Penyebab</label>
                    <textarea
                        id="penyebab"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="penyebab"
                        placeholder="Penyebab Risiko"
                        value={riskForm.penyebab || ''}
                        onChange={handleRiskFormChange}
                    />

                    <label htmlFor="dampak" className="font-semibold mb-1 text-black">Dampak</label>
                    <textarea
                        id="dampak"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="dampak"
                        placeholder="Dampak yang ditimbulkan"
                        value={riskForm.dampak || ''}
                        onChange={handleRiskFormChange}
                    />

                    <label htmlFor="tindakan_mitigasi" className="font-semibold mb-1 text-black">Tindakan Mitigasi</label>
                    <textarea
                        id="tindakan_mitigasi"
                        className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                        name="tindakan_mitigasi"
                        placeholder="Rencana atau tindakan mitigasi"
                        value={riskForm.tindakan_mitigasi || ''}
                        onChange={handleRiskFormChange}
                    />

                    <label htmlFor="tanggal_kejadian" className="font-semibold mb-1 text-black">Tanggal Kejadian</label>
                    <input
                        id="tanggal_kejadian"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        type="date"
                        name="tanggal_kejadian"
                        value={riskForm.tanggal_kejadian || ''}
                        onChange={handleRiskFormChange}
                    />

                    <label htmlFor="status" className="font-semibold mb-1 text-black">Status</label>
                    <select
                        id="status"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                        name="status"
                        value={riskForm.status || ''}
                        onChange={handleRiskFormChange}
                    >
                        <option value="pending">Pending</option>
                        <option value="aktif">Aktif</option>
                        <option value="selesai">Selesai</option>
                    </select>
                    
                    <label htmlFor="object_id" className="font-semibold mb-1 text-black">Object ID</label>
                    <input
                        id="object_id"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded bg-gray-100"
                        type="text"
                        name="object_id"
                        value={riskForm.object_id || ''}
                        readOnly
                    />
                    
                    <label htmlFor="urn" className="font-semibold mb-1 text-black">URN</label>
                    <input
                        id="urn"
                        className="w-full text-black p-2 my-2 border border-gray-300 rounded bg-gray-100"
                        type="text"
                        name="urn"
                        value={riskForm.urn || ''}
                        readOnly
                    />

                    <input
                        className="w-full mt-4 p-2 border border-gray-300 rounded bg-stone-800 text-white hover:bg-stone-700 cursor-pointer"
                        type="submit"
                        value={changeProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        disabled={changeProcessing}
                    />
                </form>
            </Modal>
        </AppLayout>
    );
}

export default AdminRequests;