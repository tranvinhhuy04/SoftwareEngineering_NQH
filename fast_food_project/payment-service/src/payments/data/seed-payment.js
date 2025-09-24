// ----------------------
// Database payment-service
// ----------------------
const cartDB = db.getSiblingDB('purely_cart_service'); // hoặc database payment-service

const payments = [
  { userId: 'user1', amount: 100, status: 'pending' },
  { userId: 'user2', amount: 250, status: 'success' },
  { userId: 'user3', amount: 50, status: 'failed' }
];

payments.forEach(payment => {
  const exists = cartDB.Payments.findOne({
    userId: payment.userId,
    amount: payment.amount
  });
  if (!exists) {
    cartDB.Payments.insertOne(payment);
    print(`Inserted payment for user: ${payment.userId}`);
  } else {
    cartDB.Payments.updateOne(
      { userId: payment.userId, amount: payment.amount },
      { $set: payment }
    );
    print(`Updated payment for user: ${payment.userId}`);
  }
});
