// seed.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env configuration initialization files.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const administratorsAndUsers = [
  { email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  { email: 'user1@example.com', password: 'User123!', role: 'user' },
  { email: 'user2@example.com', password: 'User123!', role: 'user' },
  { email: 'user3@example.com', password: 'User123!', role: 'user' },
];

async function executeDatabaseClusterSeeding() {
  console.log('🏁 Initializing context transaction tier provisioning...');
  
  for (const account of administratorsAndUsers) {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const match = listData?.users?.find(u => u.email === account.email);

    if (match) {
      console.log(`[-] Identity matching index [${account.email}] already present. Skipping transaction dynamic write.`);
      continue;
    }

    const { data: registeredUser, error: registrationError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
    });

    if (registrationError) {
      console.error(`[!] Failed verification mapping on [${account.email}]:`, registrationError.message);
      continue;
    }

    console.log(`[+] Identity committed: ${account.email} -> UID: ${registeredUser.user.id}`);

    const { error: profileWriteError } = await supabase
      .from('profiles')
      .insert({
        id: registeredUser.user.id,
        role: account.role
      });

    if (profileWriteError) {
      console.error(`[!] Error provisioning role permissions profile matching UID [${registeredUser.user.id}]:`, profileWriteError.message);
    } else {
      console.log(`[+] Authorization profiles verified matching access level definition: [${account.role}]`);
    }
  }
  console.log('🏁 Provisioning sequence successfully closed.');
}

executeDatabaseClusterSeeding();
