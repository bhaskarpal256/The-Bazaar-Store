export default {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
    },
    {
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'totalPrice',
      title: 'Total Price',
      type: 'number',
    },
    {
      name: 'stripeSessionId',
      title: 'Stripe Session ID',
      type: 'string',
    },
    {
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Paid', value: 'Paid' },
          { title: 'Pending', value: 'Pending' },
          { title: 'Failed', value: 'Failed' },
        ],
      },
    },
    {
      name: 'cartItems',
      title: 'Cart Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'cartItem',
          title: 'Cart Item',
          fields: [
            { name: 'name', type: 'string', title: 'Product Name' },
            { name: 'price', type: 'number', title: 'Price' },
            { name: 'quantity', type: 'number', title: 'Quantity' },
          ],
        },
      ],
    },
  ],
};
