import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import { Layer } from '../types';

interface MapLayerProps {
  layer: Layer;
}

const MapLayer: React.FC<MapLayerProps> = ({ layer }) => {
  return (
    <WMSTileLayer
      url="https://giscopade.neuquen.gov.ar/integrabilidad/giscopade.neuquen.gov.ar/geoserver/wms"
      layers={layer.name}
      format="image/png"
      transparent={true}
      opacity={layer.opacity}
    />
  );
};

export default MapLayer;