import React, { useState } from "react";
import { router } from "@inertiajs/react";

const XlsUploadButton = ({ id }: { id: number }) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    const formData = new FormData();
    formData.append("excel_file", file);
    console.log("Uploading file to model ID:", formData,id);
    router.post(`/models/xls/${id}`, formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        // ✅ flash message from Laravel can appear automatically if set
        // but you can also show local toast
        alert("✅ Excel/CSV uploaded successfully!");
      },
      onError: (errors) => {
        console.error(errors);
        alert("❌ Upload failed. Please check your file format.");
      },
      onFinish: () => {
        setUploading(false);
      },
    });
  };

  return (
    <div className="relative inline-block my-[20px]" id="xlsupload">
      <label
        htmlFor={`excel-file-${id}`}
        className={`inline-flex items-center justify-center px-5 py-2 rounded-md font-semibold cursor-pointer transition-all duration-300 ${
          uploading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        }`}
      >
        {uploading ? (
          <span className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Uploading...</span>
          </span>
        ) : (
          <span>{fileName ? "Re-upload Excel" : "Upload Excel"}</span>
        )}
      </label>

      <input
        type="file"
        id={`excel-file-${id}`}
        accept=".xls,.xlsx,.csv"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default XlsUploadButton;
