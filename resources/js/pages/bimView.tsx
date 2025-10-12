import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'View BIM', href: '/bim-view' },
];

interface Upload {
  id: number;
  urn: string;
  filename: string;
  created_at: string;
}

interface Props {
  uploads: Upload[];
}

export default function BimView({ uploads }: Props) {
  const [showPopup, setShowPopup] = useState(false);

  const handleDelete = (upload: Upload) => {
    router.delete('/models/' + upload.id, {
      onSuccess: () => {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000); // auto close after 3s
        router.reload();
      },
      onError: (error) => {
        alert('Error deleting model');
        console.error(error);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="BIM Viewer" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-scroll rounded-xl p-4">
        {/* ✅ Green Popup */}
        {showPopup && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-bounce">
            ✅ Model BIM berhasil dihapus
          </div>
        )}

        <div className="w-full border rounded-xl bg-white shadow dark:bg-gray-900 dark:border-gray-700">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="border px-4 py-2 dark:border-gray-700">URN</th>
                <th className="border px-4 py-2 dark:border-gray-700">File Name</th>
                <th className="border px-4 py-2 dark:border-gray-700">Date</th>
                <th className="border px-4 py-2 dark:border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length > 0 ? (
                uploads.map((upload) => (
                  <tr
                    key={upload.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="border px-4 py-2 font-mono text-xs dark:border-gray-700 text-wrap break-all">
                      {upload.urn}
                    </td>
                    <td className="border px-4 py-2 dark:border-gray-700 text-wrap break-all">
                      {upload.filename}
                    </td>
                    <td className="border px-4 py-2 dark:border-gray-700">
                      {new Date(upload.created_at).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 flex gap-2">
                      <Link href={`/bim-view/risks/${upload.urn}`}>
                        <input
                          type="button"
                          value="View"
                          className="bg-slate-700 hover:bg-slate-500 text-white font-bold px-4 py-2 rounded-sm"
                        />
                      </Link>
                      <input
                        onClick={() => handleDelete(upload)}
                        type="button"
                        value="Delete"
                        className="bg-red-700 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-sm"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border px-4 py-2 text-center dark:border-gray-700"
                    colSpan={4}
                  >
                    No models uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
