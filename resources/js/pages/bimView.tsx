import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        setTimeout(() => setShowPopup(false), 3000);
        router.reload();
      },
      onError: () => alert('Error deleting model'),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="BIM Viewer" />

      {/* PAGE WRAPPER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-scroll rounded-xl p-4"
      >
        {/* Animated Success Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 70 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg"
            >
              ✅ Model BIM berhasil dihapus
            </motion.div>
          )}
        </AnimatePresence>

        {/* TABLE CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full border rounded-xl bg-white shadow dark:bg-gray-900 dark:border-gray-700"
        >
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="border px-4 py-3 dark:border-gray-700">URN</th>
                <th className="border px-4 py-3 dark:border-gray-700">File Name</th>
                <th className="border px-4 py-3 dark:border-gray-700">Date</th>
                <th className="border px-4 py-3 dark:border-gray-700 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {uploads.length > 0 ? (
                uploads.map((upload, index) => (
                  <motion.tr
                    key={upload.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    }}
                    className="dark:hover:bg-gray-800 transition cursor-pointer"
                  >
                    <td className="border px-4 py-2 font-mono text-xs dark:border-gray-700 break-all">
                      {upload.urn}
                    </td>
                    <td className="border px-4 py-2 dark:border-gray-700 break-all">
                      {upload.filename}
                    </td>
                    <td className="border px-4 py-2 dark:border-gray-700">
                      {new Date(upload.created_at).toLocaleString()}
                    </td>

                    <td className="border px-4 py-2 flex gap-2 justify-center dark:border-gray-700">
                      {/* View Button */}
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Link href={`/bim-view/risks/${upload.urn}`}>
                          <button className="bg-slate-700 hover:bg-slate-500 text-white font-bold px-4 py-2 rounded-sm transition">
                            View
                          </button>
                        </Link>
                      </motion.div>

                      {/* Delete Button */}
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <button
                          onClick={() => handleDelete(upload)}
                          className="bg-red-700 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-sm transition"
                        >
                          Delete
                        </button>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <td
                    className="border px-4 py-4 text-center dark:border-gray-700"
                    colSpan={4}
                  >
                    No models uploaded yet
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
