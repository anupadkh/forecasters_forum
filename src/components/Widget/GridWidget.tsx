import s from './GridWidget.module.scss';

interface GridWidgetProps {
  title?: string;
  isEditing?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  onToggleDrag?: () => void;
  onToggleResize?: () => void;
}

export default function GridWidget({ 
  title = "Default Widget", 
  isEditing,
  isDraggable = true,
  isResizable = true,
  onToggleDrag,
  onToggleResize
}: GridWidgetProps) {
  return (
    <div className={`${s.widget} ${isEditing ? s.editing : ''}`}>
      <h3 className={s.title}>{title}</h3>
      <p className={s.status}>This widget is {isDraggable ? 'Draggable' : 'Locked'}!</p>

      {/* Only show these buttons if the global Edit Mode is ON */}
      {isEditing && (
        <div className={s.controls}>
          <button className={s.controlButton} type="button" onClick={onToggleDrag}>
            {isDraggable ? '🔓 Lock Drag' : '🔒 Unlock Drag'}
          </button>
          <button className={s.controlButton} type="button" onClick={onToggleResize}>
            {isResizable ? '🔓 Lock Resize' : '🔒 Unlock Resize'}
          </button>
        </div>
      )}
    </div>
  );
}