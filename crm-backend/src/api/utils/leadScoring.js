
const calculateScore = (leadData) => {
    let score = 30; // Base score for new lead
    if (leadData.otpVerified) score += 25;
    if (leadData.name && leadData.email && leadData.phone) score += 15;

    // Custom fields scoring
    const customFields = leadData.customFields || {};
    if (customFields.bill && parseInt(customFields.bill) > 5000) score += 20;
    if (customFields.propertyStatus === 'Homeowner') score += 10;
    if (customFields.energyCost && parseInt(customFields.energyCost) > 15000) score += 20;

    return Math.min(100, score);
};

const getScoreStatus = (score) => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
};

module.exports = {
    calculateScore,
    getScoreStatus,
};
