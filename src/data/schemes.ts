export type Scheme = {
  id: string;
  title: string;
  shortTitle: string;
  category: "central" | "maharashtra";
  type: string[];
  ministry: string;
  launchYear: number;
  budget: string;
  icon: string;
  color: string;
  overview: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  howToApply: string;
  officialWebsite: string;
  tags: string[];
};

export const schemes: Scheme[] = [
  {
    id: "pm-kisan",
    title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    shortTitle: "PM-KISAN",
    category: "central",
    type: ["subsidy", "direct-benefit"],
    ministry: "Ministry of Agriculture & Farmers Welfare",
    launchYear: 2019,
    budget: "₹60,000 Crore/year",
    icon: "Sprout",
    color: "#2d6a4f",
    overview:
      "PM-KISAN provides income support of ₹6,000 per year to all landholding farmer families across the country, paid in three equal instalments directly into bank accounts.",
    eligibility: [
      "Small and marginal farmer families",
      "Cultivable landholding in farmer's name",
      "Indian citizen",
      "Not an income tax payer",
    ],
    benefits: [
      "₹6,000 per year in 3 equal instalments",
      "Direct Benefit Transfer to bank account",
      "No middlemen involved",
      "Coverage for all eligible landholding farmers",
    ],
    documents: ["Aadhaar Card", "Land Records", "Bank Account Details", "Citizenship Certificate"],
    howToApply:
      "Visit pmkisan.gov.in, register as a new farmer, upload Aadhaar and land documents, and submit. You can also apply through your nearest Common Service Centre (CSC) or village revenue office.",
    officialWebsite: "https://pmkisan.gov.in",
    tags: ["income support", "direct transfer", "subsidy"],
  },
  {
    id: "pmfby",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    shortTitle: "PMFBY",
    category: "central",
    type: ["insurance"],
    ministry: "Ministry of Agriculture & Farmers Welfare",
    launchYear: 2016,
    budget: "₹15,500 Crore/year",
    icon: "ShieldCheck",
    color: "#1d4ed8",
    overview:
      "PMFBY provides comprehensive crop insurance against non-preventable natural risks from pre-sowing to post-harvest at very low premium rates for farmers.",
    eligibility: [
      "All farmers including sharecroppers and tenant farmers",
      "Growing notified crops in notified areas",
      "Must have insurable interest in the crop",
    ],
    benefits: [
      "Premium of just 2% for Kharif, 1.5% for Rabi crops",
      "5% for commercial/horticultural crops",
      "Full sum insured paid in case of crop loss",
      "Use of technology for quick claim settlement",
    ],
    documents: ["Aadhaar", "Bank Passbook", "Land Records / Sowing Certificate", "Tenant Agreement (if applicable)"],
    howToApply:
      "Apply at the nearest bank, PACS, or CSC, or online via pmfby.gov.in before the cut-off date for the relevant season.",
    officialWebsite: "https://pmfby.gov.in",
    tags: ["insurance", "crop loss", "risk cover"],
  },
  {
    id: "kcc",
    title: "Kisan Credit Card (KCC)",
    shortTitle: "Kisan Credit Card",
    category: "central",
    type: ["loans", "credit"],
    ministry: "Ministry of Agriculture & Farmers Welfare",
    launchYear: 1998,
    budget: "Demand based",
    icon: "CreditCard",
    color: "#f4a261",
    overview:
      "KCC provides timely and adequate short-term credit to farmers to meet cultivation needs and post-harvest expenses at concessional interest rates.",
    eligibility: [
      "All farmers — individual / joint borrowers who are owner cultivators",
      "Tenant farmers, oral lessees and share croppers",
      "Self Help Groups (SHGs) or Joint Liability Groups (JLGs)",
    ],
    benefits: [
      "Loans up to ₹3 lakh at 4% interest (with subvention)",
      "Flexible repayment as per crop cycle",
      "Covers crop, post-harvest, and consumption needs",
      "Personal accident insurance cover",
    ],
    documents: ["Identity Proof", "Address Proof", "Land Documents", "Passport-size Photographs"],
    howToApply:
      "Visit any bank branch (Commercial, Cooperative, or RRB) with required documents and submit the KCC application form. Online application is available through PM-KISAN portal.",
    officialWebsite: "https://www.pmkisan.gov.in/Kcc.aspx",
    tags: ["credit", "loans", "low interest"],
  },
  {
    id: "pmksy",
    title: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    shortTitle: "PMKSY",
    category: "central",
    type: ["irrigation"],
    ministry: "Ministry of Jal Shakti / Agriculture",
    launchYear: 2015,
    budget: "₹93,068 Crore (2021-26)",
    icon: "Droplets",
    color: "#0ea5e9",
    overview:
      "PMKSY aims to ensure access to protective irrigation for all agricultural farms — 'Har Khet Ko Paani' — and improve water-use efficiency via 'Per Drop More Crop'.",
    eligibility: [
      "All farmers with cultivable land",
      "Priority for small and marginal farmers",
      "Group / community-based irrigation projects",
    ],
    benefits: [
      "Up to 55% subsidy on micro-irrigation for small/marginal farmers",
      "45% subsidy for other farmers",
      "Improved water-use efficiency",
      "Higher yields per drop of water",
    ],
    documents: ["Aadhaar", "Land Records", "Bank Details", "Quotation for irrigation equipment"],
    howToApply:
      "Apply through the State Agriculture / Horticulture Department or online at pmksy.gov.in with the required documents and equipment quotation.",
    officialWebsite: "https://pmksy.gov.in",
    tags: ["irrigation", "drip", "sprinkler", "water"],
  },
  {
    id: "soil-health-card",
    title: "Soil Health Card Scheme",
    shortTitle: "Soil Health Card",
    category: "central",
    type: ["soil", "advisory"],
    ministry: "Department of Agriculture & Cooperation",
    launchYear: 2015,
    budget: "₹568 Crore",
    icon: "Leaf",
    color: "#65a30d",
    overview:
      "The scheme issues soil health cards to farmers every 3 years, giving crop-wise recommendations on nutrients and fertilizers required to improve productivity.",
    eligibility: ["All farmers across India with cultivable land"],
    benefits: [
      "Free soil testing of farm",
      "Crop-wise nutrient recommendations",
      "Reduced fertilizer cost",
      "Improved soil fertility & yield",
    ],
    documents: ["Aadhaar", "Land Records", "Mobile Number"],
    howToApply:
      "Contact local Krishi Vigyan Kendra or visit soilhealth.dac.gov.in to register and request soil sample collection.",
    officialWebsite: "https://soilhealth.dac.gov.in",
    tags: ["soil", "testing", "advisory"],
  },
  {
    id: "mjpsky",
    title: "Mahatma Jyotirao Phule Shetkari Karj Mukti Yojana",
    shortTitle: "MJP Karj Mafi",
    category: "maharashtra",
    type: ["loan-waiver"],
    ministry: "Maharashtra Cooperation, Marketing & Textiles Dept.",
    launchYear: 2019,
    budget: "₹21,000 Crore",
    icon: "BadgeIndianRupee",
    color: "#2d6a4f",
    overview:
      "Loan waiver scheme by the Government of Maharashtra providing relief of up to ₹2 lakh to farmers on outstanding short-term crop loans.",
    eligibility: [
      "Farmers in Maharashtra",
      "Short-term crop loans outstanding as on 30 Sept 2019",
      "Loan from cooperative banks, commercial banks or RRBs",
    ],
    benefits: [
      "Loan waiver up to ₹2,00,000",
      "Direct credit to loan account",
      "Relief from indebtedness",
    ],
    documents: ["Aadhaar", "Bank Loan Account", "Ration Card", "Land Records"],
    howToApply:
      "Visit your loan-issuing bank branch with Aadhaar; the bank verifies eligibility and the waiver amount is credited to your loan account.",
    officialWebsite: "https://mjpsky.maharashtra.gov.in",
    tags: ["loan waiver", "debt relief"],
  },
  {
    id: "pocra",
    title: "Nanaji Deshmukh Krishi Sanjivani Prakalp (POCRA)",
    shortTitle: "POCRA",
    category: "maharashtra",
    type: ["climate", "resilience"],
    ministry: "Maharashtra Department of Agriculture",
    launchYear: 2018,
    budget: "₹4,000 Crore (World Bank assisted)",
    icon: "CloudSun",
    color: "#f59e0b",
    overview:
      "POCRA enhances climate resilience of farmers in drought-prone and salinity-affected areas of Maharashtra through climate-smart agricultural practices.",
    eligibility: [
      "Farmers in 5,142 selected villages in 15 districts",
      "Priority for SC/ST, women and small/marginal farmers",
    ],
    benefits: [
      "Subsidy on protected cultivation, micro-irrigation, farm ponds",
      "Climate-resilient seeds and inputs",
      "Support for FPOs and value chain",
      "Capacity building & training",
    ],
    documents: ["Aadhaar", "7/12 Extract", "Bank Account", "Caste Certificate (if applicable)"],
    howToApply:
      "Register on the DBT Mahaagri portal (mahadbt.maharashtra.gov.in) and apply under the POCRA component for your village.",
    officialWebsite: "https://mahapocra.gov.in",
    tags: ["climate", "drought", "resilience"],
  },
  {
    id: "magel-tyala-shettale",
    title: "Magel Tyala Shettale Yojana",
    shortTitle: "Shettale Yojana",
    category: "maharashtra",
    type: ["water", "irrigation"],
    ministry: "Maharashtra Department of Agriculture",
    launchYear: 2016,
    budget: "₹50,000 per beneficiary",
    icon: "Waves",
    color: "#0ea5e9",
    overview:
      "Farm pond scheme providing financial assistance to farmers for constructing on-farm ponds to ensure protective irrigation and recharge groundwater.",
    eligibility: [
      "Farmer with minimum 0.6 hectare of land",
      "Resident of Maharashtra",
      "Land suitable for pond construction",
    ],
    benefits: [
      "Up to ₹50,000 grant for farm pond",
      "Protective irrigation during dry spells",
      "Improved groundwater recharge",
    ],
    documents: ["7/12 Extract", "8-A Extract", "Aadhaar", "Bank Passbook"],
    howToApply:
      "Apply online via mahadbt.maharashtra.gov.in under 'Magel Tyala Shettale' or visit the Taluka Agriculture Officer.",
    officialWebsite: "https://mahadbt.maharashtra.gov.in",
    tags: ["farm pond", "water harvesting"],
  },
  {
    id: "fundkar-falbag",
    title: "Bhausaheb Fundkar Falbag Lagvad Yojana",
    shortTitle: "Falbag Yojana",
    category: "maharashtra",
    type: ["horticulture"],
    ministry: "Maharashtra Department of Horticulture",
    launchYear: 2018,
    budget: "₹100 Crore/year",
    icon: "TreePine",
    color: "#16a34a",
    overview:
      "Provides 100% subsidy for horticulture plantation to farmers not covered under MGNREGA, promoting fruit cultivation and farmer income diversification.",
    eligibility: [
      "Farmers in Maharashtra not eligible under MGNREGA fruit plantation",
      "Minimum 0.20 hectare land",
      "Land must be suitable for horticulture",
    ],
    benefits: [
      "100% subsidy spread over 3 years",
      "Support for mango, cashew, guava, pomegranate etc.",
      "Long-term income from orchards",
    ],
    documents: ["7/12 Extract", "8-A Extract", "Aadhaar", "Bank Passbook"],
    howToApply:
      "Apply through the Taluka Agriculture Office or online via mahadbt.maharashtra.gov.in.",
    officialWebsite: "https://mahadbt.maharashtra.gov.in",
    tags: ["horticulture", "fruits", "orchard"],
  },
  {
    id: "saur-krushi-pump",
    title: "Mukhyamantri Saur Krushi Pump Yojana",
    shortTitle: "Saur Krushi Pump",
    category: "maharashtra",
    type: ["solar", "irrigation"],
    ministry: "MEDA, Government of Maharashtra",
    launchYear: 2019,
    budget: "₹1,000 Crore",
    icon: "Sun",
    color: "#f4a261",
    overview:
      "Provides solar-powered agricultural pumps to farmers at heavily subsidised rates, reducing dependence on the electricity grid and diesel.",
    eligibility: [
      "Maharashtra farmers without conventional grid electricity",
      "Farmers with up to 5 acres get 3 HP pump",
      "Farmers with more than 5 acres get 5 HP pump",
    ],
    benefits: [
      "95% subsidy for SC/ST farmers",
      "90% subsidy for general category",
      "Free solar energy for irrigation",
      "No monthly electricity bill",
    ],
    documents: ["Aadhaar", "7/12 Extract", "Caste Certificate (if applicable)", "Bank Passbook"],
    howToApply:
      "Apply online at the MEDA solar pump portal (mahaurja.com) and pay the beneficiary share after approval.",
    officialWebsite: "https://www.mahaurja.com",
    tags: ["solar", "pump", "renewable"],
  },
];

