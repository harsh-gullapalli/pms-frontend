import { useState } from 'react';
import * as Lucide from 'lucide-react';
import { toast } from '../../../utils/toast';
import { Button, IconButton, SelectField, TextField } from '../../../components/primitives';
import { Field } from '../../../components/controls';
import { Modal } from '../../../components/overlays';
import { Badge, Card, CardTitle, TableContainer } from '../../../components/ui';
import type { Building, FloorLevel } from './types';
import { StatStrip, StatTile } from './RoomSettingsKit';

interface FloorsBuildingsSectionProps {
  buildings: Building[];
  floors: FloorLevel[];
  onBuildingsChange: (b: Building[]) => void;
  onFloorsChange: (f: FloorLevel[]) => void;
}

const EMPTY_BUILDING: Building = {
  id: '',
  code: '',
  name: '',
  description: '',
  totalFloors: 1,
  totalRooms: 0,
  active: true,
};

const EMPTY_FLOOR: FloorLevel = {
  id: '',
  buildingId: '',
  buildingName: '',
  floorNumber: 1,
  floorName: '',
  wing: 'East Wing',
  totalRooms: 6,
  assignedTypes: ['Deluxe'],
  keycardZone: 'Zone-1 (Lift Bank A)',
  status: 'Operational',
};

