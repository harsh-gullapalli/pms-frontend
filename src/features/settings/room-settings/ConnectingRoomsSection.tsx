import { useState } from 'react';
import * as Lucide from 'lucide-react';
import { formatCurrency } from '../../../lib/api/format';
import { toast } from '../../../utils/toast';
import { Button, Checkbox, IconButton, SelectField, TextArea, TextField } from '../../../components/primitives';
import { Field } from '../../../components/controls';
import { Modal } from '../../../components/overlays';
import { Badge, Card, CardTitle, TableContainer } from '../../../components/ui';
import type { ConnectingRoomPair, ConnectionType, DoorLockType } from './types';
import { StatStrip, StatTile } from './RoomSettingsKit';

interface ConnectingRoomsSectionProps {
  pairs: ConnectingRoomPair[];
  currencyCode: string;
  onChange: (items: ConnectingRoomPair[]) => void;
}

const EMPTY_PAIR: ConnectingRoomPair = {
  id: '',
  primaryRoom: '103',
  secondaryRoom: '104',
  primaryType: 'Standard Room',
  secondaryType: 'Standard Room',
  connectionType: 'Interconnecting Door',
  doorLockType: 'Double Deadlock (Acoustic)',
  sellAsComboSuite: false,
  comboSuiteName: '',
  comboNightlyRate: 7000,
  currentStatus: 'Both Available',
  notes: '',
};

