const userDB = db.getSiblingDB('purely_auth_service');

const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
];

users.forEach(user => {
  const exists = userDB.users.findOne({ email: user.email });
  if (!exists) {
    userDB.users.insertOne(user);
    print(`Inserted user: ${user.email}`);
  } else {
    userDB.users.updateOne({ email: user.email }, { $set: user });
    print(`Updated user: ${user.email}`);
  }
});