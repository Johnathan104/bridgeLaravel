import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Head, router} from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
// --- CONFIGURATION ---
const BUCKET_KEY = 'bridge-react-demo-bucket'; // Must be globally unique
const currentDate = new Date().toISOString().replace(/[-:.]/g, '');
const MODEL_FILE_NAME = `model_${currentDate}.rvt`; // Unique file name with timestamp
function encodeUrnRFC6920(objectId) {
  return btoa(objectId)
    .replace(/=/g, '')   // Remove padding
    .replace(/\//g, '_') // Replace '/' with '_'
    .replace(/\+/g, '-'); // Replace '+' with '-'
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'BIM upload',
        href: '/bimUpload',
    },
];

function App() {
  const [props, setProps] = useState([])
  
  const [propType, setPropType] = useState(null)
  const [forgeToken, setForgeToken] = useState(null);
  const [modelUrn, setModelUrn] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [model_name, setModelName] = useState('');
  const MODEL_FILE_NAME = `${model_name}_${currentDate}.rvt`; 
  // Unique file name with timestamp
  const createViewerReact = (token:string, urny:string) => {

    // axios.post('http://localhost:3001/api/viewer',{
    //   urn:modelUrn,
    //   token:token
    // }).then(res=>{
    //   console.log(res)
    // })
    let viewer;
    let options = {
    env: 'AutodeskProduction2', // Use 'AutodeskProduction' for SVF
    api: 'streamingV2', // Use 'derivativeV2' for SVF
    getAccessToken: function(onTokenReady) {
          let timeInSeconds = 3600; // Use value provided by APS Authentication (OAuth) API
          onTokenReady(token, timeInSeconds);
      }
    };

    Autodesk.Viewing.FeatureFlags.set('DS_ENDPOINTS', true); // Enable automatic region routing

    Autodesk.Viewing.Initializer(options, function() {
      let htmlDiv = document.getElementById('forgeViewer');
      viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
      let startedCode = viewer.start();
      if (startedCode > 0) {
          console.error('Failed to create a Viewer: WebGL not supported.');
          return;
      }

      console.log('Initialization complete, loading a model next...');
    });
     let documentId = 'urn:'+urny;
       Autodesk.Viewing.Document.load(
        documentId,
        onDocumentLoadSuccess,
        onDocumentLoadFailure,
        { accessToken: token }
      );

      function onDocumentLoadSuccess(viewerDocument) {
          let defaultModel = viewerDocument.getRoot().getDefaultGeometry();
          viewer.loadDocumentNode(viewerDocument, defaultModel);
          // 🔹 Add selection listener
            viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function (event) {
            if (event.dbIdArray.length > 0) {
              const dbId = event.dbIdArray[0];
              viewer.getProperties(dbId, function (props) {
                console.log('Clicked part properties:', props);
                alert(`You clicked: ${props.name}\nCategory: ${props.properties[0]?.displayName}`);
              });
            }
          });

      }

      function onDocumentLoadFailure() {
          console.error('Failed fetching Forge manifest');
      }
      
      
    
  }
  // --- Get Forge Token ---
  const getForgeToken = async () => {
    try {
      setUploadStatus('Getting Forge token...');
      const res = await axios.get(
        '/api/revit/token');
      setForgeToken(res.data);
      setUploadStatus('Forge token acquired');
      console.log(res.data)
      return res.data;
    } catch {
      setUploadStatus('Failed to get Forge token');
      return null;
    }
  };

  // --- Create Bucket ---
  const createBucket = async (token) => {
    try {
      await axios.post(
        'https://developer.api.autodesk.com/oss/v2/buckets',
        {
          bucketKey: BUCKET_KEY,
          policyKey: 'transient',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Bucket already exists
        return true;
      }
      setUploadStatus('Bucket creation failed');
      return false;
    }
  };

  const translateModel = async (token, urn) => {
    try {
      const response = await axios.post(
        'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
        {
          input: { urn },
          output: {
            formats: [
              {
                type: 'svf2',
                views: ['2d', '3d']
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setUploadStatus('Translation job started. You can proceed to check status, to view');
      console.log('Translation job response:', response.data);
      setModelUrn(response.data.urn);
      router.post('/models', {
      urn,
      filename: MODEL_FILE_NAME,
    });
      
    } catch (error) {
      setUploadStatus('Failed to start translation job');
      console.error(error);
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
          uploadKey: uploadKey,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const urn = encodeUrnRFC6920(response.data.objectId);
      setModelUrn(urn);
      // createViewerReact(token, urn);

      // Automatically start translation job after upload
      await translateModel(token, urn);
    } catch (error) {
      setUploadStatus('Failed to get signed S3 upload URL');
      return null;
    }
  };
  const checkStatus = ()=>{
    let lolurn=modelUrn
    axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${lolurn}/manifest`,{
      headers:{
        Authorization:`Bearer ${forgeToken}`
      }
    }).then(res=>{
      console.log(res, 'status')
      setModelUrn(res.data.urn)
      if(res.data.status==='success'){
        alert('translation complete')
        console.log(forgeToken)
      //get metadata
      axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${lolurn}/metadata`, {
        headers:{
          Authorization:`Bearer ${forgeToken}`
        }
      }).then((res)=>{
        let guid = res.data.data.metadata[0].guid
        axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${lolurn}/metadata/${guid}`, {
          headers:{
            Authorization:`Bearer ${forgeToken}`
          }
        }).then((res)=>{
          console.log(res.data.data.objects[0].objects)
          setProps(res.data.data.objects[0].objects)
        })
      })
      createViewerReact(forgeToken,res.data.urn)
      }
      else{
        alert('translation in progress')
      }
    })
  }

  // --- Upload RVT File ---
  const uploadRvtFile = async (token, file) => {
    try {
      const response = await axios.get(
        `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects/${MODEL_FILE_NAME}/signeds3upload`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
          },
        }
      );
      const { uploadKey, urls } = response.data;
      await axios.put(
        urls[0],
        file,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        }
      );
      getSignedS3UploadUrl(token, uploadKey);
    } catch (error) {
      setUploadStatus('File upload failed');
      return null;
    }
  };

  // --- Handle File Upload ---
  const handleFileChange = async (e) => {
    if(model_name){
      
      setUploadStatus('Uploading file...');
      const file = e.target.files[0];
      if (!file) return;
      const token = forgeToken || (await getForgeToken());
      if (!token) return;
      const bucketCreated = await createBucket(token);
      if (!bucketCreated) return;
      await uploadRvtFile(token, file);
    }else{
      alert('Please enter model name first')
    }
   
  };

  useEffect(() => {
    getForgeToken();
  }, []);

  return (
   <AppLayout breadcrumbs={breadcrumbs}>
    <Head title="BIM Upload" />
    <div className="flex justify-center items-center p-4">
        <div className="w-full max-w-4xl border border-gray-400 rounded-lg p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">Upload RVT and Get URN</h1>
        <p className="text-sm">Model name</p>
        <input type="text" onChange={(e)=>setModelName(e.target.value)}  value ={model_name} className="w-full border border-white p-2 mb-4 rounded-sm" />
        <input
            className="mb-4 block w-full text-sm text-gray-400 border border-gray-300 rounded-sm p-4 cursor-pointer focus:outline-none focus:ring focus:ring-blue-300"
            type="file"
            accept=".rvt"
            onChange={handleFileChange}
        />

        <p className="text-gray-200">{uploadStatus}</p>
        <p className="mb-4 text-gray-200">Upload a Revit (.rvt) file to view.</p>

        <button
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-sm border-gray hover:bg-gray-700 focus:ring-2 focus:ring-blue-400"
            onClick={checkStatus}
        >
            Check Status
        </button>

        {props.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">1
                <h2 className="text-center font-semibold mb-2">Type</h2>
                <select
                id="propType"
                className="w-full p-2 border border-gray-300 rounded-lg"
                >
                {props.map((prop, index) => (
                    <option
                    onClick={() => setPropType(index)}
                    key={prop.objectId}
                    value={index}
                    >
                    {prop.name}
                    </option>
                ))}
                </select>
            </div>

            <div className="flex-1">
                <h2 className="text-center font-semibold mb-2">Specific</h2>
                <select
                id="specificProp"
                className="w-full p-2 border border-gray-300 rounded-lg"
                >
                {props[propType]?.objects.map((prop) => (
                    <option key={prop.objectId} value={prop.objectId}>
                    {prop.name}
                    </option>
                ))}
                </select>
            </div>
            </div>
        ) : (
            ""
        )}

        <div
            id="forgeViewer"
            className="w-full h-[40vh] min-h-[400px] relative overflow-hidden border border-gray-300 rounded-lg mt-6"
        />
        </div>
    </div>
    </AppLayout>


  );
}

export default App;