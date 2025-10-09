// components/AlertModal.jsx
export default function AlertModal({ type, message, onClose }) {
  const colors = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      button: "bg-green-600 hover:bg-green-700",
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      button: "bg-blue-600 hover:bg-blue-700",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      button: "bg-amber-600 hover:bg-amber-700",
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      button: "bg-red-600 hover:bg-red-700",
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
  };

  const currentColor = colors[type] || colors.info;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div 
        className={`
          relative max-w-md w-full p-6 rounded-2xl shadow-2xl 
          ${currentColor.bg} ${currentColor.border} border-2
          transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white hover:bg-opacity-30 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="p-3 rounded-full bg-white bg-opacity-50">
            {currentColor.icon}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className={`text-lg font-semibold ${currentColor.text}`}>
              {type === 'success' && 'Success!'}
              {type === 'info' && 'Information'}
              {type === 'warning' && 'Warning'}
              {type === 'error' && 'Error'}
            </h3>
            <p className={`text-sm leading-relaxed ${currentColor.text} opacity-90`}>
              {message}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`
              mt-2 px-6 py-2 text-white rounded-lg font-medium
              transition-all duration-200 transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
              ${currentColor.button}
            `}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}