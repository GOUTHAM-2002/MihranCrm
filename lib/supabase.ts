import { createClient } from '@supabase/supabase-js';
import { InsuranceDetail, CSVRecord } from './types';

// Define a type for inbound records to avoid using 'any'
type InboundRecordInput = {
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
};

const supabaseUrl = 'https://xfrghllgtjsghdgcbikd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcmdobGxndGpzZ2hkZ2NiaWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5ODgyMDAsImV4cCI6MjA1ODU2NDIwMH0.ESGUo8FyqiYzW9dFrntOIlcGhrvtkovxqcgFG39IZyI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Insurance details API
export const insuranceDetailsApi = {
  getAll: async (page = 1, pageSize = 10, searchTerm = '') => {
    let query = supabase
      .from('insurance_details')
      .select('*', { count: 'exact' });
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,member_id.ilike.%${searchTerm}%,insurance_company.ilike.%${searchTerm}%`);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    if (error) throw error;
    
    return { data, count };
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('insurance_details')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  },
  
  create: async (insuranceDetail: Omit<InsuranceDetail, 'id' | 'created_at'>) => {
    // Ensure we have name, phone_number, member_id, and called_status as required
    const calledStatus = 'not called' as const;
    const { name, phone_number, member_id, called_status = calledStatus, ...rest } = insuranceDetail;
    
    if (!name || !phone_number || !member_id) {
      throw new Error('Name, phone number, and member ID are required');
    }
    
    const sanitizedData: Omit<InsuranceDetail, 'id' | 'created_at'> = {
      name,
      phone_number,
      member_id,
      called_status,
      ...rest
    };
    
    const { data, error } = await supabase
      .from('insurance_details')
      .insert(sanitizedData)
      .select();
    
    if (error) throw error;
    
    return data;
  },
  
  update: async (id: string, insuranceDetail: Partial<InsuranceDetail>) => {
    // Ensure we have name, phone_number, and member_id as required
    const { name, phone_number, member_id, ...rest } = insuranceDetail;
    
    if ((name !== undefined && !name) || 
        (phone_number !== undefined && !phone_number) || 
        (member_id !== undefined && !member_id)) {
      throw new Error('Name, phone number, and member ID cannot be empty');
    }
    
    const sanitizedData: Partial<InsuranceDetail> = {
      ...(name !== undefined ? { name } : {}),
      ...(phone_number !== undefined ? { phone_number } : {}),
      ...(member_id !== undefined ? { member_id } : {}),
      ...rest
    };
    
    const { data, error } = await supabase
      .from('insurance_details')
      .update(sanitizedData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('insurance_details')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  },
  
  deleteAll: async () => {
    const { error } = await supabase
      .from('insurance_details')
      .delete()
      .neq('id', ''); // This is a workaround to delete all records
    
    if (error) throw error;
    
    return true;
  },
  
  bulkInsert: async (insuranceDetails: CSVRecord[]) => {
    // Validate that each record has name, phone_number, and member_id
    const validRecords = insuranceDetails.filter(record => 
      record.name && record.phone_number && record.member_id
    );
    
    if (validRecords.length === 0) {
      throw new Error('No valid records to insert. Each record must have a name, phone number, and member ID.');
    }
    
    const { data, error } = await supabase
      .from('insurance_details')
      .insert(validRecords)
      .select();
    
    if (error) throw error;
    
    return data;
  }
};

// Inbound API
export const inboundApi = {
  getAll: async (page = 1, pageSize = 10, searchTerm = '') => {
    let query = supabase
      .from('inbound')
      .select('*', { count: 'exact' });
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,appointment_number.ilike.%${searchTerm}%,dob.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,insurance_name.ilike.%${searchTerm}%,member_id.ilike.%${searchTerm}%`);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    if (error) throw error;
    
    return { data, count };
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('inbound')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  },
  
  create: async (inboundRecord: Omit<InboundRecordInput, 'id' | 'created_at'>) => {
    const { appointment_number, appointment_date, type, dob, phone, address, insurance_policy, ...rest } = inboundRecord;
    
    if (!appointment_number || !appointment_date || !type || !dob || !phone || !address || insurance_policy === undefined) {
      throw new Error('Required fields missing');
    }
    
    const sanitizedData = {
      appointment_number,
      appointment_date,
      type,
      dob,
      phone,
      address,
      insurance_policy,
      ...rest
    };
    
    const { data, error } = await supabase
      .from('inbound')
      .insert(sanitizedData)
      .select();
    
    if (error) throw error;
    
    return data;
  },
  
  update: async (id: string, inboundRecord: Partial<InboundRecordInput>) => {
    const { data, error } = await supabase
      .from('inbound')
      .update(inboundRecord)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('inbound')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  },
  
  deleteAll: async () => {
    const { error } = await supabase
      .from('inbound')
      .delete()
      .neq('id', '');
    
    if (error) throw error;
    
    return true;
  }
}; 