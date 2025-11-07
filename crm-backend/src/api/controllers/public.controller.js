const prisma = require('../../config/prisma');
const { calculateScore, getScoreStatus } = require('../utils/leadScoring');

// --- Mock Data (to be moved to DB eventually) ---
const locations = {
    "India": {
        "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
        "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "Y.S.R. Kadapa"],
        "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
        "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
        "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
        "Chandigarh": ["Chandigarh"],
        "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
        "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Dadra and Nagar Haveli"],
        "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
        "Goa": ["North Goa", "South Goa"],
        "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
        "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
        "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
        "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
        "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
        "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
        "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
        "Ladakh": ["Kargil", "Leh"],
        "Lakshadweep": ["Lakshadweep"],
        "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
        "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
        "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
        "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
        "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
        "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
        "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
        "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
        "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
        "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
        "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
        "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
        "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
        "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
        "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
        "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
        "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
    }
};

const formSchemas = {
    rooftop: [
        { id: 'f_state', type: 'select', name: 'state', label: 'State', required: true, options: [] },
        { id: 'f_district', type: 'select', name: 'district', label: 'District', required: true, options: [] },
        { id: 'f_pincode', type: 'text', name: 'pincode', label: 'Pincode', required: true, placeholder: 'e.g. 411001' },
        { id: 'f2', type: 'number', name: 'bill', label: 'Average Monthly Electricity Bill (₹)', required: true, placeholder: 'e.g., 3000' },
        { id: 'f3', type: 'select', name: 'propertyStatus', label: 'Property Status', required: true, options: ['Homeowner', 'Business Owner'] },
        { id: 'f4', type: 'select', name: 'roofType', label: 'Roof Type', required: true, options: ['RCC (Concrete)', 'Metal Sheet', 'Asbestos', 'Other'] },
        { id: 'f_aadhar', type: 'image', name: 'aadharCard', label: 'Upload Aadhar Card for Verification', required: true }
    ],
    pump: [
        { id: 'p_state', type: 'select', name: 'state', label: 'State', required: true, options: [] },
        { id: 'p_district', type: 'select', name: 'district', label: 'District', required: true, options: [] },
        { id: 'p_pincode', type: 'text', name: 'pincode', label: 'Pincode', required: true, placeholder: 'e.g. 440001' },
        { id: 'p2', type: 'number', name: 'energyCost', label: 'Current Energy Cost (₹/Season)', required: true, placeholder: 'e.g., 10000' },
        { id: 'p3', type: 'select', name: 'pumpHP', label: 'Required HP / Existing Pump HP', required: true, options: ['3 HP', '5 HP', '7.5 HP', '10 HP'] },
        { id: 'p4', type: 'select', name: 'waterSource', label: 'Water Source', required: true, options: ['Borehole', 'Well', 'River', 'Pond'] },
        { id: 'p_aadhar', type: 'image', name: 'aadharCard', label: 'Upload Aadhar Card for Verification', required: true }
    ],
};

// --- Controllers ---
const getStates = (req, res) => res.json(Object.keys(locations.India));
const getDistricts = (req, res) => res.json(locations.India[req.params.state] || []);
const getFormSchema = (req, res) => res.json(formSchemas[req.params.formType] || []);

const createLead = async (req, res) => {
    const { productType, customFields } = req.body;
    try {
        const sources = ['Website', 'Referral', 'Cold Call', 'Social Media'];
        const newLeadData = {
            productType,
            customFields: customFields || {},
            pipelineStage: 'New Lead',
            activityLog: { create: { action: 'Lead Created via Website', user: 'System' } },
            source: sources[Math.floor(Math.random() * sources.length)],
        };
        
        const matchingVendor = await prisma.user.findFirst({
            where: { role: 'Vendor', district: customFields?.district }
        });

        if (matchingVendor) {
            newLeadData.assignedVendorId = matchingVendor.id;
            newLeadData.activityLog.create.action += ` and auto-assigned to ${matchingVendor.name}`;
        }
        
        const score = calculateScore(newLeadData);
        newLeadData.score = score;
        newLeadData.scoreStatus = getScoreStatus(score);

        const newLead = await prisma.lead.create({ data: newLeadData });
        res.status(201).json(newLead);
    } catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({ message: 'Failed to create lead.' });
    }
};

const sendOtp = async (req, res) => {
    const { leadId } = req.params;
    const { name, email, phone } = req.body;
    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) return res.status(404).json({ message: 'Lead not found.' });

        const updatedData = { name, email, phone };
        const score = calculateScore({ ...lead, ...updatedData });
        updatedData.score = score;
        updatedData.scoreStatus = getScoreStatus(score);

        await prisma.lead.update({
            where: { id: leadId },
            data: {
                ...updatedData,
                activityLog: { create: { action: 'Contact info submitted, OTP sent', user: 'System' } },
            },
        });
        // Mock OTP sending
        res.json({ message: 'OTP sent (mock)' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
};

const verifyOtp = async (req, res) => {
    const { leadId } = req.params;
    const { otp } = req.body;
    if (otp !== '1234') { // Mock OTP check
        return res.status(400).json({ message: 'Invalid OTP' });
    }
    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) return res.status(404).json({ message: 'Lead not found.' });
        
        const updatedData = { otpVerified: true, pipelineStage: 'Verified Lead' };
        const score = calculateScore({ ...lead, ...updatedData });
        updatedData.score = score;
        updatedData.scoreStatus = getScoreStatus(score);

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                ...updatedData,
                activityLog: { create: { action: 'OTP Verified', user: 'System' } },
            }
        });

        // Mock calculation results
        const results = updatedLead.productType === 'rooftop'
            ? { "System Size (kW)": `${(parseInt(updatedLead.customFields.bill) / 750).toFixed(1)} kW`, "Total Subsidy Estimate (₹)": "₹ " + Math.min(78000, ((parseInt(updatedLead.customFields.bill) / 750) * 22000)).toLocaleString('en-IN'), "Annual Savings (₹)": "₹ " + (parseInt(updatedLead.customFields.bill) * 12).toLocaleString('en-IN'), "Payback Period": "~4.5 Years" }
            : { "Estimated Annual Diesel Savings (₹)": "₹ " + (parseInt(updatedLead.customFields.energyCost) * 4).toLocaleString('en-IN'), "PM-KUSUM Subsidy Estimate": "60%", "Payback Period": "~1.9 Years" };

        res.json({ message: 'Verification successful', results });
    } catch (error) {
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
};

const handleApplicationFileUpload = async (req, res) => {
    const { leadId } = req.params;
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }
    try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) return res.status(404).json({ message: 'Lead not found.' });
        
        const customFieldsUpdate = { ...lead.customFields };
        const documentsToCreate = [];
        const activityLogToCreate = [];

        req.files.forEach(file => {
            customFieldsUpdate[file.fieldname] = file.filename;
            documentsToCreate.push({ filename: file.filename });
            activityLogToCreate.push({ action: `Document '${file.originalname}' uploaded via form`, user: 'System' });
        });
        
        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                customFields: customFieldsUpdate,
                documents: { create: documentsToCreate },
                activityLog: { create: activityLogToCreate },
            }
        });
        res.json(updatedLead);
    } catch(error) {
        console.error("File upload error:", error);
        res.status(500).json({ message: "Failed to process file upload." });
    }
};


module.exports = {
    getStates,
    getDistricts,
    getFormSchema,
    createLead,
    sendOtp,
    verifyOtp,
    handleApplicationFileUpload,
};