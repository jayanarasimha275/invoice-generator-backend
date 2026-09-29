const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const convertBelowHundred = (number) => {
  if (number < 20) {
    return ones[number];
  }

  const ten = Math.floor(number / 10);
  const one = number % 10;

  return `${tens[ten]}${one ? ` ${ones[one]}` : ""}`;
};

const convertBelowThousand = (number) => {
  let words = "";

  if (number >= 100) {
    words += `${ones[Math.floor(number / 100)]} Hundred`;

    number %= 100;

    if (number > 0) {
      words += " ";
    }
  }

  if (number > 0) {
    words += convertBelowHundred(number);
  }

  return words;
};

const convertIndianNumber = (number) => {
  if (number === 0) {
    return "Zero";
  }

  let words = "";

  const crore = Math.floor(number / 10000000);

  number %= 10000000;

  const lakh = Math.floor(number / 100000);

  number %= 100000;

  const thousand = Math.floor(number / 1000);

  number %= 1000;

  if (crore > 0) {
    words += `${convertIndianNumber(crore)} Crore `;
  }

  if (lakh > 0) {
    words += `${convertBelowHundred(lakh)} Lakh `;
  }

  if (thousand > 0) {
    words += `${convertBelowHundred(thousand)} Thousand `;
  }

  if (number > 0) {
    words += convertBelowThousand(number);
  }

  return words.trim();
};

const numberToWords = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return "Invalid Amount";
  }

  const roundedAmount =
    Math.round((amount + Number.EPSILON) * 100) / 100;

  let rupees = Math.floor(roundedAmount);

  let paise = Math.round(
    (roundedAmount - rupees) * 100
  );

  if (paise === 100) {
    rupees += 1;
    paise = 0;
  }

  let words = `${convertIndianNumber(rupees)} Rupees`;

  if (paise > 0) {
    words += ` and ${convertBelowHundred(paise)} Paise`;
  }

  return `${words} Only`;
};

module.exports = numberToWords;