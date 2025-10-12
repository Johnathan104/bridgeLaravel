import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Modal from '@/components/modal';
interface Change {
  id: number;
  date: string;
  title: string;
  description: string;
  pelapor: string;
  status: string;
  object_id: string;
  urn: string;
  impact_analysis?: string;
  mitigation_plan?: string;
  approved_by?: string;
  implemented_by?: string;
  evaluation_notes?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View Changes',
        href: '/admin/changes',
    },
];
interface PageProps {
  changes: Change[];
  urns: string[];
}

function ViewChanges() {
  const { props } = usePage<PageProps>();
  const [urnFilter, setUrnFilter] = useState<string>('');
  const [filteredStatus, setFilteredStatus] = useState<string>('pending');
   const [editChangeModalOpen, setEditChangeModalOpen] = useState(false);
  const [changeForm, setChangeForm] = useState<any>({});
  const [changeFormErrors, setChangeFormErrors] = useState<string | null>(null);
  const [changeProcessing, setChangeProcessing] = useState(false);
  const handleChangeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          setChangeForm({ ...changeForm, [e.target.name]: e.target.value });
      };

  const changes = props.changes.filter(
    (change) =>
      change.status === filteredStatus &&
      (urnFilter === '' || change.urn === urnFilter)
  );
  const handleEditChange = (change:Change) => {
      if(change.id){
          setChangeForm(change);
          setEditChangeModalOpen(true);
          setChangeFormErrors(null);
      }
    };
  const handleDelete= (change : Change)=>{
    router.delete('/changes/'+change.id, {
      preserveScroll:true,
      onSuccess: ()=>{
        alert('succesfuly deleted')
      }, 
      onError:(error)=>{
        alert('failed to delete, something went wrong')
        console.error(error)
      }
    })
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
              },
              onError: (error) => {
                  console.error(error)
                  setChangeFormErrors('Gagal mengupdate perubahan.');
                  setChangeProcessing(false);
              },
              onFinish: () => setChangeProcessing(false),
          });
      };

  const handleAccept = (changeId: number) => {
    if (!confirm('Are you sure you want to accept this change?')) return;

    // FIX: Use direct URL instead of route helper
    router.put(
      `/changes/${changeId}`,
      { status: 'accepted' },
      {
        preserveScroll: true,
        onSuccess: () => alert('Status updated to "being accepted"'),
      }
    );
  };

  return (
    <AppLayout >
      <div className='p-8 flex flex-col items-center1'>
      <h1 className="text-2xl font-bold mb-4">Analyze Changes</h1>

      <div className="mb-4">
        <label htmlFor="urnFilter" className="font-semibold mr-2">
          Filter by URN (search it in view bims):
        </label>
        <input
          id="urnFilter"
          type="text"
          className="border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-900 text-black dark:text-white"
          value={urnFilter}
          onChange={(e) => setUrnFilter(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="urnFilter" className="font-semibold mr-2">
          Filter by URN (search it in view bims):
        </label>
        <select
          id="statusFilter"
          className="border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-900 text-black dark:text-white"
          value={filteredStatus}
          onChange={(e) => setFilteredStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="implemented">Implemented</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="overflow-x-auto w-[80vw]">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Tanggal</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Judul</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Deskripsi</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Pelapor</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Object ID</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Analisis Dampak</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">status</th>
              
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Rencana Mitigasi</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Disetujui Oleh</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Pelaksana</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Catatan Evaluasi</th>
              <th className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {changes.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No pending changes found.
                </td>
              </tr>
            ) : (
              changes.map((change) => (
                <tr key={change.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.date}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.title}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.description}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.pelapor}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.object_id}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.impact_analysis}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.status}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.mitigation_plan}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.approved_by}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.implemented_by}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-black dark:text-white">{change.evaluation_notes}</td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-center flex align-center content-center">
                    {
                      filteredStatus=='pending'?(
                        <button
                          onClick={() => handleAccept(change.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                      ):(
                        <button
                          onClick={() => handleDelete(change)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      )
                    }
                    
                    <button
                      onClick={() => handleEditChange(change)}
                      className="bg-yellow-600 hover:bg-yellow-700 ml-2 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    </AppLayout>
  );
}

export default ViewChanges;
