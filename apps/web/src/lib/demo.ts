export function isDemoMode() {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const demoOrg = {
  id: "demo-org",
  role: "owner",
  organization: {
    id: "demo-org",
    name: "Koper Express LLC",
    mc_number: "MC-482910",
    dot_number: "DOT-3392014",
  },
};

export const demoDrivers = [
  {
    id: "drv-1",
    first_name: "Marcus",
    last_name: "Johnson",
    phone: "(214) 555-0182",
    cdl_number: "TX-4829103",
    cdl_expiry: "2027-08-15",
    status: "active",
  },
  {
    id: "drv-2",
    first_name: "Elena",
    last_name: "Ruiz",
    phone: "(469) 555-0294",
    cdl_number: "TX-3392014",
    cdl_expiry: "2026-11-20",
    status: "active",
  },
  {
    id: "drv-3",
    first_name: "James",
    last_name: "Whitfield",
    phone: "(972) 555-0371",
    cdl_number: "TX-7712048",
    cdl_expiry: "2028-03-10",
    status: "active",
  },
];

export const demoTrucks = [
  {
    id: "trk-1",
    unit_number: "101",
    make: "Freightliner",
    model: "Cascadia",
    year: 2022,
    trailer_type: "Dry Van",
    vin: "1FUJGHDV8NLBT4829",
    status: "active",
  },
  {
    id: "trk-2",
    unit_number: "102",
    make: "Kenworth",
    model: "T680",
    year: 2021,
    trailer_type: "Reefer",
    vin: "1XKYD49X2MJ339201",
    status: "active",
  },
  {
    id: "trk-3",
    unit_number: "103",
    make: "Volvo",
    model: "VNL 760",
    year: 2023,
    trailer_type: "Dry Van",
    vin: "4V4NC9EH9PN771204",
    status: "maintenance",
  },
];

export const demoBrokers = [
  {
    id: "brk-1",
    name: "Summit Logistics",
    mc_number: "MC-882104",
    contact_name: "Sarah Chen",
    contact_email: "loads@summitlogistics.com",
    payment_terms: 30,
    total_loads: 24,
    avg_days_to_pay: 28,
  },
  {
    id: "brk-2",
    name: "Heartland Freight",
    mc_number: "MC-441902",
    contact_name: "Mike Torres",
    contact_email: "dispatch@heartlandfreight.com",
    payment_terms: 45,
    total_loads: 18,
    avg_days_to_pay: 41,
  },
  {
    id: "brk-3",
    name: "Atlas Brokerage",
    mc_number: "MC-229018",
    contact_name: "Jen Park",
    contact_email: "jen@atlasbrokerage.com",
    payment_terms: 21,
    total_loads: 31,
    avg_days_to_pay: 19,
  },
];

export const demoFacilities = [
  {
    id: "fac-1",
    name: "Dallas Distribution Center",
    facility_type: "shipper",
    city: "Dallas",
    state: "TX",
    zip: "75201",
    dock_hours: "6am–6pm",
    avg_wait_minutes: 45,
    appointment_required: true,
  },
  {
    id: "fac-2",
    name: "Atlanta Cold Storage",
    facility_type: "receiver",
    city: "Atlanta",
    state: "GA",
    zip: "30303",
    dock_hours: "24/7",
    avg_wait_minutes: 90,
    appointment_required: false,
  },
  {
    id: "fac-3",
    name: "Memphis Crossdock",
    facility_type: "shipper",
    city: "Memphis",
    state: "TN",
    zip: "38103",
    dock_hours: "7am–5pm",
    avg_wait_minutes: 60,
    appointment_required: true,
  },
];

export const demoLoads = [
  {
    id: "demo-1",
    load_number: "LP-2401",
    status: "in_transit",
    rate: 2850,
    commodity: "General freight",
    miles: 780,
    pickup_date: "2026-06-07",
    delivery_date: "2026-06-09",
    brokers: { name: "Summit Logistics" },
    drivers: { first_name: "Marcus", last_name: "Johnson" },
    trucks: { unit_number: "101" },
    reference_number: "SUM-88201",
    weight_lbs: 42000,
    notes: "Driver assigned. ETA delivery Jun 9.",
    created_at: "2026-06-06T14:00:00Z",
  },
  {
    id: "demo-2",
    load_number: "LP-2402",
    status: "dispatched",
    rate: 1940,
    commodity: "Paper products",
    miles: 510,
    pickup_date: "2026-06-08",
    delivery_date: "2026-06-09",
    brokers: { name: "Heartland Freight" },
    drivers: { first_name: "Elena", last_name: "Ruiz" },
    trucks: { unit_number: "102" },
    reference_number: "HL-44102",
    weight_lbs: 38000,
    notes: null,
    created_at: "2026-06-07T09:30:00Z",
  },
  {
    id: "demo-3",
    load_number: "LP-2403",
    status: "booked",
    rate: 3200,
    commodity: "Retail goods",
    miles: 920,
    pickup_date: "2026-06-09",
    delivery_date: "2026-06-11",
    brokers: { name: "Atlas Brokerage" },
    drivers: null,
    trucks: null,
    reference_number: "ATL-22901",
    weight_lbs: 44000,
    notes: "Awaiting driver assignment",
    created_at: "2026-06-08T11:00:00Z",
  },
  {
    id: "demo-4",
    load_number: "LP-2398",
    status: "delivered",
    rate: 2100,
    commodity: "Building materials",
    miles: 340,
    pickup_date: "2026-06-05",
    delivery_date: "2026-06-06",
    brokers: { name: "Summit Logistics" },
    drivers: { first_name: "James", last_name: "Whitfield" },
    trucks: { unit_number: "103" },
    reference_number: "SUM-88198",
    weight_lbs: 45000,
    notes: null,
    created_at: "2026-06-04T16:00:00Z",
  },
  {
    id: "demo-5",
    load_number: "LP-2405",
    status: "available",
    rate: 2650,
    commodity: "Automotive parts",
    miles: 640,
    pickup_date: "2026-06-10",
    delivery_date: "2026-06-11",
    brokers: { name: "Heartland Freight" },
    drivers: null,
    trucks: null,
    reference_number: "HL-44105",
    weight_lbs: 36000,
    notes: "AI parsed from email — ready to book",
    created_at: "2026-06-08T08:00:00Z",
  },
  {
    id: "demo-6",
    load_number: "LP-2406",
    status: "draft",
    rate: 1780,
    commodity: "Food grade",
    miles: 420,
    pickup_date: "2026-06-11",
    delivery_date: "2026-06-12",
    brokers: { name: "Atlas Brokerage" },
    drivers: null,
    trucks: null,
    reference_number: "ATL-22906",
    weight_lbs: 40000,
    notes: "Rate con uploaded — pending review",
    created_at: "2026-06-08T10:15:00Z",
  },
];

export const demoDocuments = [
  {
    id: "doc-1",
    file_name: "LP-2401_rate_con.pdf",
    document_type: "rate_confirmation",
    created_at: "2026-06-06T12:00:00Z",
    scan_status: "completed",
    scan_confidence: 0.94,
    parsed_data: {
      load_number: "LP-2401",
      broker_name: "Summit Logistics",
      rate: 2850,
      pickup_date: "2026-06-07",
      confidence: 0.94,
    },
    loads: { load_number: "LP-2401" },
  },
  {
    id: "doc-2",
    file_name: "LP-2401_BOL.pdf",
    document_type: "bol",
    created_at: "2026-06-07T08:30:00Z",
    loads: { load_number: "LP-2401" },
  },
  {
    id: "doc-3",
    file_name: "LP-2398_POD.jpg",
    document_type: "pod",
    created_at: "2026-06-06T17:00:00Z",
    loads: { load_number: "LP-2398" },
  },
  {
    id: "doc-4",
    file_name: "lumper_receipt_memphis.pdf",
    document_type: "lumper_receipt",
    created_at: "2026-06-05T14:20:00Z",
    loads: { load_number: "LP-2398" },
  },
  {
    id: "doc-5",
    file_name: "LP-2406_rate_con.pdf",
    document_type: "rate_confirmation",
    created_at: "2026-06-08T10:15:00Z",
    loads: null,
  },
];

export const demoClaims = [
  {
    id: "claim-1",
    claim_type: "detention",
    amount: 225,
    status: "submitted",
    load_id: "demo-1",
    created_at: "2026-06-08T09:00:00Z",
    loads: { load_number: "LP-2401" },
  },
  {
    id: "claim-2",
    claim_type: "lumper",
    amount: 85,
    status: "draft",
    load_id: "demo-4",
    created_at: "2026-06-06T18:00:00Z",
    loads: { load_number: "LP-2398" },
  },
  {
    id: "claim-3",
    claim_type: "detention",
    amount: 180,
    status: "submitted",
    load_id: "demo-4",
    created_at: "2026-06-07T10:00:00Z",
    loads: { load_number: "LP-2398" },
  },
  {
    id: "claim-4",
    claim_type: "detention",
    amount: 150,
    status: "paid",
    load_id: "demo-4",
    created_at: "2026-05-28T11:00:00Z",
    loads: { load_number: "LP-2390" },
  },
];

export const demoDashboard = {
  activeLoads: 14,
  totalDrivers: demoDrivers.length,
  totalRevenue: 48200,
  recoverable: demoClaims
    .filter((c) => ["draft", "submitted"].includes(c.status))
    .reduce((s, c) => s + c.amount, 0),
  bookedToday: 3,
  recentLoads: demoLoads.slice(0, 4),
  pendingClaims: demoClaims.filter((c) =>
    ["draft", "submitted"].includes(c.status)
  ),
};

export const demoParsedEmail = {
  load_number: "LP-2407",
  broker_name: "Summit Logistics",
  origin: "Dallas, TX",
  destination: "Atlanta, GA",
  pickup_date: "2026-06-12",
  delivery_date: "2026-06-14",
  rate: 2850,
  commodity: "General freight",
  weight_lbs: 42000,
  confidence: 0.94,
};

export function getDemoLoad(id: string) {
  return demoLoads.find((l) => l.id === id) ?? null;
}

export function getDemoBroker(id: string) {
  return demoBrokers.find((b) => b.id === id) ?? null;
}
