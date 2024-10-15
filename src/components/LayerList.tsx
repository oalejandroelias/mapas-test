import React from 'react';
import { Layer } from '../types';
import { Layers, MoreVertical, Download } from 'lucide-react';

interface LayerListProps {
  layers: Layer[];
  toggleVisibility: (id: number) => void;
  updateOpacity: (id: number, opacity: number) => void;
  onContextMenu: (e: React.MouseEvent, layerId: number) => void;
}

const LayerList: React.FC<LayerListProps> = ({ layers, toggleVisibility, updateOpacity, onContextMenu }) => {
  return (
    <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Layers className="mr-2" /> Capas
      </h2>
      <ul>
        {layers.map(layer => (
          <li key={layer.id} className="mb-4 border-b pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => toggleVisibility(layer.id)}
                  className="mr-2"
                />
                <span className="font-medium">{layer.title}</span>
              </div>
              <button
                onClick={(e) => onContextMenu(e, layer.id)}
                className="p-1 rounded hover:bg-gray-200"
              >
                <MoreVertical size={18} />
              </button>
            </div>
            {layer.visible && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Opacity: {layer.opacity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
                  className="w-full"
                />
                <button className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <Download size={16} className="mr-1" /> Download
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayerList;