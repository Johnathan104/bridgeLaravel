function Modal({ open, onClose, children }:
 { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000aa] bg-opacity-60">
      <div className="bg-white rounded shadow-lg p-8 min-w-[400px] relative">
        <button className="absolute top-2 right-2 text-black" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}
export default Modal;