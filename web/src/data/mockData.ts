export const sampleEvents = [
  {
    id: "campfire-stories",
    title: "Campfire Stories & S'mores Night",
    summary: "Guided campfire stories with local historians, craft marshmallow bar, and stargazing walk.",
    description:
      "Join our rangers for a cozy night around the fire. Tickets include gourmet s'mores bar, guided stories, and a short stargazing hike.",
    startDate: "2024-07-12",
    endDate: "2024-07-14",
    heroImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60",
    featured: true,
    ctaLabel: "Reserve for this weekend",
    tags: ["family", "food", "night"],
  },
  {
    id: "lakefront-yoga",
    title: "Sunrise Lakefront Yoga",
    summary: "Morning flow with lake breeze, pour-over coffee, and healthy bites.",
    description:
      "Start your day with a gentle flow overlooking the lake. Bring your mat or borrow one of ours.",
    startDate: "2024-08-02",
    endDate: "2024-08-04",
    heroImageUrl: "https://images.unsplash.com/photo-1505483531331-3072be41ff82?auto=format&fit=crop&w=1200&q=60",
    featured: false,
    ctaLabel: "Book sunrise slots",
    tags: ["wellness", "sunrise"],
  },
  {
    id: "fall-harvest",
    title: "Fall Harvest Weekend",
    summary: "Pumpkin carving, cider flights, artisan market, and live folk music.",
    description:
      "Celebrate the season with local makers, hay rides, and evening concerts by the pavilion.",
    startDate: "2024-10-10",
    endDate: "2024-10-13",
    heroImageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=60",
    featured: true,
    ctaLabel: "Plan your harvest stay",
    tags: ["seasonal", "music", "market"],
  },
];

export const sampleDeals = [
  {
    id: "midweek-saver",
    title: "Midweek Saver",
    description: "Stay 3 nights Sun–Thu and save 20% on site fees.",
    discountPercent: 20,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    code: "MIDWEEK20",
    featured: true,
    badge: "Hot",
  },
  {
    id: "new-rigs",
    title: "New Rig Welcome",
    description: "$30 off your first RV stay when you try Camp Everyday.",
    fixedAmountCents: 3000,
    startDate: "2024-06-01",
    endDate: "2024-12-31",
    code: "NEWRIG30",
    featured: false,
    badge: "RV",
  },
  {
    id: "pet-pass",
    title: "Pet Pass Included",
    description: "Pets stay free on select pet-friendly sites.",
    startDate: "2024-07-01",
    endDate: "2024-09-01",
    code: "PETSPLAY",
    featured: true,
    badge: "Pets",
  },
];

export const siteTypes = [
  {
    id: "rv-fhu",
    name: "RV Full Hookup",
    description: "50/30/20A • Water • Sewer • Pull-through and back-in options",
    capacity: 8,
    length: "45ft",
    price: "$86",
    perks: ["Fast Wi-Fi", "Shade trees", "Sewer hookups"],
  },
  {
    id: "glamping",
    name: "Glamping Tents",
    description: "Canvas tents with beds, power, mini-fridge, and deck chairs",
    capacity: 4,
    length: "N/A",
    price: "$142",
    perks: ["Heated blankets", "Coffee kit", "Fire pit"],
  },
  {
    id: "cabins",
    name: "Waterfront Cabins",
    description: "1–2 bedroom cabins with kitchenettes and river views",
    capacity: 6,
    length: "N/A",
    price: "$210",
    perks: ["AC/Heat", "Full bath", "Deck"],
  },
];

export const featuredSites = [
  {
    id: "maple-7",
    title: "Maple Loop 7",
    type: "RV Full Hookup",
    price: "$92",
    electric: "50/30A",
    length: "44ft",
    petFriendly: true,
    note: "Quiet back-in with cedar shade",
  },
  {
    id: "cedar-2",
    title: "Cedar Ridge 2",
    type: "Glamping",
    price: "$158",
    electric: "30A",
    length: "N/A",
    petFriendly: false,
    note: "Deck with lake sunrise",
  },
  {
    id: "river-10",
    title: "River Run 10",
    type: "Cabin",
    price: "$236",
    electric: "Full power",
    length: "N/A",
    petFriendly: true,
    note: "Two-bedroom with fire table",
  },
];

export const faqs = [
  {
    q: "Can I book without creating an account?",
    a: "Yes. You'll get a magic link to manage your stay, and you can optionally save your rig and traveler details for faster checkout next time.",
  },
  {
    q: "How do cancellations work?",
    a: "Policies are set per-campground. You'll see the exact refund window and fees before you confirm your booking.",
  },
  {
    q: "Do you support back-to-back arrivals?",
    a: "Yes, unless the site requires a buffer day. We'll show real-time eligibility during checkout.",
  },
];
