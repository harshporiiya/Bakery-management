const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate 80mm Thermal Receipt / Small Bakery Bill Slip PDF
 */
const generateInvoicePDF = async (order, res, type = 'final') => {
  // Calculate dynamic height based on number of items
  const itemRowsCount = order.items ? order.items.length : 1;
  const slipHeight = Math.max(450, 260 + (itemRowsCount * 30) + 120);
  const slipWidth = 226.77; // 80mm in PostScript points (80 / 25.4 * 72)

  const doc = new PDFDocument({
    margin: 12,
    size: [slipWidth, slipHeight]
  });

  // Stream directly to HTTP response
  if (res) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=BakerySlip_${order.orderNumber}.pdf`);
    doc.pipe(res);
  }

  // Generate QR code data URL for UPI / Payment verification
  const qrData = `upi://pay?pa=sweetdelight@upi&pn=SweetDelightBakery&am=${order.grandTotal}&tn=Order_${order.orderNumber}`;
  let qrCodeImage = null;
  try {
    qrCodeImage = await QRCode.toDataURL(qrData, { margin: 1, width: 70 });
  } catch (err) {
    console.error('QR code generation warning:', err);
  }

  const isKOT = type === 'kot';

  // Bakery Header
  doc
    .fillColor('#3D2314')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('SWEET DELIGHT BAKERY', 12, 12, { width: slipWidth - 24, align: 'center' })
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#555555')
    .text('Gourmet Bakery & Cake Shop', 12, 26, { width: slipWidth - 24, align: 'center' })
    .text('Ph: +91 98765 43210 | GSTIN: 24AAACD1234F', 12, 35, { width: slipWidth - 24, align: 'center' });

  doc.moveTo(10, 47).lineTo(slipWidth - 10, 47).dash(3, { space: 2 }).strokeColor('#888888').lineWidth(0.5).stroke();

  // Slip Title
  let currentY = 52;
  doc
    .undash()
    .fillColor('#3D2314')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(isKOT ? '*** KITCHEN BAKING SLIP ***' : '*** BAKERY RECEIPT SLIP ***', 12, currentY, { width: slipWidth - 24, align: 'center' });

  currentY += 16;

  // Order Details
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#222222')
    .text(`ORDER #: ${order.orderNumber}`, 12, currentY)
    .font('Helvetica')
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 12, currentY + 11)
    .text(`Time: ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, 12, currentY + 22)
    .text(`Customer: ${order.customerName}`, 12, currentY + 33)
    .text(`Phone: ${order.customerPhone || 'N/A'}`, 12, currentY + 44);

  currentY += 58;

  doc.moveTo(10, currentY).dash(3, { space: 2 }).strokeColor('#888888').stroke();
  currentY += 6;

  // Item Table Headers
  doc
    .undash()
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('Item Description', 12, currentY)
    .text('Qty', 140, currentY, { width: 25, align: 'center' })
    .text('Amt(₹)', 165, currentY, { width: 50, align: 'right' });

  currentY += 12;
  doc.moveTo(10, currentY).dash(2, { space: 2 }).strokeColor('#CCCCCC').stroke();
  currentY += 6;

  // Render Items List
  order.items.forEach(item => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    doc
      .undash()
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .fillColor('#222222')
      .text(`${item.name}`, 12, currentY, { width: 125 })
      .font('Helvetica')
      .text(`(${item.weight || '500g'})`, 12, currentY + 9)
      .text(`${item.quantity}`, 140, currentY, { width: 25, align: 'center' })
      .text(`${itemTotal}`, 165, currentY, { width: 50, align: 'right' });

    currentY += 20;
  });

  doc.moveTo(10, currentY).dash(3, { space: 2 }).strokeColor('#888888').stroke();
  currentY += 6;

  if (!isKOT) {
    // Totals Breakdown
    doc
      .undash()
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('#444444')
      .text('Subtotal:', 100, currentY, { width: 60, align: 'right' })
      .text(`₹${order.subtotal.toFixed(2)}`, 165, currentY, { width: 50, align: 'right' });
    currentY += 12;

    doc
      .text('GST (5%):', 100, currentY, { width: 60, align: 'right' })
      .text(`₹${order.gst.toFixed(2)}`, 165, currentY, { width: 50, align: 'right' });
    currentY += 12;

    if (order.discount > 0) {
      doc
        .text('Discount:', 100, currentY, { width: 60, align: 'right' })
        .text(`-₹${order.discount.toFixed(2)}`, 165, currentY, { width: 50, align: 'right' });
      currentY += 12;
    }

    doc
      .text('Delivery Fee:', 100, currentY, { width: 60, align: 'right' })
      .text(`₹${order.deliveryCharge.toFixed(2)}`, 165, currentY, { width: 50, align: 'right' });
    currentY += 14;

    doc.moveTo(90, currentY).lineTo(slipWidth - 10, currentY).strokeColor('#000000').lineWidth(0.5).stroke();
    currentY += 4;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('GRAND TOTAL:', 80, currentY, { width: 80, align: 'right' })
      .text(`₹${order.grandTotal.toFixed(2)}`, 165, currentY, { width: 50, align: 'right' });

    currentY += 16;

    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('#333333')
      .text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 12, currentY, { width: slipWidth - 24, align: 'center' });

    currentY += 14;

    // QR Code for payment verification
    if (qrCodeImage) {
      const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      doc.image(qrBuffer, (slipWidth - 50) / 2, currentY, { width: 50, height: 50 });
      currentY += 54;
    }
  }

  // Footer Message
  doc
    .fontSize(7)
    .font('Helvetica-Oblique')
    .fillColor('#666666')
    .text('Thank you for ordering with Sweet Delight!', 12, currentY, { width: slipWidth - 24, align: 'center' })
    .text('Freshly Baked Gourmet Treats', 12, currentY + 9, { width: slipWidth - 24, align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF };
