import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AttributeTableProps {
  layerId: number;
  layerName: string;
  onClose: () => void;
}

const AttributeTable: React.FC<AttributeTableProps> = ({ layerId, layerName, onClose }) => {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axios.get(`https://giscopade.neuquen.gov.ar/integrabilidad/giscopade.neuquen.gov.ar/geoserver/wfs`, {
          params: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json',
            maxFeatures: 50
          }
        });
        if (response.data && response.data.features) {
          setAttributes(response.data.features);
        } else {
          setError('No data received from the server');
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
        setError('Failed to fetch attributes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [layerId, layerName]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4">
          <p className="text-xl">Loading attributes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (attributes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">No Data</h2>
          <p>No attributes found for this layer.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const columns = Object.keys(attributes[0].properties);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-3/4 h-3/4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Attribute Table</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="border p-2 bg-gray-200">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((feature, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column} className="border p-2">{feature.properties[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AttributeTable;