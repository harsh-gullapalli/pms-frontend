import { useMemo, useState } from 'react';
import * as Lucide from 'lucide-react';
import { toast } from '../../../utils/toast';
import { Button, Checkbox, IconButton, SelectField, TextArea, TextField } from '../../../components/primitives';
import { Field } from '../../../components/controls';
import { Modal } from '../../../components/overlays';
import { Badge, Card, CardTitle, TableContainer } from '../../../components/ui';
import type { AttributeType, RoomAttributeItem } from './types';

interface AttributesSectionProps {
  attributes: RoomAttributeItem[];
  onChange: (items: RoomAttributeItem[]) => void;
}

const TYPE_CONFIG: Record<
  AttributeType,
  { label: string; icon: Lucide.LucideIcon; description: string; tone: 'info' | 'success' | 'warning' | 'neutral' }
> = {
  smoking: {
    label: 'Smoking Policies',
    icon: Lucide.Cigarette,
    description: 'Smoke-free compliance & designated outdoor smoking designations',
    tone: 'warning',
  },
  view: {
    label: 'Room Views',
    icon: Lucide.Eye,
    description: 'Window vistas, orientation, and landscape exposure options',
    tone: 'info',
  },
  bed: {
    label: 'Bed Configurations',
    icon: Lucide.BedDouble,
    description: 'Mattress sizing, bed layouts, and sleeping arrangement standards',
    tone: 'success',
  },
  accessibility: {
    label: 'Accessibility (ADA)',
    icon: Lucide.Accessibility,
    description: 'Wheelchair access, roll-in showers, grab rails, and visual emergency strobes',
    tone: 'info',
  },
};

const EMPTY_ATTRIBUTE: RoomAttributeItem = {
  id: '',
  type: 'view',
  name: '',
  code: '',
  description: '',
  active: true,
  isDefault: false,
};

