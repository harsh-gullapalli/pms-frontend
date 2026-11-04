import { useMemo, useState } from 'react';
import * as Lucide from 'lucide-react';
import { formatCurrency } from '../../../lib/api/format';
import { toast } from '../../../utils/toast';
import { Button, Checkbox, IconButton, SelectField, TextArea, TextField } from '../../../components/primitives';
import { Field } from '../../../components/controls';
import { Modal } from '../../../components/overlays';
import { Badge, Card, CardTitle } from '../../../components/ui';
import type { AmenityCategory, RoomAmenityItem } from './types';

interface AmenitiesSectionProps {
  amenities: RoomAmenityItem[];
  currencyCode: string;
  onChange: (items: RoomAmenityItem[]) => void;
}

const CATEGORY_LABELS: Record<AmenityCategory, { label: string; icon: Lucide.LucideIcon }> = {
  connectivity: { label: 'Connectivity & Media', icon: Lucide.Wifi },
  comfort: { label: 'Comfort & Climate', icon: Lucide.Wind },
  bathroom: { label: 'Bathroom & Wellness', icon: Lucide.Bath },
  dining: { label: 'Dining & Minibar', icon: Lucide.Coffee },
  work: { label: 'Work & Security', icon: Lucide.Briefcase },
  outdoor: { label: 'Outdoor & Balcony', icon: Lucide.Sun },
};

function renderAmenityIcon(iconName: string, size = 18) {
  switch (iconName.toLowerCase()) {
    case 'wifi':
      return <Lucide.Wifi size={size} />;
    case 'tv':
      return <Lucide.Tv size={size} />;
    case 'airvent':
      return <Lucide.AirVent size={size} />;
    case 'wine':
      return <Lucide.Wine size={size} />;
    case 'sunmedium':
      return <Lucide.SunMedium size={size} />;
    case 'bath':
      return <Lucide.Bath size={size} />;
    case 'droplet':
      return <Lucide.Droplet size={size} />;
    case 'coffee':
      return <Lucide.Coffee size={size} />;
    case 'shieldcheck':
      return <Lucide.ShieldCheck size={size} />;
    case 'laptop':
      return <Lucide.Laptop size={size} />;
    case 'sparkles':
      return <Lucide.Sparkles size={size} />;
    case 'shirt':
      return <Lucide.Shirt size={size} />;
    default:
      return <Lucide.CheckCircle2 size={size} />;
  }
}

const EMPTY_AMENITY: RoomAmenityItem = {
  id: '',
  name: '',
  category: 'comfort',
  description: '',
  iconName: 'Sparkles',
  isStandard: true,
  isChargeable: false,
  chargeAmount: 0,
  active: true,
};