export function FloorsBuildingsSection({
  buildings,
  floors,
  onBuildingsChange,
  onFloorsChange,
}: FloorsBuildingsSectionProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [editingFloor, setEditingFloor] = useState<FloorLevel | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const filteredFloors = floors.filter(
    (fl) => selectedBuildingId === 'all' || fl.buildingId === selectedBuildingId,
  );

  const totalRoomsMapped = floors.reduce((s, f) => s + f.totalRooms, 0);
  const operationalFloors = floors.filter((f) => f.status === 'Operational').length;
  const renovationFloors = floors.filter((f) => f.status === 'Renovation').length;

  const handleOpenAddBuilding = () => {
    setEditingBuilding({
      ...EMPTY_BUILDING,
      id: `bld-${Date.now().toString(36)}`,
      code: `BLD-${buildings.length + 1}`,
    });
  };

  const handleSaveBuilding = () => {
    if (!editingBuilding) return;
    if (editingBuilding.name.trim().length < 2) {
      return toast('Building name required', { tone: 'warning' });
    }
    const exists = buildings.some((b) => b.id === editingBuilding.id);
    let updated: Building[];
    if (exists) {
      updated = buildings.map((b) => (b.id === editingBuilding.id ? editingBuilding : b));
      toast('Building updated', { tone: 'success' });
    } else {
      updated = [...buildings, editingBuilding];
      toast('New building added', { tone: 'success' });
    }
    onBuildingsChange(updated);
    setEditingBuilding(null);
  };

  const handleOpenAddFloor = () => {
    const defaultBld = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];
    setEditingFloor({
      ...EMPTY_FLOOR,
      id: `flr-${Date.now().toString(36)}`,
      buildingId: defaultBld?.id || 'bld-main',
      buildingName: defaultBld?.name || 'Main Tower',
      floorNumber: floors.length + 1,
      floorName: `Floor ${floors.length + 1} - Standard Wing`,
    });
  };

  const handleSaveFloor = () => {
    if (!editingFloor) return;
    if (editingFloor.floorName.trim().length < 2) {
      return toast('Floor name required', { tone: 'warning' });
    }
    const bld = buildings.find((b) => b.id === editingFloor.buildingId);
    const resolvedFloor = {
      ...editingFloor,
      buildingName: bld ? bld.name : editingFloor.buildingName,
    };

    const exists = floors.some((f) => f.id === resolvedFloor.id);
    let updated: FloorLevel[];
    if (exists) {
      updated = floors.map((f) => (f.id === resolvedFloor.id ? resolvedFloor : f));
      toast('Floor configuration saved', { tone: 'success' });
    } else {
      updated = [...floors, resolvedFloor];
      toast('New floor added', { tone: 'success' });
    }
    onFloorsChange(updated);
    setEditingFloor(null);
  };

  const handleDeleteFloor = (id: string, name: string) => {
    const updated = floors.filter((f) => f.id !== id);
    onFloorsChange(updated);
    toast('Floor removed', { detail: `${name} deleted.`, tone: 'info' });
  };

  return (
    <div className="flex flex-col gap-5">
      <StatStrip>
        <StatTile
          label="Buildings / Wings"
          icon={Lucide.Building2}
          tone="info"
          value={buildings.length}
          caption="Towers & standalone wings"
        />

        <StatTile
          label="Floor Levels"
          icon={Lucide.Layers}
          tone="success"
          value={floors.length}
          caption={<>{operationalFloors} operational</>}
        />

        <StatTile
          label="Total Rooms"
          icon={Lucide.DoorClosed}
          tone="primary"
          value={totalRoomsMapped}
          caption="Across all floor zones"
        />

        <StatTile
          label="Under Renovation"
          icon={Lucide.Hammer}
          tone="warning"
          value={renovationFloors}
          caption="Floors currently blocked"
        />
      </StatStrip>

      {/* Buildings Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {buildings.map((bld) => {
          const bldFloors = floors.filter((f) => f.buildingId === bld.id);
          const bldRooms = bldFloors.reduce((s, f) => s + f.totalRooms, 0);
          const isSelected = selectedBuildingId === bld.id;
          return (
            <div
              key={bld.id}
              onClick={() => setSelectedBuildingId(isSelected ? 'all' : bld.id)}
              className={`pms-card p-4 cursor-pointer transition-all border ${
                isSelected
                  ? 'border-primary shadow-xs ring-1 ring-primary/30'
                  : 'hover:border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-micro font-bold uppercase tracking-wider text-primary">
                    {bld.code}
                  </span>
                  <h3 className="text-body font-bold text-ink mt-0.5">{bld.name}</h3>
                </div>
                <Badge tone={bld.active ? 'success' : 'neutral'} dot size="sm">
                  {bld.active ? 'Active' : 'Closed'}
                </Badge>
              </div>
              <p className="text-label text-ink-secondary mt-1.5 line-clamp-2">
                {bld.description}
              </p>
              <div className="mt-3 pt-2.5 border-t border-divider flex items-center justify-between text-label">
                <span className="text-ink-muted">
                  <span className="font-semibold text-ink tnum">{bldFloors.length}</span> Floors
                </span>
                <span className="text-ink-muted">
                  <span className="font-semibold text-ink tnum">{bldRooms}</span> Rooms
                </span>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBuilding(bld);
                  }}
                  title={`Edit ${bld.name}`}
                >
                  <Lucide.Pencil size={13} />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floors Table Card */}
      <Card>
        <CardTitle
          title="Floor Plans & Elevator Zones"
          subtitle="Configure floor naming, floor numbers, assigned room types, and keycard lift zones"
          icon={Lucide.Layers}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleOpenAddBuilding}
                icon={<Lucide.Plus size={14} />}
              >
                Add Building
              </Button>
              <Button
                variant="primary"
                onClick={handleOpenAddFloor}
                icon={<Lucide.Plus size={14} />}
              >
                Add Floor Level
              </Button>
            </div>
          }
        />

        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-label text-ink-secondary">Filter by Building:</span>
            <SelectField
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="w-48"
            >
              <option value="all">All Buildings ({floors.length} Floors)</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
          </div>
          <span className="text-label text-ink-secondary">
            Showing <span className="font-semibold text-ink">{filteredFloors.length}</span> floor levels
          </span>
        </div>

        <TableContainer>
          <table className="pms-table min-w-[760px] w-full text-left">
            <thead>
              <tr>
                <th className="w-12 text-center">LEVEL</th>
                <th>FLOOR NAME</th>
                <th>BUILDING / TOWER</th>
                <th>WING / SECTION</th>
                <th className="text-center">ROOMS</th>
                <th>KEYCARD ELEVATOR ZONE</th>
                <th className="text-center">STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredFloors.map((fl) => (
                <tr key={fl.id} className="transition-colors hover:bg-hover-surface/60 border-b border-divider last:border-b-0">
                  <td className="text-center py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted-surface text-ink font-black tnum text-label">
                      {fl.floorNumber}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="block font-bold text-ink text-label">{fl.floorName}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {fl.assignedTypes.map((type, i) => (
                        <span key={i} className="text-micro font-medium text-ink-muted bg-muted-surface px-1.5 py-0.2 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-label font-semibold text-ink py-3">
                    {fl.buildingName}
                  </td>
                  <td className="text-label text-ink-secondary py-3">
                    {fl.wing}
                  </td>
                  <td className="text-center tnum text-label font-bold text-ink py-3">
                    {fl.totalRooms}
                  </td>
                  <td className="text-label text-ink-secondary py-3">
                    <span className="inline-flex items-center gap-1 font-mono text-micro px-2 py-0.5 rounded bg-muted-surface border border-border">
                      <Lucide.KeyRound size={11} className="text-ink-muted" />
                      {fl.keycardZone}
                    </span>
                  </td>
                  <td className="text-center py-3">
                    <Badge
                      tone={
                        fl.status === 'Operational'
                          ? 'success'
                          : fl.status === 'Renovation'
                            ? 'warning'
                            : 'neutral'
                      }
                      dot
                      size="sm"
                    >
                      {fl.status}
                    </Badge>
                  </td>
                  <td className="text-right py-3">
                    <div className="inline-flex items-center gap-1.5">
                      <IconButton
                        title={`Edit ${fl.floorName}`}
                        onClick={() => setEditingFloor(fl)}
                      >
                        <Lucide.Pencil size={14} />
                      </IconButton>
                      <IconButton
                        title={`Delete ${fl.floorName}`}
                        onClick={() => handleDeleteFloor(fl.id, fl.floorName)}
                        className="hover:text-danger-text"
                      >
                        <Lucide.Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFloors.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-label text-ink-muted">
                    No floor levels configured for this building.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableContainer>
      </Card>

      {/* Edit / Add Floor Modal */}
      <Modal
        open={editingFloor !== null}
        onClose={() => setEditingFloor(null)}
        title={editingFloor?.id.startsWith('flr-') && !floors.some((f) => f.id === editingFloor?.id) ? 'Add Floor Level' : `Edit ${editingFloor?.floorName}`}
        subtitle="Manage building association, floor number, room allotments, and elevator access zones"
        wide
      >
        {editingFloor && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 py-2">
            <Field label="Building / Tower">
              <SelectField
                value={editingFloor.buildingId}
                onChange={(e) => {
                  const b = buildings.find((x) => x.id === e.target.value);
                  setEditingFloor({
                    ...editingFloor,
                    buildingId: e.target.value,
                    buildingName: b ? b.name : editingFloor.buildingName,
                  });
                }}
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </SelectField>
            </Field>

            <Field label="Floor Level Number">
              <TextField
                type="number"
                min={0}
                max={99}
                value={editingFloor.floorNumber}
                onChange={(e) => setEditingFloor({ ...editingFloor, floorNumber: Number(e.target.value) })}
                className="tnum"
              />
            </Field>

            <Field label="Floor Display Name">
              <TextField
                value={editingFloor.floorName}
                onChange={(e) => setEditingFloor({ ...editingFloor, floorName: e.target.value })}
                placeholder="e.g. 2nd Floor - Executive Lounge"
                autoFocus
              />
            </Field>

            <Field label="Wing / Corridor">
              <TextField
                value={editingFloor.wing}
                onChange={(e) => setEditingFloor({ ...editingFloor, wing: e.target.value })}
                placeholder="e.g. East Wing, Beachfront Pavilion"
              />
            </Field>

            <Field label="Total Physical Rooms on Floor">
              <TextField
                type="number"
                min={1}
                max={50}
                value={editingFloor.totalRooms}
                onChange={(e) => setEditingFloor({ ...editingFloor, totalRooms: Number(e.target.value) })}
                className="tnum"
              />
            </Field>

            <Field label="Keycard RFID Zone">
              <TextField
                value={editingFloor.keycardZone}
                onChange={(e) => setEditingFloor({ ...editingFloor, keycardZone: e.target.value })}
                placeholder="e.g. Zone-2 (Elevator Bank A)"
              />
            </Field>

            <Field label="Floor Status">
              <SelectField
                value={editingFloor.status}
                onChange={(e) =>
                  setEditingFloor({
                    ...editingFloor,
                    status: e.target.value as FloorLevel['status'],
                  })
                }
              >
                <option value="Operational">Operational (Ready for guest stays)</option>
                <option value="Renovation">Renovation (Housekeeping / civil maintenance)</option>
                <option value="Closed">Closed (Off-season or shut)</option>
              </SelectField>
            </Field>

            <div className="flex justify-end gap-2 sm:col-span-2 pt-3 border-t border-divider">
              <Button variant="secondary" onClick={() => setEditingFloor(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveFloor}
                icon={<Lucide.Save size={14} />}
              >
                Save Floor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit / Add Building Modal */}
      <Modal
        open={editingBuilding !== null}
        onClose={() => setEditingBuilding(null)}
        title={editingBuilding?.id.startsWith('bld-') && !buildings.some((b) => b.id === editingBuilding?.id) ? 'Add Building / Tower' : `Edit ${editingBuilding?.name}`}
        subtitle="Configure physical hotel tower, wing identification code, and floor count"
      >
        {editingBuilding && (
          <div className="flex flex-col gap-3.5 py-2">
            <Field label="Building Name">
              <TextField
                value={editingBuilding.name}
                onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                placeholder="e.g. Heritage Tower"
                autoFocus
              />
            </Field>

            <Field label="Building Code">
              <TextField
                value={editingBuilding.code}
                onChange={(e) => setEditingBuilding({ ...editingBuilding, code: e.target.value.toUpperCase() })}
                placeholder="e.g. TWR-B"
                className="font-mono"
              />
            </Field>

            <Field label="Description">
              <TextField
                value={editingBuilding.description}
                onChange={(e) => setEditingBuilding({ ...editingBuilding, description: e.target.value })}
                placeholder="Location on property grounds, proximity to amenities"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-3 border-t border-divider">
              <Button variant="secondary" onClick={() => setEditingBuilding(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveBuilding}
                icon={<Lucide.Save size={14} />}
              >
                Save Building
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
