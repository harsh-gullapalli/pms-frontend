import { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useApiResource } from '../../../lib/api/useApiResource';
import { loadRoomInventory } from '../../../lib/api/loaders';
import { toast } from '../../../utils/toast';
import { Button } from '../../../components/primitives';
import type {
  Building,
  FloorLevel,
  MaintenanceReasonItem,
  OccupancyConfig,
  RoomCategory,
  RoomSettingsSectionId,
  RoomStatusDefinition,
} from './types';
import {
  INITIAL_BUILDINGS,
  INITIAL_CATEGORIES,
  INITIAL_FLOORS,
  INITIAL_MAINTENANCE_REASONS,
  INITIAL_OCCUPANCY_CONFIG,
  INITIAL_ROOM_STATUSES,
} from './initialData';
import { RoomTypesSection } from './RoomTypesSection';
import { CategoriesSection } from './CategoriesSection';
import { FloorsBuildingsSection } from './FloorsBuildingsSection';
import { OccupancyCapacitySection } from './OccupancyCapacitySection';
import { MaintenanceReasonsSection } from './MaintenanceReasonsSection';
import { StatusConfigSection } from './StatusConfigSection';

interface SectionTabItem {
  id: RoomSettingsSectionId;
  label: string;
  shortLabel: string;
  icon: Lucide.LucideIcon;
}

interface SectionGroup {
  title: string;
  items: SectionTabItem[];
}

const GROUPS: SectionGroup[] = [
  {
    title: 'Inventory',
    items: [
      { id: 'room-types', label: 'Room Types', shortLabel: 'Types', icon: Lucide.BedDouble },
      { id: 'categories', label: 'Categories', shortLabel: 'Categories', icon: Lucide.Boxes },
      { id: 'floors-buildings', label: 'Floors & Buildings', shortLabel: 'Floors', icon: Lucide.Building2 },
    ],
  },
  {
    title: 'Guest experience',
    items: [
      { id: 'occupancy', label: 'Occupancy & Capacity', shortLabel: 'Capacity', icon: Lucide.Users2 },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'maintenance-reasons', label: 'Maintenance Reasons', shortLabel: 'Reasons', icon: Lucide.Wrench },
      { id: 'status-config', label: 'Status Configuration', shortLabel: 'Status', icon: Lucide.Activity },
    ],
  },
];

const SECTIONS: SectionTabItem[] = GROUPS.flatMap((g) => g.items);

