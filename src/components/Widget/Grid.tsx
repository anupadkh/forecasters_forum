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
    <div style={{ 
      height: '100%',             
      boxSizing: 'border-box',    
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column' // Helps us push content to the top and buttons to the bottom
    }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ flexGrow: 1 }}>This widget is {isDraggable ? 'Draggable' : 'Locked'}!</p>

      {/* Only show these buttons if the global Edit Mode is ON */}
      {isEditing && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={onToggleDrag}>
            {isDraggable ? '🔓 Lock Drag' : '🔒 Unlock Drag'}
          </button>
          <button onClick={onToggleResize}>
            {isResizable ? '🔓 Lock Resize' : '🔒 Unlock Resize'}
          </button>
        </div>
      )}
    </div>
  );
}