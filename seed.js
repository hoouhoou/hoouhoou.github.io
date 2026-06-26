// seed.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users = [
  { email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  { email: 'user1@example.com', password: 'User123!', role: 'user' },
  { email: 'user2@example.com', password: 'User123!', role: 'user' },
  { email: 'user3@example.com', password: 'User123!', role: 'user' },
  { email: 'user4@example.com', password: 'User123!', role: 'user' },
  { email: 'user5@example.com', password: 'User123!', role: 'user' },
  { email: 'user6@example.com', password: 'User123!', role: 'user' },
  { email: 'user7@example.com', password: 'User123!', role: 'user' },
  { email: 'user8@example.com', password: 'User123!', role: 'user' },
  { email: 'user9@example.com', password: 'User123!', role: 'user' },
];

async function seedUsers() {
  for (const user of users) {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers.users.find(u => u.email === user.email);

    if (existing) {
      console.log(`User ${user.email} already exists, skipping.`);
      continue;
    }

    // Create user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (createError) {
      console.error(`Error creating ${user.email}:`, createError.message);
      continue;
    }

    console.log(`Created user: ${user.email} (${newUser.user.id})`);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        role: user.role,
      });

    if (profileError) {
      console.error(`Error creating profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`Profile created for ${user.email} with role: ${user.role}`);
    }
  }
}

seedUsers();
