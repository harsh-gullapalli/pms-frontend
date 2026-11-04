export type RoomSettingsSectionId =
  | 'room-types'
  | 'categories'
  | 'floors-buildings'
  | 'occupancy'
  | 'maintenance-reasons'
  | 'status-config';

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


