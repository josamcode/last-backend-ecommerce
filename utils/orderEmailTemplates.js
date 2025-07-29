// utils/orderEmailTemplates.js

const getOrderConfirmationHTML = (user, savedOrder, finalCoupon, discountValue) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Order Confirmation</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 700px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #1e3a8a;
        color: white;
        text-align: center;
        padding: 30px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 30px;
      }
      .section-title {
        font-size: 18px;
        margin-bottom: 10px;
        color: #1e3a8a;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      th {
        background-color: #f1f5f9;
        font-weight: 600;
      }
      .totals {
        text-align: right;
        margin-top: 20px;
      }
      .footer {
        background-color: #f1f5f9;
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase, ${user.username}!</p>
      </div>

      <div class="content">
        <h3 class="section-title">Order Summary</h3>
        <p><strong>Order ID:</strong> ${savedOrder._id}</p>
        <p><strong>Date:</strong> ${new Date(savedOrder.createdAt).toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${savedOrder.paymentMethod}</p>
        <p><strong>Shipping Address:</strong> ${savedOrder.shippingAddress?.street}, ${savedOrder.shippingAddress?.city}, ${savedOrder.shippingAddress?.country}</p>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${savedOrder.items.map(item => `
              <tr>
                <td>${item.name} ${item.color ? `(${item.color})` : ''} ${item.size ? `[${item.size}]` : ''}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)} EGP</td>
                <td>${(item.price * item.quantity).toFixed(2)} EGP</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          ${finalCoupon ? `<p><strong>Discount (${finalCoupon}):</strong> -${discountValue.toFixed(2)} EGP</p>` : ''}
          <h3><strong>Total: ${savedOrder.total.toFixed(2)} EGP</strong></h3>
        </div>
      </div>

      <div class="footer">
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>&copy; ${new Date().getFullYear()} JOSAM. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

const getNewOrderNotificationHTML = (user, savedOrder, finalCoupon, discountValue) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>New Order Notification</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 700px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #0d9488;
        color: white;
        text-align: center;
        padding: 30px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 30px;
      }
      .section-title {
        font-size: 18px;
        margin-bottom: 10px;
        color: #0d9488;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      th {
        background-color: #f1f5f9;
        font-weight: 600;
      }
      .totals {
        text-align: right;
        margin-top: 20px;
      }
      .footer {
        background-color: #f1f5f9;
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Order Received</h1>
        <p>A new order has just been placed!</p>
      </div>

      <div class="content">
        <h3 class="section-title">Customer Information</h3>
        <p><strong>Customer Name:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>

        <h3 class="section-title">Order Details</h3>
        <p><strong>Order ID:</strong> ${savedOrder._id}</p>
        <p><strong>Date:</strong> ${new Date(savedOrder.createdAt).toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${savedOrder.paymentMethod}</p>
        <p><strong>Shipping Address:</strong> ${savedOrder.shippingAddress?.street}, ${savedOrder.shippingAddress?.city}, ${savedOrder.shippingAddress?.country}</p>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${savedOrder.items.map(item => `
              <tr>
                <td>${item.name} ${item.color ? `(${item.color})` : ''} ${item.size ? `[${item.size}]` : ''}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)} EGP</td>
                <td>${(item.price * item.quantity).toFixed(2)} EGP</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          ${finalCoupon ? `<p><strong>Discount (${finalCoupon}):</strong> -${discountValue.toFixed(2)} EGP</p>` : ''}
          <h3><strong>Total: ${savedOrder.total.toFixed(2)} EGP</strong></h3>
        </div>
      </div>

      <div class="footer">
        <p>Please process this order as soon as possible.</p>
        <p>&copy; ${new Date().getFullYear()} JOSAM. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

const getOrderStatusUpdateHTML = (user, order, previousState, state) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Order Status Update</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #4f46e5;
        color: white;
        text-align: center;
        padding: 30px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 30px;
      }
      .section-title {
        font-size: 18px;
        margin-bottom: 10px;
        color: #4f46e5;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      .status-box {
        background-color: #dbeafe;
        border-left: 5px solid #3b82f6;
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
      }
      .footer {
        background-color: #f1f5f9;
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Order Status Updated</h1>
        <p>Hello ${user.username}, your order status has changed.</p>
      </div>

      <div class="content">
        <h3 class="section-title">Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Previous Status:</strong> ${previousState ? previousState.charAt(0).toUpperCase() + previousState.slice(1) : 'N/A'}</p>

        <div class="status-box">
          <h3 style="margin: 0; color: #3b82f6;">New Status: ${state.charAt(0).toUpperCase() + state.slice(1)}</h3>
        </div>

        <p>We’ll keep you updated on any further changes. If you need assistance, feel free to contact us.</p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} JOSAM. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

module.exports = {
  getOrderConfirmationHTML,
  getNewOrderNotificationHTML,
  getOrderStatusUpdateHTML
};