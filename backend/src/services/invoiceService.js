import PDFDocument from 'pdfkit';

export const generateOrderInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(stream);

  // Header
  doc
    .fillColor('#131921')
    .fontSize(22)
    .text('OMNIMARKET INVOICE', 50, 50, { bold: true })
    .fontSize(10)
    .fillColor('#555555')
    .text('Multi-Vendor E-Commerce Platform', 50, 78)
    .text('support@omnimarket.io | www.omnimarket.io', 50, 92);

  doc
    .fillColor('#232f3e')
    .fontSize(12)
    .text(`Invoice #: ${order.invoiceNumber || order.orderNumber}`, 350, 50, { align: 'right' })
    .fontSize(10)
    .fillColor('#555555')
    .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 68, { align: 'right' })
    .text(`Payment: ${order.payment?.method?.toUpperCase()} (${order.payment?.status?.toUpperCase()})`, 350, 84, { align: 'right' })
    .text(`Status: ${order.overallStatus?.toUpperCase()}`, 350, 100, { align: 'right' });

  doc.moveTo(50, 125).lineTo(545, 125).strokeColor('#e2e8f0').stroke();

  // Billed To & Shipped To
  const shipping = order.shippingAddress || {};
  doc
    .fontSize(11)
    .fillColor('#131921')
    .text('Billed & Shipped To:', 50, 140, { bold: true })
    .fontSize(10)
    .fillColor('#334155')
    .text(shipping.fullName || order.customer?.name || 'Customer', 50, 158)
    .text(shipping.addressLine1 || shipping.street || 'Address on file', 50, 172)
    .text(`${shipping.city || ''}, ${shipping.state || ''} ${shipping.postalCode || ''}`.trim() || 'N/A', 50, 186)
    .text(`Phone: ${shipping.phone || order.customer?.phone || 'N/A'}`, 50, 200);

  // Table Header
  const tableTop = 235;
  doc
    .rect(50, tableTop - 5, 495, 24)
    .fillColor('#f8fafc')
    .fill();

  doc
    .fontSize(9)
    .fillColor('#475569')
    .text('ITEM & VENDOR', 60, tableTop, { bold: true })
    .text('QTY', 310, tableTop, { width: 40, align: 'center', bold: true })
    .text('UNIT PRICE', 360, tableTop, { width: 80, align: 'right', bold: true })
    .text('TOTAL', 450, tableTop, { width: 85, align: 'right', bold: true });

  let yPosition = tableTop + 26;

  // Items
  order.items.forEach((item) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    
    doc
      .fontSize(9)
      .fillColor('#0f172a')
      .text(item.name, 60, yPosition, { width: 240 })
      .fontSize(8)
      .fillColor('#64748b')
      .text(`Sold by: ${item.vendorName || 'Independent Vendor'} | Status: ${item.status}`, 60, yPosition + 12);

    doc
      .fontSize(9)
      .fillColor('#0f172a')
      .text(item.quantity.toString(), 310, yPosition, { width: 40, align: 'center' })
      .text(`Rs. ${item.price.toFixed(2)}`, 360, yPosition, { width: 80, align: 'right' })
      .text(`Rs. ${itemTotal}`, 450, yPosition, { width: 85, align: 'right' });

    yPosition += 32;
  });

  doc.moveTo(50, yPosition + 5).lineTo(545, yPosition + 5).strokeColor('#e2e8f0').stroke();
  yPosition += 15;

  // Summary Totals
  const summaryLeft = 340;
  const summaryRight = 450;
  const summaryWidth = 85;

  doc
    .fontSize(9)
    .fillColor('#475569')
    .text('Subtotal:', summaryLeft, yPosition)
    .text(`Rs. ${order.subtotal.toFixed(2)}`, summaryRight, yPosition, { width: summaryWidth, align: 'right' });

  if (order.discount > 0) {
    yPosition += 16;
    doc
      .text(`Discount (${order.couponApplied?.code || 'Coupon'}):`, summaryLeft, yPosition)
      .fillColor('#16a34a')
      .text(`-Rs. ${order.discount.toFixed(2)}`, summaryRight, yPosition, { width: summaryWidth, align: 'right' })
      .fillColor('#475569');
  }

  yPosition += 16;
  doc
    .text('Tax (8%):', summaryLeft, yPosition)
    .text(`Rs. ${order.tax.toFixed(2)}`, summaryRight, yPosition, { width: summaryWidth, align: 'right' });

  yPosition += 16;
  doc
    .text('Shipping:', summaryLeft, yPosition)
    .text(order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee.toFixed(2)}`, summaryRight, yPosition, { width: summaryWidth, align: 'right' });

  yPosition += 20;
  doc
    .rect(summaryLeft - 10, yPosition - 4, 215, 24)
    .fillColor('#f1f5f9')
    .fill();

  doc
    .fontSize(11)
    .fillColor('#0f172a')
    .text('Total Paid:', summaryLeft, yPosition + 2, { bold: true })
    .text(`Rs. ${order.totalAmount.toFixed(2)}`, summaryRight, yPosition + 2, { width: summaryWidth, align: 'right', bold: true });

  // Footer Note
  doc
    .fontSize(8)
    .fillColor('#94a3b8')
    .text('Thank you for shopping on OmniMarket! This is a computer-generated tax invoice.', 50, 750, { align: 'center' });

  doc.end();
};

