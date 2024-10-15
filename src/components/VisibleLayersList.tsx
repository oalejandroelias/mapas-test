import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Layer } from '../types';
import { GripVertical } from 'lucide-react';

interface DragItem {
  index: number;
  id: number;
  type: string;
}

interface LayerItemProps {
  layer: Layer;
  index: number;
  moveLayer: (dragIndex: number, hoverIndex: number) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({ layer, index, moveLayer }) => {
  const ref = useRef<HTMLLIElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: 'layer',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveLayer(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'layer',
    item: () => {
      return { id: layer.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <li ref={ref} className="flex items-center bg-white p-2 mb-1 shadow rounded" style={{ opacity }} data-handler-id={handlerId}>
      <GripVertical size={18} className="mr-2 cursor-move" />
      <span>{layer.title}</span>
    </li>
  );
};

interface VisibleLayersListProps {
  layers: Layer[];
  moveLayer: (dragIndex: number, hoverIndex: number) => void;
}

const VisibleLayersList: React.FC<VisibleLayersListProps> = ({ layers, moveLayer }) => {
  return (
    <div className="absolute top-2 right-2 w-64 bg-white shadow-lg rounded p-2 z-[1000]">
      <h3 className="font-bold mb-2">Visible Layers</h3>
      <ul>
        {layers.map((layer, index) => (
          <LayerItem key={layer.id} layer={layer} index={index} moveLayer={moveLayer} />
        ))}
      </ul>
    </div>
  );
};

export default VisibleLayersList;