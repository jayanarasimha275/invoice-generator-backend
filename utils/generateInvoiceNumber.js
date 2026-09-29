const Invoice = require("../models/Invoice");

const generateInvoiceNumber = async (userId = null) => {
  const year = new Date().getFullYear();

  const invoicePrefix = `ODA/${year}-${year+1}/`;

  let latestInvoice;

  if (userId) {
    latestInvoice = await Invoice.findOne({
      userId,
      invoiceNo: {
        $regex: `^ODA/${year}-${year+1}/`,
      },
    }).sort({
      createdAt: -1,
    });
  } else {
    latestInvoice = await Invoice.findOne({
      invoiceNo: {
        $regex: `^ODA/${year}-${year+1}/`,
      },
    }).sort({
      createdAt: -1,
    });
  }

  let nextNumber = 1;

  if (latestInvoice?.invoiceNo) {
    const invoiceParts = latestInvoice.invoiceNo.split("/");

    const lastNumber = parseInt(
      invoiceParts[invoiceParts.length - 1],
      10
    );

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const formattedNumber = String(nextNumber).padStart(3, "0");

  return `${invoicePrefix}${formattedNumber}`;
};

module.exports = generateInvoiceNumber;