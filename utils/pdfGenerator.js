const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ======================================================
// COLORS
// ======================================================

const BLACK = "#111111";
const WHITE = "#ffffff";
const ORANGE = "#f9a008";
const GRAY = "#667085";
const BORDER = "#d9dde5";

// ======================================================
// HELPERS
// ======================================================

function firstValue(...values) {
  return (
    values.find(
      (value) =>
        value !== undefined && value !== null && String(value).trim() !== "",
    ) || ""
  );
}

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB");
}

function writeText(
  doc,
  value,
  x,
  y,
  size = 9,
  bold = false,
  color = BLACK,
  options = {},
) {
  doc
    .fillColor(color)
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(size)
    .text(String(value ?? ""), x, y, options);
}

function drawLine(doc, x1, y1, x2, y2, color = BLACK, width = 1) {
  doc
    .strokeColor(color)
    .lineWidth(width)
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .stroke();
}

// ======================================================
// SELLER DATA
// ======================================================

function getSeller(invoice) {
  const seller = invoice?.seller || {};

  return {
    ...seller,

    businessName: firstValue(
      seller.businessName,
      seller.name,
      seller.companyName,
      seller.legalName,
    ),

    legalName: firstValue(seller.legalName, seller.businessName, seller.name),

    gstNumber: firstValue(
      seller.gstNumber,
      seller.gst,
      seller.gstin,
      seller.gstNo,
    ),

    panNumber: firstValue(seller.panNumber, seller.pan, seller.panNo),

    email: firstValue(seller.email, seller.businessEmail),

    phone: firstValue(seller.phone, seller.mobile, seller.phoneNumber),

    address: firstValue(seller.address, seller.businessAddress),

    city: seller.city || "",

    state: seller.state || "",

    country: seller.country || "",

    zipCode: firstValue(
      seller.zipCode,
      seller.pincode,
      seller.pinCode,
      seller.postalCode,
    ),

    bankDetails: {
      ...(seller.bankDetails || {}),

      bankName: firstValue(
        seller.bankDetails?.bankName,
        seller.bankDetails?.bank,
        seller.bankName,
        seller.bank,
      ),

      accountName: firstValue(
        seller.bankDetails?.accountName,
        seller.bankDetails?.accountHolderName,
        seller.bankDetails?.accountHolder,
        seller.accountName,
        seller.accountHolderName,
        seller.accountHolder,
      ),

      accountNumber: firstValue(
        seller.bankDetails?.accountNumber,
        seller.bankDetails?.accountNo,
        seller.bankDetails?.acNo,
        seller.accountNumber,
        seller.accountNo,
        seller.acNo,
      ),

      ifsc: firstValue(
        seller.bankDetails?.ifsc,
        seller.bankDetails?.ifscCode,
        seller.bankDetails?.IFSC,
        seller.ifsc,
        seller.ifscCode,
        seller.IFSC,
      ),

      branchName: firstValue(seller.bankDetails?.branchName, seller.branchName),
    },
  };
}

// ======================================================
// CLIENT DATA
// ======================================================

function getClient(invoice) {
  const client = invoice?.client || {};

  return {
    ...client,

    clientName: firstValue(client.clientName, client.name, client.companyName),

    companyName: client.companyName || "",

    gstNumber: firstValue(
      client.gstNumber,
      client.gst,
      client.gstin,
      client.gstNo,
    ),

    email: firstValue(client.email),

    phone: firstValue(client.phone, client.mobile, client.phoneNumber),

    address: firstValue(client.address, client.clientAddress),

    city: client.city || "",

    state: client.state || "",

    country: client.country || "",

    zipCode: firstValue(
      client.zipCode,
      client.pincode,
      client.pinCode,
      client.postalCode,
    ),
  };
}

// ======================================================
// ITEM HELPERS
// ======================================================

function getItemName(item) {
  return firstValue(item.itemName, item.name, item.productName, item.item);
}

