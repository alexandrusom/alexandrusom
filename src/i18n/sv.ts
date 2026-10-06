// All Swedish text on the site. Must have the same shape as en.ts.
// Swedish headings use sentence case (only the first word capitalised), which reads naturally in Swedish.

import type { RangeField } from "@calc";
import type { Dictionary } from "./en";

const fieldNames: Record<RangeField, string> = {
  age: "ålder",
  heightCm: "längd",
  weightKg: "nuvarande vikt",
  goalWeightKg: "målvikt",
  weeks: "tidsram",
};

export const sv: Dictionary = {
  meta: {
    title: "Alexandru Som | Personlig träning & kostcoaching",
    description:
      "Evidensbaserad personlig träning och kostcoaching. Hitta ditt dagliga kalorimål och få en plan byggd kring ditt liv.",
    calculatorTitle: "Kaloriräknare | Alexandru Som",
    privacyTitle: "Integritetspolicy | Alexandru Som",
    bookingTitle: "Boka konsultation | Alexandru Som",
  },

  bookCta: "Boka en konsultation",

  navbar: {
    brand: "Bättre än igår",
    calculator: "Testa ditt kaloriintag",
    free: "Gratis",
    book: "Boka konsultation",
    bookShort: "Boka",
    about: "Om Alexandru",
    openMenu: "Öppna meny",
    closeMenu: "Stäng meny",
    language: "Språk",
  },

  footer: {
    links: [
      { label: "Coaching", path: "/#coaching" },
      { label: "Så funkar det", path: "/#how-it-works" },
      { label: "Om mig", path: "/#about" },
      { label: "Kaloriräknare", path: "/calculator/" },
    ],
    tagline: "Personlig träning & kostcoaching",
    privacy: "Integritetspolicy",
    rights: "Alla rättigheter förbehållna.",
  },

  hero: {
    lead: "Ja, AI kan ta fram din kostplan.",
    title: "Men den kan inte förstå dig som jag gör.",
    subtitle:
      "AI märker inte när veckan rasar ihop, när motivationen sviktar eller när framstegen står still. Det gör jag, och jag justerar din plan längs hela vägen.",
    highlight: "Lita på mig, du kommer att nå dit.",
    primaryCta: "Testa att räkna dina kalorier",
    reassurance: ["Plan byggd kring dig", "Justeras när du utvecklas", "Riktigt mänskligt stöd"],
  },

  programs: {
    eyebrow: "Träningsprogram",
    title: "Träningsprogram",
    comingSoon: "Kommer snart",
    teaser: "Mina träningsprogram är på väg. Vill du vara först i kön?",
    notifyCta: "Meddela mig",
    newTag: "Ny",
    goal: "Mål",
    level: "Nivå",
    items: [
      { name: "Lean Foundations", goal: "Fettförbränning", level: "Nybörjare" },
      { name: "Build & Grow", goal: "Muskler", level: "Medel" },
      { name: "Strength Base", goal: "Styrka", level: "Alla nivåer" },
      { name: "Stage Ready", goal: "Fysik", level: "Avancerad" },
    ],
  },

  coaching: {
    eyebrow: "Coaching",
    title: "Personlig coaching, byggd kring dig",
    tag: "Alltid personligt",
    name: "Personlig coaching",
    description:
      "Varje resa börjar med en konsultation där jag lär känna dig: dina mål, din vardag och vad som har fungerat och inte fungerat tidigare. Utifrån det bygger jag en plan som känns naturlig att följa, så att det blir enkelt att hålla sig till den.",
    cta: "Boka din konsultation",
    includedLabel: "Det här ingår",
    optionalTag: "Tillval",
    included: [
      { optional: false, title: "Skräddarsydd kost", body: "En kostplan byggd kring ditt mål, din smak och din vardag." },
      { optional: false, title: "Veckovisa avstämningar", body: "Varje vecka går vi igenom dina framsteg och justerar planen så att du fortsätter framåt." },
      { optional: false, title: "Support via WhatsApp", body: "Frågor mellan avstämningarna? Skriv direkt till mig och få ett riktigt svar." },
      { optional: false, title: "Träningstips", body: "Vägledning kring teknik, progression och hur du får ut mer av varje pass." },
      { optional: true, title: "Personlig träning", body: "Ingår inte från början men går att lägga till: träna tillsammans med mig för praktisk coaching och peppning på plats." },
    ],
  },

  howItWorks: {
    eyebrow: "Så funkar det",
    steps: [
      { title: "Boka en konsultation", body: "Fyll i formuläret så ringer jag upp dig. Vi går igenom dina mål, din bakgrund och ditt schema." },
      { title: "Få din plan", body: "Du får tränings- och kostmål som är utformade kring dig." },
      { title: "Följ upp & utvecklas", body: "Vi går igenom dina framsteg regelbundet och finjusterar så att du fortsätter framåt." },
    ],
  },

  about: {
    title: "Hej, jag heter Alexandru.",
    paragraphs: [
      "Du har förmodligen sett mig på gymmet. Jag är han som är där i timmar, pratar med alla, stretchar, kör övningar med gummiband eller står svettig på trappmaskinen. Jag älskar hälsa, jag älskar gymmet och jag älskar friheten det ger mig.",
      "Jag började tävla i bodybuilding som 18-åring, utan några prestationshöjande preparat. Sedan fick jag artros i ung ålder, fick opereras i höften och kunde plötsligt inte träna alls. Att förlora det lärde mig vad som verkligen betyder något: i dag älskar jag inte bara gymmet, jag sätter hälsan först.",
      "Jag är inte din typiska gymbro, men jag har varit en. Nu lägger jag min fritid på att lära mig allt jag kan om hälsa, från kost och återhämtning till peptider och nya träningsupplägg. Det finns alltid något nytt att lära sig och något nytt att testa.",
      "Tre tävlingar i Men's Physique, alla helt naturligt. Längs vägen har jag coachat vänner och familj, och nu tar jag steget till att coacha professionellt. Jag vet att jag har det som krävs för att ta dig till ditt mål.",
    ],
    closing: "Så låt mig hjälpa dig.",
  },

  results: {
    eyebrow: "Resultat",
    title: "Personer jag har coachat",
    before: "Före",
    after: "Efter",
    upcoming: 2,
    comingSoon: "Kommer snart",
    comingSoonBody: "Fler resultat kommer snart",
    prev: "Föregående resultat",
    nextPhoto: "Visa nästa bild",
    next: "Nästa resultat",
    items: [
      {
        name: "J.T., 40 år",
        beforeValue: "59 kg",
        afterValue: "53 kg",
        change: "−6 kg",
        quote:
          "Det finns coacher som ger dig ett schema, och så finns det coacher som ger dig verktygen att förändra ditt liv. Alex är det sistnämnda. Flera månader efter avslutat samarbete så håller målvikten samtidigt som den nya kosten är implementerad i en vardag som fungerar.",
        headline: "Redan vältränad. Nu ännu mer.",
        photos: {
          before: "/images/results/client-1-before.jpg",
          after: ["/images/results/client-1-after.jpg", "/images/results/client-1-flex.jpg"],
        },
      },
      {
        name: "J.N., 22 år",
        quote:
          "Alex gjorde hela resan så mycket enklare och roligare. Alex justerade planen varje vecka, svarade på alla mina frågor och höll mig på banan när motivationen svek. 20 veckor senare är jag 15 kilo lättare och mår bättre än någonsin.",
        beforeValue: "90 kg",
        afterValue: "75 kg",
        change: "−15 kg",
        headline: "15 kilo ner på 20 veckor.",
        photos: {
          before: "/images/results/client-2-before.jpg",
          after: ["/images/results/client-2-after.jpg"],
        },
      },
    ],
  },

  finalCta: {
    title: "Redo att börja?",
    body: "Boka en konsultation så bygger vi en plan som tar dig till ditt mål, och du kommer att må bättre än någonsin.",
  },

  booking: {
    eyebrow: "Boka konsultation",
    title: "Låt oss prata om ditt mål",
    intro: "Fyll i dina uppgifter så ringer jag upp dig inom 24 timmar. Konsultationen är ett samtal där jag lär känna dig, dina mål och din vardag.",
    topicQuestion: "Vad vill du uppnå?",
    topics: {
      fat_loss: "Gå ner i fett",
      muscle: "Bygga muskler",
      health: "Må bättre & hälsa",
      programs: "Träningsprogram",
      other: "Något annat",
    },
    message: "Berätta gärna mer (valfritt)",
    consent:
      "Jag godkänner att Alexandru Som sparar mitt namn, mitt telefonnummer och det jag skriver här för att kontakta mig om coaching. Jag kan när som helst be om att mina uppgifter raderas.",
    submit: "Ring upp mig",
    sending: "Skickar…",
    successTitle: "Tack! Jag ringer upp dig inom 24 timmar.",
    successBody: "Håll utkik efter ett samtal från mig. Under tiden kan du testa ditt kaloriintag.",
    successCta: "Testa ditt kaloriintag",
    errors: {
      topic: "Välj vad du vill uppnå.",
    },
  },

  units: { week: "vecka", weeks: "veckor", perWeek: "/vecka" },

  calculator: {
    eyebrow: "Kaloriräknare",
    title: "Hitta ditt dagliga kalorimål",
    intro: "Fyll i dina uppgifter och ditt mål. Du får ett dagligt kalorimål som är hälsosamt och realistiskt, aldrig en kraschdiet.",
    disclaimer:
      "Uträkningen bygger på Mifflin-St Jeor-formeln. Det verkliga behovet varierar med ungefär ±10 %, så målet bör justeras utifrån dina framsteg. Detta är inte medicinsk rådgivning; har du ett medicinskt tillstånd, rådgör först med din läkare.",

    form: {
      title: "Dina uppgifter",
      units: "Enheter",
      sex: "Kön",
      sexHint: "Används i kaloriformeln",
      male: "Man",
      female: "Kvinna",
      age: "Ålder",
      years: "år",
      height: "Längd",
      feet: "Fot",
      inches: "Tum",
      weight: "Nuvarande vikt",
      goalWeight: "Målvikt",
      timeframe: "Tidsram",
      weeks: "veckor",
      activity: "Aktivitetsnivå",
      activityPlaceholder: "Välj din aktivitetsnivå",
      submit: "Räkna ut mina kalorier",
    },

    activity: {
      sedentary: { label: "Stillasittande", description: "Kontorsjobb, lite eller ingen träning" },
      light: { label: "Lätt aktiv", description: "Tränar 1–3 dagar i veckan" },
      moderate: { label: "Måttligt aktiv", description: "Tränar 3–5 dagar i veckan" },
      active: { label: "Mycket aktiv", description: "Tränar 6–7 dagar i veckan" },
      very_active: { label: "Extremt aktiv", description: "Fysiskt jobb plus daglig träning" },
    },

    incomplete: { title: "Några uppgifter saknas", body: "Fyll i alla fält för att se ditt dagliga kalorimål." },

    result: {
      label: "Ditt dagliga kalorimål",
      notRecommended: "Rekommenderas inte",
      perDay: "kcal / dag",
      maintainPrefix: "för att behålla",
      fromPrefix: "för att gå från",
      to: "till",
      in: "på",
      maintenance: "Underhåll",
      deficit: "Dagligt underskott",
      surplus: "Dagligt överskott",
      pace: "Takt",
    },

    issue(issue, f, units) {
      switch (issue.code) {
        case "under_18":
          return {
            title: "Den här räknaren är för vuxna",
            body: "Är du under 18 växer din kropp fortfarande, så prata med en förälder eller läkare innan du ändrar hur du äter.",
          };
        case "out_of_range":
          return {
            title: `Kontrollera din ${fieldNames[issue.field]}`,
            body: `Den ska vara mellan ${f.limit(issue.field, issue.min, units)} och ${f.limit(issue.field, issue.max, units)}.`,
          };
        case "goal_below_healthy_bmi":
          return {
            title: "Den målvikten är under ett hälsosamt intervall",
            body: `För din längd är den lägsta hälsosamma vikten runt ${f.weight(issue.minHealthyWeightKg, units, 0)}. Att gå lägre kostar dig energi, styrka och hälsa, och det är inget mål jag hjälper dig att jaga.`,
          };
        case "below_medical_minimum":
          return {
            title: "Det här målet går inte att nå säkert",
            body: `För att nå ditt mål på den här tiden skulle du behöva äta under ${f.kcal(issue.medicalMinimum)} kcal om dagen. Det är en nivå som bara ska användas under medicinsk övervakning, så jag visar ingen siffra för det. Prata med mig så hittar vi ett upplägg som faktiskt fungerar.`,
          };
      }
    },

    useHealthyMin: (goal) => `Använd ${goal} som mitt mål`,


    lead: {
      intro: {
        none: {
          title: "Ja, räknaren har räknat ut dina kalorier. Men vad är nästa steg?",
          body: "En siffra tar dig inte hela vägen. Det som gör det är en plan byggd kring ditt liv och någon som justerar den längs vägen. Lämna ditt namn och nummer så ringer jag upp dig.",
        },
        ambitious: {
          title: "Ja, räknaren har räknat ut dina kalorier. Men målet är ambitiöst.",
          body: "Det går att nå, men i den här takten krävs rätt plan för att du ska behålla muskler, ork och motivation längs vägen. Lämna ditt namn och nummer så ringer jag upp dig.",
        },
        dangerous: {
          title: "Ja, räknaren har räknat ut dina kalorier. Men den här takten rekommenderas inte.",
          body: "Att försöka nå målet så här snabbt på egen hand kan göra mer skada än nytta. Låt oss istället hitta ett upplägg som tar dig dit på ett sätt som håller. Lämna ditt namn och nummer så ringer jag upp dig.",
        },
      },
      name: "Namn",
      phone: "Telefonnummer",
      consent:
        "Jag godkänner att Alexandru Som sparar mitt namn, mitt telefonnummer och mina svar i räknaren för att kontakta mig om coaching. Jag kan när som helst be om att mina uppgifter raderas.",
      privacy: "Integritetspolicy",
      submit: "Kontakta mig",
      sending: "Skickar…",
      errors: {
        name: "Fyll i ditt namn.",
        phone: "Fyll i ett giltigt telefonnummer.",
        consent: "Kryssa i rutan så att jag får kontakta dig.",
        generic: "Något gick fel. Försök igen om en stund.",
        notConnected: "Formuläret är inte kopplat än. Försök igen senare.",
      },
    },

    pitch: {
      thanks: "Tack, jag ringer upp dig inom 24 timmar",
      title: "Att känna till ditt mål är första steget.",
      body: "Att nå det vecka efter vecka är där de flesta tappar. Det är där jag kommer in. Med min coaching får du:",
      points: [
        "Ett träningsprogram byggt för ditt mål, ditt schema och din utrustning",
        "Kost som passar ditt liv: inga förbjudna livsmedel, inga kraschdieter",
        "Avstämningar där vi justerar dina kalorier när kroppen förändras",
        "Direkt kontakt med mig på WhatsApp när du behöver",
      ],
      closing: "Du kommer att nå dit, och du kommer att må bättre än någonsin på vägen.",
    },
  },

  privacy: {
    title: "Integritetspolicy",
    contactPlaceholder: "[din kontaktmejl]",
    sections: (name, contact) => [
      {
        heading: "Vem jag är",
        body: `Den här webbplatsen drivs av ${name}, personlig tränare och hälsocoach. Du kan kontakta mig om dina uppgifter på ${contact}.`,
      },
      {
        heading: "Vad jag samlar in",
        body: "Kaloriräknaren körs i din webbläsare och inget skickas någonstans om du inte själv väljer att lämna dina uppgifter. Gör du det sparar jag ditt namn, ditt telefonnummer, svaren du gav i räknaren (kön, ålder, längd, vikt, målvikt, tidsram och aktivitetsnivå) och ditt resultat. Om du använder bokningsformuläret sparar jag ditt namn, ditt telefonnummer, vad du vill uppnå och det du skriver.",
      },
      {
        heading: "Varför",
        body: "För att kontakta dig personligen om coaching, med ditt samtycke. Jag säljer eller delar inte dina uppgifter med någon för marknadsföring.",
      },
      {
        heading: "Var de sparas",
        body: "Dina uppgifter lagras säkert hos min databasleverantör Supabase.",
      },
      { heading: "Hur länge", body: "Tills du ber mig radera dem, eller högst 24 månader efter vår senaste kontakt." },
      {
        heading: "Dina rättigheter",
        body: `Du kan när som helst be att få se, rätta eller radera dina uppgifter, eller återkalla ditt samtycke, genom att mejla ${contact}. Du har också rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY).`,
      },
    ],
  },
};
