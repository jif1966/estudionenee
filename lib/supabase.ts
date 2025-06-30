import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rertxtrglbghadkkmvsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcnR4dHJnbGJnaGFka2ttdnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTUyMDMsImV4cCI6MjA2NjY5MTIwM30.G4_btnzz9FvZWF3C7KKlhioz-tmmkr7hii0aEXJ0dI4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
