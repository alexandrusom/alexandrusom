// Site settings that are the same in every language.
// All text lives in src/i18n/sv.ts (Swedish) and src/i18n/en.ts (English).
// Lines marked TODO need your real details before launch.

export const site = {
  name: "Alexandru Som",


  // Supabase function that saves calculator leads (see README → Supabase)
  leadEndpoint: "https://cmbrupeqoseswqovwarz.supabase.co/functions/v1/submit-lead",
  // Supabase function that saves consultation requests from the booking page
  contactEndpoint: "https://cmbrupeqoseswqovwarz.supabase.co/functions/v1/submit-contact",

  // Hero background videos, played in this order and then repeated. Files live in /public/videos.
  heroVideos: ["/videos/hero-1.mp4", "/videos/hero-2.mp4", "/videos/hero-3.mp4"],

  // TODO: drop photos into /public/images and set the paths, e.g. "/images/about.jpg".
  photos: {
    about: "/images/about.jpg",
  },

  // TODO: add your profile links, or leave empty to hide them.
  socials: [
    { label: "Instagram", href: "" },
    { label: "TikTok", href: "" },
    { label: "YouTube", href: "" },
  ],

  // TODO: contact email for privacy requests.
  contactEmail: "",
};
