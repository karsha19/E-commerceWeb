const PDFDocument = require('pdfkit');

// Streams a PDF invoice directly to an HTTP response.
// `order` = row from `orders` table, `items` = array of order_items joined with product name.
function generateInvoicePDF(order, items, res) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-order-${order.id}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('INVOICE', { align: 'right' });
  doc.fontSize(10).fillColor('#555').text(`Order #${order.id}`, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(2);

  // Shipping details
  doc.fillColor('#000').fontSize(12).text('Ship To:', { underline: true });
  doc.fontSize(10)
    .text(order.shipping_name)
    .text(order.shipping_phone)
    .text(order.shipping_address)
    .text(`${order.shipping_city}, ${order.shipping_state || ''} ${order.shipping_pincode}`);
  doc.moveDown();

  doc.fontSize(10).text(`Payment Method: Cash on Delivery`);
  doc.text(`Order Status: ${order.status}`);
  doc.moveDown(1.5);

  // Table header
  const tableTop = doc.y;
  doc.font('Helvetica-Bold');
  doc.text('Item', 50, tableTop);
  doc.text('Qty', 300, tableTop, { width: 60, align: 'right' });
  doc.text('Price', 370, tableTop, { width: 80, align: 'right' });
  doc.text('Subtotal', 460, tableTop, { width: 90, align: 'right' });
  doc.font('Helvetica');
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 22;
  items.forEach(item => {
    const lineTotal = (item.price * item.quantity).toFixed(2);
    doc.text(item.name, 50, y, { width: 240 });
    doc.text(String(item.quantity), 300, y, { width: 60, align: 'right' });
    doc.text(`₹${Number(item.price).toFixed(2)}`, 370, y, { width: 80, align: 'right' });
    doc.text(`₹${lineTotal}`, 460, y, { width: 90, align: 'right' });
    y += 20;
  });

  doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
  doc.font('Helvetica-Bold').text(`Total: ₹${Number(order.total).toFixed(2)}`, 370, y + 15, { width: 180, align: 'right' });

  doc.moveDown(4);
  doc.font('Helvetica').fontSize(9).fillColor('#888')
    .text('Thank you for shopping with us!', { align: 'center' });

  doc.end();
}

module.exports = generateInvoicePDF;