function getQuantity(item) {
  return Number(item.quantity ?? item.qty ?? 0);
}

function getRate(item) {
  return Number(item.rate ?? item.price ?? 0);
}

function getTaxRate(item) {
  return Number(item.taxRate ?? item.gst ?? item.gstRate ?? item.tax ?? 0);
}

function getItemAmount(item) {
  if (item.amount !== undefined && item.amount !== null) {
    return Number(item.amount);
  }

  if (item.total !== undefined && item.total !== null) {
    return Number(item.total);
  }

  return getQuantity(item) * getRate(item);
}

// ======================================================
// ADDRESS
// ======================================================

function buildAddress(data = {}) {
  const lines = [];

  const address = firstValue(
    data.address,
    data.businessAddress,
    data.clientAddress,
  );

  if (address) {
    lines.push(String(address).trim());
  }

  const cityState = [data.city, data.state].filter(Boolean);

  if (cityState.length) {
    lines.push(cityState.join(", "));
  }

  if (data.country) {
    lines.push(String(data.country));
  }

  if (data.zipCode) {
    lines.push(String(data.zipCode));
  }

  return lines.join("\n");
}

// ======================================================
// IMAGE RESOLVER
// ======================================================

function resolveImageSource(imageValue) {
  if (!imageValue || typeof imageValue !== "string") {
    return null;
  }

  if (imageValue.startsWith("data:image")) {
    try {
      const base64Data = imageValue.replace(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
        "",
      );

      return Buffer.from(base64Data, "base64");
    } catch (error) {
      console.error("BASE64 IMAGE ERROR:", error);

      return null;
    }
  }

  let cleanPath = imageValue.trim();

  cleanPath = cleanPath.replace(/^https?:\/\/localhost:5000\/?/i, "");

  cleanPath = cleanPath.replace(/^https?:\/\/127\.0\.0\.1:5000\/?/i, "");

  cleanPath = cleanPath.replace(/^\/+/, "");

  cleanPath = cleanPath.replace(/\\/g, "/");

  const possiblePaths = [
    path.resolve(process.cwd(), cleanPath),

    path.resolve(process.cwd(), "uploads", path.basename(cleanPath)),

    path.resolve(__dirname, "..", "uploads", path.basename(cleanPath)),

    path.resolve(__dirname, "..", cleanPath),

    path.resolve(__dirname, "..", "..", "uploads", path.basename(cleanPath)),
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return null;
}

// ======================================================
// PDF GENERATOR
// ======================================================

function generatePDF(invoice, res) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    autoFirstPage: true,
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoice.invoiceNo || "invoice"}.pdf"`,
  );

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const left = 42;
  const right = pageWidth - 42;
  const contentWidth = right - left;

  // ======================================================
  // DATA
  // ======================================================

  const seller = getSeller(invoice);
  const client = getClient(invoice);

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  // ======================================================
  // SELLER
  // ======================================================

  const sellerName = firstValue(
    seller.businessName,
    seller.legalName,
    "OWNADZ",
  );

  const sellerAddress = buildAddress(seller);

  const sellerGST = firstValue(seller.gstNumber);

  const sellerPAN = firstValue(seller.panNumber);

  const sellerPhone = firstValue(seller.phone);

  const sellerEmail = firstValue(seller.email);

  // ======================================================
  // CLIENT
  // ======================================================

  const clientName = firstValue(client.clientName, client.companyName);

  const clientAddress = buildAddress(client);

  const clientGST = firstValue(client.gstNumber);

  // ======================================================
  // BANK DETAILS
  // ======================================================

const invoiceBank = invoice?.bankDetails || {};

const sellerBank = seller?.bankDetails || {};

const bankName = firstValue(
  invoiceBank.bankName,
  invoiceBank.bank,

  sellerBank.bankName,
  sellerBank.bank,

  seller.bankName,
  seller.bank,
);

