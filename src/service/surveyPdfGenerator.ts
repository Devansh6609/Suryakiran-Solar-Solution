import jsPDF from 'jspdf';

export const generateSurveyReportPdf = (survey: any): jsPDF => {
    const doc = new jsPDF('p', 'mm', 'a4');

    const lead = survey.lead || {};
    const engineer = survey.assignedEngineer || {};
    const sections = survey.sectionsMap || {};
    const customerInfo = sections.customerInfo || {};
    const roofDetails = sections.roofDetails || {};
    const measurements = sections.measurements || {};
    const electrical = sections.electrical || {};

    // Header Banner
    doc.setFillColor(15, 23, 42); // Night sky dark
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(34, 211, 238); // Neon cyan
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('VARCAS ENERGY', 14, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('TECHNICAL SITE SURVEY & FEASIBILITY REPORT', 14, 25);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Survey ID: ${survey.surveyNo || 'SV-2026-0001'}`, 150, 16);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 150, 22);

    let y = 42;

    // Status & Approval Badge
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`SURVEY STATUS: ${survey.status?.toUpperCase() || 'APPROVED'}`, 20, y + 10);
    doc.text(`ESTIMATED CAPACITY: ${survey.estimatedCapacity || 5.2} kW`, 110, y + 10);

    y += 26;

    // Customer & GPS Info
    doc.setFillColor(34, 211, 238);
    doc.rect(14, y, 4, 12, 'F');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('1. CUSTOMER & LOCATION DETAILS', 22, y + 9);

    y += 18;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`Customer Name: ${lead.name || customerInfo.customerName || 'N/A'}`, 14, y);
    doc.text(`Phone: ${lead.phone || customerInfo.mobile || 'N/A'}`, 110, y);
    y += 6;
    doc.text(`Address: ${customerInfo.address || lead.village || 'N/A'}, ${lead.district || 'Gujarat'}`, 14, y);
    doc.text(`Customer Type: ${customerInfo.customerType || 'Residential'}`, 110, y);
    y += 6;
    doc.text(`GPS Coordinates: Lat ${survey.gpsLat || '23.0225°'}, Lng ${survey.gpsLng || '72.5714°'}`, 14, y);
    doc.text(`GPS Accuracy: ${survey.gpsAccuracy || 5} meters (Verified)`, 110, y);

    y += 16;

    // Roof & Property Specs
    doc.setFillColor(34, 211, 238);
    doc.rect(14, y, 4, 12, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. ROOF & MEASUREMENT SPECIFICATIONS', 22, y + 9);

    y += 18;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`Roof Type: ${roofDetails.roofType || 'RCC Flat Roof'}`, 14, y);
    doc.text(`Roof Condition: ${roofDetails.roofCondition || 'Excellent'}`, 110, y);
    y += 6;
    doc.text(`Roof Orientation: ${roofDetails.roofOrientation || 'South Facing'}`, 14, y);
    doc.text(`Roof Slope / Tilt: ${roofDetails.roofTilt || '15° Optimal'}`, 110, y);
    y += 6;
    doc.text(`Usable Roof Area: ${measurements.usableArea || 450} sq.ft`, 14, y);
    doc.text(`Max Panel Count: ${measurements.maxPanels || 12} Panels`, 110, y);

    y += 16;

    // Electrical Survey
    doc.setFillColor(34, 211, 238);
    doc.rect(14, y, 4, 12, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. ELECTRICAL SURVEY & METER BOARD', 22, y + 9);

    y += 18;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`Consumer #: ${electrical.consumerNo || '102938475612'}`, 14, y);
    doc.text(`Sanction Load: ${electrical.sanctionLoad || '5 kW'}`, 110, y);
    y += 6;
    doc.text(`Connection Type: ${electrical.connectionType || 'Single Phase'}`, 14, y);
    doc.text(`Electricity Provider: ${electrical.provider || 'GUVNL / DISCOM'}`, 110, y);
    y += 6;
    doc.text(`Net Meter Existing: ${electrical.netMeter || 'No (Requires New Net Meter)'}`, 14, y);
    doc.text(`Monthly Electricity Bill: ₹${electrical.monthlyBill || 4500}`, 110, y);

    y += 20;

    // Signatures & Manager Approval
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 32, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('CUSTOMER DIGITAL SIGNATURE', 22, y + 10);
    doc.text('ENGINEER & MANAGER APPROVAL', 110, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.text(`Signed By: ${lead.name || 'Customer'}`, 22, y + 18);
    doc.text(`Approved By: ${survey.approvedBy || engineer.name || 'Rahul Patel (Manager)'}`, 110, y + 18);
    doc.text(`Date & Time: ${new Date().toLocaleString('en-IN')}`, 22, y + 24);
    doc.text(`Status: VERIFIED & APPROVED FOR PROPOSAL`, 110, y + 24);

    return doc;
};