export function RoomSettingsTab({ currencyCode }: { currencyCode: string }) {
  const [activeSection, setActiveSection] = useState<RoomSettingsSectionId>('room-types');

  // Live Inventory Resource (Room Types & Rooms from backend/store)
  const inventoryResource = useApiResource(() => loadRoomInventory());
  const roomTypes = inventoryResource.data?.roomTypes ?? [];

  // Local state for all 6 modular sections
  const [categories, setCategories] = useState<RoomCategory[]>(INITIAL_CATEGORIES);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [floors, setFloors] = useState<FloorLevel[]>(INITIAL_FLOORS);
  const [occupancyConfig, setOccupancyConfig] = useState<OccupancyConfig>(INITIAL_OCCUPANCY_CONFIG);
  const [maintenanceReasons, setMaintenanceReasons] = useState<MaintenanceReasonItem[]>(INITIAL_MAINTENANCE_REASONS);
  const [statuses, setStatuses] = useState<RoomStatusDefinition[]>(INITIAL_ROOM_STATUSES);

  const [isSavingAll, setIsSavingAll] = useState(false);

  // Dynamic counter badge per section
  const getBadgeCount = (id: RoomSettingsSectionId): string | number => {
    switch (id) {
      case 'room-types':
        return roomTypes.length;
      case 'categories':
        return categories.length;
      case 'floors-buildings':
        return `${buildings.length}b / ${floors.length}f`;
      case 'occupancy':
        return `${occupancyConfig.maxTotalOccupancy} max`;
      case 'maintenance-reasons':
        return maintenanceReasons.length;
      case 'status-config':
        return statuses.length;
    }
  };

  const handleSaveAll = () => {
    setIsSavingAll(true);
    setTimeout(() => {
      setIsSavingAll(false);
      toast('All room settings committed', {
        detail: 'Global specifications, building hierarchy, operational rules, and status triggers saved.',
        tone: 'success',
      });
    }, 400);
  };

  const handleResetDefaults = () => {
    setCategories(INITIAL_CATEGORIES);
    setBuildings(INITIAL_BUILDINGS);
    setFloors(INITIAL_FLOORS);
    setOccupancyConfig(INITIAL_OCCUPANCY_CONFIG);
    setMaintenanceReasons(INITIAL_MAINTENANCE_REASONS);
    setStatuses(INITIAL_ROOM_STATUSES);
    inventoryResource.refresh();
    toast('Room settings restored to baseline', {
      detail: 'All 6 sections reset to standard property defaults.',
      tone: 'info',
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="pms-card flex flex-col justify-between gap-4 p-4 sm:p-5 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-dark-accent text-white shadow-xs shadow-primary/20">
            <Lucide.Hotel size={22} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-disp2 font-extrabold tracking-tight text-ink">Room Settings</h1>
            <p className="text-label text-ink-secondary">
              Inventory, capacity, amenities and operating rules for every room in the property
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-none">
          <Button variant="secondary" onClick={handleResetDefaults} icon={<Lucide.RotateCcw size={13} />}>
            Reset Defaults
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSavingAll}
            icon={isSavingAll ? <Lucide.Loader2 size={14} className="animate-spin" /> : <Lucide.CheckCheck size={14} />}
          >
            {isSavingAll ? 'Saving…' : 'Save All Settings'}
          </Button>
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="pms-card min-w-0 p-1.5 lg:sticky lg:top-4 lg:p-2.5" aria-label="Room settings sections">
          <div
            className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
            role="tablist"
            aria-label="Room Settings Sections"
            onKeyDown={(e) => {
              const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
              if (!keys.includes(e.key)) return;
              e.preventDefault();
              const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);
              let nextIndex: number;
              if (e.key === 'Home') nextIndex = 0;
              else if (e.key === 'End') nextIndex = SECTIONS.length - 1;
              else {
                const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
                nextIndex = (currentIndex + step + SECTIONS.length) % SECTIONS.length;
              }
              const next = SECTIONS[nextIndex];
              setActiveSection(next.id);
              document.getElementById(`room-tab-${next.id}`)?.focus();
            }}
          >
            {GROUPS.map((group, groupIndex) => (
              <div
                key={group.title}
                role="presentation"
                className={`flex gap-1 lg:flex-col ${groupIndex > 0 ? 'lg:mt-2 lg:border-t lg:border-divider lg:pt-2' : ''}`}
              >
                <p
                  className="hidden px-2 pb-1 pt-1 text-micro font-bold uppercase tracking-wider text-ink-muted lg:block"
                  role="presentation"
                >
                  {group.title}
                </p>
                {group.items.map((sec) => {
                  const isSelected = activeSection === sec.id;
                  const Icon = sec.icon;
                  return (
                    <button
                      type="button"
                      key={sec.id}
                      id={`room-tab-${sec.id}`}
                      role="tab"
                      tabIndex={isSelected ? 0 : -1}
                      aria-selected={isSelected}
                      aria-controls={`room-panel-${sec.id}`}
                      onClick={() => setActiveSection(sec.id)}
                      className={`flex flex-none cursor-pointer items-center gap-2.5 rounded-xl border px-2 py-1.5 text-left text-label font-semibold transition-colors lg:w-full ${
                        isSelected
                          ? 'border-primary/30 bg-primary/5 text-ink'
                          : 'border-transparent text-ink-secondary hover:bg-muted-surface hover:text-ink'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg transition-colors ${
                          isSelected ? 'bg-primary text-white shadow-xs' : 'bg-muted-surface text-ink-secondary'
                        }`}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="hidden min-w-0 flex-1 truncate lg:inline">{sec.label}</span>
                      <span className="lg:hidden">{sec.shortLabel}</span>
                      <span
                        className={`text-micro font-semibold tnum lg:ml-auto ${isSelected ? 'text-primary' : 'text-ink-muted'}`}
                      >
                        {getBadgeCount(sec.id)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <div
          id={`room-panel-${activeSection}`}
          role="tabpanel"
          aria-labelledby={`room-tab-${activeSection}`}
          className="min-w-0"
        >
          {activeSection === 'room-types' && (
            <RoomTypesSection
              types={roomTypes}
              currencyCode={currencyCode}
              loading={inventoryResource.loading}
              error={inventoryResource.error}
              onRefresh={() => inventoryResource.refresh()}
            />
          )}

          {activeSection === 'categories' && (
            <CategoriesSection
              categories={categories}
              onChange={setCategories}
            />
          )}

          {activeSection === 'floors-buildings' && (
            <FloorsBuildingsSection
              buildings={buildings}
              floors={floors}
              onBuildingsChange={setBuildings}
              onFloorsChange={setFloors}
            />
          )}

          {activeSection === 'occupancy' && (
            <OccupancyCapacitySection
              config={occupancyConfig}
              currencyCode={currencyCode}
              onChange={setOccupancyConfig}
            />
          )}

          {activeSection === 'maintenance-reasons' && (
            <MaintenanceReasonsSection
              reasons={maintenanceReasons}
              onChange={setMaintenanceReasons}
            />
          )}

          {activeSection === 'status-config' && (
            <StatusConfigSection
              statuses={statuses}
              onChange={setStatuses}
            />
          )}
        </div>
      </div>
    </div>
  );
}