export function ConnectingRoomsSection({
  pairs,
  currencyCode,
  onChange,
}: ConnectingRoomsSectionProps) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ConnectingRoomPair | null>(null);

  const filtered = pairs.filter(
    (p) =>
      p.primaryRoom.includes(search) ||
      p.secondaryRoom.includes(search) ||
      p.primaryType.toLowerCase().includes(search.toLowerCase()) ||
      p.secondaryType.toLowerCase().includes(search.toLowerCase()) ||
      (p.comboSuiteName && p.comboSuiteName.toLowerCase().includes(search.toLowerCase())),
  );

  const totalPairs = pairs.length;
  const comboCount = pairs.filter((p) => p.sellAsComboSuite).length;
  const interconnectingCount = pairs.filter((p) => p.connectionType === 'Interconnecting Door').length;
  const availableCount = pairs.filter((p) => p.currentStatus === 'Both Available').length;

  const handleOpenAdd = () => {
    setEditing({
      ...EMPTY_PAIR,
      id: `conn-${Date.now().toString(36)}`,
    });
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.primaryRoom === editing.secondaryRoom) {
      return toast('Invalid pair', { detail: 'Primary and secondary rooms must be different.', tone: 'warning' });
    }
    if (!editing.primaryRoom || !editing.secondaryRoom) {
      return toast('Rooms required', { detail: 'Please specify both room numbers.', tone: 'warning' });
    }

    const exists = pairs.some((p) => p.id === editing.id);
    let updated: ConnectingRoomPair[];
    if (exists) {
      updated = pairs.map((p) => (p.id === editing.id ? editing : p));
      toast('Linked room pair updated', { detail: `Rooms ${editing.primaryRoom} & ${editing.secondaryRoom} updated.`, tone: 'success' });
    } else {
      updated = [...pairs, editing];
      toast('New connected pair linked', { detail: `Rooms ${editing.primaryRoom} & ${editing.secondaryRoom} connected.`, tone: 'success' });
    }
    onChange(updated);
    setEditing(null);
  };

  const handleDelete = (id: string, primary: string, secondary: string) => {
    const updated = pairs.filter((p) => p.id !== id);
    onChange(updated);
    toast('Rooms unlinked', { detail: `Relationship between ${primary} and ${secondary} removed.`, tone: 'info' });
  };

  return (
    <div className="flex flex-col gap-5">
      <StatStrip>
        <StatTile
          label="Linked Pairs"
          icon={Lucide.Link2}
          tone="info"
          value={totalPairs}
          caption="Physical room connections"
        />

        <StatTile
          label="Interconnecting"
          icon={Lucide.DoorOpen}
          tone="success"
          value={interconnectingCount}
          caption="Internal acoustic doors"
        />

        <StatTile
          label="Sellable as Combo"
          icon={Lucide.Boxes}
          tone="warning"
          value={comboCount}
          caption="Marketed as 2-bed suite"
        />

        <StatTile
          label="Both Available"
          icon={Lucide.Sparkles}
          tone="primary"
          valueTone="success"
          value={<>{availableCount} Pairs</>}
          caption="Ready for family booking"
        />
      </StatStrip>

      <Card>
        <CardTitle
          title="Connecting &amp; Linked Rooms Configuration"
          subtitle="Manage interconnecting acoustic doors, adjoining foyer pairs, dual-key suites, and lock relationships"
          icon={Lucide.Link2}
          action={
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              icon={<Lucide.Plus size={14} />}
            >
              Link Room Pair
            </Button>
          }
        />

        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Lucide.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by room numbers (e.g. 101, 204) or combo name..."
              className="pl-8"
            />
          </div>
          <p className="text-label text-ink-secondary self-center">
            Showing <span className="font-semibold text-ink">{filtered.length}</span> of {pairs.length} connected pairs
          </p>
        </div>

        <TableContainer>
          <table className="pms-table min-w-[760px] w-full text-left">
            <thead>
              <tr>
                <th>CONNECTED ROOMS</th>
                <th>CONNECTION ARCHITECTURE</th>
                <th>DOOR LOCK HARDWARE</th>
                <th>COMBO SUITE SALES</th>
                <th>LIVE ROOM STATUS</th>
                <th>NOTES</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pair) => (
                <tr key={pair.id} className="transition-colors hover:bg-hover-surface/60 border-b border-divider last:border-b-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-muted-surface font-black text-ink tnum text-label border border-border">
                        {pair.primaryRoom}
                      </span>
                      <Lucide.ArrowLeftRight size={14} className="text-primary shrink-0" />
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-muted-surface font-black text-ink tnum text-label border border-border">
                        {pair.secondaryRoom}
                      </span>
                    </div>
                    <span className="block text-micro text-ink-muted mt-1">
                      {pair.primaryType} + {pair.secondaryType}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 font-medium text-ink text-label">
                      <Lucide.DoorOpen size={14} className="text-ink-secondary shrink-0" />
                      <span>{pair.connectionType}</span>
                    </div>
                  </td>
                  <td className="text-label text-ink-secondary py-3">
                    <span className="font-mono text-micro px-2 py-0.5 rounded bg-muted-surface border border-border">
                      {pair.doorLockType}
                    </span>
                  </td>
                  <td className="py-3">
                    {pair.sellAsComboSuite ? (
                      <div>
                        <span className="block font-bold text-ink text-label">
                          {pair.comboSuiteName || '2-Bedroom Connected Suite'}
                        </span>
                        <span className="text-micro font-bold text-success-text tnum">
                          {formatCurrency(pair.comboNightlyRate ?? 0, currencyCode)}/night
                        </span>
                      </div>
                    ) : (
                      <span className="text-label text-ink-muted">Sold Independently</span>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge
                      tone={
                        pair.currentStatus === 'Both Available'
                          ? 'success'
                          : pair.currentStatus === 'One Occupied'
                            ? 'info'
                            : pair.currentStatus === 'Both Occupied'
                              ? 'neutral'
                              : 'danger'
                      }
                      dot
                      size="sm"
                    >
                      {pair.currentStatus}
                    </Badge>
                  </td>
                  <td className="text-label text-ink-secondary py-3 max-w-[200px]">
                    <span className="line-clamp-2">{pair.notes || '—'}</span>
                  </td>
                  <td className="text-right py-3">
                    <div className="inline-flex items-center gap-1.5">
                      <IconButton
                        title="Edit linked configuration"
                        onClick={() => setEditing(pair)}
                      >
                        <Lucide.Pencil size={14} />
                      </IconButton>
                      <IconButton
                        title={`Unlink ${pair.primaryRoom} and ${pair.secondaryRoom}`}
                        onClick={() => handleDelete(pair.id, pair.primaryRoom, pair.secondaryRoom)}
                        className="hover:text-danger-text"
                      >
                        <Lucide.Unlink size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-label text-ink-muted">
                    No connecting room relationships match &quot;{search}&quot;.
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
        title={editing?.id.startsWith('conn-') && !pairs.some((p) => p.id === editing?.id) ? 'Link Rooms Together' : `Edit Pair: ${editing?.primaryRoom} ↔ ${editing?.secondaryRoom}`}
        subtitle="Configure connecting door hardware, acoustic isolation, and combined suite sales"
        wide
      >
        {editing && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 py-2">
            <Field label="Primary Room Number">
              <TextField
                value={editing.primaryRoom}
                onChange={(e) => setEditing({ ...editing, primaryRoom: e.target.value })}
                placeholder="e.g. 201"
                className="tnum font-bold"
                autoFocus
              />
            </Field>

            <Field label="Secondary Room Number">
              <TextField
                value={editing.secondaryRoom}
                onChange={(e) => setEditing({ ...editing, secondaryRoom: e.target.value })}
                placeholder="e.g. 202"
                className="tnum font-bold"
              />
            </Field>

            <Field label="Connection Architecture">
              <SelectField
                value={editing.connectionType}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    connectionType: e.target.value as ConnectionType,
                  })
                }
              >
                <option value="Interconnecting Door">Interconnecting Door (Internal Communicating)</option>
                <option value="Adjoining Foyer">Adjoining Foyer (Side-by-side with shared vestibule)</option>
                <option value="Dual-Key Suite">Dual-Key Suite (Outer main door locks both units)</option>
                <option value="Side-by-Side">Side-by-Side (Close proximity for families)</option>
              </SelectField>
            </Field>

            <Field label="Door Lock Hardware Standard">
              <SelectField
                value={editing.doorLockType}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    doorLockType: e.target.value as DoorLockType,
                  })
                }
              >
                <option value="Double Deadlock (Acoustic)">Double Deadlock (Acoustic soundproof leaf)</option>
                <option value="Keycard RFID Linked">Keycard RFID Linked (Programmable access)</option>
                <option value="Master Key Interior">Master Key Interior (Manual key)</option>
                <option value="Magnetic Latch">Magnetic Latch (Child-safe barrier)</option>
              </SelectField>
            </Field>

            <div className="sm:col-span-2 rounded-xl border border-border p-3.5 bg-muted-surface/40 flex flex-col gap-3">
              <Checkbox
                checked={editing.sellAsComboSuite}
                onChange={(e) => setEditing({ ...editing, sellAsComboSuite: e.target.checked })}
                label="Sellable as Combined Multi-Bedroom Suite Package"
              />
              {editing.sellAsComboSuite && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1 pt-1">
                  <Field label="Combined Suite Display Title">
                    <TextField
                      value={editing.comboSuiteName || ''}
                      onChange={(e) => setEditing({ ...editing, comboSuiteName: e.target.value })}
                      placeholder="e.g. 2-Bedroom Family Connected Suite"
                    />
                  </Field>
                  <Field label={`Combined Nightly Rate (${currencyCode})`}>
                    <TextField
                      type="number"
                      min={0}
                      value={editing.comboNightlyRate ?? 0}
                      onChange={(e) => setEditing({ ...editing, comboNightlyRate: Number(e.target.value) })}
                      className="tnum"
                    />
                  </Field>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <Field label="Operational Notes">
                <TextArea
                  rows={2}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  placeholder="Special instructions for front desk or housekeeping (e.g. keycard unlocking upon family request)"
                />
              </Field>
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
                Save Linked Pair
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
