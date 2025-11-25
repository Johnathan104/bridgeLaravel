import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../../css/riskViews.css'
import AppLayout from '@/layouts/app-layout';
import { usePage, router, Head } from '@inertiajs/react';
import RiskCard from '@/components/riskCard';
import { Risk, Change, User } from '@/types';
import * as THREE from 'three';
import { Link } from '@inertiajs/react';
import ChangeCard from '@/components/changeCard';
import { SearchCheck } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import XlsUploadButton from '@/components/xlsUploadButton'
import ExcelPreview from '@/components/excelPreview';
import Modal from '@/components/modal'
import { motion, AnimatePresence } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View Risks',
        href: '/bim-view/risks/{urn}',
    },
];
// --- Add Modal component ---
// function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000aa] bg-opacity-60">
//       <div className="bg-white rounded shadow-lg p-8 min-w-[400px] relative">
//         <button className="absolute top-2 right-2 text-black" onClick={onClose}>✕</button>
//         {children}
//       </div>
//     </div>
//   );
// }


interface PageProps {
  urn: string;
  risks: Risk[];
  changes: Change[];
  role:User;
}

function RisksView() {
  const { props } = usePage<PageProps>();
  const urn = props.urn;
  const risks = props.risks;
  const role = props.role.role;
  const changes = props.changes;
  const [model, setModel] = useState<any>(null);
  const [schedulesState,setSchedules]= useState<any[]>([]);
  const [reqeustModalOpen, setRequestModalOpen] = useState(false);
  const viewerRef = useRef<Autodesk.Viewing.GuiViewer3D | null>(null);
  const [filterObjectChanges, setFilterObjectChanges] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [forgeToken, setForgeToken] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Risk | null>(null);
  const [form, setForm] = useState<any>({});
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [changeFiltered, setChangeFiltered] = useState(false);
  const [riskFiltered, setRiskFiltered] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [editChangeModalOpen, setEditChangeModalOpen] = useState(false);
  const [changeFormErrors, setChangeFormErrors] = useState<string | null>(null);
  const [changeProcessing, setChangeProcessing] = useState(false);
  const [changeForm, setChangeForm] = useState<any>({});
  const [editChangeData, setEditChangeData] = useState<any>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  // Tambahkan state untuk form request change risk & change
  const [requestChangeForm, setRequestChangeForm] = useState({
    description: '',
  });
  const [requestChangeError, setRequestChangeError] = useState<string | null>(null);
  const [requestChangeProcessing, setRequestChangeProcessing] = useState(false);
  const [requestChangeTarget, setRequestChangeTarget] = useState<{ type: 'risk' | 'change', id: number } | null>(null);

  const handleSearchFilterChange = ()=>{
    console.log('object idi selected', selectedObjectId)
    if(changeFiltered){
      setChangeFiltered(false)
    }else{
      setChangeFiltered(true)
    }
  }
  const handleRiskFilterChange = ()=>{
    console.log('object idi selected', selectedObjectId)
    if(riskFiltered){
      setRiskFiltered(false)
    }else{
      setRiskFiltered(true)
    }
  }
  // 🔹 Get Forge Token

  const getForgeToken = async () => {
    try {
      setUploadStatus('Getting Forge token...');
      const res = await axios.get(
        '/api/revit/token');
      setForgeToken(res.data);
      setUploadStatus('Forge token acquired');
      console.log("token is", res.data)
      return res.data;
    } catch {
      setUploadStatus('Failed to get Forge token');
      return null;
    }
  };
 async function getSchedules() {
  console.log('fetching schedules with urn', urn)
  console.log('forge token is', forgeToken)

  // 1️⃣ Get model metadata (all views, schedules, etc.)
  if(forgeToken){
    const metaRes = await fetch(
    `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata`,
    {
      headers: { Authorization: `Bearer ${forgeToken.trim()}` },
    }
  );
  const metaData = await metaRes.json();
  const metadataList = metaData.data.metadata;

  // 2️⃣ Filter for schedules
  const schedules = metadataList.filter((m) =>
    m.name.toLowerCase().includes("schedule")
  );

  console.log("Available schedules:", schedules);
  setSchedules(schedules)

  // 3️⃣ Example: get data from one schedule (using GUID)
  if (schedules.length > 0) {
    const scheduleGuid = schedules[0].guid;

    const scheduleRes = await fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${scheduleGuid}`,
      {
        headers: { Authorization: `Bearer ${forgeToken.trim()}` },
      }
    );

    const scheduleData = await scheduleRes.json();
    console.log("Schedule contents:", scheduleData);
  } 
  }
}
  const handleDelete = (risk:Risk)=>{
    router.delete('/risks/'+risk.id, 
      {
        onSuccess: () => {

          alert('successful deleting risk')
          window.location.reload()}, // Or use Inertia visit for SPA
        onError: () => setFormErrors('Gagal delete data risiko.'),
        onFinish: () => setProcessing(false),
      }
    )

  }
  // 🔹 RiskCard click handler
  const handleRiskSelect = (risk: Risk) => {
    if (!viewerRef.current) return;
    const id = parseInt(risk.object_id);
    if (!isNaN(id)) {
      viewerRef.current.isolate([id]);
      viewerRef.current.select([id]);
      viewerRef.current.fitToView([id]);
    }
  };
  const handleChangeSelect = (change: Change) => {
    if (!viewerRef.current) return;
    const id = parseInt(change.object_id);
    if (!isNaN(id)) {
      viewerRef.current.isolate([id]);
      viewerRef.current.setThemingColor(
                    [id],
                    new THREE.Vector4(1, 0.5, 0, 1),
                    null,
                    true // Orange RGBA
                  );
      viewerRef.current.fitToView([id]);
    }
  };
  // 🔹 Init Forge Viewer
  const initViewer = (token: string, urn: string) => {
    console.log('initviewer token is', token)
    const options = {
      env: 'AutodeskProduction2',
      api: 'streamingV2',
      getAccessToken: (cb: any) => cb(token, 3600),
    };

    Autodesk.Viewing.Initializer(options, () => {
      const htmlDiv = document.getElementById('forgeViewer')!;
      const viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);

      if (viewer.start() > 0) {
        console.error('Failed to create Viewer');
        return;
      }
      viewerRef.current = viewer;

      // 🔹 Select object on click
      viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
        const dbIds = event.dbIdArray;
        if (dbIds?.length > 0) {
          const selectedId = dbIds[0];
          setSelectedObjectId(dbIds[0]);
          console.log('Selected Object ID:', selectedObjectId);
          viewer.fitToView([selectedId]);
          console.log('Selected Object ID:', selectedId);
        }
      });

      const documentId = 'urn:' + urn;
      Autodesk.Viewing.Document.load(
        documentId,
        (doc) => {
          const defaultModel = doc.getRoot().getDefaultGeometry();
          viewer.loadDocumentNode(doc, defaultModel).then(() => {
            // 🔹 Highlight risks once model is loaded
          });
        },
        (error) => console.error('Failed to load document', error),
        { accessToken: token }
      );
    });
  };
  const getModel = async ()=>{
    if(urn){
      try{
        const data =  await axios.get('/api/models/'+urn)
        setModelId(data.data.id)
        setModel(data.data)
      }catch(error){
        console.log(error)
      }
    }
  }

  // 🔹 Check translation status
  const checkStatus = async (token: string) => {
    try {
      setUploadStatus('Checking translation status...');
      const res = await axios.get(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 'success') {
        setUploadStatus('Translation complete');
        initViewer(token, urn);
      } else {
        setUploadStatus(`Translation in progress: ${res.data.progress}`);
      }
    } catch {
      setUploadStatus('Failed to check status');
    }
  };

  const handleEdit = (risk: Risk) => {
  setEditData(risk);
  // 'risk' harus berisi semua field dari model Laravel
  setForm({
      risk_code: risk.risk_code,
      project_name: risk.project_name,
      tanggal_kejadian: risk.tanggal_kejadian, // Pastikan ini ada
      deskripsi_risiko: risk.deskripsi_risiko, // Pastikan ini ada
      penyebab: risk.penyebab,
      dampak: risk.dampak,
      tindakan_mitigasi: risk.tindakan_mitigasi,
      status: risk.status,
      // ... field lainnya
  }); 
  setFormErrors(null);
  setEditModalOpen(true);
};

  // --- Change: Open create modal ---
  const openCreateChangeModal = () => {
    setChangeForm({
      date: '',
      title: '',
      description: '',
      pelapor: '',
      object_id: selectedObjectId ? selectedObjectId.toString() : '',
      urn: urn, // Add urn automatically
    });
    setChangeFormErrors(null);
    setChangeModalOpen(true);
  };

  // --- Change: Open edit modal ---
  const handleEditChange = (change: any) => {
    setEditChangeData(change);
    setChangeForm({ ...change });
    setChangeFormErrors(null);
    setEditChangeModalOpen(true);
  };

  // --- Form change handler ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Change: Form change handler ---
  const handleChangeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setChangeForm({ ...changeForm, [e.target.name]: e.target.value });
  };

  // --- Form validation ---
  // PERHATIAN: Anda perlu memperbarui fungsi ini di file RisksView.tsx Anda
  const validateForm = () => {
    if (!form.risk_code || !form.project_name || !form.tanggal_kejadian || !form.deskripsi_risiko || !form.penyebab || !form.dampak || !form.tindakan_mitigasi || !form.status) {
      setFormErrors('Semua field harus diisi.');
      return false;
    }
    setFormErrors(null);
    return true;
  };

  // --- Change: Validation ---
  const validateChangeForm = () => {
    if (
      !changeForm.date ||
      !changeForm.title ||
      !changeForm.description ||
      !changeForm.pelapor ||
      !changeForm.object_id ||
      !changeForm.urn // urn is required now
    ) {
      setChangeFormErrors('Semua field harus diisi.');
      return false;
    }
    setChangeFormErrors(null);
    return true;
  };
  const handleScheduleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const guid = e.target.value;
    if (!guid) return;

    try {
      const res = await fetch(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}`,
        {
          headers: { Authorization: `Bearer ${forgeToken?.trim()}` },
        }
      );

      const json = await res.json();
      const rootObjects = json.data?.objects || [];

      console.log("🧱 Raw schedule tree:", rootObjects);

      // Recursive function to flatten nested objects
      const traverse = (nodes: any[], depth = 0): any[] => {
        let result: any[] = [];
        for (const node of nodes) {
          const { name, objectid } = node;
          result.push({ name, objectid, depth });

          // if it has nested objects, go deeper
          if (node.objects && node.objects.length > 0) {
            result = result.concat(traverse(node.objects, depth + 1));
          }
        }
        return result;
      };

      const flattened = traverse(rootObjects);

      console.log("📊 Flattened Schedule Objects:", flattened);
    } catch (err) {
      console.error("❌ Error fetching schedule data:", err);
    }
  };


  // --- Form submit handler ---
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editData) return;
    setProcessing(true);
    setEditModalOpen(false);
    let response = router.put(
      `/risks/${editData.id}`,
      form,
      {
        onSuccess: () => {
          alert('Data berhasil diperbarui.')
          window.location.reload()
        }, // Or use Inertia visit for SPA
        onError: () => setFormErrors('Gagal mengupdate data.'),
        onFinish: () => setProcessing(false),
      }
    );
  };
