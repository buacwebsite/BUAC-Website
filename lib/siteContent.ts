export type Activity = {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
};

export type HeroSlide = {
  id: string;
  place: string;
  country: string;
  tag: string;
  description: string;
  image: string;
};

export type GalleryItem = {
  id: number;
  type: "image" | "video";
  url: string;
  youtubeUrl: string;
};

export type Quote = {
  name: string;
  designation: string;
  quote: string;
  image: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type Objective = {
  title: string;
  description: string;
};

export type ContactContent = {
  heading: string;
  subheading: string;
  location: {
    line1: string;
    line2: string;
    line3: string;
  };
  email: string;
  phone: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  ctaHeading: string;
  ctaDescription: string;
};

export type RecruitmentContent = {
  heading: string;
  subheading: string;
  whyJoinHeading: string;
  benefits: Array<{
    title: string;
    description: string;
  }>;
  lookingForHeading: string;
  essentialQualitiesHeading: string;
  essentialQualities: string[];
  bonusPointsHeading: string;
  bonusPoints: string[];
  applyHeading: string;
  applySubheading: string;
  ctaHeading: string;
  ctaDescription: string;
};

export const DEFAULT_CONTENT_IMAGE = "/assets/footerbg.webp";

export const STATIC_ACTIVITIES: Activity[] = [
  {
    id: 1,
    name: "Step To Glee",
    description:
      "BUAC's signature orientation program welcoming new members through entertainment, performances and bonding.",
    category: "Orientation",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 2,
    name: "Club Fair",
    description:
      "BUAC showcases its activities, recruits new members and inspires students to join the adventure.",
    category: "Recruitment",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 3,
    name: "Bootcamp",
    description:
      "Outdoor training program members to build skills, confidence, leadership and teamwork.",
    category: "Training",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 4,
    name: "Run Fusion",
    description:
      "BUAC's flagship running event promoting fitness, endurance and community through an exciting themed marathon.",
    category: "Flagship Event",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 5,
    name: "Football Tournament",
    description:
      "An inter-club football competition encouraging healthy competition and teamwork.",
    category: "Sports",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 6,
    name: "Badminton Tournament",
    description:
      "A badminton competition bringing members together through sports and healthy rivalry.",
    category: "Sports",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 7,
    name: "Cricket Tournament",
    description:
      "A competitive cricket event that strengthens BUAC’s sportsmanship and teamwork.",
    category: "Sports",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 8,
    name: "Creative Workshop",
    description:
      "An interactive workshop designed to exhibit creativity and develop practical skills among members.",
    category: "Workshop",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 9,
    name: "IT Workshop",
    description:
      "A skill-development workshop teaching graphic design, photography, video editing and other digital creative skills.",
    category: "Workshop",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 10,
    name: "First Aid Workshop",
    description:
      "A training session teaching members essential first aid and emergency response skills for safe adventures.",
    category: "Workshop",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 11,
    name: "Swimming Workshop",
    description:
      "A practical training program teaching swimming and promotes water safety and fitness.",
    category: "Workshop",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 12,
    name: "Student Tourism Security Workshop",
    description:
      "An awareness seminar focusing on safe risk management, responsible tourism and travel practices.",
    category: "Workshop",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 13,
    name: "IT Photowalk",
    description:
      "A photography quest where members explore the city, enhance photography skills and capture meaningful stories.",
    category: "Expedition",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 14,
    name: "Iftar Mahfil",
    description:
      "A Ramadan gathering bringing existing members and alumni together to share Iftar and strengthen bonds.",
    category: "Social Event",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 15,
    name: "Get-together",
    description:
      "A recreational outing that strengthens connections and creates lasting memories.",
    category: "Social Event",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 16,
    name: "Short Tour",
    description:
      "A brief adventure trip offering members the opportunity to explore nature, bond and gain outdoor experience.",
    category: "Tour",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 17,
    name: "Long Tour",
    description:
      "A multi-day voyage featuring trekking, exploration and unforgettable memories in nature.",
    category: "Tour",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 18,
    name: "University Adventra",
    description:
      "BUAC's national inter-university adventure competition promoting leadership, strategy and collaboration.",
    category: "Flagship Event",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 19,
    name: "Aquaventure",
    description:
      "A BUAC-led club fair highlighting marine conservation while promoting environmental responsibility and student engagement.",
    category: "Flagship Event",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 20,
    name: "Recruitment",
    description:
      "BUAC's recruiting process where eager students are interviewed and selected to become club members.",
    category: "Recruitment",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 21,
    name: "General Body Meeting (GBM)",
    description:
      "A meeting where members provide and receive updates, discuss upcoming events and strengthen communication.",
    category: "Meeting",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 22,
    name: "Unconquerable: Beyond The Limit",
    description:
      "A digital skill-based competition challenging participants in planning, data management, problem-solving and creative presentation.",
    category: "Competition",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
  {
    id: 23,
    name: "Movie Meetup",
    description:
      "A casual social event bringing BUAC members together through films and laughter.",
    category: "Social Event",
    imageUrl: DEFAULT_CONTENT_IMAGE,
  },
];

export const STATIC_HERO_SLIDES: HeroSlide[] = [
  {
    id: "buac",
    place: "BUAC",
    country: "BRAC University Adventure Club",
    tag: "Adventure",
    description:
      "Step into the wild with BUAC — a community built around exploration, teamwork, courage, and unforgettable outdoor stories.",
    image: "/assets/footerbg.webp",
  },
  {
    id: "trails",
    place: "Trails",
    country: "Bangladesh",
    tag: "Expedition",
    description:
      "From misty hills to forest trails, every expedition becomes a memory, a challenge, and a story worth carrying forward.",
    image: "/assets/panelbg.jpg",
  },
  {
    id: "explore",
    place: "Explore",
    country: "BUAC Family",
    tag: "Community",
    description:
      "Explore beyond your comfort zone with people who believe that the best views come after the hardest climb.",
    image: "/assets/footerbg.webp",
  },
];

/**
 * IMPORTANT:
 * Put actual local images inside /public/assets/content/gallery/
 * and update these URLs.
 *
 * Example:
 * public/assets/content/gallery/1.webp
 * public/assets/content/gallery/2.webp
 * public/assets/content/gallery/3.webp
 */

export const STATIC_GALLERY: GalleryItem[] = [
  {
    id: 1,
    type: "image",
    url: "/assets/content/gallery/1.webp",
    youtubeUrl: "",
  },
  {
    id: 2,
    type: "image",
    url: "/assets/content/gallery/2.webp",
    youtubeUrl: "",
  },
  {
    id: 3,
    type: "image",
    url: "/assets/content/gallery/3.webp",
    youtubeUrl: "",
  },
  {
    id: 4,
    type: "image",
    url: "/assets/content/gallery/4.webp",
    youtubeUrl: "",
  },
  {
    id: 5,
    type: "image",
    url: "/assets/content/gallery/5.webp",
    youtubeUrl: "",
  },
  {
    id: 6,
    type: "image",
    url: "/assets/content/gallery/6.webp",
    youtubeUrl: "",
  },
  {
    id: 7,
    type: "image",
    url: "/assets/content/gallery/7.webp",
    youtubeUrl: "",
  },
  {
    id: 8,
    type: "image",
    url: "/assets/content/gallery/8.webp",
    youtubeUrl: "",
  },
];

export const STATIC_ABOUT = {
  aboutText:
    "Founded by passionate adventurers at BRAC University, BUAC is a community built around exploration, teamwork, courage, and unforgettable outdoor stories.",
  stats: [
    { value: "500+", label: "Active Members" },
    { value: "100+", label: "Expeditions" },
    { value: "50+", label: "Locations" },
    { value: "15+", label: "Years Strong" },
  ] as Stat[],
  quotes: [] as Quote[],
};

export const STATIC_VISION = {
  visionText:
    "The BRAC University Adventure Club envisions a generation of fearless, resilient, and purpose-driven individuals who embrace challenges as opportunities for growth.",
  objectives: [
    {
      title: "Build Skills. Break Limits. Become More.",
      description:
        "BUAC develops practical skills through training, workshops, first aid, leadership activities, and outdoor experiences.",
    },
    {
      title: "One Community. Endless Adventures.",
      description:
        "BUAC creates an inclusive community where members support one another through exploration, teamwork, and shared experiences.",
    },
  ] as Objective[],
};

export const STATIC_CONTACT: ContactContent = {
  heading: "GET IN TOUCH",
  subheading:
    "Ready to embark on your next adventure? Reach out to us and let's start planning your journey into the wild.",
  location: {
    line1: "BRAC University",
    line2: "Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212",
    line3: "Bangladesh",
  },
  email: "club.buac@g.bracu.ac.bd",
  phone: "",
  socialLinks: {
    facebook: "https://facebook.com/buacofficial",
    instagram: "https://instagram.com/brac_university_adventure_club",
    linkedin: "https://linkedin.com/company/buac",
  },
  ctaHeading: "Ready for Adventure?",
  ctaDescription:
    "Join BUAC and explore the breathtaking landscapes of Bangladesh.",
};

export const STATIC_RECRUITMENT: RecruitmentContent = {
  heading: "JOIN THE ADVENTURE",
  subheading:
    "Are you ready to step out of your comfort zone and into the wild? BUAC is looking for passionate adventurers who want to explore, learn, and grow.",
  whyJoinHeading: "Why Join BUAC?",
  benefits: [
    {
      title: "Epic Adventures",
      description:
        "Explore breathtaking mountains, valleys, and trails across Bangladesh.",
    },
    {
      title: "Skill Development",
      description:
        "Learn trekking, camping, navigation, and survival skills from experienced members.",
    },
    {
      title: "Leadership",
      description:
        "Develop leadership qualities by organizing and leading expeditions.",
    },
    {
      title: "Unforgettable Memories",
      description:
        "Create lasting bonds and memories around campfires under starry skies.",
    },
    {
      title: "Vibrant Community",
      description:
        "Join a passionate community of adventure seekers and outdoor enthusiasts.",
    },
    {
      title: "Personal Growth",
      description:
        "Push your limits, build resilience, and discover your potential.",
    },
  ],
  lookingForHeading: "What We're Looking For",
  essentialQualitiesHeading: "Essential Qualities",
  essentialQualities: [
    "Current BRAC University student with valid student ID",
    "Passion for outdoor activities and adventure",
    "Commitment to attend regular club activities",
    "Team player with positive attitude",
  ],
  bonusPointsHeading: "Bonus Points",
  bonusPoints: [
    "Previous trekking or camping experience",
    "Photography or videography skills",
    "Social media management experience",
    "Event organization or leadership roles",
  ],
  applyHeading: "Apply Now",
  applySubheading:
    "Fill out the form below and take the first step towards unforgettable adventures with BUAC.",
  ctaHeading: "Questions About Recruitment?",
  ctaDescription:
    "Feel free to reach out to us. We're here to answer your questions about joining BUAC.",
};