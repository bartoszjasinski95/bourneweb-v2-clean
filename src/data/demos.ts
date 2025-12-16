export type Demo = {
  slug: string;
  title: string;
  industry: string;
  summary: string;
  highlights: string[];
  stack: string;
  goal: string;
  active: boolean;
  demoHref: string;
};

export const demos: Demo[] = [
  {
    slug: "local-barber-booking-site",
    title: "Westcliff Barber · Booking Demo",
    industry: "Barber booking",
    summary: "Local barber booking demo (self-contained).",
    highlights: ["High-end hero", "Services grid hover animation", "Mobile/desktop preview"],
    stack: "Astro + Tailwind",
    goal: "Bookings",
    active: true,
    demoHref: "/projects/local-barber-booking-site",
  },
  {
  title: "Clinic Appointment Site",
  industry: "Clinic",
  slug: "clinic-appointment-site",
  summary: "Clinic demo focused on trust, services, and a frictionless appointment flow.",
  highlights: ["Appointment CTA", "Services layout", "Clinician profiles", "FAQ + reviews"],
  stack: "Astro · Tailwind · Local CSS",
  goal: "More appointments",
  active: true,
  demoHref: "/projects/clinic-appointment-site",
  },
  {
    slug: "electrical-emergency-site",
    title: "SparkForge Electrical",
    industry: "Electrical",
    summary: "Neon, zero ściemy — emergency call-outs + EV chargers + pricing, demo z pazurem na konwersję.",
    highlights: ["Call 24/7", "EV chargers", "Service areas", "Get quote"],
    stack: "Astro + CSS",
    goal: "More quotes",
    active: true,
    demoHref: "/projects/electrical-emergency-site",
  },

  {
  slug: "local-restaurant-dining-site",
  title: "Harbour & Hearth",
  industry: "Restaurant",
  summary: "Menu, reservations, reviews — a warm dining demo with a totally different design system.",
  highlights: ["Reservations", "Menu", "Reviews", "Local vibe"],
  stack: "Astro + Tailwind",
  goal: "More covers",
  active: true,
  demoHref: "/projects/local-restaurant-dining-site",
},


];
