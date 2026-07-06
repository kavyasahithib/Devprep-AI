const mongoose = require('c:/Users/sailo/Desktop/Projects/devprep-ai/backend/node_modules/mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/devprepAI');
    const res = await mongoose.connection.db.collection('users').updateOne(
      { email: 'sailokeshnalabothu@gmail.com' },
      { $set: { role: 'admin' } }
    );
    console.log('Update result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Failed to promote user to admin:', err);
    process.exit(1);
  }
}

run();