export function AmenitiesSection({
  amenities,
  currencyCode,
  onChange,
}: AmenitiesSectionProps) {
  const [selectedCat, setSelectedCat] = useState<AmenityCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<RoomAmenityItem | null>(null);

  const filtered = useMemo(() => {
    return amenities.filter((item) => {
      const matchCat = selectedCat === 'all' || item.category === selectedCat;
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [amenities, selectedCat, search]);

  const activeCount = amenities.filter((a) => a.active).length;
  const standardCount = amenities.filter((a) => a.isStandard).length;
  const chargeableCount = amenities.filter((a) => a.isChargeable).length;

  const handleToggle = (id: string) => {
    const updated = amenities.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    onChange(updated);
    toast('Amenity availability toggled', { tone: 'success' });
  };

  const handleOpenAdd = () => {
    setEditing({
      ...EMPTY_AMENITY,
      id: `amen-${Date.now().toString(36)}`,
    });
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.name.trim().length < 2) {
      return toast('Name required', { detail: 'Please specify the amenity name.', tone: 'warning' });
    }

    const exists = amenities.some((a) => a.id === editing.id);
    let updated: RoomAmenityItem[];
    if (exists) {
      updated = amenities.map((a) => (a.id === editing.id ? editing : a));
      toast('Amenity updated', { detail: `${editing.name} specifications saved.`, tone: 'success' });
    } else {
      updated = [...amenities, editing];
      toast('New amenity created', { detail: `${editing.name} added to catalog.`, tone: 'success' });
    }
    onChange(updated);
    setEditing(null);
  };

  const handleDelete = (id: string, name: string) => {
    const updated = amenities.filter((a) => a.id !== id);
    onChange(updated);
    toast('Amenity removed', { detail: `${name} deleted from catalog.`, tone: 'info' });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Total Catalog</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-info-bg text-info-text">
              <Lucide.Sparkles size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{amenities.length}</span>
            <p className="text-label text-ink-secondary mt-0.5">{activeCount} enabled in rooms</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Standard Inclusions</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-bg text-success-text">
              <Lucide.CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{standardCount}</span>
            <p className="text-label text-ink-secondary mt-0.5">Complimentary for all guests</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Premium / Chargeable</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning-bg text-warning-text">
              <Lucide.Coins size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-ink tnum">{chargeableCount}</span>
            <p className="text-label text-ink-secondary mt-0.5">Minibar & on-demand items</p>
          </div>
        </div>

        <div className="pms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label font-semibold text-ink-secondary">Categories</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lucide.Layers size={16} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-disp3 font-black text-success-text tnum">6 Groups</span>
            <p className="text-label text-ink-secondary mt-0.5">Fully classified</p>
          </div>
        </div>
      </div>

      <Card>
        <CardTitle
          title="Room Amenities & In-Room Comfort Features"
          subtitle="Wi-Fi, 55&quot; TV, Climate AC, Minibar, Balcony, Soaking Bathtub, and luxury inclusions"
          icon={Lucide.Sparkles}
          action={
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              icon={<Lucide.Plus size={14} />}
            >
              Add Amenity
            </Button>
          }
        />

        {/* Filter Bar with Category Tabs and Search */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Lucide.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search amenities by name, specs..."
                className="pl-8"
              />
            </div>
            <p className="text-label text-ink-secondary self-center">
              Showing <span className="font-semibold text-ink">{filtered.length}</span> of {amenities.length} amenities
            </p>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-divider">
            <Button
              variant="text"
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-lg text-label font-semibold transition-all ${
                selectedCat === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink hover:bg-muted-surface'
              }`}
            >
              All Categories ({amenities.length})
            </Button>
            {(Object.keys(CATEGORY_LABELS) as AmenityCategory[]).map((cat) => {
              const { label, icon: Icon } = CATEGORY_LABELS[cat];
              const count = amenities.filter((a) => a.category === cat).length;
              const isSelected = selectedCat === cat;
              return (
                <Button
                  key={cat}
                  variant="text"
                  onClick={() => setSelectedCat(cat)}
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

        {/* Amenities Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`pms-card p-4 flex flex-col justify-between border transition-all ${
                item.active ? 'hover:border-primary/40' : 'opacity-60 bg-muted-surface/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      {renderAmenityIcon(item.iconName, 17)}
                    </div>
                    <div>
                      <h4 className="text-label font-bold text-ink leading-tight">{item.name}</h4>
                      <span className="text-micro text-ink-muted">
                        {CATEGORY_LABELS[item.category]?.label || item.category}
                      </span>
                    </div>
                  </div>
                  <IconButton
                    title={item.active ? 'Disable amenity' : 'Enable amenity'}
                    onClick={() => handleToggle(item.id)}
                    className={item.active ? 'text-success-text hover:text-warning-text' : 'text-ink-disabled'}
                  >
                    {item.active ? <Lucide.CheckCircle2 size={16} /> : <Lucide.Circle size={16} />}
                  </IconButton>
                </div>

                <p className="text-label text-ink-secondary mt-2.5 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge tone={item.isStandard ? 'success' : 'warning'} size="sm">
                    {item.isStandard ? 'Standard' : 'Premium'}
                  </Badge>
                  {item.isChargeable && (
                    <span className="text-micro font-bold text-ink tnum bg-muted-surface px-1.5 py-0.5 rounded">
                      +{formatCurrency(item.chargeAmount ?? 0, currencyCode)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <IconButton
                    title={`Edit ${item.name}`}
                    onClick={() => setEditing(item)}
                  >
                    <Lucide.Pencil size={13} />
                  </IconButton>
                  <IconButton
                    title={`Delete ${item.name}`}
                    onClick={() => handleDelete(item.id, item.name)}
                    className="hover:text-danger-text"
                  >
                    <Lucide.Trash2 size={13} />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-10 text-center text-label text-ink-muted">
              No amenities found matching &quot;{search}&quot;.
            </div>
          )}
        </div>
      </Card>

      {/* Edit / Add Modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id.startsWith('amen-') && !amenities.some((a) => a.id === editing?.id) ? 'Add Room Amenity' : `Edit ${editing?.name}`}
        subtitle="Configure in-room feature, classification category, icon symbol, and guest billing policy"
        wide
      >
        {editing && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 py-2">
            <Field label="Amenity Name">
              <TextField
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Nespresso Coffee Pod Machine"
                autoFocus
              />
            </Field>

            <Field label="Amenity Category">
              <SelectField
                value={editing.category}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category: e.target.value as AmenityCategory,
                  })
                }
              >
                {(Object.keys(CATEGORY_LABELS) as AmenityCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k].label}
                  </option>
                ))}
              </SelectField>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Detailed Description">
                <TextArea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Brand, model, or instructions provided to guests"
                />
              </Field>
            </div>

            <Field label="Icon Indicator">
              <SelectField
                value={editing.iconName}
                onChange={(e) => setEditing({ ...editing, iconName: e.target.value })}
              >
                <option value="Wifi">Wi-Fi / Internet</option>
                <option value="Tv">Smart TV / Screen</option>
                <option value="AirVent">AC / Air Filtration</option>
                <option value="Wine">Minibar / Wine</option>
                <option value="Coffee">Coffee / Tea</option>
                <option value="Bath">Bathtub / Jacuzzi</option>
                <option value="Droplet">Rain Shower</option>
                <option value="SunMedium">Balcony / Patio</option>
                <option value="Laptop">Work Desk / Safe</option>
                <option value="Shirt">Iron / Linens</option>
                <option value="Sparkles">Luxury Special</option>
              </SelectField>
            </Field>

            <Field label="Standard Inclusion Status">
              <SelectField
                value={editing.isStandard ? 'yes' : 'no'}
                onChange={(e) => setEditing({ ...editing, isStandard: e.target.value === 'yes' })}
              >
                <option value="yes">Standard (Complimentary In-Room)</option>
                <option value="no">Optional / Premium Add-on</option>
              </SelectField>
            </Field>

            <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted-surface/40">
              <Checkbox
                checked={editing.isChargeable}
                onChange={(e) => setEditing({ ...editing, isChargeable: e.target.checked })}
                label="Chargeable Consumption / On-Demand Fee"
              />
              {editing.isChargeable && (
                <div className="flex items-center gap-2">
                  <span className="text-label text-ink-secondary">Fee ({currencyCode}):</span>
                  <TextField
                    type="number"
                    min={0}
                    value={editing.chargeAmount ?? 0}
                    onChange={(e) => setEditing({ ...editing, chargeAmount: Number(e.target.value) })}
                    className="w-28 tnum"
                  />
                </div>
              )}
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
                Save Amenity
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
