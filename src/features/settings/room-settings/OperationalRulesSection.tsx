import { useState } from 'react';
import * as Lucide from 'lucide-react';
import { toast } from '../../../utils/toast';
import { Button, Checkbox, SelectField, TextField } from '../../../components/primitives';
import { Field } from '../../../components/controls';
import { Card, CardTitle } from '../../../components/ui';
import type { RoomOperationalConfig } from './types';
import { StatStrip, StatTile } from './RoomSettingsKit';

interface OperationalRulesSectionProps {
  config: RoomOperationalConfig;
  currencyCode: string;
  onChange: (cfg: RoomOperationalConfig) => void;
}

export function OperationalRulesSection({
  config,
  currencyCode,
  onChange,
}: OperationalRulesSectionProps) {
  const [form, setForm] = useState<RoomOperationalConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onChange(form);
      setIsSaving(false);
      toast('Operational rules successfully saved', {
        detail: 'Housekeeping durations, turnaround buffers, and check-in/out policies updated.',
        tone: 'success',
      });
    }, 250);
  };

  const handleReset = () => {
    setForm({ ...config });
    toast('Operational rules reset to saved values', { tone: 'info' });
  };

  return (
    <div className="flex flex-col gap-5">
      <StatStrip>
        <StatTile
          label="Check-In / Out"
          icon={Lucide.Clock}
          tone="info"
          value={<>{form.standardCheckInTime} / {form.standardCheckOutTime}</>}
          caption="Standard daily hotel timings"
        />

        <StatTile
          label="Turnaround Window"
          icon={Lucide.Timer}
          tone="success"
          value={<>{form.turnaroundBufferMinutes} Mins</>}
          caption="Buffer before next arrival"
        />

        <StatTile
          label="Cleaning Standard"
          icon={Lucide.Sparkles}
          tone="warning"
          value={<>{form.cleaningDurationStandard}m / {form.cleaningDurationSuite}m</>}
          caption="Standard vs suite turnover"
        />

        <StatTile
          label="Holding Timeout"
          icon={Lucide.Hourglass}
          tone="primary"
          valueTone="success"
          value={<>{form.holdReleaseTimeoutMinutes} Mins</>}
          caption="Auto-release unconfirmed rooms"
        />
      </StatStrip>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main 2 Cols: Form Settings */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Card 1: Timings & Check-In/Out */}
          <Card>
            <CardTitle
              title="Daily Check-In & Check-Out Timings"
              subtitle="Establish front desk operational hours, early arrival fees, and late departure grace periods"
              icon={Lucide.Clock}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Standard Check-In Time"
                hint="Default guest arrival time (24-hour format)"
              >
                <TextField
                  type="time"
                  value={form.standardCheckInTime}
                  onChange={(e) => setForm({ ...form, standardCheckInTime: e.target.value })}
                  className="tnum"
                />
              </Field>

              <Field
                label="Standard Check-Out Time"
                hint="Default guest departure deadline"
              >
                <TextField
                  type="time"
                  value={form.standardCheckOutTime}
                  onChange={(e) => setForm({ ...form, standardCheckOutTime: e.target.value })}
                  className="tnum"
                />
              </Field>

              <div className="sm:col-span-2 rounded-xl border border-border p-3.5 bg-muted-surface/40 flex flex-col gap-3">
                <Checkbox
                  checked={form.earlyCheckInAvailable}
                  onChange={(e) => setForm({ ...form, earlyCheckInAvailable: e.target.checked })}
                  label="Offer Guaranteed Early Check-In Option"
                />
                {form.earlyCheckInAvailable && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1 pt-1">
                    <Field label="Earliest Allowed Check-In Time">
                      <TextField
                        type="time"
                        value={form.earlyCheckInEarliestTime}
                        onChange={(e) => setForm({ ...form, earlyCheckInEarliestTime: e.target.value })}
                        className="tnum"
                      />
                    </Field>
                    <Field label={`Early Check-In Fee (${currencyCode})`}>
                      <TextField
                        type="number"
                        min={0}
                        value={form.earlyCheckInFee}
                        onChange={(e) => setForm({ ...form, earlyCheckInFee: Number(e.target.value) })}
                        className="tnum"
                      />
                    </Field>
                  </div>
                )}
              </div>

              <Field
                label="Late Check-Out Grace Period"
                hint="Free departure buffer before penalty kicks in"
              >
                <SelectField
                  value={String(form.lateCheckOutGraceMinutes)}
                  onChange={(e) => setForm({ ...form, lateCheckOutGraceMinutes: Number(e.target.value) })}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes (Standard)</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes (Generous)</option>
                </SelectField>
              </Field>

              <Field
                label={`Late Check-Out Hourly Surcharge (${currencyCode})`}
                hint="Charge per hour past the grace cutoff"
              >
                <TextField
                  type="number"
                  min={0}
                  value={form.lateCheckOutFee}
                  onChange={(e) => setForm({ ...form, lateCheckOutFee: Number(e.target.value) })}
                  className="tnum"
                />
              </Field>
            </div>
          </Card>

          {/* Card 2: Housekeeping & Turnaround Buffers */}
          <Card>
            <CardTitle
              title="Housekeeping Durations & Turnaround Buffers"
              subtitle="Allocated cleaning duration per room type and automated room allocation buffers"
              icon={Lucide.Sparkles}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                label="Standard Room Clean Duration"
                hint="Allocated time for standard rooms"
              >
                <SelectField
                  value={String(form.cleaningDurationStandard)}
                  onChange={(e) => setForm({ ...form, cleaningDurationStandard: Number(e.target.value) })}
                >
                  <option value="20">20 Minutes</option>
                  <option value="25">25 Minutes</option>
                  <option value="30">30 Minutes (Standard)</option>
                  <option value="40">40 Minutes</option>
                </SelectField>
              </Field>

              <Field
                label="Suite Turnover Clean Duration"
                hint="Multi-room suite deep turnover"
              >
                <SelectField
                  value={String(form.cleaningDurationSuite)}
                  onChange={(e) => setForm({ ...form, cleaningDurationSuite: Number(e.target.value) })}
                >
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes (Standard)</option>
                  <option value="75">75 Minutes</option>
                  <option value="90">90 Minutes</option>
                </SelectField>
              </Field>

              <Field
                label="Turnaround Buffer Time"
                hint="Safety buffer between checkout & checkin"
              >
                <SelectField
                  value={String(form.turnaroundBufferMinutes)}
                  onChange={(e) => setForm({ ...form, turnaroundBufferMinutes: Number(e.target.value) })}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </SelectField>
              </Field>

              <Field
                label="Auto-Release Hold Timeout"
                hint="Release uncommitted cart reservations"
              >
                <SelectField
                  value={String(form.holdReleaseTimeoutMinutes)}
                  onChange={(e) => setForm({ ...form, holdReleaseTimeoutMinutes: Number(e.target.value) })}
                >
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes (Standard)</option>
                  <option value="20">20 Minutes</option>
                  <option value="30">30 Minutes</option>
                </SelectField>
              </Field>

              <Field
                label="Default Keycards per Room"
                hint="Initial RFID cards programmed on checkin"
              >
                <SelectField
                  value={String(form.defaultKeycardsPerRoom)}
                  onChange={(e) => setForm({ ...form, defaultKeycardsPerRoom: Number(e.target.value) })}
                >
                  <option value="1">1 Keycard</option>
                  <option value="2">2 Keycards (Standard)</option>
                  <option value="3">3 Keycards</option>
                  <option value="4">4 Keycards</option>
                </SelectField>
              </Field>

              <Field
                label="DND Welfare Alert Threshold"
                hint="Consecutive DND hours before supervisor alert"
              >
                <SelectField
                  value={String(form.dndMaxHoursAlert)}
                  onChange={(e) => setForm({ ...form, dndMaxHoursAlert: Number(e.target.value) })}
                >
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours (Standard)</option>
                  <option value="36">36 Hours</option>
                  <option value="48">48 Hours</option>
                </SelectField>
              </Field>
            </div>

            <div className="mt-5 pt-4 border-t border-divider flex items-center justify-end gap-2.5">
              <Button variant="secondary" onClick={handleReset}>
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                icon={isSaving ? <Lucide.Loader2 size={14} className="animate-spin" /> : <Lucide.Save size={14} />}
              >
                {isSaving ? 'Saving…' : 'Save Operational Rules'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Col: Visual Timeline & Sequence Diagram */}
        <div className="flex flex-col gap-4">
          <Card elevated>
            <CardTitle
              title="Turnaround Timeline Flow"
              subtitle="Sequence executed between guest departure and next arrival"
              icon={Lucide.Route}
            />

            <div className="relative pl-6 flex flex-col gap-4 my-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-divider">
              <div className="relative">
                <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-bg text-danger-text border border-danger-border text-micro font-bold">
                  1
                </span>
                <p className="text-label font-bold text-ink">
                  Guest Check-Out ({form.standardCheckOutTime})
                </p>
                <p className="text-micro text-ink-secondary mt-0.5">
                  Room auto-transitions to <span className="font-semibold text-warning-text">Vacant Dirty</span>. Keycards revoked.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning-bg text-warning-text border border-warning-border text-micro font-bold">
                  2
                </span>
                <p className="text-label font-bold text-ink">
                  Housekeeping Turnover ({form.cleaningDurationStandard} mins)
                </p>
                <p className="text-micro text-ink-secondary mt-0.5">
                  Attendant completes linen strip, sanitization, restocking, and vacuuming.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-info-bg text-info-text border border-info-border text-micro font-bold">
                  3
                </span>
                <p className="text-label font-bold text-ink">
                  Turnaround Buffer ({form.turnaroundBufferMinutes} mins)
                </p>
                <p className="text-micro text-ink-secondary mt-0.5">
                  Housekeeping supervisor inspection and air freshening. Status becomes <span className="font-semibold text-success-text">Inspected</span>.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success-bg text-success-text border border-success-border text-micro font-bold">
                  4
                </span>
                <p className="text-label font-bold text-ink">
                  Arrival Check-In ({form.standardCheckInTime})
                </p>
                <p className="text-micro text-ink-secondary mt-0.5">
                  RFID keys issued ({form.defaultKeycardsPerRoom} cards). Room becomes <span className="font-semibold text-info-text">Occupied Clean</span>.
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl border border-border bg-muted-surface/50 text-label text-ink-secondary flex items-start gap-2">
              <Lucide.Info size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                Total scheduled turnover window is{' '}
                <span className="font-bold text-ink tnum">
                  {form.cleaningDurationStandard + form.turnaroundBufferMinutes} minutes
                </span>
                , comfortably fitting within the 3-hour window between 11:00 AM and 2:00 PM.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
