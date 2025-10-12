import React from 'react'
import { Change } from '@/types';

function ChangeCard({
  change,
  onEdit,
  onDelete,
  onSelect,
  role,
  onRequest
}: {
  change: Change;
  onEdit: (c: Change) => void;
  onDelete: (c: Change) => void;
  onSelect: (c: Change) => void;
  role:string;
  onRequest: (c:Change)=>void
}) {

  return (
    <div
      className="bg-stone-800 hover:bg-stone-600 p-8 text-wrap w-full rounded-sm mb-4"
      onClick={() => onSelect(change)}
    >
        <div className="flex py-4 items-center text-wrap border-b border-white my-4">
            <p className="text-3xl">{change.title}</p>
            <p className="text-l mx-2 text-stone-400">{change.date} oleh {change.pelapor}</p>
        </div>

        <p className="text-xl mt-2">Deskripsi</p>
        <p className="text-sm text-wrap break-word">{change.description}</p>

        <p className="text-xl mt-2">Tanggal</p>
        <p className="text-sm">{change.date}</p>

        <p className="text-xl mt-2">Pelapor</p>
        <p className="text-sm text-wrap break-word">{change.pelapor}</p>

        <p className="text-xl mt-2">Status</p>
        <p className="text-sm capitalize">{change.status}</p>

        <p className="text-xl mt-2">Object ID</p>
        <p className="text-sm text-wrap break-word">{change.object_id}</p>
        {role == 'admin' ?(<div className="w-full flex justify-end mt-4">
        <button
            className="px-4 py-2 bg-slate-500 hover:bg-slate-600 rounded-sm"
            onClick={(e) => {
            e.stopPropagation();
            onEdit(change);
            }}
        >
            Edit
        </button>
        <button
            className="px-4 py-2 bg-red-500 hover:bg-red-600 ml-[20px] rounded-sm"
            onClick={(e) => {
            e.stopPropagation();
            onDelete(change);
            }}
        >
            Delete
        </button>
        </div>):(<div className="w-full flex justify-end mt-4">
           <button
            className="px-4 py-2 bg-slate-500 hover:bg-slate-600 rounded-sm"
            onClick={(e) => {
            e.stopPropagation();
            onRequest(change);
            }}
        >
            Request Change
        </button>
        </div>)}
        
    </div>
  );
}

export default ChangeCard;
