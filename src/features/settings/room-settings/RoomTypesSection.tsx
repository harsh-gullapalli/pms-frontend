import { useMemo, useState } from 'react';
import * as Lucide from 'lucide-react';
import { formatCurrency } from '../../../lib/api/format';
import { inventoryApi } from '../../../lib/api/pms';
import { displayApiError } from '../../../lib/api/client';
import { toast } from '../../../utils/toast';
import { Button, IconButton, SelectField, TextArea, TextField } from '../../../components/primitives';
import { Field } from '../../../components/controls';
import { Modal } from '../../../components/overlays';
import { Badge, Card, CardTitle, TableContainer } from '../../../components/ui';
import type { RoomType } from '../../../types';

interface RoomTypesSectionProps {
  types: RoomType[];
  currencyCode: string;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const EMPTY_ROOM_TYPE: RoomType = {
  id: '',
  name: '',
  description: '',
  count: 0,
  maxOccupancy: 2,
  maxAdults: 2,
  maxChildren: 1,
  beds: '1 King Bed',
  baseRate: 4000,
  amenities: ['Free Wi-Fi', 'AC', 'Smart TV'],
  active: true,
};

export function RoomTypesSection({
  types,
  currencyCode,
  loading,
  error,
  onRefresh,
}: RoomTypesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [amenText, setAmenText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredTypes = useMemo(() => {
    return types.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.active) ||
        (statusFilter === 'inactive' && !t.active);
      return matchSearch && matchStatus;
    });
  }, [types, searchQuery, statusFilter]);

  const totalInventoryRooms = types.reduce((sum, t) => sum + (t.count ?? 0), 0);
  const activeCount = types.filter((t) => t.active).length;
  const lowestRate = types.length > 0 ? Math.min(...types.map((t) => t.baseRate)) : 0;
  const highestRate = types.length > 0 ? Math.max(...types.map((t) => t.baseRate)) : 0;

  const handleOpenAdd = () => {
    setEditing({
      ...EMPTY_ROOM_TYPE,
      id: `rt-new-${Date.now().toString(36)}`,
    });
    setAmenText(EMPTY_ROOM_TYPE.amenities.join(', '));
  };

  const handleOpenEdit = (t: RoomType) => {
    setEditing({ ...t, amenities: [...t.amenities] });
    setAmenText(t.amenities.join(', '));
  };

  const handleToggleStatus = async (t: RoomType) => {
    try {
      await inventoryApi.updateRoomType(t.id, {
        name: t.name,
        baseRate: t.baseRate,
        isActive: !t.active,
      });
      toast(`Room type marked as ${!t.active ? 'Active' : 'Inactive'}`, {
        tone: 'success',
      });
      onRefresh();
    } catch (err) {
      toast('Could not toggle status', { detail: displayApiError(err), tone: 'danger' });
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (editing.name.trim().length < 2) {
      return toast('Name required', { detail: 'Please specify a room type title.', tone: 'warning' });
    }
    if (editing.baseRate < 0) {
      return toast('Invalid rate', { detail: 'Base nightly rate cannot be negative.', tone: 'warning' });
    }

    const amenities = amenText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      if (editing.id.startsWith('rt-new')) {
        const code = editing.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 10);
        await inventoryApi.createRoomType({
          code: code || 'RT-NEW',
          name: editing.name.trim(),
          description: editing.description,
          maxAdults: Math.max(1, editing.maxAdults ?? 2),
          maxChildren: Math.max(0, editing.maxChildren ?? 0),
          baseRate: editing.baseRate,
          amenities,
        });
        toast('New room type created', { detail: `${editing.name} added to catalog.`, tone: 'success' });
      } else {
        await inventoryApi.updateRoomType(editing.id, {
          name: editing.name.trim(),
          description: editing.description,
          maxAdults: Math.max(1, editing.maxAdults ?? 2),
          maxChildren: Math.max(0, editing.maxChildren ?? 0),
          baseRate: editing.baseRate,
          isActive: editing.active,
          amenities,
        });
        toast('Room type updated', { detail: `${editing.name} specifications updated.`, tone: 'success' });
      }
      onRefresh();
      setEditing(null);
    } catch (err) {
      toast('Could not save room type', { detail: displayApiError(err), tone: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Room Types</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-info-bg text-info-text">
              <Lucide.Layers size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{types.length}</span>
            <p className="text-label text-ink-secondary mt-0.5">{activeCount} active in catalog</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Physical Units</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-bg text-success-text">
              <Lucide.BedDouble size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{totalInventoryRooms}</span>
            <p className="text-label text-ink-secondary mt-0.5">Assigned to inventory</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Starting Rate</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning-bg text-warning-text">
              <Lucide.Tag size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">
              {formatCurrency(lowestRate, currencyCode)}
            </span>
            <p className="text-label text-ink-secondary mt-0.5">Peak {formatCurrency(highestRate, currencyCode)}</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Configuration Health</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lucide.CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-success-text tnum">100%</span>
            <p className="text-label text-ink-secondary mt-0.5">Base rates & amenities mapped</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardTitle
          title="Room Types & Rate Plans"
          subtitle="Standard, Deluxe, Suite, Presidential Suite, and custom inventory tiers"
          icon={Lucide.BedDouble}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={onRefresh}
                icon={<Lucide.RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                onClick={handleOpenAdd}
                icon={<Lucide.Plus size={14} />}
              >
                Add Room Type
              </Button>
            </div>
          }
        />

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger-border bg-danger-bg p-3 text-label text-danger-text">
            <Lucide.AlertCircle size={16} />
            <span>Could not load room types: {error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Lucide.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room type name, description..."
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label text-ink-secondary whitespace-nowrap">Filter status:</span>
            <SelectField
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-36"
            >
              <option value="all">All ({types.length})</option>
              <option value="active">Active only ({activeCount})</option>
              <option value="inactive">Inactive ({types.length - activeCount})</option>
            </SelectField>
          </div>
        </div>

        <TableContainer>
          <table className="pms-table min-w-[760px] w-full text-left">
            <thead>
              <tr>
                <th className="w-10 text-center">#</th>
                <th>ROOM TYPE</th>
                <th className="text-center">ROOMS</th>
                <th>CAPACITY</th>
                <th className="text-right">BASE RATE / NIGHT</th>
                <th>AMENITIES</th>
                <th className="text-center">STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((t, idx) => (
                <tr key={t.id} className="transition-colors hover:bg-hover-surface/60 border-b border-divider last:border-b-0">
                  <td className="text-center font-medium text-ink-muted text-label py-3">{idx + 1}</td>
                  <td className="py-3">
                    <span className="block font-bold text-ink text-label">{t.name}</span>
                    <span className="block max-w-[280px] truncate text-label text-ink-muted mt-0.5">
                      {t.description || 'Standard room inventory type'}
                    </span>
                  </td>
                  <td className="text-center tnum font-semibold text-ink text-label py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted-surface text-ink font-bold">
                      {t.count}
                    </span>
                  </td>
                  <td className="tnum text-ink-secondary text-label py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-ink">
                        <Lucide.Users size={12} className="text-ink-secondary" />
                        <span>{t.maxAdults ?? t.maxOccupancy} Adults</span>
                      </span>
                      {(t.maxChildren ?? 0) > 0 && (
                        <span className="text-micro text-ink-muted">
                          +{t.maxChildren} Child{(t.maxChildren ?? 0) > 1 ? 'ren' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="tnum text-right font-black text-ink text-label py-3">
                    {formatCurrency(t.baseRate, currencyCode)}
                  </td>
                  <td className="max-w-[240px] py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.amenities.length > 0 ? (
                        t.amenities.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="text-micro font-medium bg-muted-surface text-ink-secondary px-1.5 py-0.5 rounded"
                          >
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-label text-ink-muted">—</span>
                      )}
                      {t.amenities.length > 3 && (
                        <span className="text-micro font-bold text-ink-muted bg-muted-surface px-1 py-0.5 rounded">
                          +{t.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3">
                    <Badge tone={t.active ? 'success' : 'neutral'} dot size="sm">
                      {t.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="text-right py-3">
                    <div className="inline-flex items-center gap-1.5">
                      <IconButton
                        title={t.active ? 'Deactivate room type' : 'Activate room type'}
                        onClick={() => handleToggleStatus(t)}
                        className={t.active ? 'hover:text-warning-text' : 'hover:text-success-text'}
                      >
                        {t.active ? <Lucide.PauseCircle size={15} /> : <Lucide.PlayCircle size={15} />}
                      </IconButton>
                      <IconButton
                        title={`Edit ${t.name}`}
                        onClick={() => handleOpenEdit(t)}
                      >
                        <Lucide.Pencil size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTypes.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-label text-ink-muted">
                    No room types match the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableContainer>
      </Card>

      {/* Edit / Add Modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id.startsWith('rt-new') ? 'Add New Room Type' : `Edit ${editing?.name}`}
        subtitle="Manage room category code, base rates, occupant boundaries, and luxury inclusions"
        wide
      >
        {editing && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 py-2">
            <Field label="Room Type Name">
              <TextField
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Presidential Panoramic Suite"
                autoFocus
              />
            </Field>

            <Field label={`Base Rate per Night (${currencyCode})`}>
              <TextField
                type="number"
                min={0}
                value={editing.baseRate}
                onChange={(e) => setEditing({ ...editing, baseRate: Number(e.target.value) })}
                className="tnum"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Description">
                <TextArea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Summary of room layout, square footage, furnishings, and view orientation"
                />
              </Field>
            </div>

            <Field label="Max Adults Allowed">
              <TextField
                type="number"
                min={1}
                max={10}
                value={editing.maxAdults ?? 2}
                onChange={(e) => setEditing({ ...editing, maxAdults: Number(e.target.value) })}
                className="tnum"
              />
            </Field>

            <Field label="Max Children Allowed">
              <TextField
                type="number"
                min={0}
                max={6}
                value={editing.maxChildren ?? 0}
                onChange={(e) => setEditing({ ...editing, maxChildren: Number(e.target.value) })}
                className="tnum"
              />
            </Field>

            <Field label="Catalog Active State">
              <SelectField
                value={editing.active ? 'active' : 'inactive'}
                onChange={(e) => setEditing({ ...editing, active: e.target.value === 'active' })}
              >
                <option value="active">Active (Available for booking & OTA mapping)</option>
                <option value="inactive">Inactive (Hidden from booking engine)</option>
              </SelectField>
            </Field>

            <Field label="Bed Setup Description">
              <TextField
                value={editing.beds || '1 King Bed'}
                onChange={(e) => setEditing({ ...editing, beds: e.target.value })}
                placeholder="e.g. 1 King Bed or 2 Twin Singles"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field
                label="Included Amenities (Comma-separated)"
                hint="Amenities displayed to guests during room allocation"
              >
                <TextField
                  value={amenText}
                  onChange={(e) => setAmenText(e.target.value)}
                  placeholder="High-Speed Wi-Fi, 55 Smart TV, Minibar, Balcony, Rain Shower"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2 pt-3 border-t border-divider">
              <Button
                variant="secondary"
                onClick={() => setEditing(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                icon={isSaving ? <Lucide.Loader2 size={14} className="animate-spin" /> : <Lucide.Save size={14} />}
              >
                {isSaving ? 'Saving…' : 'Save Room Type'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

