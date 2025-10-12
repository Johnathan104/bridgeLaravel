import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const ExcelPreview = ({ fileUrl }: { fileUrl: string }) => {
  const [data, setData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100); // zoom percentage

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        setData(jsonData);
      } catch (error) {
        console.error("Error loading Excel file:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExcel();
  }, [fileUrl]);

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  if (loading) return <p className="text-gray-500">Loading spreadsheet...</p>;

  if (!data || data.length === 0)
    return <p className="text-gray-500">No data found in Excel file.</p>;

  return (
    <div className="relative overflow-auto max-h-[400px] border-t border-gray-100 bg-white rounded-lg">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          onClick={zoomOut}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded shadow transition-transform hover:scale-105"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={zoomIn}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded shadow transition-transform hover:scale-105"
          title="Zoom In"
        >
          +
        </button>
      </div>

      {/* Zoom Wrapper */}
      <div
        className="inline-block transition-transform duration-200 ease-in-out"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
      >
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i === 0 ? "font-semibold bg-gray-50" : ""}>
                {row.map((cell: any, j: number) => (
                  <td
                    key={j}
                    className="border border-gray-200 px-3 py-2 text-gray-800 whitespace-nowrap"
                  >
                    {cell ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-3 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
        Zoom: {zoom}%
      </div>
    </div>
  );
};

export default ExcelPreview;
