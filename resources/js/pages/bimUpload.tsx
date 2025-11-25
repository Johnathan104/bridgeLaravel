import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Upload } from '@/types';
import type { BreadcrumbItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const BUCKET_KEY = 'bridge_react_demo_bucket_jaem_01';
const currentDate = new Date().toISOString().replace(/[-:.]/g, '');

function encodeUrnRFC6920(objectId) {
  return btoa(objectId)
    .replace(/=/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}

interface PageProps {
  urn: string;
  uploads: Upload[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'BIM upload', href: '/bimUpload' },
];

function App() {
  const { props } = usePage<PageProps>();
  const uploads = props.uploads;

  const [previousCopyURN, setPreviousCopyURN] = useState('');
  const [uploadType] = useState('new');
  const [propType, setPropType] = useState(null);
  const [forgeToken, setForgeToken] = useState(null);
  const [modelUrn, setModelUrn] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [model_name, setModelName] = useState('');
  const [props1, setProps1] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // MODEL NAME
  const MODEL_FILE_NAME = `${model_name}_${currentDate}.rvt`;

  // Viewer builder (not modified)
  const createViewerReact = (token: string, urny: string) => {
    let viewer;
    let options = {
      env: 'AutodeskProduction2',
      api: 'streamingV2',
      getAccessToken: function (onTokenReady) {
        onTokenReady(token.trim(), 3600);
      },
    };

    Autodesk.Viewing.FeatureFlags.set('DS_ENDPOINTS', true);

    Autodesk.Viewing.Initializer(options, function () {
      let htmlDiv = document.getElementById('forgeViewer');
      viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
      if (viewer.start() > 0) return;

      let documentId = 'urn:' + urny;
      Autodesk.Viewing.Document.load(
        documentId,
        onDocumentLoadSuccess,
        () => console.error('Failed loading manifest'),
        { accessToken: token }
      );

      function onDocumentLoadSuccess(doc) {
        let defaultModel = doc.getRoot().getDefaultGeometry();
        viewer.loadDocumentNode(doc, defaultModel);

        viewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          function (event) {
            if (event.dbIdArray.length > 0) {
              const dbId = event.dbIdArray[0];
              viewer.getProperties(dbId, function (props1) {
                alert(`You clicked: ${props1.name}`);
              });
            }
          }
        );
      }
    });
  };

  // APS Token
  const getForgeToken = async () => {
    try {
      const res = await axios.get('/api/revit/token');
      setForgeToken(res.data);
      return res.data;
    } catch {
      setUploadStatus('Failed to get Forge token');
      return null;
    }
  };

  const createBucket = async (token) => {
    try {
      await axios.post(
        'https://developer.api.autodesk.com/oss/v2/buckets',
        { bucketKey: BUCKET_KEY, policyKey: 'transient' },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );
      return true;
    } catch (error) {
      if (error.response?.status === 409) return true;
      setUploadStatus('Bucket creation failed');
      return false;
    }
  };

  // TRANSLATION
  const translateModel = async (token, urn) => {
    try {
      const response = await axios.post(
        'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
        {
          input: { urn: urn.trim() },
          output: { formats: [{ type: 'svf2', views: ['2d', '3d'] }] },
        },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );

      const translatedUrn = response.data.urn;
      setModelUrn(translatedUrn);

      // 📌 Store to DB
      router.post('/models', {
        urn: translatedUrn,
        filename: MODEL_FILE_NAME,
      });

      // 🟢 SHOW SUCCESS POPUP
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      setUploadStatus('Failed to start translation job');
    }
  };

  const getSignedS3UploadUrl = async (token, uploadKey) => {
    try {
      const response = await axios.post(
        `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects/${MODEL_FILE_NAME}/signeds3upload`,
        {
          ossbucketKey: BUCKET_KEY,
          ossSourceFileObjectKey: MODEL_FILE_NAME,
          access: 'full',
          uploadKey,
        },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );

      const urn = encodeUrnRFC6920(response.data.objectId);
      setModelUrn(urn);

      await translateModel(token, urn);
    } catch {
      setUploadStatus('Failed to get signed S3 upload URL');
    }
  };

  const uploadRvtFile = async (token, file) => {
    try {
      const response = await axios.get(
        `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects/${MODEL_FILE_NAME}/signeds3upload`,
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );

      const { uploadKey, urls } = response.data;

      await axios.put(urls[0], file, {
        headers: { 'Content-Type': 'application/octet-stream' },
      });

      await getSignedS3UploadUrl(token, uploadKey);
    } catch {
      setUploadStatus('File upload failed');
    }
  };

  const handleFileChange = async (e) => {
    if (!model_name) {
      alert('Please enter model name first');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const token = forgeToken || (await getForgeToken());
    if (!token) return;

    const bucket = await createBucket(token);
    if (!bucket) return;

    uploadRvtFile(token, file);
  };

  useEffect(() => {
    getForgeToken();
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="BIM Upload" />

      <div className="relative p-4 flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-900 to-gray-800">
        
        {/* 🟢 SUCCESS POPUP */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              className="fixed top-8 right-8 bg-green-700 text-white px-8 py-4 rounded-xl shadow-2xl z-50"
              initial={{ opacity: 0, scale: 0.8, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <span className="text-2xl mr-2">✅</span>
              Model BIM berhasil diupload
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="w-full max-w-4xl border border-gray-700 rounded-2xl p-8 shadow-xl bg-gray-900"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          <motion.p
            className="text-lg font-semibold mb-2 text-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Model name
          </motion.p>
          <motion.input
            type="text"
            onChange={(e) => setModelName(e.target.value)}
            value={model_name}
            className="w-full border border-gray-700 bg-gray-800 text-gray-100 p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 transition"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          />

          <motion.input
            className="mb-6 block w-full text-sm text-gray-300 border border-gray-700 rounded-lg p-4 cursor-pointer bg-gray-800 hover:bg-gray-700 transition"
            type="file"
            accept=".rvt"
            onChange={handleFileChange}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          />

          <motion.p
            className="text-gray-400 mb-4 min-h-[24px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {uploadStatus}
          </motion.p>

          <motion.button
            className="mb-4 px-6 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition"
            onClick={() => {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Check Status
          </motion.button>

          <motion.div
            id="forgeViewer"
            className="w-full h-[40vh] border border-gray-700 rounded-xl mt-8 bg-gray-800"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          />
        </motion.div>
      </div>
    </AppLayout>
  );
}

export default App;