import { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useApiResource } from '../../../lib/api/useApiResource';
import { loadRoomInventory } from '../../../lib/api/loaders';
import { toast } from '../../../utils/toast';
import { Button } from '../../../components/primitives';
import type {
  Building,
  ConnectingRoomPair,
  FloorLevel,
  MaintenanceReasonItem,
  OccupancyConfig,
  RoomAmenityItem,
  RoomAttributeItem,
  RoomCategory,
  RoomOperationalConfig,
  RoomSettingsSectionId,
  RoomStatusDefinition,
} from './types';
import {
  INITIAL_AMENITIES,
  INITIAL_ATTRIBUTES,
  INITIAL_BUILDINGS,
  INITIAL_CATEGORIES,
  INITIAL_CONNECTING_PAIRS,
  INITIAL_FLOORS,
  INITIAL_MAINTENANCE_REASONS,
  INITIAL_OCCUPANCY_CONFIG,
  INITIAL_OPERATIONAL_CONFIG,
  INITIAL_ROOM_STATUSES,
} from './initialData';
import { RoomTypesSection } from './RoomTypesSection';
import { CategoriesSection } from './CategoriesSection';
import { FloorsBuildingsSection } from './FloorsBuildingsSection';
import { OccupancyCapacitySection } from './OccupancyCapacitySection';
import { AmenitiesSection } from './AmenitiesSection';
import { AttributesSection } from './AttributesSection';
import { OperationalRulesSection } from './OperationalRulesSection';
import { MaintenanceReasonsSection } from './MaintenanceReasonsSection';
import { StatusConfigSection } from './StatusConfigSection';
import { ConnectingRoomsSection } from './ConnectingRoomsSection';

interface SectionTabItem {
  id: RoomSettingsSectionId;
  number: number;
  label: string;
  shortLabel: string;
  icon: Lucide.LucideIcon;
}

const SECTIONS: SectionTabItem[] = [
  { id: 'room-types', number: 1, label: 'Room Types', shortLabel: 'Types', icon: Lucide.BedDouble },
  { id: 'categories', number: 2, label: 'Categories / Classification', shortLabel: 'Categories', icon: Lucide.Boxes },
  { id: 'floors-buildings', number: 3, label: 'Floors & Buildings', shortLabel: 'Floors', icon: Lucide.Building2 },
  { id: 'occupancy', number: 4, label: 'Occupancy & Capacity', shortLabel: 'Capacity', icon: Lucide.Users2 },
  { id: 'amenities', number: 5, label: 'Room Amenities', shortLabel: 'Amenities', icon: Lucide.Sparkles },
  { id: 'attributes', number: 6, label: 'Room Attributes', shortLabel: 'Attributes', icon: Lucide.Sliders },
  { id: 'operations', number: 7, label: 'Operational Rules', shortLabel: 'Operations', icon: Lucide.Clock },
  { id: 'maintenance-reasons', number: 8, label: 'Maintenance Reasons', shortLabel: 'Reasons', icon: Lucide.Wrench },
  { id: 'status-config', number: 9, label: 'Status Configuration', shortLabel: 'Status', icon: Lucide.Activity },
  { id: 'connecting-rooms', number: 10, label: 'Connecting & Linked Rooms', shortLabel: 'Linked Rooms', icon: Lucide.Link2 },
];

