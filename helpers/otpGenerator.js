const getOTP = () => {
    // Generate a random integer between 1000 and 9999
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    return randomNumber;
}

module.exports = { getOTP };
