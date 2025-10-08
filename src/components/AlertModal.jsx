// components/AlertModal.jsx
export default function AlertModal({ type, message, onClose }) {
  const colors = {
    success: "bg-green-100 text-green-800",
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className={`p-4 rounded-lg shadow-lg w-80 text-center ${colors[type]}`}>
        <p>{message}</p>
        <button
          className="mt-3 px-4 py-2 bg-gray-800 text-white rounded"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
