const generateYearPrefixedNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random7DigitNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
    return year + random7DigitNumber;
}

module.exports = { generateYearPrefixedNumber };