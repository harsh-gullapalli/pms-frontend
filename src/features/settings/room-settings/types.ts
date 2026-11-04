export type RoomSettingsSectionId =
  | 'room-types'
  | 'categories'
  | 'floors-buildings'
  | 'occupancy'
  | 'amenities'
  | 'attributes'
  | 'operations'
  | 'maintenance-reasons'
  | 'status-config'
  | 'connecting-rooms';

export interface RoomCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  bedSetup: string;
  maxGuests: number;
  accessibilityTier: 'Standard' | 'Enhanced' | 'Fully Accessible (ADA)';
  active: boolean;
  roomCount: number;
  badgeTone: 'info' | 'success' | 'warning' | 'neutral';
}

export interface Building {
  id: string;
  code: string;
  name: string;
  description: string;
  totalFloors: number;
  totalRooms: number;
  active: boolean;
}

export interface FloorLevel {
  id: string;
  buildingId: string;
  buildingName: string;
  floorNumber: number;
  floorName: string;
  wing: string;
  totalRooms: number;
  assignedTypes: string[];
  keycardZone: string;
  status: 'Operational' | 'Renovation' | 'Closed';
}

export interface OccupancyConfig {
  baseOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  maxTotalOccupancy: number;
  allowExtraBeds: boolean;
  maxExtraBeds: number;
  extraBedRate: number;
  allowCribs: boolean;
  maxCribs: number;
  cribComplimentary: boolean;
  childFreeAgeLimit: number;
  extraAdultSurcharge: number;
}

export type AmenityCategory =
  | 'connectivity'
  | 'comfort'
  | 'bathroom'
  | 'dining'
  | 'work'
  | 'outdoor';

export interface RoomAmenityItem {
  id: string;
  name: string;
  category: AmenityCategory;
  description: string;
  iconName: string;
  isStandard: boolean;
  isChargeable: boolean;
  chargeAmount?: number;
  active: boolean;
}

export type AttributeType = 'smoking' | 'view' | 'bed' | 'accessibility';

export interface RoomAttributeItem {
  id: string;
  type: AttributeType;
  name: string;
  code: string;
  description: string;
  active: boolean;
  isDefault?: boolean;
}

export interface RoomOperationalConfig {
  standardCheckInTime: string;
  standardCheckOutTime: string;
  earlyCheckInAvailable: boolean;
  earlyCheckInEarliestTime: string;
  earlyCheckInFee: number;
  lateCheckOutGraceMinutes: number;
  lateCheckOutFee: number;
  cleaningDurationStandard: number;
  cleaningDurationSuite: number;
  cleaningDurationTurnover: number;
  turnaroundBufferMinutes: number;
  holdReleaseTimeoutMinutes: number;
  defaultKeycardsPerRoom: number;
  maxKeycardsPerRoom: number;
  dndMaxHoursAlert: number;
  deepCleaningIntervalDays: number;
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type MaintenanceImpact = 'Out of Order' | 'Out of Service' | 'Inspection Required';

export interface MaintenanceReasonItem {
  id: string;
  code: string;
  name: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Renovation' | 'Housekeeping' | 'General' | 'Security';
  priority: MaintenancePriority;
  impact: MaintenanceImpact;
  avgResolutionHours: number;
  activeRoomsCount: number;
  requiresSupervisorSignoff: boolean;
  active: boolean;
}

export interface RoomStatusDefinition {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  isSellable: boolean;
  requiresHousekeeping: boolean;
  requiresInspection: boolean;
  autoMarkDirtyOnCheckout: boolean;
  active: boolean;
}

export type ConnectionType = 'Interconnecting Door' | 'Adjoining Foyer' | 'Dual-Key Suite' | 'Side-by-Side';
export type DoorLockType = 'Double Deadlock (Acoustic)' | 'Keycard RFID Linked' | 'Master Key Interior' | 'Magnetic Latch';

export interface ConnectingRoomPair {
  id: string;
  primaryRoom: string;
  secondaryRoom: string;
  primaryType: string;
  secondaryType: string;
  connectionType: ConnectionType;
  doorLockType: DoorLockType;
  sellAsComboSuite: boolean;
  comboSuiteName?: string;
  comboNightlyRate?: number;
  currentStatus: 'Both Available' | 'One Occupied' | 'Both Occupied' | 'Locked / Unlinked';
  notes: string;
}

