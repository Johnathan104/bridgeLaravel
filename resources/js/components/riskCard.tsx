import React from "react";
import { Risk } from "@/types";

interface RiskCardProps {
  risk: Risk;
  onEdit: (risk: Risk) => void;
  onDelete: (risk: Risk) => void;
  onFinish: (risk: Risk) => void;
  onSelect: (risk: Risk) => void;
  onRequest: (risk: Risk) => void;
  role:string;
}

export default function RiskCard({ risk, onEdit, onDelete, onSelect, onFinish, role, onRequest }: RiskCardProps) {
  return (
    <div
      className={
        risk.status === "selesai"
          ? "bg-green-700 border border-green p-8 text-wrap hover:bg-green-600 w-full rounded-sm mb-4"
          : "hover:bg-stone-600 bg-stone-800 p-8 text-wrap w-full rounded-sm mb-4"
      }
      onClick={() => onSelect(risk)}
    >
      <p className="text-xl font-semibold">Kode Risiko</p>
      <p className="text-sm">{risk.risk_code}</p>

      <p className="text-xl mt-2 font-semibold">Nama Proyek</p>
      <p className="text-sm">{risk.project_name}</p>

      <p className="text-xl mt-2 font-semibold">Tanggal Kejadian</p>
      <p className="text-sm">{risk.tanggal_kejadian}</p>

      <p className="text-xl mt-2 font-semibold">Deskripsi Risiko</p>
      <p className="text-sm">{risk.deskripsi_risiko}</p>

      <p className="text-xl mt-2 font-semibold">Penyebab</p>
      <p className="text-sm">{risk.penyebab}</p>

      <p className="text-xl mt-2 font-semibold">Dampak</p>
      <p className="text-sm">{risk.dampak}</p>

      <p className="text-xl mt-2 font-semibold">Tindakan Mitigasi</p>
      <p className="text-sm">{risk.tindakan_mitigasi}</p>

      <p className="text-xl mt-2 font-semibold">Status</p>
      <p className="text-sm capitalize">{risk.status}</p>

      <p className="text-xl mt-2 font-semibold">URN</p>
      <p className="text-sm break-all">{risk.urn}</p>

      <p className="text-xl mt-2 font-semibold">Object ID</p>
      <p className="text-sm">{risk.object_id}</p>
      {role == 'admin' ? (<div className="w-full flex justify-end mt-4">

        <button
          className="px-4 py-2 bg-slate-500 hover:bg-slate-600 rounded-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(risk);
          }}
        >
          Edit
        </button>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 ml-[20px] rounded-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(risk);
          }}
        >
          Delete
        </button>
      </div>): (<div className="w-full flex justify-end mt-4">
        <button
          className="px-4 py-2 bg-slate-500 hover:bg-slate-600 ml-[20px] rounded-sm"
          onClick={(e) => {
            e.stopPropagation();
            onRequest(risk);
          }}
        >
          Request Change
        </button>
      </div>)}
      
    </div>
  );
}
