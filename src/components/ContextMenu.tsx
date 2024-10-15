import React, { useState } from 'react';
import { ZoomIn, Table, Download, ChevronRight } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onZoom: () => void;
  onViewAttributes: () => void;
  onDownload: (format: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onZoom, onViewAttributes, onDownload }) => {
  const [showDownloadFormats, setShowDownloadFormats] = useState(false);

  const downloadFormats = ['kml', 'json', 'gml', 'shp'];

  return (
    <div 
      className="fixed bg-white shadow-lg rounded-md py-2 z-50"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center" onClick={onZoom}>
        <ZoomIn size={18} className="mr-2" /> Zoom to Layer
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center" onClick={onViewAttributes}>
        <Table size={18} className="mr-2" /> View Attributes
      </button>
      <div className="relative">
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
          onClick={() => setShowDownloadFormats(!showDownloadFormats)}
        >
          <span className="flex items-center">
            <Download size={18} className="mr-2" /> Download
          </span>
          <ChevronRight size={18} className={`transition-transform ${showDownloadFormats ? 'rotate-90' : ''}`} />
        </button>
        {showDownloadFormats && (
          <div className="absolute left-full top-0 bg-white shadow-lg rounded-md py-2 ml-2">
            {downloadFormats.map((format) => (
              <button
                key={format}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => onDownload(format)}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextMenu;