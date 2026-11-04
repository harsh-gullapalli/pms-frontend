import { useState } from 'react';
import * as Lucide from 'lucide-react';
import { toast } from '../../../utils/toast';
import { Button, IconButton, SelectField, TextArea, TextField } from '../../../components/primitives';
import { Field } from '../../../components/controls';
import { Modal } from '../../../components/overlays';
import { Badge, Card, CardTitle, TableContainer } from '../../../components/ui';
import type { RoomCategory } from './types';
import { StatStrip, StatTile } from './RoomSettingsKit';

interface CategoriesSectionProps {
  categories: RoomCategory[];
  onChange: (cats: RoomCategory[]) => void;
}

const EMPTY_CATEGORY: RoomCategory = {
  id: '',
  code: '',
  name: '',
  description: '',
  bedSetup: '1 King Bed (180x200 cm)',
  maxGuests: 2,
  accessibilityTier: 'Standard',
  active: true,
  roomCount: 0,
  badgeTone: 'info',
};

export function CategoriesSection({ categories, onChange }: CategoriesSectionProps) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<RoomCategory | null>(null);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.bedSetup.toLowerCase().includes(search.toLowerCase()) ||
      c.accessibilityTier.toLowerCase().includes(search.toLowerCase()),
  );

  const totalAssignedRooms = categories.reduce((s, c) => s + c.roomCount, 0);
  const accessibleCount = categories.filter((c) => c.accessibilityTier.includes('Accessible')).length;

  const handleToggle = (id: string) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    onChange(updated);
    toast('Category status updated', { tone: 'success' });
  };

  const handleOpenAdd = () => {
    setEditing({
      ...EMPTY_CATEGORY,
      id: `cat-${Date.now().toString(36)}`,
      code: `CAT-${categories.length + 1}`,
    });
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.name.trim().length < 2) {
      return toast('Name required', { detail: 'Please specify category classification name.', tone: 'warning' });
    }
    if (!editing.code.trim()) {
      return toast('Code required', { detail: 'Please provide a short classification code.', tone: 'warning' });
    }

    const exists = categories.some((c) => c.id === editing.id);
    let updated: RoomCategory[];
    if (exists) {
      updated = categories.map((c) => (c.id === editing.id ? editing : c));
      toast('Category updated', { detail: `${editing.name} updated successfully.`, tone: 'success' });
    } else {
      updated = [...categories, editing];
      toast('Category created', { detail: `${editing.name} added to classifications.`, tone: 'success' });
    }
    onChange(updated);
    setEditing(null);
  };

  const handleDelete = (id: string, name: string) => {
    const updated = categories.filter((c) => c.id !== id);
    onChange(updated);
    toast('Category removed', { detail: `${name} removed from classification list.`, tone: 'info' });
  };

  return (
    <div className="flex flex-col gap-5">
      <StatStrip>
        <StatTile
          label="Categories"
          icon={Lucide.Boxes}
          tone="info"
          value={categories.length}
          caption="Classification standards"
        />

        <StatTile
          label="Assigned Units"
          icon={Lucide.Bed}
          tone="success"
          value={totalAssignedRooms}
          caption="Mapped to physical rooms"
        />

        <StatTile
          label="ADA Accessible"
          icon={Lucide.Accessibility}
          tone="warning"
          value={accessibleCount}
          caption="Barrier-free layouts"
        />

        <StatTile
          label="Standard Tiers"
          icon={Lucide.ShieldCheck}
          tone="primary"
          valueTone="success"
          value="100%"
          caption="Compliant with hotel specs"
        />
      </StatStrip>

      <Card>
        <CardTitle
          title="Room Categories & Architectural Classifications"
          subtitle="Single, Double, Twin, King, Connecting, Accessible (ADA), and suite classifications"
          icon={Lucide.LayoutGrid}
          action={
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              icon={<Lucide.Plus size={14} />}
            >
              Add Classification
            </Button>
          }
        />

        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Lucide.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category, code, bed layout..."
              className="pl-8"
            />
          </div>
          <p className="text-label text-ink-secondary self-center">
            Showing <span className="font-semibold text-ink">{filtered.length}</span> of {categories.length} categories
          </p>
        </div>

        <TableContainer>
          <table className="pms-table min-w-[760px] w-full text-left">
            <thead>
              <tr>
                <th className="w-12 text-center">CODE</th>
                <th>CLASSIFICATION NAME</th>
                <th>BED CONFIGURATION</th>
                <th className="text-center">MAX GUESTS</th>
                <th>ACCESSIBILITY TIER</th>
                <th className="text-center">ROOMS</th>
                <th className="text-center">STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-hover-surface/60 border-b border-divider last:border-b-0">
                  <td className="text-center py-3">
                    <span className="font-mono text-micro font-black px-2 py-1 rounded bg-muted-surface text-ink border border-border">
                      {cat.code}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="block font-bold text-ink text-label">{cat.name}</span>
                    <span className="block max-w-[260px] truncate text-label text-ink-muted mt-0.5">
                      {cat.description}
                    </span>
                  </td>
                  <td className="text-label text-ink-secondary py-3">
                    <div className="flex items-center gap-1.5 font-medium text-ink">
                      <Lucide.BedDouble size={13} className="text-ink-muted" />
                      <span>{cat.bedSetup}</span>
                    </div>
                  </td>
                  <td className="text-center tnum text-label font-bold text-ink py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted-surface">
                      <Lucide.Users size={12} className="text-ink-secondary" />
                      {cat.maxGuests}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-micro font-semibold px-2 py-0.5 rounded-full ${
                        cat.accessibilityTier.includes('ADA')
                          ? 'bg-warning-bg text-warning-text border border-warning-border'
                          : 'bg-muted-surface text-ink-secondary'
                      }`}
                    >
                      {cat.accessibilityTier.includes('ADA') && <Lucide.Accessibility size={11} />}
                      {cat.accessibilityTier}
                    </span>
                  </td>
                  <td className="text-center tnum text-label font-bold text-ink py-3">
                    {cat.roomCount}
                  </td>
                  <td className="text-center py-3">
                    <Badge tone={cat.active ? 'success' : 'neutral'} dot size="sm">
                      {cat.active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="text-right py-3">
                    <div className="inline-flex items-center gap-1.5">
                      <IconButton
                        title={cat.active ? 'Disable category' : 'Enable category'}
                        onClick={() => handleToggle(cat.id)}
                        className={cat.active ? 'hover:text-warning-text' : 'hover:text-success-text'}
                      >
                        {cat.active ? <Lucide.PauseCircle size={15} /> : <Lucide.PlayCircle size={15} />}
                      </IconButton>
                      <IconButton
                        title={`Edit ${cat.name}`}
                        onClick={() => setEditing(cat)}
                      >
                        <Lucide.Pencil size={14} />
                      </IconButton>
                      <IconButton
                        title={`Delete ${cat.name}`}
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="hover:text-danger-text"
                      >
                        <Lucide.Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-label text-ink-muted">
                    No categories found matching &quot;{search}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableContainer>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id.startsWith('cat-') && !categories.some((c) => c.id === editing?.id) ? 'Add Room Category' : `Edit ${editing?.name}`}
        subtitle="Configure physical room classification, standard bedding dimensions, and accessibility level"
        wide
      >
        {editing && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 py-2">
            <Field label="Classification Name">
              <TextField
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Accessible King Suite"
                autoFocus
              />
            </Field>

            <Field label="Category Code">
              <TextField
                value={editing.code}
                onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                placeholder="e.g. ADA-KNG"
                className="font-mono"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Architectural Description">
                <TextArea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Details on floor space, entrance door width, bathroom layout, and special fixtures"
                />
              </Field>
            </div>

            <Field label="Standard Bed Setup">
              <TextField
                value={editing.bedSetup}
                onChange={(e) => setEditing({ ...editing, bedSetup: e.target.value })}
                placeholder="e.g. 1 King Bed (180x200 cm) or 2 Twins"
              />
            </Field>

            <Field label="Max Guest Capacity">
              <TextField
                type="number"
                min={1}
                max={10}
                value={editing.maxGuests}
                onChange={(e) => setEditing({ ...editing, maxGuests: Number(e.target.value) })}
                className="tnum"
              />
            </Field>

            <Field label="Accessibility Tier">
              <SelectField
                value={editing.accessibilityTier}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    accessibilityTier: e.target.value as RoomCategory['accessibilityTier'],
                  })
                }
              >
                <option value="Standard">Standard (Step-free corridor)</option>
                <option value="Enhanced">Enhanced (Wider bathroom & grab bars)</option>
                <option value="Fully Accessible (ADA)">Fully Accessible (ADA compliant with roll-in shower)</option>
              </SelectField>
            </Field>

            <Field label="Active Status">
              <SelectField
                value={editing.active ? 'active' : 'inactive'}
                onChange={(e) => setEditing({ ...editing, active: e.target.value === 'active' })}
              >
                <option value="active">Active (Permitted for room allocation)</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </Field>

            <div className="flex justify-end gap-2 sm:col-span-2 pt-3 border-t border-divider">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                icon={<Lucide.Save size={14} />}
              >
                Save Category
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
