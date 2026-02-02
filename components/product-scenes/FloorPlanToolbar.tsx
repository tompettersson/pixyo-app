'use client';

import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { ELEMENT_TEMPLATES, ElementCategory } from '@/types/floorplan';

const CATEGORIES: { key: ElementCategory; label: string; icon: string }[] = [
  { key: 'speaker', label: 'Audio', icon: '🔊' },
  { key: 'furniture', label: 'Möbel', icon: '🛋️' },
  { key: 'decor', label: 'Deko', icon: '🪴' },
  { key: 'architecture', label: 'Architektur', icon: '═' },
];

export function FloorPlanToolbar() {
  const addElement = useFloorPlanStore((s) => s.addElement);
  const camera = useFloorPlanStore((s) => s.camera);
  const addCamera = useFloorPlanStore((s) => s.addCamera);
  const removeCamera = useFloorPlanStore((s) => s.removeCamera);

  return (
    <div className="space-y-4">
      {/* Camera Section */}
      <div>
        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>📷</span>
          Kamera
        </h4>
        <button
          onClick={camera ? removeCamera : addCamera}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all text-left
            ${camera
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50 hover:border-violet-500/30'
            }`}
        >
          <span className="w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0 bg-amber-500/30">
            📷
          </span>
          <span className="text-xs">
            {camera ? 'Kamera entfernen' : 'Kamera platzieren'}
          </span>
        </button>
        {camera && (
          <p className="text-[10px] text-zinc-500 mt-1.5 px-1">
            Ziehe die Kamera im Canvas. Klicke zum Drehen.
          </p>
        )}
      </div>
      {CATEGORIES.map((category) => {
        const templates = ELEMENT_TEMPLATES.filter((t) => t.category === category.key);

        return (
          <div key={category.key}>
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.label}
            </h4>
            <div className="flex flex-col gap-1">
              {templates.map((template) => (
                <button
                  key={template.subType}
                  onClick={() => addElement(template.subType)}
                  title={template.labelDe}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50
                           hover:bg-zinc-700/50 hover:border-violet-500/30 transition-all text-left group"
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: template.color + '30' }}
                  >
                    {template.icon}
                  </span>
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                    {template.labelDe}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
