export interface InsuranceDetail {
  id: string;
  name: string;
  phone_number: string;
  member_id: string;
  appointment_date?: string;
  last_appointment?: string;
  insurance_company?: string;
  dob?: string;
  subscriber?: string;
  plan?: string;
  eligibility_status?: string;
  annual_maximum?: string;
  deductible?: string;
  coverage?: string;
  coverage_status?: string;
  waiting_period?: string;
  frequency_limitations?: string;
  frequency_limitations_status?: string;
  downgrades_exclusions?: string;
  pre_authorization?: string;
  contact_inquiries?: string;
  called_status: 'not called' | 'call failed' | 'call succeeded';
  call_transcript?: string;
  call_summary?: string;
  call_duration?: string;
  call_recording?: string;
  created_at: string;
}

export interface TableFilters {
  page: number;
  pageSize: number;
  searchTerm: string;
}

export interface CSVRecord {
  name: string;
  phone_number: string;
  member_id: string;
  appointment_date?: string;
  last_appointment?: string;
  insurance_company?: string;
  dob?: string;
  subscriber?: string;
  plan?: string;
  eligibility_status?: string;
  annual_maximum?: string;
  deductible?: string;
  coverage?: string;
  coverage_status?: string;
  waiting_period?: string;
  frequency_limitations?: string;
  frequency_limitations_status?: string;
  downgrades_exclusions?: string;
  pre_authorization?: string;
  contact_inquiries?: string;
  called_status?: 'not called' | 'call failed' | 'call succeeded';
}

export interface InboundRecord {
  id: string;
  name?: string;
  appointment_number: string;
  appointment_date: string;
  previous_appointment_date?: string;
  type: string;
  dob: string;
  phone: string;
  address: string;
  insurance_policy: boolean;
  insurance_name?: string;
  member_id?: string;
  group_number?: string;
  call_status?: string;
  call_transfer_status?: string;
  transcript?: string;
  summary?: string;
  created_at: string;
} 