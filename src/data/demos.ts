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
];
