import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { usePage, useForm } from '@inertiajs/react';
import * as THREE from 'three';


interface PageProps {
  urn: string;
}

function BimView() {
  const { props } = usePage<PageProps>();
  const urn = props.urn;
  const [propType, setPropType] = useState(0);
  const [modelProps, setProps] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [forgeToken, setForgeToken] = useState<string | null>(null);

  // 🔹 Keep viewer instance
  const viewerRef = useRef<Autodesk.Viewing.GuiViewer3D | null>(null);

  // 🔹 Inertia form
  const { data, setData, post, processing, reset } = useForm({
  risk_code: '',
  project_name: '',
  tanggal_kejadian: '',
  deskripsi_risiko: '',
  penyebab: '',
  dampak: '',
  tindakan_mitigasi: '',
  status: '',
  urn: urn,
  object_id: '',
});

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

 // 🟥 Updated validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: string[] = [];
    if (!data.risk_code) validationErrors.push('Risk code wajib diisi.');
    if (!data.project_name) validationErrors.push('Nama proyek wajib diisi.');
    if (!data.tanggal_kejadian) validationErrors.push('Tanggal kejadian wajib diisi.');
    if (!data.deskripsi_risiko) validationErrors.push('Deskripsi risiko wajib diisi.');
    if (!data.object_id) validationErrors.push('Object ID wajib diisi.');

    if (validationErrors.length > 0) {
      setErrorMessages(validationErrors);
      setShowErrorDialog(true);
      return;
    }

    post(`/bim-view/risks/${urn}`, {
      onSuccess: () => {
        reset();
        alert('Risiko berhasil ditambahkan!');
      },
      onError: (serverErrors) => {
        setErrorMessages(Object.values(serverErrors));
        setShowErrorDialog(true);
      },
    });
  };

   const getForgeToken = async () => {
    try {
      setUploadStatus('Getting Forge token...');
      const res = await axios.get(
        '/api/revit/token');
      setForgeToken(res.data.trim());
      setUploadStatus('Forge token acquired');
      console.log(res.data)
      return res.data;
    } catch {
      setUploadStatus('Failed to get Forge token');
      return null;
    }
  };

  const initViewer = (token: string, urn: string) => {
    const options = {
      env: 'AutodeskProduction2',
      api: 'streamingV2',
      getAccessToken: (cb: any) => cb(token, 3600),
    };

    Autodesk.Viewing.Initializer(options, () => {
      const htmlDiv = document.getElementById('forgeViewer')!;
      const viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
      viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
        const dbIds = event.dbIdArray;
        if (dbIds && dbIds.length > 0) {
          const selectedId = dbIds[0];
          viewer.fitToView([selectedId]);
          setData('object_id', String(selectedId));
        }
      });

      if (viewer.start() > 0) {
        console.error('Failed to create Viewer');
        return;
      }
      viewerRef.current = viewer; // save reference

      const documentId = 'urn:' + urn;
      Autodesk.Viewing.Document.load(
        documentId,
        (doc) => {
          const defaultModel = doc.getRoot().getDefaultGeometry();
          viewer.loadDocumentNode(doc, defaultModel).then(() => {
            // Highlight selected risk object in orange and hide its texture
            if (data.object_id) {
              const id = parseInt(data.object_id);
              if (!isNaN(id)) {
                viewer.setThemingColor(
                  id,
                  new THREE.Vector4(1, 0.5, 0, 1) // Orange RGBA
                );
                // Hide the texture by making the object more transparent
                viewer.setMaterialOpacity(id, 0.8, true);
                viewer.setRenderOption('ghosting', false);
              }
            }
          });
        },
        () => console.error('Failed to load document'),
        { accessToken: token }
      );
    });
  };

  const checkStatus = async (token: string) => {
    try {
       const cleanToken = token.trim();
       console.log('token is ', cleanToken)
      setUploadStatus('Checking translation status...');
      const res = await axios.get(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      if (res.data.status === 'success') {
        setUploadStatus('Translation complete');
        // Fetch metadata
        const metadataRes = await axios.get(
          `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata`,
          { headers: { Authorization: `Bearer ${cleanToken}` } }
        );
        const guid = metadataRes.data.data.metadata[0].guid;

        const hierarchyRes = await axios.get(
          `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}`,
          { headers: { Authorization: `Bearer ${cleanToken}` } }
        );
        console.log('medel', hierarchyRes)
        console.log('Model Hierarchy:', hierarchyRes.data.data.objects[0].objects[0].objects[0].objectid);
        setProps(hierarchyRes.data.data.objects[0].objects);
        console.log('Model Properties', modelProps);
        initViewer(token.trim(), urn);
      } else {

        setUploadStatus(`Translation in progress: ${res.data.progress}`);
      }
    } catch (err) {
      console.error(err)
      setUploadStatus('Failed to check status');
    }
  };

  // 🔹 Handle selecting a specific element
  const handleSpecificChange = (dbId: number) => {
    if (!viewerRef.current) return;
    viewerRef.current.isolate([dbId]);
    viewerRef.current.select([dbId]);
    viewerRef.current.fitToView([dbId]);

    setData('object_id', String(dbId)); // save object_id for the form
  };

  useEffect(() => {
    (async () => {
      const token = await getForgeToken();
      if (token) checkStatus(token);
      else setUploadStatus('Could not get Forge token');
    })();
  }, [urn]);

  return (
    <AppLayout breadcrumbs={[{ title: 'View BIM', href: `/bim-view/${urn}` }]}>
      <div className="flex justify-center items-center p-4">
        <div className="w-full max-w-5xl border border-gray-400 rounded-lg p-6 shadow">
          <h1 className="text-2xl font-bold mb-4">BIM Viewer</h1>
          <p className="mb-4">{uploadStatus}</p>

         
          {/* Forge Viewer */}
          <div
            id="forgeViewer"
            className="w-full h-[70vh] min-h-[400px] relative overflow-hidden border border-gray-300 rounded-lg"
          />
          <div className=" border rounded-sm border-white my-4 p-4">
            <h1 className="text-4xl font-bold my-[50px] ml-[20px]">Form resiko pada struktur</h1>
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <input
                className="w-full p-2 my-4 border border-gray-300 rounded"
                type="text"
                name="risk_code"
                placeholder="Kode Risiko"
                value={data.risk_code}
                onChange={(e) => setData('risk_code', e.target.value)}
              />

              <input
                className="w-full p-2 my-4 border border-gray-300 rounded"
                type="text"
                name="project_name"
                placeholder="Nama Proyek"
                value={data.project_name}
                onChange={(e) => setData('project_name', e.target.value)}
              />

              <input
                className="w-full my-4 p-2 border border-gray-300 rounded"
                type="date"
                name="tanggal_kejadian"
                value={data.tanggal_kejadian}
                onChange={(e) => setData('tanggal_kejadian', e.target.value)}
              />

              <textarea
                className="w-full p-2 my-4 border border-gray-300 rounded"
                name="deskripsi_risiko"
                placeholder="Deskripsi Risiko"
                value={data.deskripsi_risiko}
                onChange={(e) => setData('deskripsi_risiko', e.target.value)}
              />

              <textarea
                className="w-full p-2 my-4 border border-gray-300 rounded"
                name="penyebab"
                placeholder="Penyebab Risiko"
                value={data.penyebab}
                onChange={(e) => setData('penyebab', e.target.value)}
              />

              <textarea
                className="w-full p-2 my-4 border border-gray-300 rounded"
                name="dampak"
                placeholder="Dampak Risiko"
                value={data.dampak}
                onChange={(e) => setData('dampak', e.target.value)}
              />

              <textarea
                className="w-full p-2 my-4 border border-gray-300 rounded"
                name="tindakan_mitigasi"
                placeholder="Tindakan Mitigasi"
                value={data.tindakan_mitigasi}
                onChange={(e) => setData('tindakan_mitigasi', e.target.value)}
              />

              <select
                className="w-full p-2 my-4 border border-gray-300 rounded"
                name="status"
                value={data.status}
                onChange={(e) => setData('status', e.target.value)}
              >
                <option value="">Pilih Status</option>
                <option value="teridentifikasi">Teridentifikasi</option>
                <option value="mitigasi">Dalam Mitigasi</option>
                <option value="selesai">Selesai</option>
              </select>

              <input
                className="w-full p-2 border border-gray-300 rounded hover:bg-gray-700 text-white cursor-pointer bg-gray-800"
                type="submit"
                value={processing ? 'Submitting...' : 'Submit'}
                disabled={processing}
              />
            </form>

          </div>
        </div>
      </div>

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Validation Errors</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => setShowErrorDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default BimView;
