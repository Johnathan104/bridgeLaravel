import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

interface RiskFormProps {
  action: string; // API endpoint
  urn: string;
  objectId: string | null;
}

const RiskForm: React.FC<RiskFormProps> = ({ action, urn, objectId }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    deskripsiResiko: '',
    status: '',
    tanggal: '',
    biaya: '',
    prioritas: 'rendah',
    jenisResiko: 'struktur',
    urn: urn || '',
    object_id: objectId || null,
  });

  // 🔹 Sync props → form state when they change
  useEffect(() => {
    setData('urn', urn);
  }, [urn]);

  useEffect(() => {
    if (objectId) setData('object_id', objectId);
  }, [objectId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setData(e.target.name as keyof typeof data, e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(action, {
      onSuccess: () => {
        alert('✅ Risk created successfully');
        reset();
        setData('urn', urn); // re-fill urn after reset
        setData('object_id', objectId); // re-fill object id
      },
      onError: () => {
        alert('❌ Failed to submit risk, please check the fields.');
      },
    });
  };

  return (
    <div className="border rounded-sm border-white my-4 p-4">
      <h1 className="text-4xl font-bold my-[50px] ml-[20px]">Form resiko pada struktur</h1>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-m mb-2"
          name="deskripsiResiko"
          placeholder="Deskripsi resiko"
          value={data.deskripsiResiko}
          onChange={handleChange}
        />
        {errors.deskripsiResiko && <p className="text-red-500">{errors.deskripsiResiko}</p>}

        <input
          className="w-full p-2 border border-gray-300 rounded-m mb-2"
          type="text"
          name="status"
          placeholder="status resiko"
          value={data.status}
          onChange={handleChange}
        />
        {errors.status && <p className="text-red-500">{errors.status}</p>}

        <input
          className="w-full p-2 border border-gray-300 rounded-m mb-2"
          type="date"
          name="tanggal"
          placeholder="tanggal"
          value={data.tanggal}
          onChange={handleChange}
        />
        {errors.tanggal && <p className="text-red-500">{errors.tanggal}</p>}

        <input
          className="w-full p-2 border border-gray-300 rounded-m mb-2"
          type="number"
          name="biaya"
          placeholder="biaya"
          value={data.biaya}
          onChange={handleChange}
        />
        {errors.biaya && <p className="text-red-500">{errors.biaya}</p>}

        <div className="flex flex-row w-full gap-4 mb-4">
          <select
            className="w-full p-2 border border-gray-300 rounded-m"
            name="prioritas"
            id="prioritas"
            value={data.prioritas}
            onChange={handleChange}
          >
            <option value="rendah">Rendah</option>
            <option value="sedang">Sedang</option>
            <option value="tinggi">Tinggi</option>
          </select>
          {errors.prioritas && <p className="text-red-500">{errors.prioritas}</p>}

          <select
            className="w-full p-2 border border-gray-300 rounded-m"
            name="jenisResiko"
            id="jenisResiko"
            value={data.jenisResiko}
            onChange={handleChange}
          >
            <option value="struktur">Struktur</option>
            <option value="nonStruktur">Non Struktur</option>
            <option value="infrastruktur">Infrastruktur</option>
          </select>
          {errors.jenisResiko && <p className="text-red-500">{errors.jenisResiko}</p>}
        </div>

        {/* Hidden urn & object_id */}
        <input type="hidden" name="urn" value={data.urn} />
        <input type="hidden" name="object_id" value={data.object_id || ''} />

        <button
          type="submit"
          disabled={processing}
          className="w-full p-2 border border-gray-300 rounded-m mb-2 hover:bg-gray-700 cursor-pointer disabled:opacity-50"
        >
          {processing ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default RiskForm;
