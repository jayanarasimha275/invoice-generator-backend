const roundMoney = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

const calculateTotals = (
  items = [],
  discount = 0,
  additionalCharges = 0,
  shippingCharges = 0
) => {
  let subtotal = 0;
  let tax = 0;

  const safeDiscount = Number(discount) || 0;
  const safeAdditionalCharges = Number(additionalCharges) || 0;
  const safeShippingCharges = Number(shippingCharges) || 0;

  const updatedItems = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const taxRate = Number(item.taxRate) || 0;

    const amount = roundMoney(quantity * rate);

    const taxAmount = roundMoney(
      (amount * taxRate) / 100
    );

    subtotal += amount;
    tax += taxAmount;

    return {
      ...item,
      quantity,
      rate,
      taxRate,
      amount,
      taxAmount,
    };
  });

  subtotal = roundMoney(subtotal);
  tax = roundMoney(tax);

  const grandTotal = roundMoney(
    subtotal +
      tax -
      safeDiscount +
      safeAdditionalCharges +
      safeShippingCharges
  );

  return {
    items: updatedItems,

    subtotal,

    tax,

    discount: roundMoney(safeDiscount),

    additionalCharges: roundMoney(
      safeAdditionalCharges
    ),

    shippingCharges: roundMoney(
      safeShippingCharges
    ),

    grandTotal,
  };
};

module.exports = calculateTotals;