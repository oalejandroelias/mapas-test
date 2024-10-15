import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import LayerList from './components/LayerList';
import MapLayer from './components/MapLayer';
import VisibleLayersList from './components/VisibleLayersList';
import ContextMenu from './components/ContextMenu';
import AttributeTable from './components/AttributeTable';
import { Layer } from './types';

function App() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; layerId: number } | null>(null);
  const [showAttributeTable, setShowAttributeTable] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const response = await axios.get('https://giscopade.neuquen.gov.ar/integrabilidad/giscopade.neuquen.gov.ar/geoserver/wms?request=GetCapabilities&service=wms');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const layerElements = xmlDoc.getElementsByTagName('Layer');
        
        const parsedLayers: Layer[] = Array.from(layerElements).map((layerElement, index) => {
          const name = layerElement.getElementsByTagName('Name')[0]?.textContent || '';
          const title = layerElement.getElementsByTagName('Title')[0]?.textContent || '';
          const bbox = layerElement.getElementsByTagName('BoundingBox')[0];
          const extent = bbox ? [
            parseFloat(bbox.getAttribute('minx') || '0'),
            parseFloat(bbox.getAttribute('miny') || '0'),
            parseFloat(bbox.getAttribute('maxx') || '0'),
            parseFloat(bbox.getAttribute('maxy') || '0')
          ] : null;
          return { id: index, name, title, visible: false, opacity: 1, zIndex: index, extent };
        });

        setLayers(parsedLayers);
      } catch (error) {
        console.error('Error fetching layers:', error);
      }
    };

    fetchLayers();
  }, []);

  const toggleLayerVisibility = (id: number) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const updateLayerOpacity = (id: number, opacity: number) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, opacity } : layer
    ));
  };

  const handleContextMenu = (e: React.MouseEvent, layerId: number) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ x: rect.right, y: rect.top, layerId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const zoomToLayer = (layerId: number) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer && layer.extent && mapRef.current) {
      mapRef.current.fitBounds([
        [layer.extent[1], layer.extent[0]],
        [layer.extent[3], layer.extent[2]]
      ]);
    }
    closeContextMenu();
  };

  const viewAttributes = (layerId: number) => {
    setSelectedLayerId(layerId);
    setShowAttributeTable(true);
    closeContextMenu();
  };

  const downloadLayer = async (layerId: number, format: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      const url = `https://giscopade.neuquen.gov.ar/integrabilidad/giscopade.neuquen.gov.ar/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer.name}&outputFormat=${format}`;
      window.open(url, '_blank');
    }
    closeContextMenu();
  };

  const moveLayer = (dragIndex: number, hoverIndex: number) => {
    setLayers(prevLayers => {
      const newLayers = [...prevLayers];
      const [reorderedLayer] = newLayers.splice(dragIndex, 1);
      newLayers.splice(hoverIndex, 0, reorderedLayer);
      return newLayers.map((layer, index) => ({ ...layer, zIndex: newLayers.length - index }));
    });
  };

  const MapController = () => {
    const map = useMap();
    mapRef.current = map;
    return null;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen">
        <LayerList 
          layers={layers} 
          toggleVisibility={toggleLayerVisibility} 
          updateOpacity={updateLayerOpacity}
          onContextMenu={handleContextMenu}
        />
        <div className="flex-grow relative">
          <MapContainer center={[-38.9516, -68.0591]} zoom={7} style={{ height: '100%', width: '100%' }}>
            <MapController />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {layers.filter(layer => layer.visible).sort((a, b) => b.zIndex - a.zIndex).map(layer => (
              <MapLayer key={layer.id} layer={layer} />
            ))}
          </MapContainer>
          <VisibleLayersList layers={layers.filter(layer => layer.visible)} moveLayer={moveLayer} />
        </div>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onZoom={() => zoomToLayer(contextMenu.layerId)}
            onViewAttributes={() => viewAttributes(contextMenu.layerId)}
            onDownload={(format) => downloadLayer(contextMenu.layerId, format)}
          />
        )}
        {showAttributeTable && selectedLayerId !== null && (
          <AttributeTable
            layerId={selectedLayerId}
            layerName={layers.find(l => l.id === selectedLayerId)?.name || ''}
            onClose={() => setShowAttributeTable(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;