export function AttributesSection({ attributes, onChange }: AttributesSectionProps) {
  const [selectedType, setSelectedType] = useState<AttributeType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<RoomAttributeItem | null>(null);

  const filtered = useMemo(() => {
    return attributes.filter((item) => {
      const matchType = selectedType === 'all' || item.type === selectedType;
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [attributes, selectedType, search]);

  const viewCount = attributes.filter((a) => a.type === 'view').length;
  const bedCount = attributes.filter((a) => a.type === 'bed').length;
  const adaCount = attributes.filter((a) => a.type === 'accessibility').length;
  const smokingCount = attributes.filter((a) => a.type === 'smoking').length;

  const handleToggle = (id: string) => {
    const updated = attributes.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    onChange(updated);
    toast('Attribute status updated', { tone: 'success' });
  };

  const handleOpenAdd = () => {
    const defaultType = selectedType === 'all' ? 'view' : selectedType;
    setEditing({
      ...EMPTY_ATTRIBUTE,
      id: `attr-${Date.now().toString(36)}`,
      type: defaultType,
      code: `ATTR-${attributes.length + 1}`,
    });
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.name.trim().length < 2) {
      return toast('Name required', { detail: 'Please specify attribute label.', tone: 'warning' });
    }
    if (!editing.code.trim()) {
      return toast('Code required', { detail: 'Please specify attribute identifier code.', tone: 'warning' });
    }

    const exists = attributes.some((a) => a.id === editing.id);
    let updated: RoomAttributeItem[];
    if (exists) {
      updated = attributes.map((a) => (a.id === editing.id ? editing : a));
      toast('Attribute saved', { detail: `${editing.name} specifications updated.`, tone: 'success' });
    } else {
      updated = [...attributes, editing];
      toast('Attribute created', { detail: `${editing.name} added to specifications.`, tone: 'success' });
    }
    onChange(updated);
    setEditing(null);
  };

  const handleDelete = (id: string, name: string) => {
    const updated = attributes.filter((a) => a.id !== id);
    onChange(updated);
    toast('Attribute removed', { detail: `${name} deleted.`, tone: 'info' });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">View Vistas</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-info-bg text-info-text">
              <Lucide.Eye size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{viewCount}</span>
            <p className="text-label text-ink-secondary mt-0.5">Sea, City, Garden, Pool</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Bed Setups</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-bg text-success-text">
              <Lucide.BedDouble size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{bedCount}</span>
            <p className="text-label text-ink-secondary mt-0.5">King, Queen, Twin Singles</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">ADA Accessibility</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lucide.Accessibility size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{adaCount}</span>
            <p className="text-label text-ink-secondary mt-0.5">Barrier-free features</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Smoking Tiers</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning-bg text-warning-text">
              <Lucide.Cigarette size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{smokingCount}</span>
            <p className="text-label text-ink-secondary mt-0.5">Policies configured</p>
          </div>
        </div>
      </div>

      <Card>
        <CardTitle
          title="Room Attributes & Guest Preference Factors"
          subtitle="Smoking policies, view orientation, bed dimensions, and barrier-free ADA accessibility attributes"
          icon={Lucide.Sliders}
          action={
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              icon={<Lucide.Plus size={14} />}
            >
              Add Attribute
            </Button>
          }
        />

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Lucide.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search attribute name, code, description..."
                className="pl-8"
              />
            </div>
            <p className="text-label text-ink-secondary self-center">
              Showing <span className="font-semibold text-ink">{filtered.length}</span> of {attributes.length} attributes
            </p>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-divider">
            <Button
              variant="text"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-label font-semibold transition-all ${
                selectedType === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink hover:bg-muted-surface'
              }`}
            >
              All Types ({attributes.length})
            </Button>
            {(Object.keys(TYPE_CONFIG) as AttributeType[]).map((type) => {
              const { label, icon: Icon } = TYPE_CONFIG[type];
              const count = attributes.filter((a) => a.type === type).length;
              const isSelected = selectedType === type;
              return (
                <Button
                  key={type}
                  variant="text"
                  onClick={() => setSelectedType(type)}
                  icon={<Icon size={13} />}
                  className={`px-3 py-1.5 rounded-lg text-label font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-ink-secondary hover:text-ink hover:bg-muted-surface'
                  }`}
                >
                  {label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        <TableContainer>
          <table className="pms-table min-w-[760px] w-full text-left">
            <thead>
              <tr>
                <th className="w-12 text-center">CODE</th>
                <th>ATTRIBUTE NAME</th>
                <th>CLASSIFICATION</th>
                <th>DESCRIPTION</th>
                <th className="text-center">DEFAULT</th>
                <th className="text-center">STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((attr) => {
                const conf = TYPE_CONFIG[attr.type];
                const Icon = conf?.icon || Lucide.Tag;
                return (
                  <tr key={attr.id} className="transition-colors hover:bg-hover-surface/60 border-b border-divider last:border-b-0">
                    <td className="text-center py-3">
                      <span className="font-mono text-micro font-black px-2 py-1 rounded bg-muted-surface text-ink border border-border">
                        {attr.code}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-ink-secondary shrink-0" />
                        <span className="font-bold text-ink text-label">{attr.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge tone={conf?.tone ?? 'neutral'} size="sm">
                        {conf?.label || attr.type}
                      </Badge>
                    </td>
                    <td className="text-label text-ink-secondary py-3 max-w-[280px]">
                      <span className="line-clamp-2">{attr.description}</span>
                    </td>
                    <td className="text-center py-3">
                      {attr.isDefault ? (
                        <span className="text-micro font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Standard
                        </span>
                      ) : (
                        <span className="text-label text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="text-center py-3">
                      <Badge tone={attr.active ? 'success' : 'neutral'} dot size="sm">
                        {attr.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="text-right py-3">
                      <div className="inline-flex items-center gap-1.5">
                        <IconButton
                          title={attr.active ? 'Disable attribute' : 'Enable attribute'}
                          onClick={() => handleToggle(attr.id)}
                          className={attr.active ? 'hover:text-warning-text' : 'hover:text-success-text'}
                        >
                          {attr.active ? <Lucide.PauseCircle size={15} /> : <Lucide.PlayCircle size={15} />}
                        </IconButton>
                        <IconButton
                          title={`Edit ${attr.name}`}
                          onClick={() => setEditing(attr)}
                        >
                          <Lucide.Pencil size={14} />
                        </IconButton>
                        <IconButton
                          title={`Delete ${attr.name}`}
                          onClick={() => handleDelete(attr.id, attr.name)}
                          className="hover:text-danger-text"
                        >
                          <Lucide.Trash2 size={14} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-label text-ink-muted">
                    No attributes found matching &quot;{search}&quot;.
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
        title={editing?.id.startsWith('attr-') && !attributes.some((a) => a.id === editing?.id) ? 'Add Room Attribute' : `Edit ${editing?.name}`}
        subtitle="Configure physical room specifications, bedding layout, and guest criteria tags"
        wide
      >
        {editing && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 py-2">
            <Field label="Attribute Name">
              <TextField
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Panoramic Ocean Sunset View"
                autoFocus
              />
            </Field>

            <Field label="Attribute Code">
              <TextField
                value={editing.code}
                onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                placeholder="e.g. VW-SUNSET"
                className="font-mono"
              />
            </Field>

            <Field label="Attribute Category">
              <SelectField
                value={editing.type}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    type: e.target.value as AttributeType,
                  })
                }
              >
                <option value="smoking">Smoking Policy</option>
                <option value="view">Room View</option>
                <option value="bed">Bed Configuration</option>
                <option value="accessibility">Accessibility (ADA)</option>
              </SelectField>
            </Field>

            <Field label="Active Status">
              <SelectField
                value={editing.active ? 'active' : 'inactive'}
                onChange={(e) => setEditing({ ...editing, active: e.target.value === 'active' })}
              >
                <option value="active">Active (Available for guest selection)</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Description">
                <TextArea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Detailed criteria, equipment, or orientation details"
                />
              </Field>
            </div>

            <div className="sm:col-span-2 pt-1">
              <Checkbox
                checked={editing.isDefault}
                onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })}
                label="Set as default attribute for standard room types"
              />
            </div>

            <div className="flex justify-end gap-2 sm:col-span-2 pt-3 border-t border-divider">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                icon={<Lucide.Save size={14} />}
              >
                Save Attribute
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
