// All English text on the site. The Swedish version (sv.ts) must have the same shape.

import type { ActivityLevel, Issue, RangeField, Risk } from "@calc";
import type { Formatter, Units } from "@/lib/format";

export type Topic = "fat_loss" | "muscle" | "health" | "programs" | "other";

const fieldNames: Record<RangeField, string> = {
  age: "age",
  heightCm: "height",
  weightKg: "current weight",
  goalWeightKg: "goal weight",
  weeks: "timeframe",
};

export const en = {
  meta: {
    title: "Alexandru Som | Personal Training & Nutrition Coaching",
    description:
      "Evidence-based personal training and nutrition coaching. Find your daily calorie target and get a plan built around your life.",
    calculatorTitle: "Calorie Calculator | Alexandru Som",
    privacyTitle: "Privacy Policy | Alexandru Som",
    bookingTitle: "Book a Consultation | Alexandru Som",
  },

  bookCta: "Book a consultation",

  // Navbar, in this order: free first step → main action → trust.
  navbar: {
    brand: "Better than yesterday",
    calculator: "Test your caloric intake",
    free: "Free",
    book: "Book consultation",
    bookShort: "Book",
    about: "About Alexandru",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },

  footer: {
    links: [
      { label: "Coaching", path: "/#coaching" },
      { label: "How it works", path: "/#how-it-works" },
      { label: "About", path: "/#about" },
      { label: "Calorie calculator", path: "/calculator/" },
    ],
    tagline: "Personal training & nutrition coaching",
    privacy: "Privacy policy",
    rights: "All rights reserved.",
  },

  // Hero box: name the free alternative (AI), then say what only a real coach gives you.
  hero: {
    lead: "Yes, AI can generate your diet.",
    title: "But It Can't Understand You Like I Do.",
    subtitle:
      "AI doesn't notice when your week falls apart, when motivation dips or when progress stalls. I do, and I adjust your plan every step of the way.",
    highlight: "Trust me, you will get there.",
    primaryCta: "Try counting your calories",
    reassurance: ["Plan built around you", "Adjusted as you progress", "Real human support"],
  },

  // Shown blurred behind "Coming soon" until they launch. TODO: replace the placeholder programs.
  programs: {
    eyebrow: "Training programs",
    title: "Training Programs",
    comingSoon: "Coming soon",
    teaser: "My training programs are on the way. Want to be first in line?",
    notifyCta: "Notify me",
    newTag: "New",
    goal: "Goal",
    level: "Level",
    items: [
      { name: "Lean Foundations", goal: "Fat loss", level: "Beginner" },
      { name: "Build & Grow", goal: "Muscle", level: "Intermediate" },
      { name: "Strength Base", goal: "Strength", level: "All levels" },
      { name: "Stage Ready", goal: "Physique", level: "Advanced" },
    ],
  },

  // One personalised offer: always starts with a consultation
  coaching: {
    eyebrow: "Coaching",
    title: "Personal Coaching, Built Around You",
    tag: "Always personalised",
    name: "Personal Coaching",
    description:
      "Every journey starts with a consultation where I get to know you: your goals, your daily life and what has or hasn't worked before. From there I build a plan that feels natural to follow, so sticking to it becomes the easy part.",
    cta: "Book your consultation",
    includedLabel: "What's included",
    optionalTag: "Optional add-on",
    included: [
      { optional: false, title: "Custom Diet", body: "A nutrition plan built around your goal, your preferences and your everyday life." },
      { optional: false, title: "Weekly Check-Ins", body: "Every week we review your progress and adjust the plan so you keep moving forward." },
      { optional: false, title: "WhatsApp Support", body: "Questions between check-ins? Message me directly and get a real answer." },
      { optional: false, title: "Training Tips", body: "Guidance on technique, progression and getting more out of every session." },
      { optional: true, title: "Personal Training", body: "Not included by default, but available: train together with me for hands-on coaching and accountability." },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    steps: [
      { title: "Book a Consultation", body: "Fill in the form and I'll call you. We talk through your goals, history and schedule." },
      { title: "Get Your Plan", body: "You receive training and nutrition targets designed around you." },
      { title: "Check In & Progress", body: "We review progress regularly and fine-tune so you keep moving forward." },
    ],
  },

  about: {
    title: "Hi, I'm Alexandru.",
    paragraphs: [
      "You've probably seen me at the gym. I'm the one who's there for hours, chatting with everyone, stretching, doing banded exercises or grinding away on the StairMaster. I love health, I love the gym, and I love the freedom it gives me.",
      "I started competing in bodybuilding at 18, without any performance-enhancing drugs. Then, at a young age, I developed arthritis, had to have hip surgery and suddenly couldn't train at all. Losing that taught me what really matters: today I don't just love the gym, I put health first.",
      "I'm not your typical gym bro, but I've been one. Now I spend my free time learning everything I can about health, from nutrition and recovery to peptides and new training approaches. There's always something new to learn and something new to try.",
      "Three Men's Physique shows, all completely natural. Along the way I've coached friends and family, and now I'm taking the step to coaching professionally. I know I have what it takes to get you to your goal.",
    ],
    closing: "So let me.",
  },

  // People you've coached. Only add someone with their written permission. Photos live in /public/images/results.
  results: {
    eyebrow: "Results",
    title: "People I've Coached",
    before: "Before",
    after: "After",
    // Placeholder slots shown until more people are added (set to 0 to hide them)
    upcoming: 2,
    comingSoon: "Coming soon",
    comingSoonBody: "More results coming soon",
    prev: "Previous result",
    nextPhoto: "Show next photo",
    next: "Next result",
    items: [
      {
        name: "J.T., 40",
        beforeValue: "59 kg",
        afterValue: "53 kg",
        change: "−6 kg",
        // Translated from her original Swedish quote
        quote:
          "There are coaches who give you a schedule, and then there are coaches who give you the tools to change your life. Alex is the latter. Months after we finished working together, my goal weight is holding, and the new way of eating has become part of an everyday life that works.",
        headline: "Already fit. Now even fitter.",
        photos: {
          before: "/images/results/client-1-before.jpg",
          after: ["/images/results/client-1-after.jpg", "/images/results/client-1-flex.jpg"],
        },
      },
      {
        name: "J.N., 22",
        quote:
          "Alex made the whole journey so much easier and more enjoyable. Alex adjusted the plan every week, answered all my questions and kept me on track when my motivation dipped. 20 weeks later I'm 15 kilos lighter and feel better than ever.",
        beforeValue: "90 kg",
        afterValue: "75 kg",
        change: "−15 kg",
        headline: "15 kilos down in 20 weeks.",
        photos: {
          before: "/images/results/client-2-before.jpg",
          after: ["/images/results/client-2-after.jpg"],
        },
      },
    ] as {
      name: string;
      beforeValue: string;
      afterValue: string;
      change: string;
      quote?: string;
      headline: string;
      /** One before photo; one or more after photos (click to switch) */
      photos: { before: string; after: string[] };
    }[],
  },

  finalCta: {
    title: "Ready to Start?",
    body: "Book a consultation and let's build a plan that gets you to your goal, feeling better than ever.",
  },

  // Booking page (/en/book/): every "Book a consultation" button leads here
  booking: {
    eyebrow: "Book a consultation",
    title: "Let's Talk About Your Goal",
    intro: "Fill in your details and I'll call you within 24 hours. The consultation is a conversation where I get to know you, your goals and your everyday life.",
    topicQuestion: "What do you want to achieve?",
    topics: {
      fat_loss: "Lose fat",
      muscle: "Build muscle",
      health: "Health & wellbeing",
      programs: "Training programs",
      other: "Something else",
    } as Record<Topic, string>,
    message: "Tell me more (optional)",
    consent:
      "I agree that Alexandru Som may store my name, phone number and what I write here to contact me about coaching. I can ask for my data to be deleted at any time.",
    submit: "Call me back",
    sending: "Sending…",
    successTitle: "Thanks! I'll call you within 24 hours.",
    successBody: "Keep an eye on your phone. In the meantime, why not test your calorie intake?",
    successCta: "Test your caloric intake",
    errors: {
      topic: "Please choose what you want to achieve.",
    },
  },

  units: { week: "week", weeks: "weeks", perWeek: "/week" },

  calculator: {
    eyebrow: "Calorie calculator",
    title: "Find Your Daily Calorie Target",
    intro: "Enter your details and goal. You'll get a daily calorie target that's healthy and realistic, never a crash diet.",
    disclaimer:
      "Estimates use the Mifflin-St Jeor equation. Real needs vary by about ±10%, so targets should be adjusted based on your progress. This is not medical advice; if you have a medical condition, check with your doctor first.",

    form: {
      title: "Your Details",
      units: "Units",
      sex: "Sex",
      sexHint: "Used in the calorie formula",
      male: "Male",
      female: "Female",
      age: "Age",
      years: "years",
      height: "Height",
      feet: "Feet",
      inches: "Inches",
      weight: "Current weight",
      goalWeight: "Goal weight",
      timeframe: "Timeframe",
      weeks: "weeks",
      activity: "Activity level",
      activityPlaceholder: "Choose your activity level",
      submit: "Calculate my calories",
    },

    activity: {
      sedentary: { label: "Sedentary", description: "Desk job, little or no exercise" },
      light: { label: "Lightly active", description: "Training 1–3 days a week" },
      moderate: { label: "Moderately active", description: "Training 3–5 days a week" },
      active: { label: "Very active", description: "Training 6–7 days a week" },
      very_active: { label: "Extremely active", description: "Physical job plus daily training" },
    } as Record<ActivityLevel, { label: string; description: string }>,

    incomplete: { title: "A few details are missing", body: "Fill in every field to see your daily calorie target." },

    result: {
      label: "Your daily calorie target",
      notRecommended: "Not recommended",
      perDay: "kcal / day",
      maintainPrefix: "to maintain",
      fromPrefix: "to go from",
      to: "to",
      in: "in",
      maintenance: "Maintenance",
      deficit: "Daily deficit",
      surplus: "Daily surplus",
      pace: "Pace",
    },

    // Messages when there's no number to show. The numbers are filled in automatically.
    issue(issue: Issue, f: Formatter, units: Units): { title: string; body: string } {
      switch (issue.code) {
        case "under_18":
          return {
            title: "This calculator is for adults",
            body: "If you're under 18, your body is still growing, so please talk to a parent or doctor before changing how you eat.",
          };
        case "out_of_range":
          return {
            title: `Please check your ${fieldNames[issue.field]}`,
            body: `It should be between ${f.limit(issue.field, issue.min, units)} and ${f.limit(issue.field, issue.max, units)}.`,
          };
        case "goal_below_healthy_bmi":
          return {
            title: "That goal weight is below a healthy range",
            body: `For your height, the lowest healthy weight is around ${f.weight(issue.minHealthyWeightKg, units, 0)}. Going lower costs you energy, strength and health, and that's not a goal I'll help you chase.`,
          };
        case "below_medical_minimum":
          return {
            title: "This goal can't be reached safely",
            body: `Reaching your goal in this time would mean eating less than ${f.kcal(issue.medicalMinimum)} kcal a day. That's a level that should only be used under medical supervision, so I won't show a number for it. Talk to me and we'll find a plan that actually works.`,
          };
      }
    },

    useHealthyMin: (goal: string) => `Use ${goal} as my goal`,


    lead: {
      // Heading and text change with how aggressive the goal is
      intro: {
        none: {
          title: "Yes, the Calculator Counted Your Calories. But What's the Next Step?",
          body: "A number alone won't get you there. What will is a plan built around your life, and someone who adjusts it as you go. Leave your name and number and I'll call you.",
        },
        ambitious: {
          title: "Yes, the Calculator Counted Your Calories. But This Goal Is Ambitious.",
          body: "It's reachable, but at this pace you need the right plan to keep your muscle, energy and motivation along the way. Leave your name and number and I'll call you.",
        },
        dangerous: {
          title: "Yes, the Calculator Counted Your Calories. But This Pace Isn't Recommended.",
          body: "Trying to reach your goal this fast on your own can do more harm than good. Let's find a plan that gets you there in a way that lasts. Leave your name and number and I'll call you.",
        },
      } as Record<Risk, { title: string; body: string }>,
      name: "Name",
      phone: "Phone number",
      consent:
        "I agree that Alexandru Som may store my name, phone number and calculator answers to contact me about coaching. I can ask for my data to be deleted at any time.",
      privacy: "Privacy policy",
      submit: "Contact me",
      sending: "Sending…",
      errors: {
        name: "Please enter your name.",
        phone: "Please enter a valid phone number.",
        consent: "Please tick the box so I'm allowed to contact you.",
        generic: "Something went wrong. Please try again in a moment.",
        notConnected: "This form isn't connected yet. Please try again later.",
      },
    },

    // Shown after the lead form is submitted
    pitch: {
      thanks: "Thanks, I'll call you within 24 hours",
      title: "Knowing Your Number Is Step One.",
      body: "Hitting it week after week is where most people fall off. That's where I come in. With my coaching you get:",
      points: [
        "A training plan built for your goal, schedule and equipment",
        "Nutrition that fits your life: no banned foods, no crash diets",
        "Check-ins where we adjust your calories as your body changes",
        "Direct access to me on WhatsApp when you need it",
      ],
      closing: "You'll get there, and you'll feel better than ever doing it.",
    },
  },

  // TODO: this is a starting draft. Have it reviewed so it matches how you actually handle data.
  privacy: {
    title: "Privacy Policy",
    contactPlaceholder: "[your contact email]",
    sections: (name: string, contact: string) => [
      {
        heading: "Who I am",
        body: `This website is run by ${name}, a personal trainer and health coach. You can contact me about your data at ${contact}.`,
      },
      {
        heading: "What I collect",
        body: "The calorie calculator runs in your browser, and nothing is sent anywhere unless you choose to leave your details. If you do, I store your name, phone number, the answers you gave the calculator (sex, age, height, weight, goal weight, timeframe and activity level) and your result. If you use the booking form, I store your name, phone number, what you want to achieve and anything you write.",
      },
      {
        heading: "Why",
        body: "To contact you personally about coaching, with your consent. I don't sell or share your data with anyone for marketing.",
      },
      {
        heading: "Where it's stored",
        body: "Your details are stored securely with my database provider, Supabase.",
      },
      { heading: "How long", body: "Until you ask me to delete it, or at most 24 months after our last contact." },
      {
        heading: "Your rights",
        body: `You can ask to see, correct or delete your data, or withdraw your consent, at any time by emailing ${contact}. You also have the right to complain to your local data protection authority.`,
      },
    ],
  },
};

export type Dictionary = typeof en;