export const updates = [
  {
    id: 1,
    title: "PM-KISAN 17th Instalment Released",
    date: "2025-06-18",
    description:
      "Government released the 17th instalment of ₹2,000 to over 9.3 crore farmers under PM-KISAN, totalling more than ₹20,000 crore.",
  },
  {
    id: 2,
    title: "PMFBY Enrolment Deadline Extended for Kharif",
    date: "2025-07-31",
    description:
      "Last date for crop insurance enrolment under PMFBY for Kharif season has been extended to 15 August in most states.",
  },
  {
    id: 3,
    title: "KCC Saturation Drive Launched",
    date: "2025-05-02",
    description:
      "Banks across India have begun a new drive to provide Kisan Credit Cards to every eligible PM-KISAN beneficiary.",
  },
  {
    id: 4,
    title: "Maharashtra Adds 2 Lakh Farmers to Solar Pump Scheme",
    date: "2025-04-12",
    description:
      "MEDA announced expansion of the Mukhyamantri Saur Krushi Pump Yojana, targeting 2 lakh additional installations this year.",
  },
  {
    id: 5,
    title: "POCRA Phase II Approved",
    date: "2025-03-22",
    description:
      "The World Bank has approved the second phase of POCRA, expanding climate-resilient agriculture coverage to more Marathwada villages.",
  },
  {
    id: 6,
    title: "Soil Health Card Goes Digital",
    date: "2025-02-15",
    description:
      "Soil Health Cards will now be issued digitally with real-time analytics through the new soilhealth.dac.gov.in 2.0 portal.",
  },
  {
    id: 7,
    title: "Magel Tyala Shettale Subsidy Hiked",
    date: "2025-01-09",
    description:
      "Maharashtra increased the farm pond subsidy to ₹75,000 for eligible farmers in drought-prone districts.",
  },
  {
    id: 8,
    title: "Falbag Lagvad Expanded to New Crops",
    date: "2024-12-05",
    description:
      "Dragon fruit and avocado added to the eligible plantations under the Bhausaheb Fundkar Falbag Yojana.",
  },
];

