export interface Translations {
  nav: {
    home: string;
    about: string;
    services: string;
    expertise: string;
    careers: string;
    contact: string;
    talkToUs: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    exploreServices: string;
    talkToExperts: string;
    specializedAcross: string;
  };
  marketSlider: {
    badge: string;
    title: string;
    subtitle: string;
    targetMarket: string;
    learnMore: string;
    discussRole: string;
  };
  customerCards: {
    eyebrow: string;
    title: string;
    card1Title: string;
    card1Subtitle: string;
    card1Desc: string;
    card1Cta: string;
    card2Title: string;
    card2Subtitle: string;
    card2Desc: string;
    card2Cta: string;
    card3Title: string;
    card3Subtitle: string;
    card3Desc: string;
    card3Cta: string;
  };
  vistexFeature: {
    badge: string;
    cardTitle: string;
    headline: string;
    description: string;
    cta: string;
  };
}

export const translations: Record<'EN' | 'DE', Translations> = {
  EN: {
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      expertise: 'Expertise',
      careers: 'Careers',
      contact: 'Contact',
      talkToUs: 'Talk to Us',
    },
    hero: {
      eyebrow: 'SAP & VISTEX CONSULTING + TECHNOLOGY STAFFING',
      titleLine1: 'Specialized SAP & Vistex Expertise.',
      titleLine2: 'Built for Your Success.',
      subtitle: 'Nova Sitara connects organizations with experienced SAP and Vistex professionals who help accelerate implementations, enhancements, migrations and application support.',
      exploreServices: 'Explore Our Services',
      talkToExperts: 'Talk to Our Experts',
      specializedAcross: 'Specialized expertise across:',
    },
    marketSlider: {
      badge: 'TARGET MARKET SPOTLIGHT',
      title: 'Current Market Focus & Sourcing Capabilities',
      subtitle: 'Easily explore our specialized talent pipelines and active enterprise domains.',
      targetMarket: 'TARGET MARKET',
      learnMore: 'Explore Practice',
      discussRole: 'Discuss Project Sourcing',
    },
    customerCards: {
      eyebrow: 'WHO WE SUPPORT',
      title: 'Built for Different Project Needs.',
      card1Title: 'Consulting Firms',
      card1Subtitle: 'Implementation & Strategic Sourcing',
      card1Desc: 'Implementation partners and consulting organizations seeking specialized project expertise.',
      card1Cta: 'Discuss Staffing Needs',
      card2Title: 'Implementation Partners',
      card2Subtitle: 'Technical & Functional Roles',
      card2Desc: 'Qualified professionals for specific SAP and Vistex roles and project-specific requirements.',
      card2Cta: 'Request Project Expertise',
      card3Title: 'Enterprise Clients',
      card3Subtitle: 'Direct Application & Project Support',
      card3Desc: 'Experienced consultants for implementation, enhancement, migration and application support requirements.',
      card3Cta: 'Talk to Our Consultants',
    },
    vistexFeature: {
      badge: 'NICHE MARKET SPECIALIZATION',
      cardTitle: 'Vistex Consulting Expertise',
      headline: 'Dedicated Vistex Sourcing & Consulting.',
      description: 'With a particular focus on the niche Vistex market, Nova Sitara helps consulting firms, implementation partners and end clients quickly access qualified professionals for specific project roles and skill requirements.',
      cta: 'Explore Vistex Capabilities',
    },
  },
  DE: {
    nav: {
      home: 'Startseite',
      about: 'Über uns',
      services: 'Leistungen',
      expertise: 'Fachbereiche',
      careers: 'Karriere',
      contact: 'Kontakt',
      talkToUs: 'Kontakt aufnehmen',
    },
    hero: {
      eyebrow: 'SAP & VISTEX BERATUNG + IT-PERSONALVERMITTLUNG',
      titleLine1: 'Spezialisierte SAP & Vistex Expertise.',
      titleLine2: 'Entwickelt für Ihren Erfolg.',
      subtitle: 'Nova Sitara verbindet Unternehmen mit erfahrenen SAP- und Vistex-Beratern, um Implementierungen, Erweiterungen, Migrationen und Anwendungsbetreuung zu beschleunigen.',
      exploreServices: 'Unsere Leistungen',
      talkToExperts: 'Experten kontaktieren',
      specializedAcross: 'Spezialisierte Expertise in:',
    },
    marketSlider: {
      badge: 'ZIELMARKT IM FOKUS',
      title: 'Aktueller Marktfokus & Beschaffungskompetenz',
      subtitle: 'Entdecken Sie unsere spezialisierten Beraterteams für aktuelle Unternehmensanforderungen.',
      targetMarket: 'ZIELMARKT',
      learnMore: 'Fachbereich erkunden',
      discussRole: 'Projektexpertise anfragen',
    },
    customerCards: {
      eyebrow: 'WEN WIR UNTERSTÜTZEN',
      title: 'Maßgeschneidert für unterschiedliche Projektanforderungen.',
      card1Title: 'Beratungsunternehmen',
      card1Subtitle: 'Implementierung & Strategisches Sourcing',
      card1Desc: 'Implementierungspartner und Beratungshäuser auf der Suche nach hochspezialisierter Projektexpertise.',
      card1Cta: 'Personalbedarf besprechen',
      card2Title: 'Implementierungspartner',
      card2Subtitle: 'Technische & Funktionale Rollen',
      card2Desc: 'Qualifizierte Fachkräfte für anspruchsvolle SAP- und Vistex-Rollen sowie projektspezifische Anforderungen.',
      card2Cta: 'Projektexpertise anfragen',
      card3Title: 'Unternehmenskunden',
      card3Subtitle: 'Direkte Anwendungs- & Projektbetreuung',
      card3Desc: 'Erfahrene Berater für Implementierung, Systemerweiterung, Migration und laufenden Support.',
      card3Cta: 'Mit Beratern sprechen',
    },
    vistexFeature: {
      badge: 'NISCHENMARKT-SPEZIALISIERUNG',
      cardTitle: 'Vistex Beratungsexpertise',
      headline: 'Dedizierte Vistex-Beratung & Personalvermittlung.',
      description: 'Mit einem ausgeprägten Fokus auf den Nischenmarkt Vistex unterstützt Nova Sitara Beratungshäuser, Partner und Endkunden beim schnellen Zugriff auf qualifizierte Experten für spezifische Rollen.',
      cta: 'Vistex-Kompetenzen erkunden',
    },
  },
};
