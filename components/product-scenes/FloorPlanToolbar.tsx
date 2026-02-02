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

  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => {
        const templates = ELEMENT_TEMPLATES.filter((t) => t.category === category.key);

        return (
          <div key={category.key}>
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.label}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {templates.map((template) => (
                <button
                  key={template.subType}
                  onClick={() => addElement(template.subType)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50
                           hover:bg-zinc-700/50 hover:border-violet-500/30 transition-all text-left group"
                >
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-sm"
                    style={{ backgroundColor: template.color + '30' }}
                  >
                    {template.icon}
                  </span>
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200 truncate">
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