export const faqs = [
  {
    q: "What is PM-KISAN and who can apply?",
    a: "PM-KISAN is a central scheme providing ₹6,000/year income support to all landholding farmer families. Apply online at pmkisan.gov.in with Aadhaar and land records.",
  },
  {
    q: "How do I apply for a Kisan Credit Card?",
    a: "Visit any bank branch with ID proof, address proof, and land documents, or apply via the PM-KISAN portal under KCC services.",
  },
  {
    q: "Am I eligible for the Maharashtra loan waiver?",
    a: "Farmers in Maharashtra with outstanding short-term crop loans up to ₹2 lakh as on 30 Sept 2019 are eligible under MJPSKY.",
  },
  {
    q: "What does PMFBY cover?",
    a: "PMFBY covers non-preventable natural risks from pre-sowing to post-harvest, including drought, flood, pest attacks, and unseasonal rainfall.",
  },
  {
    q: "Is there a subsidy for solar pumps in Maharashtra?",
    a: "Yes — under Mukhyamantri Saur Krushi Pump Yojana, 90–95% subsidy is available depending on category.",
  },
  {
    q: "How often do I get a Soil Health Card?",
    a: "Soil Health Cards are issued every three years with updated crop-wise nutrient recommendations.",
  },
  {
    q: "What documents are typically required?",
    a: "Aadhaar, bank passbook, land records (7/12 extract), and a passport-size photo are commonly needed for most schemes.",
  },
  {
    q: "Can tenant farmers also apply for crop insurance?",
    a: "Yes, PMFBY covers sharecroppers and tenant farmers provided they can show insurable interest in the notified crop.",
  },
  {
    q: "How much subsidy is given for drip irrigation?",
    a: "Under PMKSY 'Per Drop More Crop', up to 55% subsidy is given to small/marginal farmers and 45% to other farmers.",
  },
  {
    q: "Where can I check application status?",
    a: "Each scheme has its own portal (e.g., pmkisan.gov.in, mahadbt.maharashtra.gov.in) where you can track status using your Aadhaar or registration ID.",
  },
  {
    q: "Is there any helpline for farmers?",
    a: "Yes — Kisan Call Centre: 1800-180-1551. Maharashtra Krishi Helpline: 1800-233-4000.",
  },
  {
    q: "Do I need to pay anyone to apply for a scheme?",
    a: "No. All government schemes are free to apply for. Avoid middlemen and use only official portals or government offices.",
  },
];

export const helplines = [
  { name: "Kisan Call Centre (Central)", number: "1800-180-1551" },
  { name: "PM-KISAN Helpline", number: "155261 / 011-24300606" },
  { name: "PMFBY Toll Free", number: "1800-200-7710" },
  { name: "Maharashtra Krishi Helpline", number: "1800-233-4000" },
  { name: "MEDA Solar Pump Helpline", number: "020-25675600" },
];

export const stateContacts = [
  { state: "Maharashtra", office: "Commissionerate of Agriculture, Pune", phone: "020-25531276" },
  { state: "Central", office: "Ministry of Agriculture & Farmers Welfare, Krishi Bhavan, New Delhi", phone: "011-23382651" },
  { state: "Gujarat", office: "Directorate of Agriculture, Gandhinagar", phone: "079-23256075" },
  { state: "Karnataka", office: "Directorate of Agriculture, Bengaluru", phone: "080-22210237" },
];