const accountName = firstValue(
  invoiceBank.accountName,
  invoiceBank.accountHolderName,
  invoiceBank.accountHolder,

  sellerBank.accountName,
  sellerBank.accountHolderName,
  sellerBank.accountHolder,

  seller.accountName,
  seller.accountHolderName,
  seller.accountHolder,
);

const accountNumber = firstValue(
  invoiceBank.accountNumber,
  invoiceBank.accountNo,
  invoiceBank.acNo,

  sellerBank.accountNumber,
  sellerBank.accountNo,
  sellerBank.acNo,

  seller.accountNumber,
  seller.accountNo,
  seller.acNo,
);

const ifsc = firstValue(
  invoiceBank.ifsc,
  invoiceBank.ifscCode,
  invoiceBank.IFSC,

  sellerBank.ifsc,
  sellerBank.ifscCode,
  sellerBank.IFSC,

  seller.ifsc,
  seller.ifscCode,
  seller.IFSC,
);

const branchName = firstValue(
  invoiceBank.branchName,

  sellerBank.branchName,

  seller.branchName,
);
  // ======================================================
  // TOTALS
  // ======================================================

  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + getItemAmount(item),
    0,
  );

  const subtotal = Number(invoice.subtotal ?? calculatedSubtotal);

  const taxAmount = Number(invoice.tax ?? invoice.taxAmount ?? 0);

  const discount = Number(invoice.discount ?? invoice.discountAmount ?? 0);

  const additional = Number(
    invoice.additional ??
      invoice.additionalCharges ??
      invoice.additionalCharge ??
      0,
  );

  const shipping = Number(
    invoice.shipping ?? invoice.shippingCharges ?? invoice.shippingCharge ?? 0,
  );

  const grandTotal = Number(
    invoice.grandTotal ??
      invoice.total ??
      subtotal + taxAmount - discount + additional + shipping,
  );

  // ======================================================
  // TOP ORANGE LINE
  // ======================================================

  doc.rect(0, 0, pageWidth, 6).fill(ORANGE);

  // ======================================================
  // HEADER LOGO
  // ======================================================

  const logoPath = path.resolve(process.cwd(), "assests", "ownadz-logo.png");

  let logoDrawn = false;

  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, left, 28, {
        fit: [155, 48],
        align: "left",
        valign: "center",
      });

      logoDrawn = true;
    } catch (error) {
      console.error("OWNADZ LOGO PDF ERROR:", error);
    }
  }

  if (!logoDrawn) {
    writeText(doc, sellerName || "OWNADZ", left, 35, 22, true, BLACK, {
      width: 230,
      lineBreak: false,
      ellipsis: true,
    });
  }

  // ======================================================
  // INVOICE TITLE
  // ======================================================

  writeText(doc, "INVOICE", 355, 28, 27, true, BLACK, {
    width: right - 355,
    align: "right",
    lineBreak: false,
  });

  writeText(doc, invoice.invoiceNo || "-", 355, 68, 10, false, GRAY, {
    width: right - 355,
    align: "right",
    lineBreak: false,
  });

  drawLine(doc, left, 105, right, 105, ORANGE, 0.8);

  // ======================================================
  // FROM DETAILS
  // ======================================================

  writeText(doc, "FROM", left, 124, 9, true, ORANGE);

  writeText(doc, sellerName || "-", left, 142, 15, true, BLACK, {
    width: 270,
    lineBreak: false,
    ellipsis: true,
  });

  let sellerY = 166;

  if (sellerAddress) {
    doc
      .fillColor(GRAY)
      .font("Helvetica")
      .fontSize(8.5)
      .text(sellerAddress, left, sellerY, {
        width: 270,
        lineGap: 1.5,
      });

    sellerY = doc.y + 3;
  }

  if (sellerPhone) {
    writeText(doc, sellerPhone, left, sellerY, 8.5, false, GRAY);

    sellerY += 12;
  }

  if (sellerEmail) {
    writeText(doc, sellerEmail, left, sellerY, 8.5, false, GRAY);

    sellerY += 12;
  }

  if (sellerGST) {
    writeText(doc, `GSTIN: ${sellerGST}`, left, sellerY, 8.5, false, GRAY);

    sellerY += 12;
  }

  if (sellerPAN) {
    writeText(doc, `PAN: ${sellerPAN}`, left, sellerY, 8.5, false, GRAY);
  }

  // ======================================================
  // INVOICE INFORMATION CARD
  // ======================================================

  const infoX = 355;
  const infoY = 122;
  const infoW = right - infoX;
  const infoH = 92;

  doc
    .roundedRect(infoX, infoY, infoW, infoH, 7)
    .strokeColor(BORDER)
    .lineWidth(0.8)
    .stroke();

  doc.roundedRect(infoX, infoY, infoW, 7, 7).fill(ORANGE);

  writeText(doc, "Invoice No", infoX + 16, infoY + 23, 8.5, true, BLACK);

  writeText(
    doc,
    invoice.invoiceNo || "-",
    infoX + 105,
    infoY + 23,
    7,
    false,
    BLACK,
    {
      width: infoW - 115,
      align: "right",
      lineBreak: false,
    },
  );

  writeText(doc, "Invoice Date", infoX + 16, infoY + 49, 8.5, true, BLACK);

  writeText(
    doc,
    formatDate(invoice.invoiceDate),
    infoX + 105,
    infoY + 49,
    8.5,
    false,
    BLACK,
    {
      width: infoW - 121,
      align: "right",
      lineBreak: false,
    },
  );

  // ======================================================
  // BILL TO
  // ======================================================

  const billY = 255;
  const billH = 94;

  doc
    .roundedRect(left, billY, contentWidth, billH, 7)
    .strokeColor(BORDER)
    .lineWidth(0.8)
    .stroke();

  doc.roundedRect(left, billY, 96, 26, 6).fill(BLACK);

  writeText(doc, "BILL TO", left, billY + 8, 9, true, WHITE, {
    width: 96,
    align: "center",
    lineBreak: false,
  });

  writeText(doc, clientName || "-", left + 16, billY + 35, 12, true, BLACK, {
    width: 300,
    lineBreak: false,
    ellipsis: true,
  });

  let clientAddressY = billY + 55;

  if (client.companyName && client.companyName !== clientName) {
    writeText(doc, client.companyName, left + 16, billY + 52, 8.5, true, GRAY, {
      width: 300,
      lineBreak: false,
      ellipsis: true,
    });

    clientAddressY = billY + 66;
  }

  doc
    .fillColor(GRAY)
    .font("Helvetica")
    .fontSize(8.5)
    .text(clientAddress || "-", left + 16, clientAddressY, {
      width: 300,
      height: 30,
      lineGap: 1,
      ellipsis: true,
    });

  if (clientGST) {
    writeText(doc, "GSTIN", 420, billY + 38, 8.5, true, BLACK);

    writeText(doc, clientGST, 420, billY + 57, 8.5, false, GRAY, {
      width: 125,
      lineBreak: false,
      ellipsis: true,
    });
  }

  // ======================================================
  // ITEMS TABLE
  // ======================================================

  let y = billY + billH + 22;

  const tableX = left;
  const tableWidth = contentWidth;

  const widths = {
    no: 28,
    item: 205,
    qty: 55,
    rate: 75,
    gst: 55,
  };

  widths.amount =
    tableWidth -
    widths.no -
    widths.item -
    widths.qty -
    widths.rate -
    widths.gst;

  const headerHeight = 28;

  doc.roundedRect(tableX, y, tableWidth, headerHeight, 5).fill(BLACK);

  let headerX = tableX;

  writeText(doc, "#", headerX, y + 9, 8.5, true, WHITE, {
    width: widths.no,
    align: "center",
    lineBreak: false,
  });

  headerX += widths.no;

  writeText(doc, "ITEM", headerX + 8, y + 9, 8.5, true, WHITE);

  headerX += widths.item;

  writeText(doc, "QTY", headerX, y + 9, 8.5, true, WHITE, {
    width: widths.qty,
    align: "center",
    lineBreak: false,
  });

  headerX += widths.qty;

  writeText(doc, "RATE", headerX, y + 9, 8.5, true, WHITE, {
    width: widths.rate,
    align: "center",
    lineBreak: false,
  });

  headerX += widths.rate;

  writeText(doc, "GST", headerX, y + 9, 8.5, true, WHITE, {
    width: widths.gst,
    align: "center",
    lineBreak: false,
  });

  headerX += widths.gst;

  writeText(doc, "AMOUNT", headerX, y + 9, 8.5, true, WHITE, {
    width: widths.amount,
    align: "right",
    lineBreak: false,
  });

  y += headerHeight;

  const rowHeight = 32;

  if (items.length === 0) {
    writeText(doc, "No items added", tableX, y + 10, 8.5, false, GRAY, {
      width: tableWidth,
      align: "center",
    });

    y += rowHeight;

    drawLine(doc, tableX, y, tableX + tableWidth, y, BORDER, 0.7);
  } else {
    items.forEach((item, index) => {
      let rowX = tableX;

      writeText(doc, index + 1, rowX, y + 10, 8.5, false, BLACK, {
        width: widths.no,
        align: "center",
        lineBreak: false,
      });

      rowX += widths.no;

      writeText(
        doc,
        getItemName(item) || "-",
        rowX + 8,
        y + 10,
        8.5,
        true,
        BLACK,
        {
          width: widths.item - 12,
          lineBreak: false,
          ellipsis: true,
        },
      );

      rowX += widths.item;

      writeText(doc, getQuantity(item), rowX, y + 10, 8.5, false, BLACK, {
        width: widths.qty,
        align: "center",
        lineBreak: false,
      });

      rowX += widths.qty;

      writeText(
        doc,
        `Rs. ${money(getRate(item))}`,
        rowX,
        y + 10,
        8.5,
        false,
        BLACK,
        {
          width: widths.rate,
          align: "center",
          lineBreak: false,
        },
      );

      rowX += widths.rate;

      writeText(doc, `${getTaxRate(item)}%`, rowX, y + 10, 8.5, false, BLACK, {
        width: widths.gst,
        align: "center",
        lineBreak: false,
      });

      rowX += widths.gst;

      writeText(
        doc,
        `Rs. ${money(getItemAmount(item))}`,
        rowX,
        y + 10,
        8.5,
        false,
        BLACK,
        {
          width: widths.amount,
          align: "right",
          lineBreak: false,
        },
      );

      y += rowHeight;

      drawLine(doc, tableX, y, tableX + tableWidth, y, BORDER, 0.7);
    });
  }

  // ======================================================
  // AMOUNT IN WORDS
  // ======================================================

  const summaryY = y + 14;

  writeText(doc, "AMOUNT IN WORDS", left, summaryY, 8.5, true, ORANGE);

  writeText(
    doc,
    invoice.totalInWords || "-",
    left,
    summaryY + 20,
    8.5,
    false,
    GRAY,
    {
      width: 270,
      height: 50,
      lineGap: 2,
      ellipsis: true,
    },
  );

  // ======================================================
  // TOTALS CARD
  // ======================================================
  // ======================================================
  // TOTALS CARD
  // ======================================================

  const totalsX = 365;
  const totalsY = summaryY;
  const totalsW = right - totalsX;
  const totalRowH = 22;

  const totalRows = [
    ["Subtotal", subtotal],
    ["IGST", taxAmount],

    // ["Discount", discount],
    // ["Additional", additional],
    // ["Shipping", shipping],
  ];

  const totalsPaddingTop = 10;
  const grandTotalH = 34;

  const totalsH = totalsPaddingTop + totalRows.length * totalRowH + grandTotalH;

  doc
    .roundedRect(totalsX, totalsY, totalsW, totalsH, 6)
    .strokeColor(BORDER)
    .lineWidth(0.8)
    .stroke();

  totalRows.forEach(([label, value], index) => {
    const rowY = totalsY + totalsPaddingTop + index * totalRowH;

    writeText(doc, label, totalsX + 16, rowY, 8.5, false, BLACK);

    writeText(
      doc,
      `Rs. ${money(value)}`,
      totalsX + 90,
      rowY,
      8.5,
      false,
      BLACK,
      {
        width: totalsW - 106,
        align: "right",
        lineBreak: false,
      },
    );
  });

  const grandY = totalsY + totalsPaddingTop + totalRows.length * totalRowH;

  doc.rect(totalsX, grandY, totalsW, grandTotalH).fill(ORANGE);

  writeText(doc, "GRAND TOTAL", totalsX + 16, grandY + 11, 10, true, BLACK);

  writeText(
    doc,
    `Rs. ${money(grandTotal)}`,
    totalsX + 100,
    grandY + 11,
    10,
    true,
    BLACK,
    {
      width: totalsW - 116,
      align: "right",
      lineBreak: false,
    },
  );
  // ======================================================
