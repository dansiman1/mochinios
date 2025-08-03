import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkriobcachrsocrbdgxy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcmlvYmNhY2hyc29jcmJkZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTAzMTgsImV4cCI6MjA2ODgyNjMxOH0.ULjzJ0db_B57ZF8NCcT0Oc5ULxfSZ7OSHZt9rFYfM0E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);