export function RoomSettingsTab({ currencyCode }: { currencyCode: string }) {
  const [activeSection, setActiveSection] = useState<RoomSettingsSectionId>('room-types');

  // Live Inventory Resource (Room Types & Rooms from backend/store)
  const inventoryResource = useApiResource(() => loadRoomInventory());
  const roomTypes = inventoryResource.data?.roomTypes ?? [];

  // Local state for all 10 modular sections
  const [categories, setCategories] = useState<RoomCategory[]>(INITIAL_CATEGORIES);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [floors, setFloors] = useState<FloorLevel[]>(INITIAL_FLOORS);
  const [occupancyConfig, setOccupancyConfig] = useState<OccupancyConfig>(INITIAL_OCCUPANCY_CONFIG);
  const [amenities, setAmenities] = useState<RoomAmenityItem[]>(INITIAL_AMENITIES);
  const [attributes, setAttributes] = useState<RoomAttributeItem[]>(INITIAL_ATTRIBUTES);
  const [operationalConfig, setOperationalConfig] = useState<RoomOperationalConfig>(INITIAL_OPERATIONAL_CONFIG);
  const [maintenanceReasons, setMaintenanceReasons] = useState<MaintenanceReasonItem[]>(INITIAL_MAINTENANCE_REASONS);
  const [statuses, setStatuses] = useState<RoomStatusDefinition[]>(INITIAL_ROOM_STATUSES);
  const [connectingPairs, setConnectingPairs] = useState<ConnectingRoomPair[]>(INITIAL_CONNECTING_PAIRS);

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
      case 'amenities':
        return amenities.filter((a) => a.active).length;
      case 'attributes':
        return attributes.filter((a) => a.active).length;
      case 'operations':
        return `${operationalConfig.turnaroundBufferMinutes}m`;
      case 'maintenance-reasons':
        return maintenanceReasons.length;
      case 'status-config':
        return statuses.length;
      case 'connecting-rooms':
        return connectingPairs.length;
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
    setAmenities(INITIAL_AMENITIES);
    setAttributes(INITIAL_ATTRIBUTES);
    setOperationalConfig(INITIAL_OPERATIONAL_CONFIG);
    setMaintenanceReasons(INITIAL_MAINTENANCE_REASONS);
    setStatuses(INITIAL_ROOM_STATUSES);
    setConnectingPairs(INITIAL_CONNECTING_PAIRS);
    inventoryResource.refresh();
    toast('Room settings restored to baseline', {
      detail: 'All 10 sections reset to standard property defaults.',
      tone: 'info',
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Global Top Banner */}
      <div className="pms-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-dark-accent text-white shadow-xs shadow-primary/20">
            <Lucide.Hotel size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-disp2 font-black text-ink tracking-tight">Room Settings</h1>
              <span className="text-micro font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Global Property Config
              </span>
            </div>
            <p className="text-label text-ink-secondary mt-0.5">
              Complete hotel inventory specifications, architectural categories, tower floors, occupancy rules, amenities, and operational triggers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Button
            variant="secondary"
            onClick={handleResetDefaults}
            icon={<Lucide.RotateCcw size={13} />}
          >
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
      </div>

      {/* 10-Section Navigation Bar */}
      <div className="pms-card p-1.5 overflow-hidden">
        <div
          className="no-scrollbar flex overflow-x-auto gap-1"
          role="tablist"
          aria-label="Room Settings Sections"
          onKeyDown={(e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault();
            const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);
            const step = e.key === 'ArrowRight' ? 1 : -1;
            const next = SECTIONS[(currentIndex + step + SECTIONS.length) % SECTIONS.length];
            setActiveSection(next.id);
            document.getElementById(`room-tab-${next.id}`)?.focus();
          }}
        >
          {SECTIONS.map((sec) => {
            const isSelected = activeSection === sec.id;
            const Icon = sec.icon;
            const badgeValue = getBadgeCount(sec.id);
            return (
              <Button
                variant="text"
                key={sec.id}
                id={`room-tab-${sec.id}`}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-controls={`room-panel-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`relative flex flex-none items-center gap-2 rounded-xl px-3 py-2 text-label font-bold transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-ink-secondary hover:text-ink hover:bg-muted-surface'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-micro font-black tnum ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-muted-surface text-ink-muted'
                  }`}
                >
                  {sec.number}
                </span>
                <Icon size={14} className="shrink-0" />
                <span className="hidden sm:inline">{sec.label}</span>
                <span className="inline sm:hidden">{sec.shortLabel}</span>
                <span
                  className={`text-micro font-semibold px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-muted-surface text-ink-muted'
                  }`}
                >
                  {badgeValue}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Section View Panel */}
      <div id={`room-panel-${activeSection}`} role="tabpanel" aria-labelledby={`room-tab-${activeSection}`}>
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

        {activeSection === 'amenities' && (
          <AmenitiesSection
            amenities={amenities}
            currencyCode={currencyCode}
            onChange={setAmenities}
          />
        )}

        {activeSection === 'attributes' && (
          <AttributesSection
            attributes={attributes}
            onChange={setAttributes}
          />
        )}

        {activeSection === 'operations' && (
          <OperationalRulesSection
            config={operationalConfig}
            currencyCode={currencyCode}
            onChange={setOperationalConfig}
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

        {activeSection === 'connecting-rooms' && (
          <ConnectingRoomsSection
            pairs={connectingPairs}
            currencyCode={currencyCode}
            onChange={setConnectingPairs}
          />
        )}
      </div>
    </div>
  );
}
