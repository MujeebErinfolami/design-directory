import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "#e2d9f3","#d1ecf1","#fce8d5","#d4edda","#f8d7da","#fff3cd",
  "#cce5ff","#e9ecef","#f0e6ff","#d6f0e0","#ffe4cc","#dbeafe",
  "#fef9c3","#fce7f3","#ede9fe","#dcfce7","#fff1f2","#fefce8",
  "#f0fdf4","#ecfdf5",
];

let colorIdx = 0;
function nextColor() { return AVATAR_COLORS[colorIdx++ % AVATAR_COLORS.length]; }

// ── Creatives ─────────────────────────────────────────────────────────────────

const creatives = [
  {
    name: "Jessica Hische",
    title: "Lettering artist and illustrator who loves drop caps",
    bio: "Jessica Hische is a letterer, illustrator, and type designer based in San Francisco. She has created custom lettering for brands including Wes Anderson films, Penguin Books, and the US Postal Service. Her work sits at the intersection of craft and concept.",
    location: { city: "San Francisco", country: "United States", code: "US" },
    primaryRoles: ["Illustrator", "Brand Designer"],
    tools: ["Illustrator", "Photoshop", "Procreate"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://jessicahische.is",
    dribbble: "https://dribbble.com/jessicahische",
    instagram: "https://instagram.com/jessicahische",
  },
  {
    name: "Aaron Draplin",
    title: "Thick lines, bold colors, American design",
    bio: "Aaron James Draplin is a graphic designer and founder of Draplin Design Co., based in Portland, Oregon. Known for his strong typographic work and field notes, Aaron brings a no-frills, blue-collar aesthetic to every project.",
    location: { city: "Portland", country: "United States", code: "US" },
    primaryRoles: ["Brand Designer", "Art Director"],
    tools: ["Illustrator", "InDesign", "Photoshop"],
    availability: "unavailable" as const,
    experienceLevel: "senior" as const,
    website: "https://draplin.com",
    instagram: "https://instagram.com/draplin",
    dribbble: "https://dribbble.com/draplin",
  },
  {
    name: "Tobias van Schneider",
    title: "Designer and maker — building tools people love",
    bio: "Tobias van Schneider is a designer, entrepreneur, and founder based in New York City. Formerly Lead Product Designer at Spotify, he now runs DESK — a newsletter and creative studio exploring the intersection of design and culture.",
    location: { city: "New York", country: "United States", code: "US" },
    primaryRoles: ["UI/UX Designer", "Product Designer"],
    tools: ["Figma", "Sketch", "After Effects"],
    availability: "unavailable" as const,
    experienceLevel: "senior" as const,
    website: "https://vanschneider.com",
    dribbble: "https://dribbble.com/vanschneider",
    instagram: "https://instagram.com/vanschneider",
  },
  {
    name: "Lotta Nieminen",
    title: "Graphic designer and illustrator exploring pattern and color",
    bio: "Lotta Nieminen is a Finnish graphic designer and illustrator based in New York City. Her work spans editorial illustration, brand identity, and surface pattern design. Clients include The New Yorker, Nike, and The New York Times.",
    location: { city: "New York", country: "United States", code: "US" },
    primaryRoles: ["Illustrator", "Art Director"],
    tools: ["Illustrator", "Photoshop", "InDesign"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://lottanieminen.com",
    instagram: "https://instagram.com/lottanieminen",
    behance: "https://behance.net/lottanieminen",
  },
  {
    name: "Chris Do",
    title: "Founder of The Futur — teaching designers to think like business owners",
    bio: "Chris Do is an Emmy Award-winning director, designer, and educator based in Los Angeles. As the CEO of Blind and founder of The Futur, he has built one of the most influential design education platforms in the world.",
    location: { city: "Los Angeles", country: "United States", code: "US" },
    primaryRoles: ["Creative Director", "Brand Designer"],
    tools: ["After Effects", "Illustrator", "Figma"],
    availability: "unavailable" as const,
    experienceLevel: "senior" as const,
    website: "https://thefutur.com",
    instagram: "https://instagram.com/thechrisdo",
    dribbble: "https://dribbble.com/chrisdo",
  },
  {
    name: "Debbie Millman",
    title: "Author, educator, and host of Design Matters",
    bio: "Debbie Millman is a designer, author, educator, and brand strategist. She is host of Design Matters — the world's first podcast about design — and Chair of the Masters in Branding program at SVA in New York.",
    location: { city: "New York", country: "United States", code: "US" },
    primaryRoles: ["Brand Designer", "Creative Director"],
    tools: ["Illustrator", "InDesign", "Photoshop"],
    availability: "unavailable" as const,
    experienceLevel: "senior" as const,
    website: "https://debbiemillman.com",
    instagram: "https://instagram.com/debbiemillman",
    linkedin: "https://linkedin.com/in/debbiemillman",
  },
  {
    name: "Timothy Goodman",
    title: "Illustrator and muralist — words as images, images as words",
    bio: "Timothy Goodman is a New York-based graphic designer and illustrator known for his hand-drawn lettering, murals, and collaborations with brands like Google, Nike, and Apple. His personal projects blur the line between fine art and design.",
    location: { city: "New York", country: "United States", code: "US" },
    primaryRoles: ["Illustrator", "Art Director"],
    tools: ["Procreate", "Illustrator", "Photoshop"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://timothygoodman.com",
    instagram: "https://instagram.com/timothygoodman",
    dribbble: "https://dribbble.com/timothygoodman",
  },
  {
    name: "Bethany Heck",
    title: "Type designer and design director obsessed with sports ephemera",
    bio: "Bethany Heck is a type designer and Design Director at Microsoft. She founded Font Review Journal, a deep-dive publication about typefaces, and has released several typefaces through her foundry Eephus League.",
    location: { city: "Seattle", country: "United States", code: "US" },
    primaryRoles: ["Brand Designer", "Web Designer"],
    tools: ["Glyphs", "Illustrator", "Figma"],
    availability: "unavailable" as const,
    experienceLevel: "senior" as const,
    website: "https://eephusleague.com",
    dribbble: "https://dribbble.com/bethanyh",
    instagram: "https://instagram.com/bethany_heck",
  },
  {
    name: "Bradley Munkowitz",
    title: "GMUNK — motion, light, and immersive visual experiences",
    bio: "Bradley Munkowitz, known as GMUNK, is a Los Angeles-based motion designer and visual artist. His work spans film titles, music videos, and immersive installations. He is known for projects on films like Tron Legacy and Oblivion.",
    location: { city: "Los Angeles", country: "United States", code: "US" },
    primaryRoles: ["Motion Designer", "3D Artist"],
    tools: ["After Effects", "Cinema 4D", "Houdini"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://gmunk.com",
    instagram: "https://instagram.com/gmunk",
    dribbble: "https://dribbble.com/gmunk",
  },
  {
    name: "Morag Myerscough",
    title: "Bold patterns, community spaces, colour that moves",
    bio: "Morag Myerscough is a London-based designer known for her bold use of colour and pattern in public and community spaces. Her studio creates identity systems, way-finding, and large-scale installations for cultural institutions worldwide.",
    location: { city: "London", country: "United Kingdom", code: "GB" },
    primaryRoles: ["Art Director", "Brand Designer"],
    tools: ["Illustrator", "InDesign", "Photoshop"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://moragmyerscough.com",
    instagram: "https://instagram.com/moragmyerscough",
    behance: "https://behance.net/moragmyerscough",
  },
  {
    name: "Sophia Cipolletta",
    title: "UI/UX designer crafting accessible digital experiences",
    bio: "Sophia Cipolletta is a product designer based in Amsterdam specialising in accessible interfaces and design systems. She has worked with fintech and healthtech startups to build products used by millions across Europe.",
    location: { city: "Amsterdam", country: "Netherlands", code: "NL" },
    primaryRoles: ["UI/UX Designer", "Product Designer"],
    tools: ["Figma", "Framer", "Notion"],
    availability: "available" as const,
    experienceLevel: "mid" as const,
    website: "https://dribbble.com/sophiacipo",
    dribbble: "https://dribbble.com/sophiacipo",
    linkedin: "https://linkedin.com/in/sophiacipolletta",
  },
  {
    name: "Marcus Tran",
    title: "Brand strategist and visual identity designer in Southeast Asia",
    bio: "Marcus Tran is a Ho Chi Minh City-based brand designer helping startups and consumer brands establish strong visual identities. His work is heavily influenced by Southeast Asian typography and vernacular graphic traditions.",
    location: { city: "Ho Chi Minh City", country: "Vietnam", code: "VN" },
    primaryRoles: ["Brand Designer", "Art Director"],
    tools: ["Illustrator", "Figma", "InDesign"],
    availability: "available" as const,
    experienceLevel: "mid" as const,
    website: "https://behance.net/marcustrandesign",
    behance: "https://behance.net/marcustrandesign",
    instagram: "https://instagram.com/marcustrandesign",
  },
  {
    name: "Yuki Tanaka",
    title: "Motion designer and visual storyteller based in Tokyo",
    bio: "Yuki Tanaka is a Tokyo-based motion designer whose work bridges minimalist Japanese aesthetics with contemporary digital expression. She creates title sequences, music videos, and brand animations for Japanese and international clients.",
    location: { city: "Tokyo", country: "Japan", code: "JP" },
    primaryRoles: ["Motion Designer", "Art Director"],
    tools: ["After Effects", "Cinema 4D", "Illustrator"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://yukitanaka.work",
    instagram: "https://instagram.com/yukitanakamotion",
    dribbble: "https://dribbble.com/yukitanaka",
  },
  {
    name: "Emilio Gomariz",
    title: "Digital artist making work at the edge of glitch and order",
    bio: "Emilio Gomariz is a Barcelona-based digital artist and designer known for his generative, glitch-inspired visual work. He creates for advertising campaigns, album artwork, and gallery exhibitions, working at the intersection of code and craft.",
    location: { city: "Barcelona", country: "Spain", code: "ES" },
    primaryRoles: ["3D Artist", "Motion Designer"],
    tools: ["Cinema 4D", "After Effects", "Blender"],
    availability: "available" as const,
    experienceLevel: "senior" as const,
    website: "https://emiliogomariz.com",
    instagram: "https://instagram.com/emiliogomariz",
    behance: "https://behance.net/egomariz",
  },
  {
    name: "Naomi Atkinson",
    title: "Creative director specialising in print and sustainability",
    bio: "Naomi Atkinson is a UK-based creative director and founder of Naomi Atkinson Design. Her studio is committed to sustainable design practice and has been recognized for its work in publishing, cultural branding, and environmental communication.",
    location: { city: "Brighton", country: "United Kingdom", code: "GB" },
    primaryRoles: ["Creative Director", "Brand Designer"],
    tools: ["InDesign", "Illustrator", "Photoshop"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://naomiatkinsondesign.com",
    instagram: "https://instagram.com/naomiatkinsondesign",
    linkedin: "https://linkedin.com/in/naomiatkinson",
  },
  {
    name: "Femi Ogundele",
    title: "Visual identity and brand designer for African creators",
    bio: "Femi Ogundele is a Lagos-based brand designer helping African businesses and creative enterprises build distinctive, culturally resonant visual identities. His work references Yoruba textile patterns, street typography, and Afrofuturist aesthetics.",
    location: { city: "Lagos", country: "Nigeria", code: "NG" },
    primaryRoles: ["Brand Designer", "Art Director"],
    tools: ["Illustrator", "Figma", "Photoshop"],
    availability: "available" as const,
    experienceLevel: "mid" as const,
    website: "https://behance.net/femidsgns",
    behance: "https://behance.net/femidsgns",
    instagram: "https://instagram.com/femidsgns",
  },
  {
    name: "Ananya Krishnan",
    title: "UX researcher and interaction designer building for India",
    bio: "Ananya Krishnan is a Bengaluru-based UX researcher and interaction designer focused on designing for India's next billion internet users. She has shipped products for Swiggy, Razorpay, and several early-stage startups.",
    location: { city: "Bengaluru", country: "India", code: "IN" },
    primaryRoles: ["UI/UX Designer", "Product Designer"],
    tools: ["Figma", "Maze", "Notion"],
    availability: "available" as const,
    experienceLevel: "mid" as const,
    website: "https://dribbble.com/ananyak",
    dribbble: "https://dribbble.com/ananyak",
    linkedin: "https://linkedin.com/in/ananyakrishnanux",
  },
  {
    name: "Pieter Janssen",
    title: "Typographer and editorial art director in Amsterdam",
    bio: "Pieter Janssen is an Amsterdam-based typographer and editorial art director. He has art directed for De Correspondent, volume magazine, and several Dutch cultural institutions. He teaches editorial design at the Gerrit Rietveld Academie.",
    location: { city: "Amsterdam", country: "Netherlands", code: "NL" },
    primaryRoles: ["Art Director", "Brand Designer"],
    tools: ["InDesign", "Illustrator", "Figma"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://pieterjanssen.nl",
    instagram: "https://instagram.com/pieterjanssen",
    linkedin: "https://linkedin.com/in/pieterjanssen",
  },
  {
    name: "Camila Restrepo",
    title: "Photographer and visual storyteller documenting Latin America",
    bio: "Camila Restrepo is a Colombian documentary photographer and visual storyteller based in Medellín. Her editorial work has appeared in National Geographic, Aperture, and The Guardian. She also creates visual identities for cultural organisations.",
    location: { city: "Medellín", country: "Colombia", code: "CO" },
    primaryRoles: ["Photographer", "Content Creator"],
    tools: ["Lightroom", "Photoshop", "Capture One"],
    availability: "available" as const,
    experienceLevel: "senior" as const,
    website: "https://camilarestrepo.co",
    instagram: "https://instagram.com/camila.restrepo.foto",
    behance: "https://behance.net/camilarestrepo",
  },
  {
    name: "Leo Burnett Jr.",
    title: "Copywriter and creative strategist making words work harder",
    bio: "Leo Burnett Jr. is a London-based copywriter and creative strategist with 12 years of agency experience across Wieden+Kennedy, BBH, and Grey. He specialises in brand voice development, long-copy campaigns, and creative direction for global brands.",
    location: { city: "London", country: "United Kingdom", code: "GB" },
    primaryRoles: ["Copywriter & Creative", "Creative Director"],
    tools: ["Notion", "Google Docs", "Figma"],
    availability: "freelance" as const,
    experienceLevel: "senior" as const,
    website: "https://leoburnettjr.co.uk",
    linkedin: "https://linkedin.com/in/leoburnettjr",
    instagram: "https://instagram.com/leoburnettjr",
  },
];

// ── Agencies ──────────────────────────────────────────────────────────────────

const agencies = [
  {
    name: "Pentagram",
    bio: "Pentagram is the world's largest independent design consultancy. Founded in London in 1972 by five partners, the firm now operates from offices in New York, London, Austin, and Berlin, working across brand, digital, architecture, and wayfinding.",
    location: { city: "New York", country: "United States", code: "US" },
    teamSize: "100+",
    specialties: ["Brand Designer", "UI/UX Designer", "Art Director"],
    pastClients: ["Mastercard", "Saks Fifth Avenue", "United Airlines", "The Guardian", "Tiffany & Co"],
    website: "https://pentagram.com",
    instagram: "https://instagram.com/pentagramdesign",
    linkedin: "https://linkedin.com/company/pentagram",
  },
  {
    name: "Work & Co",
    bio: "Work & Co is an independent digital product studio based in Brooklyn. They design and build digital products for some of the world's most demanding companies — including Apple, Google, IKEA, and Virgin America.",
    location: { city: "Brooklyn", country: "United States", code: "US" },
    teamSize: "51-100",
    specialties: ["UI/UX Designer", "Product Designer", "Web Designer"],
    pastClients: ["Apple", "Google", "IKEA", "Virgin America", "Planned Parenthood"],
    website: "https://work.co",
    instagram: "https://instagram.com/workandco",
    linkedin: "https://linkedin.com/company/work-co",
  },
  {
    name: "Wolff Olins",
    bio: "Wolff Olins is a global brand consultancy that creates transformative brands for businesses and organisations. With offices in London, New York, and San Francisco, the studio is known for bold, provocative, and future-facing brand work.",
    location: { city: "London", country: "United Kingdom", code: "GB" },
    teamSize: "51-100",
    specialties: ["Brand Designer", "Creative Director", "Art Director"],
    pastClients: ["Google", "Uber", "GE", "Tate Modern", "NYC", "Meta"],
    website: "https://wolffolins.com",
    instagram: "https://instagram.com/wolffolins",
    linkedin: "https://linkedin.com/company/wolff-olins",
  },
  {
    name: "Collins",
    bio: "Collins is an independent brand experience company based in New York and San Francisco. The studio creates brand strategies, visual identities, and digital experiences for companies navigating change and growth.",
    location: { city: "New York", country: "United States", code: "US" },
    teamSize: "16-50",
    specialties: ["Brand Designer", "Motion Designer", "Art Director"],
    pastClients: ["Spotify", "Facebook", "Airbnb", "Dropbox", "Medium"],
    website: "https://wearecollins.com",
    instagram: "https://instagram.com/wearecollins",
    linkedin: "https://linkedin.com/company/collins-",
  },
  {
    name: "Ueno",
    bio: "Ueno is a full-service digital agency based in San Francisco, New York, and Reykjavik. The studio blends strategy, design, and engineering to create digital products and experiences that are beautiful, useful, and loved.",
    location: { city: "San Francisco", country: "United States", code: "US" },
    teamSize: "16-50",
    specialties: ["UI/UX Designer", "Brand Designer", "Web Designer"],
    pastClients: ["Twitter", "Marriott", "Lyft", "Squarespace", "GitHub"],
    website: "https://ueno.co",
    instagram: "https://instagram.com/heyueno",
    linkedin: "https://linkedin.com/company/ueno",
  },
  {
    name: "Instrument",
    bio: "Instrument is a creative agency and technology company based in Portland, Oregon. They build digital products, campaigns, and experiences for forward-thinking brands at the intersection of design, technology, and storytelling.",
    location: { city: "Portland", country: "United States", code: "US" },
    teamSize: "51-100",
    specialties: ["Web Designer", "UI/UX Designer", "Motion Designer"],
    pastClients: ["Google", "Facebook", "Nike", "Kickstarter", "Adidas"],
    website: "https://instrument.com",
    instagram: "https://instagram.com/instrument",
    linkedin: "https://linkedin.com/company/instrument-agency",
  },
  {
    name: "Mucho",
    bio: "Mucho is an independent brand design studio with offices in Barcelona, San Francisco, and Paris. The studio specialises in brand identity, naming, and communication design for culturally significant organisations and innovative companies.",
    location: { city: "Barcelona", country: "Spain", code: "ES" },
    teamSize: "16-50",
    specialties: ["Brand Designer", "Art Director", "Copywriter & Creative"],
    pastClients: ["Red Bull", "Warner Music", "Campari", "Moët Hennessy", "Virgin"],
    website: "https://wearemucho.com",
    instagram: "https://instagram.com/wearemucho",
    linkedin: "https://linkedin.com/company/wearemucho",
  },
  {
    name: "Gretel",
    bio: "Gretel is a creative studio in New York specialising in brand design, motion, and storytelling for media and entertainment companies. Known for their conceptually led branding work for streaming platforms and content studios.",
    location: { city: "New York", country: "United States", code: "US" },
    teamSize: "16-50",
    specialties: ["Brand Designer", "Motion Designer", "Art Director"],
    pastClients: ["Netflix", "Hulu", "HBO", "Showtime", "AMC"],
    website: "https://gretelny.com",
    instagram: "https://instagram.com/gretelny",
    linkedin: "https://linkedin.com/company/gretel",
  },
  {
    name: "Superflux",
    bio: "Superflux is a design and futures studio based in London and Vienna. They work at the intersection of design, technology, and futures research — creating provocative installations, policy concepts, and brand experiences about tomorrow.",
    location: { city: "London", country: "United Kingdom", code: "GB" },
    teamSize: "6-15",
    specialties: ["Creative Director", "3D Artist", "Content Creator"],
    pastClients: ["IKEA", "United Nations", "V&A Museum", "British Council", "Google"],
    website: "https://superflux.in",
    instagram: "https://instagram.com/superfluxstudio",
    linkedin: "https://linkedin.com/company/superflux",
  },
  {
    name: "Snohetta",
    bio: "Snøhetta is a transdisciplinary creative practice based in Oslo, New York, and San Francisco. Known primarily as an architecture firm, their brand design and experience division has created identities for major cultural institutions worldwide.",
    location: { city: "Oslo", country: "Norway", code: "NO" },
    teamSize: "100+",
    specialties: ["Brand Designer", "Art Director", "Web Designer"],
    pastClients: ["National September 11 Memorial Museum", "Times Square Alliance", "Bibliotheca Alexandrina"],
    website: "https://snohetta.com",
    instagram: "https://instagram.com/snohetta",
    linkedin: "https://linkedin.com/company/snohetta",
  },
];

// ── Blog posts ────────────────────────────────────────────────────────────────

const posts = [
  {
    slug: "the-brief-is-a-lie",
    title: "The Brief Is a Lie",
    excerpt: "Clients rarely know what they want — they know what they fear. The best designers learn to read between the lines.",
    category: "Strategy",
    authorName: "Michael Bierut",
    authorTitle: "Partner at Pentagram",
    readTime: "6 min read",
    featured: true,
    date: new Date("2026-03-10"),
    body: "Every creative brief I have ever received has been, in some sense, a lie. Not an intentional deception — the people writing it believe what they write. But a brief is written from a position of uncertainty, by people who have not yet solved the problem they are asking you to solve.\n\nThe brief says: we need a new logo. What it means is: something has changed in our business and we don't know how to represent ourselves anymore. The brief says: make it feel more premium. What it means is: we are losing ground to a competitor and it frightens us.\n\nThe best designers I know treat every brief as a starting hypothesis, not a specification. They sign off on the brief and then they go away and try to understand what actually needs to happen. Sometimes those two things are the same. Mostly they are not.\n\nThis is not cynicism. It is the opposite. To take a brief at face value is to deprive the client of your most valuable asset — your ability to see their problem from outside. Anyone inside the organisation has already adapted to the problem. They have made peace with it, worked around it, stopped seeing it. You have not.\n\nAsk why three times and you will almost always arrive somewhere more interesting than the brief. Not always actionable — sometimes the why is structural or political or rooted in something design cannot fix. But knowing it changes the nature of what you propose.",
  },
  {
    slug: "type-hierarchy-everything",
    title: "Type Hierarchy Is Everything",
    excerpt: "A layout with bad hierarchy makes readers work. A layout with good hierarchy makes readers disappear into the content.",
    category: "Typography",
    authorName: "Bethany Heck",
    authorTitle: "Design Director, Microsoft",
    readTime: "8 min read",
    featured: true,
    date: new Date("2026-02-28"),
    body: "Open any great magazine from the 1970s or 1980s and stare at a spread for thirty seconds. You are not reading it — you are letting it wash over you. Your eye is moving, but you are not directing it. The hierarchy is directing it.\n\nThis is what type hierarchy does at its best. It creates a sequence of entry points that readers move through without consciously choosing to. The headline catches. The deck entices. The drop cap invites you in. The subheads let you skip ahead. The pull quotes give you somewhere to rest. The body copy is where you stay if you have decided it is worth your time.\n\nEvery one of those elements is a threshold. A good designer makes each threshold low enough to cross, and interesting enough to want to.\n\nHierarchy is not just about size. It is about weight, colour, spacing, position, and — most importantly — contrast. A 40pt headline set in the same weight as the 10pt body copy is not a headline at all. It is just big text. Hierarchy requires differentiation. The reader must be able to feel the difference before they have read a word.\n\nThe common failure is hierarchy that announces itself. When you can see the hierarchy consciously — when you think 'that is a heading, that is a subhead' — the designer has lost. Great hierarchy is invisible. It guides without gesturing.",
  },
  {
    slug: "designing-for-the-next-billion",
    title: "Designing for the Next Billion",
    excerpt: "Most design tools and frameworks were built for wealthy, Western, high-bandwidth users. That's most of the world's smallest market.",
    category: "UX",
    authorName: "Ananya Krishnan",
    authorTitle: "Senior UX Designer",
    readTime: "9 min read",
    featured: false,
    date: new Date("2026-02-14"),
    body: "When I joined my first product team in Bengaluru, the design system we inherited had been built by a team in San Francisco for users with 100Mbps fibre connections, 6-inch OLED screens, and 128GB of storage. Our users had 2G connections that dropped out at 11am every day, 32GB handsets half-full with family photos, and monthly data plans they stretched across four weeks.\n\nThe gap between those two realities is not just a technical problem. It is a cultural one. It is a question of who you imagine when you design.\n\nMost design frameworks imagine someone who is essentially you. They imagine someone with a large screen, good lighting, full battery, uninterrupted time, and the literacy to decode standard interface conventions. They imagine someone who has never had a reason to distrust an app asking for their location.\n\nDesigning for the next billion means starting over from different assumptions. It means assuming low bandwidth as the default, not the edge case. It means assuming shared devices. It means assuming that every ask for personal data will be met with suspicion, because that suspicion is earned.\n\nThe good news is that designing for constraint makes you a better designer for everyone. Every optimisation you make for a 2G connection makes the experience better on 5G. Every shortcut you build for a low-literacy user makes the product more scannable for an expert one.",
  },
  {
    slug: "brand-in-motion",
    title: "Brand in Motion",
    excerpt: "Static logos made sense for a world of printed letterheads. The brands living in apps and feeds need to move to breathe.",
    category: "Motion",
    authorName: "Bradley Munkowitz",
    authorTitle: "Motion Designer & Visual Artist",
    readTime: "7 min read",
    featured: false,
    date: new Date("2026-01-30"),
    body: "The logo is dead. Long live the logo.\n\nWhen Saul Bass designed the AT&T globe in 1984, it needed to work on a letterhead, an invoice, the side of a van, and perhaps a television commercial. Four contexts. One static form. The system was simple because the world was simple.\n\nThe brands being born today will live in a dozen contexts by the time they launch and a hundred within five years. They will appear as an avatar, as a loading screen, as a notification icon, as a pinned tweet, as a TikTok sound. Many of those contexts are inherently temporal — they unfold in time. A brand that cannot move is a brand that is mute in half the conversations it needs to have.\n\nThis does not mean every brand needs a 30-second animation. It means every brand needs a theory of motion. How does it enter a screen? How does it leave? Does it bounce, ease, spring, or cut? Is its motion smooth or deliberate?\n\nThe best motion identities understand that motion is not decoration applied to a static identity — it is an expression of the same underlying idea. If the static identity is built on geometry and grid, the motion should feel structural. If the static identity is built on fluidity and hand-craft, the motion should feel organic.",
  },
  {
    slug: "the-invisible-grid",
    title: "The Invisible Grid",
    excerpt: "Good grids should never be seen — they should only be felt in the deep rightness of the layout.",
    category: "Typography",
    authorName: "Pieter Janssen",
    authorTitle: "Art Director & Typographer",
    readTime: "5 min read",
    featured: false,
    date: new Date("2026-01-18"),
    body: "Josef Müller-Brockmann spent 400 pages explaining the grid in 1981. Every design student has read the book, or at least owned it. Almost none of them can explain the modular grid on demand without looking it up.\n\nThis is not their failure. It is evidence that the grid works. You feel it before you understand it. You know a layout is right before you can say why. The grid is the reason why.\n\nThe grid is a set of promises the designer makes to the reader. It says: things that belong together will be together. Things that are different will be visibly different. There is an order here, and you can trust it.\n\nBreaking the grid is only interesting if you understand the grid you are breaking. A beginner who ignores the grid produces chaos. An expert who breaks the grid produces tension. The difference is intentionality.\n\nThe most useful thing I can say about grids is this: build your grid from the content, not the canvas. Start with the text. Set it at the size and leading that reads comfortably. Let that determine your unit. Then build outward.",
  },
  {
    slug: "photography-and-the-brand",
    title: "Photography and the Brand",
    excerpt: "The photography direction is often the last thing brands think about and the first thing audiences notice.",
    category: "Branding",
    authorName: "Camila Restrepo",
    authorTitle: "Documentary Photographer",
    readTime: "6 min read",
    featured: true,
    date: new Date("2026-01-05"),
    body: "Brands spend months on logos and years on strategy, then hand the photography brief to someone junior on the day of the shoot. The photographs end up looking like every other brand in the category. Everyone is confused about why the brand doesn't feel right in market.\n\nPhotography is not decoration. It is the brand's relationship with reality. Every photograph you publish is a claim about the world. It says: this is what our people look like. This is the light they live in. These are the places they inhabit. Audiences read these claims before they read your copy.\n\nThe best brand photography I have seen is indistinguishable from editorial photography from the same period. Not because it copies editorial conventions, but because both respond to the same cultural moment. They feel of the time because they are of the time.\n\nIf your photography could have been made five years ago, it probably should not be made today. Not because novelty is a virtue, but because photography that feels dated tells audiences that you are not paying attention to them.",
  },
  {
    slug: "systems-thinking-for-designers",
    title: "Systems Thinking for Designers",
    excerpt: "A logo is a symbol. A typeface is a convention. A colour is a signal. A design system is what happens when these things talk to each other.",
    category: "Branding",
    authorName: "Tobias van Schneider",
    authorTitle: "Founder, DESK",
    readTime: "7 min read",
    featured: false,
    date: new Date("2025-12-22"),
    body: "The hardest thing to teach young designers is not craft — it is systems thinking. Craft can be developed through repetition. Systems thinking requires a different kind of patience: the willingness to work on problems that will not resolve for weeks.\n\nA design system is not a style guide. A style guide is a document. A design system is a set of decisions that have been made once, recorded clearly, and then applied consistently everywhere.\n\nThe mistake most teams make with design systems is treating them as final. A design system is never finished. It is a living document. It should grow as the product grows, be simplified when complexity accumulates, and be challenged when the product's direction changes.\n\nStart smaller than you think you need to. The instinct is to build comprehensively. The reality is that a comprehensive system built before the product is stable will be wrong by the time it is done. Build for what you have, not what you imagine you will need.",
  },
  {
    slug: "what-ai-cannot-do",
    title: "What AI Cannot Do",
    excerpt: "AI can generate a thousand variations in the time it takes to make a coffee. That's the problem and the opportunity.",
    category: "Strategy",
    authorName: "Debbie Millman",
    authorTitle: "Chair, Masters in Branding, SVA",
    readTime: "8 min read",
    featured: false,
    date: new Date("2025-12-10"),
    body: "Every tool changes the profession that uses it. The camera changed painting. The Macintosh changed graphic design. The internet changed advertising. Each time, people predicted the end of the thing the tool was displacing. Each time, the thing adapted.\n\nAI will change design the same way. The question is not 'will AI replace designers' — it will replace some things designers do, completely and irrevocably. The question is: what will design become in response?\n\nAI is very good at generating plausible starting points. It is very good at producing many variations quickly. It is very good at imitating styles it has been trained on. These capabilities will eliminate a significant amount of junior creative work.\n\nWhat AI cannot do is know why. It cannot know why this particular client needs this particular answer at this particular moment. It cannot bring its own experience of grief or joy or surprise to the work. It cannot decide what to keep and what to discard on the basis of an intuition it has spent twenty years developing.\n\nThe designers who will thrive are the ones who have developed taste. Not aesthetic taste alone — the capacity to make judgements about what is better and worse, and to stand behind those judgements under pressure.",
  },
  {
    slug: "colour-as-culture",
    title: "Colour as Culture",
    excerpt: "Colour does not mean the same thing everywhere. Building a global brand means understanding what you're saying before you say it.",
    category: "Branding",
    authorName: "Morag Myerscough",
    authorTitle: "Designer & Artist",
    readTime: "5 min read",
    featured: false,
    date: new Date("2025-11-28"),
    body: "I work predominantly in public space. My work is seen by everyone — not the users of a product who have opted in, not the readers of a magazine who have made a choice, but everyone who walks past. This changes how you think about colour.\n\nIn public space, colour is a claim on attention. It is also a cultural statement. Yellow and black together carry different freight in different cities. Red means celebration in one context and warning in another and loss in a third. These are not universal codes. They are local ones, shaped by specific histories.\n\nThe global brand that applies a single colour system everywhere is not being consistent — it is being incurious. Consistency in brand is valuable. Incuriosity about audience is not.\n\nColour only fails when designers apply it without thinking about who will see it and what they will see when they do.",
  },
  {
    slug: "the-portfolio-trap",
    title: "The Portfolio Trap",
    excerpt: "Portfolios reward the spectacular and hide the mundane. Most of what makes a great designer great never makes it online.",
    category: "Strategy",
    authorName: "Chris Do",
    authorTitle: "CEO of The Futur",
    readTime: "6 min read",
    featured: false,
    date: new Date("2025-11-14"),
    body: "Junior designers spend enormous amounts of time on their portfolios. Senior designers barely touch them. This is not because senior designers have given up on presentation — it is because they have learned that the portfolio is not how they get work.\n\nWork gets you work. Reputation gets you work. Relationships get you work. The portfolio is a filter, not a funnel. It eliminates the wrong opportunities. It does not create the right ones.\n\nThe trap the portfolio creates is the optimisation trap. You start designing for the portfolio instead of for the client. You chase spectacular outcomes instead of effective ones. You decline messy, complicated, slow projects because they will not look good in a case study.\n\nA portfolio documents what you have done. It says almost nothing about who you are as a collaborator, a thinker, or a problem-solver. Start there and work backward.",
  },
];

// ── Seed runner ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database…");

  // Clear existing seeded data (users without OAuth accounts are seed users)
  await prisma.projectBadge.deleteMany({});
  await prisma.projectCredit.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.designerAgencyMembership.deleteMany({});
  await prisma.designerProfile.deleteMany({
    where: { user: { accounts: { none: {} } } },
  });
  await prisma.agencyProfile.deleteMany({
    where: { user: { accounts: { none: {} } } },
  });
  await prisma.blogPost.deleteMany({});
  await prisma.user.deleteMany({ where: { accounts: { none: {} } } });

  // Create creative users + profiles
  console.log(`  Creating ${creatives.length} creative profiles…`);
  for (const c of creatives) {
    const creativeSlug = slug(c.name);
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: `${creativeSlug}@seed.designdirectory.dev`,
        accountType: "designer",
      },
    });

    await prisma.designerProfile.create({
      data: {
        userId: user.id,
        slug: creativeSlug,
        displayName: c.name,
        title: c.title,
        bio: c.bio,
        avatarColor: nextColor(),
        initials: initials(c.name),
        locationCity: c.location.city,
        locationCountry: c.location.country,
        locationCountryCode: c.location.code,
        primaryRoles: c.primaryRoles,
        specialties: c.primaryRoles,
        tools: c.tools,
        availability: c.availability,
        experienceLevel: c.experienceLevel,
        contactWebsite: (c as any).website ?? "",
        contactEmail: "",
        contactLinkedin: (c as any).linkedin ?? "",
        contactInstagram: (c as any).instagram ?? "",
        contactBehance: (c as any).behance ?? "",
        contactDribbble: (c as any).dribbble ?? "",
        isVerified: true,
        isFeatured: false,
        awards: [],
      },
    });
  }

  // Create agency users + profiles
  console.log(`  Creating ${agencies.length} agency profiles…`);
  for (const a of agencies) {
    const agencySlug = slug(a.name);
    const user = await prisma.user.create({
      data: {
        name: a.name,
        email: `${agencySlug}@seed.designdirectory.dev`,
        accountType: "agency",
      },
    });

    await prisma.agencyProfile.create({
      data: {
        userId: user.id,
        slug: agencySlug,
        displayName: a.name,
        bio: a.bio,
        logoColor: nextColor(),
        locationCity: a.location.city,
        locationCountry: a.location.country,
        locationCountryCode: a.location.code,
        teamSize: a.teamSize,
        specialties: a.specialties,
        pastClients: a.pastClients,
        contactWebsite: (a as any).website ?? "",
        contactEmail: "",
        contactLinkedin: (a as any).linkedin ?? "",
        contactInstagram: (a as any).instagram ?? "",
        contactBehance: "",
        contactDribbble: "",
        isVerified: true,
      },
    });
  }

  // Create blog posts
  console.log(`  Creating ${posts.length} blog posts…`);
  for (const p of posts) {
    await prisma.blogPost.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        category: p.category,
        authorName: p.authorName,
        authorTitle: p.authorTitle,
        readTime: p.readTime,
        featured: p.featured,
        publishedAt: p.date,
      },
    });
  }

  const profileCount  = await prisma.designerProfile.count();
  const agencyCount   = await prisma.agencyProfile.count();
  const blogPostCount = await prisma.blogPost.count();

  console.log(`\n✅ Seeded:`);
  console.log(`   ${profileCount} creative profiles`);
  console.log(`   ${agencyCount} agency profiles`);
  console.log(`   ${blogPostCount} blog posts`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
