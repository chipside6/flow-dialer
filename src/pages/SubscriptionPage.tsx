import React from 'react';

const SubscriptionPage = () => {
  // Mock subscription data
  const subscription = {
    plan_name: 'Premium',
    renewal_date: '2024-12-31',
    features: ['Advanced analytics', 'Priority support'],
  };

  return (
    <div>
      <h1>Subscription Details</h1>
      <p>Plan: {subscription.plan_name}</p>
      <p>Renewal Date: {subscription.renewal_date}</p>
      <h2>Features:</h2>
      <ul>
        {subscription.features?.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
};

export default SubscriptionPage;
