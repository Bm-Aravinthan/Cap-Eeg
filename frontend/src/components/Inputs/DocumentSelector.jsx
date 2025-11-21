import { useRef } from "react";
import { LuTrash, LuFile } from "react-icons/lu";

const DocumentSelector = ({ document, setDocument }) => {
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    if (file) {
      setDocument(file);
    }
  };

  const handleRemove = () => {
    setDocument(null);
    if (inputRef.current) inputRef.current.value = null;
  };

  return (
    <div className="relative border border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition">
      {document ? (
        <div className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border border-gray-300">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <LuFile className="text-blue-600" />
            {typeof document === "string" ? (
              <a
                href={document}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View existing document
              </a>
            ) : (
              <span>{document.name}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-500 hover:text-red-600"
          >
            <LuTrash size={16} />
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-2 text-gray-500"
          onClick={() => inputRef.current.click()}
        >
          {/* <LuFile size={24} /> */}
          <p className="text-sm">Click to upload document (PDF)</p>
          <input
            type="file"
            accept="application/pdf"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default DocumentSelector;