// Buka modal request untuk risk
const openRequestChangeRisk = (risk: Risk) => {
  setRequestChangeForm({ description: '' });
  setRequestChangeTarget({ type: 'risk', id: risk.id });
  setRequestModalOpen(true);
};
// Buka modal request untuk change
const openRequestChangeChange = (change: Change) => {
  setRequestChangeForm({ description: '' });
  setRequestChangeTarget({ type: 'change', id: change.id });
  setRequestModalOpen(true);
};

// Handler perubahan input
const handleRequestChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setRequestChangeForm({ ...requestChangeForm, [e.target.name]: e.target.value });
};

// Submit request change
const handleRequestChangeSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setRequestChangeError(null);
  setRequestChangeProcessing(true);

  if (!requestChangeForm.description.trim()) {
    setRequestChangeError('Deskripsi perubahan wajib diisi.');
    setRequestChangeProcessing(false);
    return;
  }

  if (!requestChangeTarget) {
    setRequestChangeError('Target perubahan tidak ditemukan.');
    setRequestChangeProcessing(false);
    return;
  }

  const payload: any = {
    description: requestChangeForm.description,
    type: requestChangeTarget.type,
    risk_id: requestChangeTarget.type === 'risk' ? requestChangeTarget.id : null,
    change_id: requestChangeTarget.type === 'change' ? requestChangeTarget.id : null,
  };

  router.post('/requests', payload, {
    onSuccess: () => {
      setRequestModalOpen(false);
      setRequestChangeProcessing(false);
      setRequestChangeForm({ description: '' });
      setRequestChangeTarget(null);
      alert('Request perubahan berhasil dikirim!');
    },
    onError: (err) => {
      setRequestChangeError('Gagal mengirim request perubahan.');
      setRequestChangeProcessing(false);
    },
    onFinish: () => setRequestChangeProcessing(false),
  });
};

  // --- Change: Create submit handler ---
  const handleCreateChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changeForm.object_id = selectedObjectId ? selectedObjectId.toString() : '';
    changeForm.urn = urn; // Always set urn
    if (!validateChangeForm()) return;
    setChangeProcessing(true);
    router.post(
      `/bim-view/changes/${urn}`,
      changeForm,
      {
        onSuccess: () => {setChangeModalOpen(false);window.location.reload()},
        onError: (error) => {setChangeFormErrors('Gagal membuat perubahan.'); console.log(error)},
        onFinish: () => setChangeProcessing(false),
      }
    );
  };

  // --- Change: Edit submit handler ---
  const handleEditChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changeForm.urn = urn; // Always set urn
    if (!validateChangeForm() || !editChangeData) return;
    setChangeProcessing(true);
    router.put(
      `/changes/${editChangeData.id}`,
      changeForm,
      {
        onSuccess: () => window.location.reload(),
        onError: (error) => {setChangeFormErrors('Gagal mengupdate perubahan.');console.log('error updating change', error )},
        onFinish: () => setChangeProcessing(false),
      }
    );
  };

  // --- Change: Delete handler ---
  const handleDeleteChange = (change: Change) => {
    router.delete(`/changes/${change.id}`, {
      onSuccess: () => window.location.reload(),
      onError: () => alert('Gagal menghapus perubahan.'),
    });
  };

  // --- Finish handler for risks ---
  const handleFinishRisk = (risk: Risk) => {
    setProcessing(true);
    router.put(
      `/risks/${risk.id}`,
      { ...risk, status: 'selesai', urn: risk.urn }, // Make sure urn is included
      {
        onSuccess: () => window.location.reload(),
        onError: () => setFormErrors('Gagal menyelesaikan risiko.'),
        onFinish: () => setProcessing(false),
      }
    );
  };
  const resetView = () => {
    if (viewerRef.current) {
      viewerRef.current.clearThemingColors();
      viewerRef.current.isolate();
      viewerRef.current.clearSelection();
      viewerRef.current.fitToView();
      setSelectedObjectId(null);
    }
  }
  // 🔹 Init on mount
  useEffect(() => {
    let viewerInstance: Autodesk.Viewing.GuiViewer3D | null = null;
    let started = false;

    (async () => {
      getModel()
      console.log('role is', role)
      const restoken = await getForgeToken();
      const token = restoken.trim()
      console.log('token from await is', token)
      if (token) {
        // Save viewer instance for cleanup
        Autodesk.Viewing.Initializer({
          env: 'AutodeskProduction2',
          api: 'streamingV2',
          getAccessToken: (cb: any) => cb(token, 3600),
        }, () => {
          const htmlDiv = document.getElementById('forgeViewer');
          if (!htmlDiv) return;
          viewerInstance = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
    
          if (viewerInstance.start() > 0) return;
          started = true;
          viewerRef.current = viewerInstance;

          // 🔹 Select object on click
          viewerInstance.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
            const dbIds = event.dbIdArray;
            if (dbIds?.length > 0) {
              const selectedId = dbIds[0];
              setSelectedObjectId(dbIds[0]);
              console.log('Selected Object ID:', selectedObjectId);
              viewerInstance.fitToView([selectedId]);
              console.log('Selected Object ID:', selectedId);
            }
          });

          const documentId = 'urn:' + urn;
          Autodesk.Viewing.Document.load(
            documentId,
            (doc) => {
              const defaultModel = doc.getRoot().getDefaultGeometry();
              viewerInstance.loadDocumentNode(doc, defaultModel).then(() => {
                // 🔹 Highlight risks once model is loaded
              });
            },
            () => console.error('Failed to load document'),
            { accessToken: token }
          );
        });
      getSchedules();

      }
    })();

    // Cleanup function to avoid memory leaks
    return () => {
      if (viewerInstance && started) {
        viewerInstance.finish();
        viewerInstance = null;
        viewerRef.current = null;
      }
    };
  }, [urn]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Detail BIM"></Head>
      <div className="p-4 px-[80px] flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">BIM Viewer</h1>
        <p className="">link an xls file to this model.</p>
        {modelId? 
        <div id="xlsupload py-4">
          <XlsUploadButton id={modelId} />
        </div>:
        'fetching model data.'
        }
        {/* Excel Viewer Section */}
        {model?.excel_url && (
          <div className="mt-4 w-full border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-3">📊 Excel / CSV Preview</h3>
            <ExcelPreview fileUrl={model.excel_url} />
          </div>
        )}

        
        <p className="mb-4">{uploadStatus}</p>
         {/* Forge Viewer container */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          id="forgeViewer"
          className="w-full h-[70vh] min-h-[400px] relative overflow-hidden border border-gray-300 rounded-lg"
        />

        {/* Reset button */}
        <motion.button
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          onClick={resetView}
          className="bg-stone-800 mt-4 hover:bg-stone-700 px-4 py-2"
        >
          Reset view
        </motion.button>
        <h1>select schedule</h1>
        <select name="scheduleSelect" onChange={(e)=>handleScheduleSelect(e)}id="sch-slct">
          {
            schedulesState.map((schedule)=>(
              <option key = {schedule.guid} value ={schedule.guid}>{schedule.name}</option>
            ))
          }
        </select>
        <div className="flex w-[100%] bg-stone-900 p-[20px] m-[40px]  ">
          {/* --- Risks Side --- */}
          <div className="flex flex-col border-r-1 border-white p-8 max-h-[80vh] overflow-y-scroll w-full items-center">
            <h2 className="text-2xl font-bold mb-2">Risk Management</h2>
            <div className="flex flex-row items-center mb-4 mt-8">
              <Link href={'/bim-view/'+urn}>
                <button className="bg-slate-500 text-white p-2 rounded">Catat risiko baru</button>
              </Link>
              {/* Filter button and input for risks */}
              <button
                onClick={handleRiskFilterChange}
                className="ml-4 p-2 bg-stone-600 flex gap-2 text-white rounded"
              >
                <SearchCheck />
                {!riskFiltered ? 'filter' : 'clear filter'}
              </button>
              <input
                type="text"
                value={selectedObjectId ? selectedObjectId.toString() : ''}
                readOnly
                className="bg-stone-800 text-white p-2 rounded ml-2"
                placeholder="Object ID"
              />
            </div>
            {risks.length > 0
              ? risks
                  .filter((risk) =>
                    filterObjectChanges === ''
                      ? true
                      : risk.object_id === filterObjectChanges
                  )
                  .map((risk) => {
                    if(riskFiltered && risk.object_id != selectedObjectId?.toString()){
                      return null
                    }
                    return(
                    <RiskCard
                      key={risk.id}
                      risk={risk}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onSelect={handleRiskSelect}
                      onFinish={handleFinishRisk}
                      role={role}
                      onRequest = {()=>openRequestChangeRisk(risk)}
                    />
                  )})
              : 'No risks found'}
          </div>
          {/* --- Changes Side --- */}
          <div className="flex flex-col w-full p-8 items-center overflow-y-scroll max-h-[80vh]">
            <h2 className="text-2xl  font-bold mb-2">Change logs</h2>
            <div className="flex flex-row items-center mb-4 mt-8">
              <button onClick={handleSearchFilterChange} className="p-2 bg-stone-600 flex gap-2 text-white rounded">
                <SearchCheck />
                {!changeFiltered  ? 'filter' : 'clear filter'}
              </button>
              <input
                type="text"
                value={selectedObjectId ? selectedObjectId.toString() : ''}
                readOnly
                className="bg-stone-800 text-white p-2 rounded mr-4 ml-2"
                placeholder="Object ID"
              />
              <button
                className="bg-slate-500 text-white p-2 rounded"
                onClick={openCreateChangeModal}
              >
                Catat perubahan baru
              </button>
            </div>
            {changes.length > 0
              ? changes
                  .filter((change) =>
                    filterObjectChanges === ''
                      ? true
                      : change.object_id === filterObjectChanges
                  )
                  .map((change) => {
                    if(changeFiltered && change.object_id != selectedObjectId?.toString()){
                      return null
                    }
                    return (
                    <ChangeCard
                      key={change.id}
                      change={change}
                      onEdit={() => handleEditChange(change)}
                      onDelete={() => handleDeleteChange(change)}
                      onSelect={() => {handleChangeSelect(change)}
        }
                      role = {role}
                      onRequest={() => openRequestChangeChange(change)}
                    />
                  )})
              : 'No changes found ' + selectedObjectId}
          </div>
        </div>
      </div>

    {/* --- Edit Modal --- */}
      <AnimatePresence>
      {editModalOpen && (
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h1 className="text-2xl font-bold text-black mb-4">Edit Risiko</h1>

            {formErrors && (
              <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                {formErrors}
              </div>
            )}

            <form
              className="flex flex-col w-[80vh] p-5 h-[80vh] overflow-y-scroll gap-2"
              onSubmit={handleEditSubmit}
            >
              <label htmlFor="risk_code" className="font-semibold mb-1 text-black">
                Kode Risiko
              </label>
              <input
                id="risk_code"
                className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                type="text"
                name="risk_code"
                placeholder="ID/Kode Risiko"
                value={form.risk_code || ""}
                onChange={handleFormChange}
              />

              <label htmlFor="project_name" className="font-semibold mb-1 text-black">
                Nama Proyek
              </label>
              <input
                id="project_name"
                className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                type="text"
                name="project_name"
                placeholder="Nama Proyek"
                value={form.project_name || ""}
                onChange={handleFormChange}
              />

              <label htmlFor="deskripsi_risiko" className="font-semibold mb-1 text-black">
                Deskripsi Risiko
              </label>
              <textarea
                id="deskripsi_risiko"
                className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                name="deskripsi_risiko"
                placeholder="Deskripsi Risiko"
                value={form.deskripsi_risiko || ""}
                onChange={handleFormChange}
              />

              <label htmlFor="penyebab" className="font-semibold mb-1 text-black">
                Penyebab Risiko
              </label>
              <textarea
                id="penyebab"
                className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                name="penyebab"
                placeholder="Penyebab Risiko"
                value={form.penyebab || ""}
                onChange={handleFormChange}
              />

              <label htmlFor="dampak" className="font-semibold mb-1 text-black">
                Dampak Risiko
              </label>
              <textarea
                id="dampak"
                className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                name="dampak"
                placeholder="Dampak Risiko"
                value={form.dampak || ""}
                onChange={handleFormChange}
              />

              <label htmlFor="tindakan_mitigasi" className="font-semibold mb-1 text-black">
                Tindakan Mitigasi
              </label>
              <textarea
                id="tindakan_mitigasi"
                className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                name="tindakan_mitigasi"
                placeholder="Tindakan Mitigasi"
                value={form.tindakan_mitigasi || ""}
                onChange={handleFormChange}
              />

              <label htmlFor="tanggal_kejadian" className="font-semibold mb-1 text-black">
                Tanggal Kejadian
              </label>
              <input
                id="tanggal_kejadian"
                className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                type="date"
                name="tanggal_kejadian"
                placeholder="Tanggal Kejadian"
                value={form.tanggal_kejadian || ""}
                onChange={handleFormChange}
              />

              <label htmlFor="status" className="font-semibold mb-1 text-black">
                Status
              </label>
              <select
                id="status"
                className="w-full text-black p-2 my-2 border border-gray-300 rounded"
                name="status"
                value={form.status || ""}
                onChange={handleFormChange}
              >
                <option value="">Pilih Status</option>
                <option value="pending">Pending</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
              </select>

              <input
                className="w-full p-2 border border-gray-300 rounded bg-gradient-to-r from-stone-800 to-stone-700 text-white font-semibold hover:from-stone-700 hover:to-stone-800 cursor-pointer transition"
                type="submit"
                value={processing ? "Submitting..." : "Submit"}
                disabled={processing}
              />
            </form>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>

      {/* --- reqeust modal ---*/}
     <AnimatePresence>
      {reqeustModalOpen && (
        <Modal open={reqeustModalOpen} onClose={() => setRequestModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h1 className="text-2xl font-bold text-black mb-4">Request Perubahan</h1>

            {requestChangeError && (
              <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                {requestChangeError}
              </div>
            )}

            <form onSubmit={handleRequestChangeSubmit}>
              <label htmlFor="request_description" className="font-semibold mb-1 text-black">
                Deskripsi Perubahan
              </label>

              <textarea
                id="request_description"
                className="w-full p-2 my-2 text-black border border-gray-300 rounded"
                name="description"
                placeholder="Deskripsi perubahan"
                value={requestChangeForm.description}
                onChange={handleRequestChangeInput}
                required
              />

              <input
                className="w-full p-2 border border-gray-300 rounded bg-stone-800 text-white hover:bg-stone-700 cursor-pointer"
                type="submit"
                value={requestChangeProcessing ? "Mengirim..." : "Kirim Request"}
                disabled={requestChangeProcessing}
              />
            </form>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>


      {/* --- Create Change Modal --- */}
      <Modal open={changeModalOpen} onClose={() => setChangeModalOpen(false)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-bold text-black mb-4">Catat Perubahan Baru</h1>

          {changeFormErrors && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
              {changeFormErrors}
            </div>
          )}

          <form
            className="flex flex-col w-[80vh] h-[70vh] overflow-y-scroll"
            onSubmit={handleCreateChangeSubmit}
          >
          <label htmlFor="change_date" className="font-semibold mb-1 text-black">Tanggal</label>
          <input
            id="change_date"
            className="w-full text-black p-2 my-2 border border-gray-300 rounded"
            type="date"
            name="date"
            placeholder="Tanggal"
            value={changeForm.date || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_title" className="font-semibold mb-1 text-black">Judul Perubahan</label>
          <input
            id="change_title"
            className="w-full text-black p-2 my-2 border border-gray-300 rounded"
            type="text"
            name="title"
            placeholder="Judul perubahan"
            value={changeForm.title || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_description" className="font-semibold mb-1 text-black">Deskripsi Perubahan</label>
          <textarea
            id="change_description"
            className="w-full p-2 my-2 text-black border border-gray-300 rounded"
            name="description"
            placeholder="Deskripsi perubahan"
            value={changeForm.description || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_pelapor" className="font-semibold mb-1 text-black">Pelapor</label>
          <input
            id="change_pelapor"
            className="w-full text-black p-2 my-2 border border-gray-300 rounded"
            type="text"
            name="pelapor"
            placeholder="Pelapor"
            value={changeForm.pelapor || ''}
            onChange={handleChangeFormChange}
          />
        
          <label htmlFor="change_object_id" className="font-semibold mb-1 text-black">Object ID</label>
          <input
            id="change_object_id"
            className="w-full text-black p-2 my-2 border border-gray-300 rounded"
            type="text"
            name="object_id"
            placeholder="Object ID"
            value={changeForm.object_id || ''}
            readOnly
          />
          <label htmlFor="change_urn" className="font-semibold mb-1 text-black">URN</label>
          <input
            id="change_urn"
            className="w-full text-black p-2 my-2 border border-gray-300 rounded"
            type="text"
            name="urn"
            placeholder="URN"
            value={changeForm.urn || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_impact_analysis" className="font-semibold mb-1 text-black">Analisis Dampak</label>
          <textarea
            id="change_impact_analysis"
            className="w-full p-2 my-2 text-black border border-gray-300 rounded"
            name="impact_analysis"
            placeholder="Analisis Dampak"
            value={changeForm.impact_analysis || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_mitigation_plan" className="font-semibold mb-1 text-black">Rencana Mitigasi</label>
          <textarea
            id="change_mitigation_plan"
            className="w-full p-2 my-2 text-black border border-gray-300 rounded"
            name="mitigation_plan"
            placeholder="Rencana Mitigasi"
            value={changeForm.mitigation_plan || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_approved_by" className="font-semibold mb-1 text-black">Disetujui Oleh</label>
          <input
            id="change_approved_by"
            className="w-full text-black p-2 my-2 border border-gray-300 rounded"
            type="text"
            name="approved_by"
            placeholder="Disetujui Oleh"
            value={changeForm.approved_by || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_implemented_by" className="font-semibold mb-1 text-black">Pelaksana Perubahan</label>
          <input
            id="change_implemented_by"
            className="w-full text-black p-2 my-2 border border-gray-300 rounded"
            type="text"
            name="implemented_by"
            placeholder="Pelaksana Perubahan"
            value={changeForm.implemented_by || ''}
            onChange={handleChangeFormChange}
          />
          <label htmlFor="change_evaluation_notes" className="font-semibold mb-1 text-black">Catatan Evaluasi</label>
          <textarea
            id="change_evaluation_notes"
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
        value={changeProcessing ? "Submitting..." : "Submit"}
        disabled={changeProcessing}
      />
    </form>
  </motion.div>
</Modal>

      {/* --- Edit Change Modal --- */}
      <Modal open={editChangeModalOpen} onClose={() => setEditChangeModalOpen(false)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-bold text-black mb-4">Edit Perubahan</h1>

          {changeFormErrors && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
              {changeFormErrors}
            </div>
          )}

          <form
            className="flex flex-col w-[80vh] h-[80vh] overflow-y-scroll"
            onSubmit={handleEditChangeSubmit}
          >
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
            <option value="">Pilih Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="implemented">Implemented</option>
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
        value={changeProcessing ? "Submitting..." : "Submit"}
        disabled={changeProcessing}
      />
    </form>
  </motion.div>
</Modal>
    </AppLayout>
  );
}

export default RisksView;