// BANK DETAILS
// ======================================================

const bankY = Math.max(summaryY + 105, totalsY + totalsH + 28);

writeText(doc, "BANK DETAILS", left, bankY, 11, true, ORANGE);

const bankRows = [
  ["Bank", bankName || "-"],
  ["A/C Name", accountName || "-"],
  ["A/C No", accountNumber || "-"],
  ["IFSC", ifsc || "-"],
];

if (branchName) {
  bankRows.push(["Branch", branchName]);
}

bankRows.forEach(([label, value], index) => {
  const rowY = bankY + 28 + index * 19;

  writeText(doc, `${label}:`, left, rowY, 10, true, BLACK, {
    width: 85,
    lineBreak: false,
  });

  writeText(doc, value, left + 95, rowY, 10, false, GRAY, {
    width: 220,
    lineBreak: false,
    ellipsis: true,
  });
});

  // ======================================================
  // SIGNATURE
  // ======================================================

  const signature = firstValue(
    invoice.signature,
    invoice.signatureUrl,
    invoice.signatureImage,

    invoice.header?.signature,

    seller.signature,
    seller.signatureUrl,
    seller.signatureImage,
  );

  const signatureX = 405;
  const signatureY = bankY + 12;
  const signatureW = 125;

  if (signature) {
    try {
      const signatureSource = resolveImageSource(signature);

      if (signatureSource) {
        doc.image(signatureSource, signatureX + 20, signatureY, {
          fit: [85, 42],
          align: "center",
          valign: "center",
        });
      }
    } catch (error) {
      console.error("PDF SIGNATURE ERROR:", error);
    }
  }

  drawLine(
    doc,
    signatureX,
    signatureY + 53,
    signatureX + signatureW,
    signatureY + 53,
    GRAY,
    0.7,
  );

  writeText(
    doc,
    "Authorized Signature",
    signatureX,
    signatureY + 61,
    8.5,
    false,
    GRAY,
    {
      width: signatureW,
      align: "center",
      lineBreak: false,
    },
  );

  // ======================================================
  // FOOTER
  // ======================================================

  const footerLineY = pageHeight - 43;

  drawLine(doc, left, footerLineY, right, footerLineY, ORANGE, 0.7);

  writeText(
    doc,
    "This is a computer generated invoice.",
    left,
    footerLineY + 13,
    6.5,
    false,
    GRAY,
    {
      width: 200,
      lineBreak: false,
    },
  );

  writeText(doc, "www.ownadz.com", 0, footerLineY + 13, 7, true, BLACK, {
    width: pageWidth,
    align: "center",
    lineBreak: false,
  });

  // ======================================================
  // FINISH
  // ======================================================

  doc.end();
}

module.exports = generatePDF;
