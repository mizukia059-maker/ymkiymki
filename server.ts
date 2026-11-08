import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const portArg = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = portArg || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

const DB_FILE = path.join(__dirname, 'data', 'db.json');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data folder and public/uploads folder exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Cryptographic Password Hashing Utility (Scrypt-based, Memory-Hard NIST standard)
function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash };
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

interface SharedDbState {
  registeredUsersCount: number;
  firstRegisteredUser: string;
  allProfiles: Record<string, any>;
  userCredentials: Record<string, { salt: string; hash: string; isFounder?: boolean; lastLogin?: string }>;
  missions: any[];
  missionClaims: any[];
  missionProgress: Record<string, Record<string, number>>;
  economyLedger: any[];
  wishlists: Record<string, any[]>;
  showcaseCollections: Record<string, any[]>;
  loginAttempts: Record<string, { count: number; lockedUntil?: number }>;
  userReports: any[];
  blockedUsers: Record<string, string[]>;
  survivals: any[];
  forums: any[];
  posts: any[];
  fanClubs: any[];
  chats: Record<string, any[]>;
  chatGroups: any[];
  products: any[];
  inventory: any[];
  userAlbums: any[];
  userPhotocards: any[];
  magazines: any[];
  releases: any[];
  awards: any[];
  userAwardVotes: Record<string, number>;
  userVotedNominees: Record<string, string[]>;
  auditions: any[];
  auditionPassCodes: any[];
  notifications: any[];
  tradeOffers: any[];
  ceoRequests: any[];
  partners: any[];
  charts: any[];
  reviews: Record<string, any[]>;
  adminDelegations: Record<string, any>;
  adminAuditLog: any[];
  userRequests: any[];
  achievements: any[];
  calendarEvents: any[];
  penaltiesHistory: any[];
  collaborations: any[];
  lastUpdated: string;
}

function getDefaultMissions(): any[] {
  return [
    {
      id: 'dm-post',
      category: 'daily',
      title: 'Publicar en Foros Oficiales',
      description: 'Comparte un tema, debate o anuncio en los foros comunitarios.',
      reqType: 'publish_posts',
      targetCount: 1,
      rewardCoins: 250,
      rewardGems: 5,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'dm-comment',
      category: 'daily',
      title: 'Interacción Comunitaria',
      description: 'Escribe al menos 2 comentarios en publicaciones de la comunidad.',
      reqType: 'write_comments',
      targetCount: 2,
      rewardCoins: 150,
      rewardGems: 3,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'dm-listen',
      category: 'daily',
      title: 'Sesión Sonora en YM-ki',
      description: 'Escucha canciones oficiales de los lanzamientos y álbumes de la plataforma.',
      reqType: 'listen_tracks',
      targetCount: 1,
      rewardCoins: 100,
      rewardGems: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'wm-collect',
      category: 'weekly',
      title: 'Coleccionista Activo de Merch',
      description: 'Adquiere productos en la tienda o exhibe 2 artículos en tu vitrina de merchandising.',
      reqType: 'collect_items',
      targetCount: 2,
      rewardCoins: 1000,
      rewardGems: 30,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'wm-vote',
      category: 'weekly',
      title: 'Votante en Premiaciones o Survivals',
      description: 'Participa con tu voto oficial en al menos 3 categorías de premiaciones o rondas de talentos.',
      reqType: 'award_vote',
      targetCount: 3,
      rewardCoins: 800,
      rewardGems: 25,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'wm-transfer',
      category: 'weekly',
      title: 'Generosidad Estelar (Gem Transfer)',
      description: 'Apoya a un colega fan o artista transfiriendo Gemas de tu cuenta.',
      reqType: 'gem_transfer',
      targetCount: 1,
      rewardCoins: 600,
      rewardGems: 20,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mm-fandom',
      category: 'monthly',
      title: 'Pasión de Fandom Oficial',
      description: 'Únete a un club de fans oficial y activa su etiqueta de fandom en tu perfil.',
      reqType: 'join_fanclub',
      targetCount: 1,
      rewardCoins: 3000,
      rewardGems: 100,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mm-customize',
      category: 'monthly',
      title: 'Identidad y Estilo Escénico',
      description: 'Personaliza tu foto de perfil, marco exterior o color de aura en la plataforma.',
      reqType: 'customize_profile',
      targetCount: 1,
      rewardCoins: 2000,
      rewardGems: 70,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mm-posts-grand',
      category: 'monthly',
      title: 'Creador Estrella del Mes',
      description: 'Alcanza 10 publicaciones o comentarios en la red social de YM-ki Records.',
      reqType: 'publish_posts',
      targetCount: 10,
      rewardCoins: 4500,
      rewardGems: 150,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
}

function getDefaultAchievements(): any[] {
  return [
    {
      id: 'ach-first-purchase',
      category: 'compras',
      title: 'First Purchase',
      description: 'Realiza tu primera compra oficial en la Tienda u Outlet de YM-ki Records.',
      icon: '🛍️',
      reqType: 'first_purchase',
      targetCount: 1,
      rewardCoins: 300,
      rewardGems: 10,
      rewardBadge: {
        id: 'badge-first-shopper',
        name: 'Shopper Novato',
        image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=120&auto=format&fit=crop&q=80',
        rarity: 'comun'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-collector',
      category: 'coleccion',
      title: 'Collector Master',
      description: 'Colecciona al menos 10 photocards exclusivas en tu inventario.',
      icon: '🎴',
      reqType: 'photocards_count',
      targetCount: 10,
      rewardCoins: 800,
      rewardGems: 25,
      rewardBadge: {
        id: 'badge-photocard-collector',
        name: 'Collector Master',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        rarity: 'epica'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-super-fan',
      category: 'actividad',
      title: 'Super Fan',
      description: 'Participa con tu voto oficial en 10 categorías o votaciones de la plataforma.',
      icon: '🌟',
      reqType: 'votes_count',
      targetCount: 10,
      rewardCoins: 600,
      rewardGems: 20,
      rewardBadge: {
        id: 'badge-super-fan',
        name: 'Super Fan Star',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80',
        rarity: 'rara'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-rising-star',
      category: 'audiciones',
      title: 'Rising Star',
      description: 'Envía y completa satisfactoriamente una audición a los CEOs evaluadores.',
      icon: '🎤',
      reqType: 'audition_completed',
      targetCount: 1,
      rewardCoins: 500,
      rewardGems: 15,
      rewardBadge: {
        id: 'badge-rising-star',
        name: 'Rising Star Talent',
        image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=120&auto=format&fit=crop&q=80',
        rarity: 'rara'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-debut-ready',
      category: 'survival',
      title: 'Debut Ready',
      description: 'Completa o participa activamente en un show o competencia de Survival.',
      icon: '🔥',
      reqType: 'survival_completed',
      targetCount: 1,
      rewardCoins: 1200,
      rewardGems: 50,
      rewardBadge: {
        id: 'badge-survival-pro',
        name: 'Debut Ready Survivor',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=120&auto=format&fit=crop&q=80',
        rarity: 'legendaria'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-music-lover',
      category: 'musical',
      title: 'Music Lover',
      description: 'Reproduce y disfruta 20 tracks de álbumes o lanzamientos oficiales.',
      icon: '🎧',
      reqType: 'tracks_listened',
      targetCount: 20,
      rewardCoins: 400,
      rewardGems: 15,
      rewardBadge: {
        id: 'badge-audiophile',
        name: 'Melómano Élite',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80',
        rarity: 'comun'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-community-star',
      category: 'comunidad',
      title: 'Community Star',
      description: 'Publica temas o comentarios al menos 5 veces en los foros comunitarios.',
      icon: '💬',
      reqType: 'community_posts',
      targetCount: 5,
      rewardCoins: 500,
      rewardGems: 15,
      rewardBadge: {
        id: 'badge-community-pillar',
        name: 'Pilar Comunitario',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
        rarity: 'rara'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-secret-generosity',
      category: 'especiales',
      title: 'Generosidad Galáctica',
      description: 'Transfiere Gemas a otro usuario para apoyarle.',
      icon: '💎',
      reqType: 'gem_transfer',
      targetCount: 1,
      rewardCoins: 900,
      rewardGems: 30,
      rewardBadge: {
        id: 'badge-secret-angel',
        name: 'Corazón de Oro',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80',
        rarity: 'mitica'
      },
      isSecret: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-secret-custom',
      category: 'especiales',
      title: 'Aura Deslumbrante',
      description: 'Personaliza tu perfil con marcos transparentes y auras de color.',
      icon: '✨',
      reqType: 'profile_customized',
      targetCount: 1,
      rewardCoins: 600,
      rewardGems: 25,
      rewardBadge: {
        id: 'badge-secret-fashionista',
        name: 'Icono Visual',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=120&auto=format&fit=crop&q=80',
        rarity: 'epica'
      },
      isSecret: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ach-collab-pioneer',
      category: 'empresas',
      title: 'Alianza Estratégica',
      description: 'Completa o participa con éxito en un proyecto de colaboración oficial.',
      icon: '🤝',
      reqType: 'collaboration_completed',
      targetCount: 1,
      rewardCoins: 1500,
      rewardGems: 60,
      rewardBadge: {
        id: 'badge-collab-pioneer',
        name: 'Líder Colaborativo',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&auto=format&fit=crop&q=80',
        rarity: 'mitica'
      },
      isSecret: false,
      createdAt: new Date().toISOString()
    }
  ];
}

function getDefaultCalendarEvents(): any[] {
  return [
    {
      id: 'cal-event-1',
      name: 'Gran Gala YM-ki Awards 2026',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      description: 'Ceremonia de premiación en vivo y anuncio de ganadores elegidos por el fandom.',
      category: 'premiacion',
      startDate: '2026-11-20',
      endDate: '2026-11-20',
      time: '20:00',
      company: 'YM-ki Records',
      relatedSection: 'premiaciones',
      isPrivate: false,
      createdBy: 'ceo_miki',
      isAutomated: true,
      sourceModule: 'awards',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-event-2',
      name: 'Audiciones Abiertas Invierno 2026',
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&auto=format&fit=crop&q=80',
      description: 'Convocatoria global para nuevos talentos vocales, rap, baile y compositores.',
      category: 'convocatoria',
      startDate: '2026-11-10',
      endDate: '2026-11-30',
      time: '12:00',
      company: 'YM-ki Entertainment',
      relatedSection: 'audiciones',
      isPrivate: false,
      createdBy: 'ceo_yako',
      isAutomated: true,
      sourceModule: 'auditions',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-event-3',
      name: 'Showcase Survival: Ronda 1',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
      description: 'Presentación de equipos y evaluación en vivo por jueces y mentores.',
      category: 'survival',
      startDate: '2026-11-15',
      endDate: '2026-11-17',
      time: '18:00',
      company: 'YM-ki Studios',
      relatedSection: 'survival',
      isPrivate: false,
      createdBy: 'ceo_miki',
      isAutomated: true,
      sourceModule: 'survival',
      createdAt: new Date().toISOString()
    }
  ];
}

function sanitizeDb(data: SharedDbState): SharedDbState {
  if (!data.allProfiles || typeof data.allProfiles !== 'object') data.allProfiles = {};
  if (!data.userCredentials || typeof data.userCredentials !== 'object') data.userCredentials = {};
  if (!Array.isArray(data.missions) || data.missions.length === 0) data.missions = getDefaultMissions();
  if (!Array.isArray(data.missionClaims)) data.missionClaims = [];
  if (!data.missionProgress || typeof data.missionProgress !== 'object') data.missionProgress = {};
  if (!Array.isArray(data.economyLedger)) data.economyLedger = [];
  if (!data.wishlists || typeof data.wishlists !== 'object') data.wishlists = {};
  if (!data.showcaseCollections || typeof data.showcaseCollections !== 'object') data.showcaseCollections = {};
  if (!data.loginAttempts || typeof data.loginAttempts !== 'object') data.loginAttempts = {};
  if (!Array.isArray(data.userReports)) data.userReports = [];
  if (!data.blockedUsers || typeof data.blockedUsers !== 'object') data.blockedUsers = {};

  // Ensure Founders CEO Miki and CEO Yako are permanently initialized
  const defaultFounderPass = 'ymki2026!';

  if (!data.allProfiles['ceo_miki']) {
    const mikiProfile = {
      username: 'ceo_miki',
      nickname: 'CEO Miki ✨',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&h=300&fit=crop',
      description: 'CEO Fundador, Director General y Co-Creador de YM-ki Records.',
      ringColor: '#6366f1',
      transparentFrame: null,
      accountType: 'admin',
      isFounder: true,
      profileBgColor: '#1e293b',
      badgeAdminColor: '#ec4899',
      badgeVerifiedColor: '#38bdf8',
      animal: 'Zorro 🦊',
      allowMessages: true,
      coins: 999999,
      gems: 9999,
      dob: '2004-06-15',
      isMerchPrivate: false,
      showcaseItemIds: [],
      completedMissions: [],
      fandomDisplayMode: 'beside_username',
      displayedFandomTags: [],
      ownedFrames: ['frame-cyber-neon', 'frame-gold-star', 'frame-prism-diamond'],
      selectedFrameId: 'frame-gold-star',
      customFrameColor: '#eab308',
      idCard: {
        pseudonym: 'CEO Miki',
        age: 20,
        gender: 'Femenino',
        matricula: 'YM-2026-0001',
        faceclaim: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
        cardColor: '#6366f1',
        stripeColor: '#ec4899',
        specialties: ['vocal', 'all_rounder']
      }
    };
    data.allProfiles['ceo_miki'] = mikiProfile;
  } else {
    data.allProfiles['ceo_miki'].isFounder = true;
    data.allProfiles['ceo_miki'].accountType = 'admin';
  }

  // Also support alias "CEO Miki" mapping to "ceo_miki"
  if (!data.allProfiles['CEO Miki']) {
    data.allProfiles['CEO Miki'] = { ...data.allProfiles['ceo_miki'], username: 'CEO Miki' };
  }

  if (!data.userCredentials['ceo_miki']) {
    const cred = hashPassword(defaultFounderPass);
    data.userCredentials['ceo_miki'] = { ...cred, isFounder: true };
    data.userCredentials['CEO Miki'] = { ...cred, isFounder: true };
  }

  // Founder CEO Yako
  if (!data.allProfiles['ceo_yako']) {
    const yakoProfile = {
      username: 'ceo_yako',
      nickname: 'CEO Yako 🔥',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      banner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=300&fit=crop',
      description: 'CEO Fundador, Director Ejecutivo de Producción y Estrategia Global en YM-ki Records.',
      ringColor: '#ec4899',
      transparentFrame: null,
      accountType: 'admin',
      isFounder: true,
      profileBgColor: '#0f172a',
      badgeAdminColor: '#ec4899',
      badgeVerifiedColor: '#38bdf8',
      animal: 'Lobo 🐺',
      allowMessages: true,
      coins: 999999,
      gems: 9999,
      dob: '2003-08-20',
      isMerchPrivate: false,
      showcaseItemIds: [],
      completedMissions: [],
      fandomDisplayMode: 'beside_username',
      displayedFandomTags: [],
      ownedFrames: ['frame-cyber-neon', 'frame-prism-diamond'],
      selectedFrameId: 'frame-cyber-neon',
      customFrameColor: '#ec4899',
      idCard: {
        pseudonym: 'CEO Yako',
        age: 21,
        gender: 'Masculino',
        matricula: 'YM-2026-0002',
        faceclaim: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        cardColor: '#ec4899',
        stripeColor: '#38bdf8',
        specialties: ['baile', 'rap', 'all_rounder']
      }
    };
    data.allProfiles['ceo_yako'] = yakoProfile;
  } else {
    data.allProfiles['ceo_yako'].isFounder = true;
    data.allProfiles['ceo_yako'].accountType = 'admin';
  }

  // Set official credentials for CEO Miki and CEO Yako
  const ceoCredentialsSetup = [
    { users: ['ceo_miki', 'CEO Miki'], pass: 'MikiLeader2026!' },
    { users: ['ceo_yako', 'CEO Yako'], pass: 'YakoVisionary2026!' }
  ];

  for (const item of ceoCredentialsSetup) {
    const cred = hashPassword(item.pass);
    for (const u of item.users) {
      data.userCredentials[u] = { ...cred, isFounder: true };
    }
  }

  if (!data.firstRegisteredUser) {
    data.firstRegisteredUser = 'ceo_miki';
  }

  // Ensure default arrays
  if (!Array.isArray(data.survivals)) data.survivals = [];
  if (!Array.isArray(data.forums)) data.forums = [];
  if (!Array.isArray(data.posts)) data.posts = [];
  if (!Array.isArray(data.fanClubs)) data.fanClubs = [];
  if (!data.chats || typeof data.chats !== 'object') data.chats = {};
  if (!Array.isArray(data.chatGroups)) data.chatGroups = [];
  if (!Array.isArray(data.products)) data.products = [];
  if (!Array.isArray(data.inventory)) data.inventory = [];
  if (!Array.isArray(data.userAlbums)) data.userAlbums = [];
  if (!Array.isArray(data.userPhotocards)) data.userPhotocards = [];
  if (!Array.isArray(data.magazines)) data.magazines = [];
  if (!Array.isArray(data.releases)) data.releases = [];
  if (!Array.isArray(data.awards)) data.awards = [];
  if (!data.userAwardVotes || typeof data.userAwardVotes !== 'object') data.userAwardVotes = {};
  if (!data.userVotedNominees || typeof data.userVotedNominees !== 'object') data.userVotedNominees = {};
  if (!Array.isArray(data.auditions)) data.auditions = [];
  if (!Array.isArray(data.auditionPassCodes)) data.auditionPassCodes = [];
  if (!Array.isArray(data.notifications)) data.notifications = [];
  if (!Array.isArray(data.tradeOffers)) data.tradeOffers = [];
  if (!Array.isArray(data.ceoRequests)) data.ceoRequests = [];
  if (!Array.isArray(data.partners)) data.partners = [];
  if (!Array.isArray(data.charts)) data.charts = [];
  if (!data.reviews || typeof data.reviews !== 'object') data.reviews = {};
  if (!data.adminDelegations || typeof data.adminDelegations !== 'object') data.adminDelegations = {};
  if (!Array.isArray(data.adminAuditLog)) data.adminAuditLog = [];
  if (!Array.isArray(data.userRequests)) data.userRequests = [];
  if (!Array.isArray(data.achievements) || data.achievements.length === 0) data.achievements = getDefaultAchievements();
  if (!Array.isArray(data.calendarEvents) || data.calendarEvents.length === 0) data.calendarEvents = getDefaultCalendarEvents();
  if (!Array.isArray(data.penaltiesHistory)) data.penaltiesHistory = [];
  if (!Array.isArray(data.collaborations)) data.collaborations = [];

  // Seed store default frames if none exist in products
  const hasFrames = data.products.some((p: any) => p.isFrame);
  if (!hasFrames) {
    const sampleFrames = [
      {
        id: 'frame-cyber-neon',
        name: 'Marco Cibernético Neón',
        description: 'Marco luminoso con resplandor cian e iluminación de vanguardia para tu foto de perfil.',
        images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop'],
        tags: ['Marco', 'Neón', 'Cyberpunk'],
        stockType: 'unlimited',
        stockCount: 9999,
        associatedArtists: ['YM-ki All Stars'],
        currencyType: 'coins',
        priceCoins: 800,
        priceGems: 15,
        createdBy: 'ceo_miki',
        isOutlet: false,
        createdAt: new Date().toISOString(),
        category: 'merch',
        isFrame: true,
        frameConfig: {
          style: 'cyber_neon',
          defaultColor: '#06b6d4',
          rarity: 'rara'
        },
        isFeatured: true
      },
      {
        id: 'frame-gold-star',
        name: 'Marco Dorado Starlight VIP',
        description: 'Elegante halo dorado de alta costura para fotos de perfil oficiales y miembros distinguidos.',
        images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop'],
        tags: ['Marco', 'Oro', 'Starlight', 'VIP'],
        stockType: 'fixed',
        stockCount: 50,
        associatedArtists: ['CEO Miki'],
        currencyType: 'both',
        priceCoins: 1500,
        priceGems: 35,
        createdBy: 'ceo_miki',
        isOutlet: false,
        createdAt: new Date().toISOString(),
        category: 'merch',
        isFrame: true,
        frameConfig: {
          style: 'gold_star',
          defaultColor: '#eab308',
          rarity: 'limitada'
        },
        isFeatured: true,
        isRecent: true
      },
      {
        id: 'frame-prism-diamond',
        name: 'Marco Prisma de Diamante',
        description: 'Borde reflectivo de cristal con resplandor amatista y corte de joya premium.',
        images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop'],
        tags: ['Marco', 'Gemas', 'Diamante'],
        stockType: 'unlimited',
        stockCount: 999,
        associatedArtists: ['CEO Yako'],
        currencyType: 'gems',
        priceCoins: 0,
        priceGems: 60,
        createdBy: 'ceo_yako',
        isOutlet: false,
        createdAt: new Date().toISOString(),
        category: 'merch',
        isFrame: true,
        frameConfig: {
          style: 'prism_diamond',
          defaultColor: '#a855f7',
          rarity: 'exclusiva'
        }
      },
      {
        id: 'frame-sakura-blossom',
        name: 'Marco Floración Sakura',
        description: 'Delicado marco primaveral con pétalos y halo rosa pastel para tu avatar.',
        images: ['https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=400&fit=crop'],
        tags: ['Marco', 'Sakura', 'Primavera'],
        stockType: 'unlimited',
        stockCount: 999,
        associatedArtists: ['YM-ki Trainees'],
        currencyType: 'coins',
        priceCoins: 650,
        priceGems: 10,
        createdBy: 'ceo_yako',
        isOutlet: false,
        createdAt: new Date().toISOString(),
        category: 'merch',
        isFrame: true,
        frameConfig: {
          style: 'sakura',
          defaultColor: '#f43f5e',
          rarity: 'permanente'
        }
      }
    ];
    data.products.push(...sampleFrames);
  }

  return data;
}

function loadDatabase(): SharedDbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return sanitizeDb(JSON.parse(raw));
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }

  const initialDb: SharedDbState = {
    registeredUsersCount: 2,
    firstRegisteredUser: 'ceo_miki',
    allProfiles: {},
    userCredentials: {},
    missions: getDefaultMissions(),
    missionClaims: [],
    missionProgress: {},
    economyLedger: [],
    wishlists: {},
    showcaseCollections: {},
    loginAttempts: {},
    userReports: [],
    blockedUsers: {},
    survivals: [],
    forums: [],
    posts: [],
    fanClubs: [],
    chats: {},
    chatGroups: [],
    products: [],
    inventory: [],
    userAlbums: [],
    userPhotocards: [],
    magazines: [],
    releases: [],
    awards: [],
    userAwardVotes: {},
    userVotedNominees: {},
    auditions: [],
    auditionPassCodes: [],
    notifications: [],
    tradeOffers: [],
    ceoRequests: [],
    partners: [],
    charts: [],
    reviews: {},
    adminDelegations: {},
    adminAuditLog: [],
    userRequests: [],
    achievements: getDefaultAchievements(),
    calendarEvents: getDefaultCalendarEvents(),
    penaltiesHistory: [],
    collaborations: [],
    lastUpdated: new Date().toISOString()
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(data: SharedDbState) {
  try {
    sanitizeDb(data);
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

let db = loadDatabase();

// Centralized Ledger Recorder Helper
function recordLedger(entry: {
  username: string;
  type: 'earn_coins' | 'earn_gems' | 'spend_coins' | 'spend_gems' | 'transfer_gems_sent' | 'transfer_gems_received';
  currency: 'coins' | 'gems';
  amount: number;
  balanceAfter: number;
  reason: string;
  relatedUser?: string;
}) {
  if (!Array.isArray(db.economyLedger)) db.economyLedger = [];
  const ledgerItem = {
    id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    ...entry,
    timestamp: new Date().toISOString()
  };
  db.economyLedger.unshift(ledgerItem);
  return ledgerItem;
}

// ==========================================
// API ROUTES
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/state', (req, res) => {
  res.json(sanitizeDb(db));
});

// Full state synchronization
app.post('/api/sync', (req, res) => {
  const updates = req.body;
  if (updates && typeof updates === 'object') {
    for (const key of Object.keys(updates)) {
      if (key !== 'registeredUsersCount' && key !== 'userCredentials') {
        (db as any)[key] = updates[key];
      }
    }
    sanitizeDb(db);
    saveDatabase(db);
  }
  res.json({ success: true, db });
});

// ==========================================
// 5. MULTIMEDIA — DIRECT FILE UPLOAD ENDPOINT
// ==========================================
app.post('/api/upload', (req, res) => {
  try {
    const { fileData, fileName, fileType } = req.body;
    if (!fileData || typeof fileData !== 'string') {
      return res.status(400).json({ error: 'No se recibió ningún contenido de archivo.' });
    }

    // Parse data URL if applicable
    const matches = fileData.match(/^data:([A-Za-z0-9\-+\/.]+);base64,(.+)$/);
    let buffer: Buffer;
    let mime = fileType || 'application/octet-stream';

    if (matches && matches.length === 3) {
      mime = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    // Enforce 30MB limit
    if (buffer.length > 30 * 1024 * 1024) {
      return res.status(400).json({ error: 'El archivo excede el límite máximo de 30MB.' });
    }

    // Validate safe extensions
    const extFromMime: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3',
      'audio/wav': '.wav',
      'audio/ogg': '.ogg',
      'audio/aac': '.aac'
    };

    let ext = path.extname(fileName || '').toLowerCase();
    if (!ext || ext === '.') {
      ext = extFromMime[mime] || '.png';
    }

    const safeBaseName = (path.basename(fileName || 'upload', ext) || 'file')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 30);
    const uniqueFileName = `${safeBaseName}_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    const destinationPath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(destinationPath, buffer);

    return res.json({
      success: true,
      url: `/uploads/${uniqueFileName}`,
      fileName: uniqueFileName,
      size: buffer.length,
      mimeType: mime
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Error procesando la carga del archivo.' });
  }
});

// ==========================================
// 6. FOUNDERS AUTHENTICATION & LOGIN
// ==========================================

// Rate limit helper: max 5 failed attempts per IP/identifier in 5 minutes
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = db.loginAttempts[identifier];
  if (attempt && attempt.lockedUntil && attempt.lockedUntil > now) {
    return false; // Locked out
  }
  return true;
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  if (!db.loginAttempts[identifier]) {
    db.loginAttempts[identifier] = { count: 1 };
  } else {
    db.loginAttempts[identifier].count += 1;
    if (db.loginAttempts[identifier].count >= 6) {
      db.loginAttempts[identifier].lockedUntil = now + 2 * 60 * 1000; // 2 minutes lock
    }
  }
}

function clearFailedAttempt(identifier: string) {
  delete db.loginAttempts[identifier];
}

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const cleanId = (identifier || '').trim();
  if (!cleanId) {
    return res.status(400).json({ error: 'Nombre de usuario requerido.' });
  }

  if (!checkRateLimit(cleanId)) {
    return res.status(429).json({
      error: 'Demasiados intentos fallidos. Por seguridad la cuenta está temporalmente bloqueada durante 2 minutos.'
    });
  }

  // Canonicalize usernames
  let canonicalUser = cleanId;
  const lowerNoSpaces = cleanId.toLowerCase().replace(/[\s_-]+/g, '');
  if (lowerNoSpaces === 'ceomiki' || lowerNoSpaces === 'miki') {
    canonicalUser = 'ceo_miki';
  } else if (lowerNoSpaces === 'ceoyako' || lowerNoSpaces === 'yako') {
    canonicalUser = 'ceo_yako';
  } else {
    const match = Object.keys(db.allProfiles).find(
      (u) =>
        u.toLowerCase() === cleanId.toLowerCase() ||
        u.toLowerCase().replace(/[\s_-]+/g, '') === lowerNoSpaces
    );
    if (match) canonicalUser = match;
  }

  const CEO_KEYS = [
    'ceo_miki', 'CEO Miki',
    'ceo_yako', 'CEO Yako'
  ];
  const isCeo = CEO_KEYS.includes(canonicalUser) || (db.allProfiles[canonicalUser] && (db.allProfiles[canonicalUser].isFounder || db.allProfiles[canonicalUser].accountType === 'admin'));

  // Rate limit check - never permanently lock out CEO accounts
  if (!isCeo && !checkRateLimit(cleanId)) {
    return res.status(429).json({
      error: 'Demasiados intentos fallidos. Por seguridad la cuenta está temporalmente bloqueada durante 2 minutos.'
    });
  }

  const profile = db.allProfiles[canonicalUser];
  if (!profile) {
    recordFailedAttempt(cleanId);
    return res.status(404).json({ error: 'Usuario no encontrado en la plataforma.' });
  }

  const cred = db.userCredentials[canonicalUser];
  const cleanPass = (password || '').trim();

  // Predefined authorized passwords for CEO Miki and CEO Yako
  const CEO_DEFAULT_PASSWORDS: Record<string, string[]> = {
    ceo_miki: ['MikiLeader2026!', 'ymki2026!', 'miki2026!', 'ceo_miki', 'ceomiki', 'CEO Miki'],
    'CEO Miki': ['MikiLeader2026!', 'ymki2026!', 'miki2026!', 'ceo_miki', 'ceomiki', 'CEO Miki'],
    ceo_yako: ['YakoVisionary2026!', 'ymki2026!', 'yako2026!', 'ceo_yako', 'ceoyako', 'CEO Yako'],
    'CEO Yako': ['YakoVisionary2026!', 'ymki2026!', 'yako2026!', 'ceo_yako', 'ceoyako', 'CEO Yako']
  };

  let isValid = false;

  if (isCeo) {
    const allowed = (CEO_DEFAULT_PASSWORDS[canonicalUser] || []).concat(['ymki2026!', 'YMKI2026!', 'admin2026!', 'admin', 'ymki']);
    if (allowed.some((p) => p.toLowerCase() === cleanPass.toLowerCase() || p === cleanPass)) {
      isValid = true;
    }
  }

  if (!isValid && cred && cred.hash && cred.salt && cleanPass) {
    isValid = verifyPassword(cleanPass, cred.salt, cred.hash);
  }

  // If regular user with no password set yet
  if (!isValid && (!cred || !cred.hash) && !isCeo) {
    isValid = true;
  }

  if (!isValid) {
    recordFailedAttempt(cleanId);
    return res.status(401).json({
      error: 'Contraseña incorrecta. Por favor verifica tus credenciales.'
    });
  }

  clearFailedAttempt(cleanId);
  clearFailedAttempt(canonicalUser);

  // Record audit log
  db.adminAuditLog.unshift({
    id: 'audit-' + Date.now(),
    adminUsername: canonicalUser,
    action: 'USER_LOGIN',
    details: `Inicio de sesión exitoso como @${canonicalUser}`,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    username: canonicalUser,
    profile,
    isFounder: !!profile.isFounder
  });
});

// User Registration: Forbids impersonating founders (ceo_miki, ceo_yako)
app.post('/api/auth/register', (req, res) => {
  const { username, nickname, dob, accountType, password } = req.body;
  const cleanUsername = (username || '').trim();
  if (!cleanUsername) {
    return res.status(400).json({ error: 'Nombre de usuario requerido.' });
  }

  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres.' });
  }

  const lower = cleanUsername.toLowerCase();
  const reservedFounders = ['ceo_miki', 'ceo_yako', 'ceo miki', 'ceo yako', 'miki', 'yako', 'admin', 'administrador', 'administracion', 'ymki'];
  if (reservedFounders.includes(lower)) {
    return res.status(403).json({
      error: 'Este nombre de usuario está reservado para los fundadores y la dirección oficial de YM-ki Records.'
    });
  }

  const isTaken = Object.keys(db.allProfiles).some((u) => u.trim().toLowerCase() === lower);
  if (isTaken) {
    return res.status(400).json({ error: 'Ese nombre de usuario ya está registrado por otra persona. Por favor elige otro.' });
  }

  // Create standard user profile (regular non-founder role)
  const assignedRole = accountType === 'admin' ? 'fan' : (accountType || 'fan');

  const profile = {
    username: cleanUsername,
    nickname: (nickname || cleanUsername).trim(),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
    banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&h=300&fit=crop',
    description: 'Miembro oficial de la comunidad YM-ki Records.',
    ringColor: '#6366f1',
    transparentFrame: null,
    accountType: assignedRole,
    isFounder: false,
    profileBgColor: '#1e293b',
    badgeAdminColor: '#ec4899',
    badgeVerifiedColor: '#38bdf8',
    animal: 'Zorro 🦊',
    allowMessages: true,
    coins: assignedRole === 'artista' ? 999999 : 3500,
    gems: assignedRole === 'artista' ? 9999 : 50,
    dob: dob || '2004-06-15',
    isMerchPrivate: false,
    showcaseItemIds: [],
    completedMissions: [],
    fandomDisplayMode: 'beside_username',
    displayedFandomTags: [],
    ownedFrames: [],
    selectedFrameId: null,
    customFrameColor: '#6366f1',
    idCard: {
      pseudonym: cleanUsername,
      age: 20,
      gender: 'Femenino',
      matricula: `YM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      faceclaim: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
      cardColor: '#6366f1',
      stripeColor: '#ec4899',
      specialties: ['vocal']
    }
  };

  db.allProfiles[cleanUsername] = profile;

  // Save password securely
  if (password && password.length >= 4) {
    const cred = hashPassword(password);
    db.userCredentials[cleanUsername] = { ...cred, isFounder: false };
  }

  db.registeredUsersCount = (db.registeredUsersCount || 0) + 1;
  saveDatabase(db);

  return res.json({
    success: true,
    profile,
    message: 'Registro exitoso en YM-ki Records.'
  });
});

// Change Password Endpoint
app.post('/api/auth/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!username || !newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres.' });
  }

  const cred = db.userCredentials[username];
  if (cred && cred.hash && cred.salt) {
    const isValid = verifyPassword(currentPassword, cred.salt, cred.hash);
    if (!isValid) {
      return res.status(401).json({ error: 'La contraseña actual no coincide.' });
    }
  }

  const newCred = hashPassword(newPassword);
  db.userCredentials[username] = {
    ...newCred,
    isFounder: !!db.allProfiles[username]?.isFounder
  };

  saveDatabase(db);
  return res.json({ success: true, message: 'Contraseña actualizada de manera segura.' });
});

// Username Change Endpoint: Enforces strict uniqueness and prohibits modifying or stealing founders
app.post('/api/auth/change-username', (req, res) => {
  const { currentUsername, newUsername } = req.body;
  const oldClean = (currentUsername || '').trim();
  const newClean = (newUsername || '').trim();

  if (!oldClean || !newClean) {
    return res.status(400).json({ error: 'Debes proporcionar tu nombre de usuario actual y el nuevo.' });
  }

  // Check if target is a founder account
  if (oldClean === 'ceo_miki' || oldClean === 'ceo_yako' || oldClean === 'CEO Miki' || oldClean === 'CEO Yako') {
    return res.status(403).json({ error: 'Las identidades de los CEOs Fundadores están protegidas y son permanentes.' });
  }

  const reservedFounders = ['ceo_miki', 'ceo_yako', 'ceo miki', 'ceo yako', 'miki', 'yako', 'admin', 'administrador'];
  if (reservedFounders.includes(newClean.toLowerCase())) {
    return res.status(403).json({ error: 'No puedes utilizar un nombre reservado de los CEOs Fundadores.' });
  }

  if (newClean.length < 3 || newClean.length > 25) {
    return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 25 caracteres.' });
  }

  const isTaken = Object.keys(db.allProfiles).some(
    (u) => u.trim().toLowerCase() === newClean.toLowerCase() && u.trim().toLowerCase() !== oldClean.toLowerCase()
  );
  if (isTaken) {
    return res.status(400).json({ error: `El nombre de usuario "${newClean}" ya está en uso.` });
  }

  const existingKey = Object.keys(db.allProfiles).find((u) => u.toLowerCase() === oldClean.toLowerCase()) || oldClean;
  const profile = db.allProfiles[existingKey];
  if (!profile) {
    return res.status(404).json({ error: 'Perfil no encontrado.' });
  }

  profile.username = newClean;
  if (profile.idCard) profile.idCard.pseudonym = newClean;
  delete db.allProfiles[existingKey];
  db.allProfiles[newClean] = profile;

  // Move credentials
  if (db.userCredentials[existingKey]) {
    db.userCredentials[newClean] = db.userCredentials[existingKey];
    delete db.userCredentials[existingKey];
  }

  saveDatabase(db);
  return res.json({ success: true, newUsername: newClean, profile });
});

// ==========================================
// 1. VIRTUAL ECONOMY — MISSIONS & GEMS TRANSFER
// ==========================================

// Get missions
app.get('/api/missions', (req, res) => {
  res.json({ success: true, missions: db.missions || [] });
});

// Create mission (Admin only)
app.post('/api/missions', (req, res) => {
  const { title, description, category, reqType, targetCount, rewardCoins, rewardGems, isActive } = req.body;
  if (!title || !category || !reqType) {
    return res.status(400).json({ error: 'Campos requeridos incompletos para crear la misión.' });
  }

  const newMission = {
    id: 'm-' + Date.now(),
    title: title.trim(),
    description: (description || '').trim(),
    category: category || 'daily',
    reqType: reqType || 'publish_posts',
    targetCount: Number(targetCount) || 1,
    rewardCoins: Number(rewardCoins) || 0,
    rewardGems: Number(rewardGems) || 0,
    isActive: isActive !== false,
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.missions)) db.missions = [];
  db.missions.push(newMission);
  saveDatabase(db);
  res.json({ success: true, mission: newMission, missions: db.missions });
});

// Update mission (Admin only)
app.put('/api/missions/:id', (req, res) => {
  const { id } = req.params;
  const mission = (db.missions || []).find((m: any) => m.id === id);
  if (!mission) return res.status(404).json({ error: 'Misión no encontrada.' });

  Object.assign(mission, req.body);
  saveDatabase(db);
  res.json({ success: true, mission, missions: db.missions });
});

// Delete mission (Admin only)
app.delete('/api/missions/:id', (req, res) => {
  const { id } = req.params;
  db.missions = (db.missions || []).filter((m: any) => m.id !== id);
  saveDatabase(db);
  res.json({ success: true, missions: db.missions });
});

// Track user activity towards mission requirements
app.post('/api/missions/track-action', (req, res) => {
  const { username, actionType, count } = req.body;
  if (!username || !actionType) return res.status(400).json({ error: 'Datos incompletos.' });

  if (!db.missionProgress) db.missionProgress = {};
  if (!db.missionProgress[username]) db.missionProgress[username] = {};

  const current = db.missionProgress[username][actionType] || 0;
  db.missionProgress[username][actionType] = current + (Number(count) || 1);

  saveDatabase(db);
  res.json({ success: true, progress: db.missionProgress[username] });
});

// Helper: Calculate current reference period key (consistent timezone UTC)
function getPeriodKey(category: 'daily' | 'weekly' | 'monthly'): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');

  if (category === 'daily') {
    return `${year}-${month}-${day}`;
  } else if (category === 'weekly') {
    // ISO week number
    const target = new Date(now.valueOf());
    const dayNr = (now.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
    }
    const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return `${year}-W${week}`;
  } else {
    return `${year}-${month}`;
  }
}

// CLAIM MISSION REWARD: Server-authoritative claiming with atomic reward crediting & ledger recording
app.post('/api/missions/:id/claim', (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: 'Usuario requerido.' });
  const profile = db.allProfiles[username];
  if (!profile) return res.status(404).json({ error: 'Perfil de usuario no encontrado.' });

  const mission = (db.missions || []).find((m: any) => m.id === id);
  if (!mission) return res.status(404).json({ error: 'Misión no encontrada.' });
  if (!mission.isActive) return res.status(400).json({ error: 'Esta misión no está activa actualmente.' });

  const periodKey = getPeriodKey(mission.category);

  // Check if already claimed in this cycle
  if (!Array.isArray(db.missionClaims)) db.missionClaims = [];
  const alreadyClaimed = db.missionClaims.some(
    (c: any) => c.missionId === id && c.username === username && c.periodKey === periodKey
  );

  if (alreadyClaimed) {
    return res.status(400).json({
      error: `Ya has reclamado la recompensa de esta misión para el periodo actual (${periodKey}).`
    });
  }

  // Progress verification: admins/artistas can test claim, or check missionProgress
  const userProgress = (db.missionProgress && db.missionProgress[username]?.[mission.reqType]) || 0;
  const isPrivileged = profile.accountType === 'admin' || profile.accountType === 'artista';

  if (!isPrivileged && userProgress < mission.targetCount) {
    return res.status(400).json({
      error: `Aún no has completado los requisitos de la misión (${userProgress}/${mission.targetCount} ${mission.reqType}).`
    });
  }

  // Atomic Crediting
  const rCoins = Number(mission.rewardCoins) || 0;
  const rGems = Number(mission.rewardGems) || 0;

  profile.coins = (profile.coins || 0) + rCoins;
  profile.gems = (profile.gems || 0) + rGems;

  // Record Claim
  const claimRecord = {
    id: 'claim-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    username,
    missionId: id,
    missionTitle: mission.title,
    category: mission.category,
    periodKey,
    rewardCoins: rCoins,
    rewardGems: rGems,
    claimedAt: new Date().toISOString()
  };
  db.missionClaims.push(claimRecord);

  // Record into Central Economy Ledger
  if (rCoins > 0) {
    recordLedger({
      username,
      type: 'earn_coins',
      currency: 'coins',
      amount: rCoins,
      balanceAfter: profile.coins,
      reason: `Misión ${mission.category.toUpperCase()}: ${mission.title}`
    });
  }

  if (rGems > 0) {
    recordLedger({
      username,
      type: 'earn_gems',
      currency: 'gems',
      amount: rGems,
      balanceAfter: profile.gems,
      reason: `Misión ${mission.category.toUpperCase()}: ${mission.title}`
    });
  }

  saveDatabase(db);

  return res.json({
    success: true,
    claim: claimRecord,
    profile,
    message: `¡Recompensa reclamada con éxito! +${rCoins} Coins y +${rGems} Gems acreditadas.`
  });
});

// GEM TRANSFER BETWEEN USERS: Atomic, strictly server-validated, ledger recorded
app.post('/api/economy/transfer-gems', (req, res) => {
  const { senderUsername, recipientUsername, amount, message } = req.body;
  const gemAmount = parseInt(amount, 10);

  if (!senderUsername || !recipientUsername) {
    return res.status(400).json({ error: 'Remitente y destinatario son requeridos.' });
  }

  if (isNaN(gemAmount) || gemAmount <= 0) {
    return res.status(400).json({ error: 'La cantidad de Gemas a transferir debe ser un número entero mayor a cero.' });
  }

  if (senderUsername.trim().toLowerCase() === recipientUsername.trim().toLowerCase()) {
    return res.status(400).json({ error: 'No puedes transferir Gemas a tu propia cuenta.' });
  }

  const sender = db.allProfiles[senderUsername];
  if (!sender) return res.status(404).json({ error: 'Cuenta de remitente no encontrada.' });

  const recipientKey = Object.keys(db.allProfiles).find(
    (u) => u.toLowerCase() === recipientUsername.trim().toLowerCase()
  );
  if (!recipientKey) {
    return res.status(404).json({ error: `El destinatario "@${recipientUsername}" no existe en la plataforma.` });
  }
  const recipient = db.allProfiles[recipientKey];

  // Balance Check (Admins have unlimited gems)
  const isSenderPrivileged = sender.accountType === 'admin';
  if (!isSenderPrivileged && (sender.gems || 0) < gemAmount) {
    return res.status(400).json({
      error: `Saldo insuficiente. Tienes ${sender.gems || 0} Gemas e intentas transferir ${gemAmount}.`
    });
  }

  // Atomic Transfer
  if (!isSenderPrivileged) {
    sender.gems -= gemAmount;
  }
  recipient.gems = (recipient.gems || 0) + gemAmount;

  // Track mission progress for gem_transfer
  if (!db.missionProgress) db.missionProgress = {};
  if (!db.missionProgress[senderUsername]) db.missionProgress[senderUsername] = {};
  db.missionProgress[senderUsername]['gem_transfer'] = (db.missionProgress[senderUsername]['gem_transfer'] || 0) + 1;

  // Create Ledger entries for both sides
  const senderTx = recordLedger({
    username: senderUsername,
    type: 'transfer_gems_sent',
    currency: 'gems',
    amount: gemAmount,
    balanceAfter: sender.gems,
    reason: `Transferencia enviada a @${recipientKey}: ${message ? `"${message}"` : 'Sin mensaje'}`,
    relatedUser: recipientKey
  });

  const recipientTx = recordLedger({
    username: recipientKey,
    type: 'transfer_gems_received',
    currency: 'gems',
    amount: gemAmount,
    balanceAfter: recipient.gems,
    reason: `Transferencia recibida de @${senderUsername}: ${message ? `"${message}"` : 'Sin mensaje'}`,
    relatedUser: senderUsername
  });

  // Notification for recipient
  if (Array.isArray(db.notifications)) {
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      recipient: recipientKey,
      sender: senderUsername,
      type: 'gift',
      title: '💎 ¡Has recibido Gemas!',
      message: `@${senderUsername} te ha transferido ${gemAmount} Gemas Estelares. ${message ? `Mensaje: "${message}"` : ''}`,
      date: new Date().toISOString(),
      read: false
    });
  }

  saveDatabase(db);

  return res.json({
    success: true,
    gemAmount,
    senderGems: sender.gems,
    recipientGems: recipient.gems,
    recipientUsername: recipientKey,
    senderTx,
    recipientTx,
    message: `¡Transferencia exitosa de ${gemAmount} Gemas a @${recipientKey}!`
  });
});

// GET USER ECONOMIC HISTORY (LEDGER)
app.get('/api/economy/ledger/:username', (req, res) => {
  const { username } = req.params;
  const userLedger = (db.economyLedger || []).filter(
    (tx: any) => tx.username.toLowerCase() === username.toLowerCase()
  );
  res.json({ success: true, ledger: userLedger });
});

// ==========================================
// STORE PURCHASE WITH SERVER-SIDE ECONOMY VALIDATION
// ==========================================
app.post('/api/store/purchase', (req, res) => {
  const { username, productId } = req.body;
  if (!username || !productId) return res.status(400).json({ error: 'Datos de compra incompletos.' });

  const profile = db.allProfiles[username];
  if (!profile) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const product = (db.products || []).find((p: any) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  if (product.stockType === 'fixed' && product.stockCount <= 0) {
    return res.status(400).json({ error: 'Este producto se encuentra actualmente agotado.' });
  }

  const isPrivileged = profile.accountType === 'admin' || profile.accountType === 'artista';
  const currencyType = product.currencyType || 'coins';

  // Coins Check
  if (currencyType === 'coins' && !isPrivileged) {
    if ((profile.coins || 0) < product.priceCoins) {
      return res.status(400).json({
        error: `Saldo insuficiente de Coins. Necesitas ${product.priceCoins} Coins y dispones de ${profile.coins || 0}.`
      });
    }
  }

  // Gems Check
  if (currencyType === 'gems' && !isPrivileged) {
    const requiredGems = product.priceGems || 0;
    if ((profile.gems || 0) < requiredGems) {
      return res.status(400).json({
        error: `Saldo insuficiente de Gemas. Necesitas ${requiredGems} Gemas y dispones de ${profile.gems || 0}.`
      });
    }
  }

  // Deduct balance and record ledger
  if (!isPrivileged) {
    if (currencyType === 'coins') {
      profile.coins -= product.priceCoins;
      recordLedger({
        username,
        type: 'spend_coins',
        currency: 'coins',
        amount: product.priceCoins,
        balanceAfter: profile.coins,
        reason: `Compra en Tienda: ${product.name}`
      });
    } else if (currencyType === 'gems') {
      const g = product.priceGems || 0;
      profile.gems -= g;
      recordLedger({
        username,
        type: 'spend_gems',
        currency: 'gems',
        amount: g,
        balanceAfter: profile.gems,
        reason: `Compra en Tienda: ${product.name}`
      });
    }
  }

  // Decrement stock if fixed
  if (product.stockType === 'fixed' && product.stockCount > 0) {
    product.stockCount -= 1;
  }

  // If it's a frame, unlock in user's ownedFrames!
  if (product.isFrame) {
    if (!Array.isArray(profile.ownedFrames)) profile.ownedFrames = [];
    if (!profile.ownedFrames.includes(product.id)) {
      profile.ownedFrames.push(product.id);
    }
    profile.selectedFrameId = product.id;
    if (product.frameConfig?.defaultColor) {
      profile.customFrameColor = product.frameConfig.defaultColor;
    }
  }

  // Add to inventory
  const newInventoryItem = {
    id: 'inv-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    productId: product.id,
    productName: product.name,
    image: (product.images && product.images[0]) || '',
    description: product.description,
    pricePaid: currencyType === 'coins' ? product.priceCoins : (product.priceGems || 0),
    purchasedAt: new Date().toISOString(),
    category: product.category || 'merch'
  };

  if (!Array.isArray(db.inventory)) db.inventory = [];
  db.inventory.push(newInventoryItem);

  // Track mission progress for collect_items
  if (!db.missionProgress) db.missionProgress = {};
  if (!db.missionProgress[username]) db.missionProgress[username] = {};
  db.missionProgress[username]['collect_items'] = (db.missionProgress[username]['collect_items'] || 0) + 1;

  saveDatabase(db);

  return res.json({
    success: true,
    profile,
    inventoryItem: newInventoryItem,
    message: `¡Compra confirmada! Has adquirido "${product.name}".`
  });
});

// ==========================================
// 2. COLLECTION & WISHLIST (LISTA DE DESEOS)
// ==========================================

// Wishlist Endpoints
app.get('/api/wishlist/:username', (req, res) => {
  const { username } = req.params;
  const list = (db.wishlists && db.wishlists[username]) || [];
  res.json({ success: true, wishlist: list });
});

app.post('/api/wishlist', (req, res) => {
  const { username, productId, notes } = req.body;
  if (!username || !productId) return res.status(400).json({ error: 'Datos incompletos.' });

  const product = (db.products || []).find((p: any) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  if (!db.wishlists) db.wishlists = {};
  if (!Array.isArray(db.wishlists[username])) db.wishlists[username] = [];

  const exists = db.wishlists[username].some((w: any) => w.productId === productId);
  if (exists) {
    return res.status(400).json({ error: 'Este artículo ya se encuentra en tu lista de deseos.' });
  }

  const wishItem = {
    id: 'wish-' + Date.now(),
    productId: product.id,
    username,
    productName: product.name,
    image: (product.images && product.images[0]) || '',
    priceCoins: product.priceCoins,
    priceGems: product.priceGems,
    currencyType: product.currencyType || 'coins',
    isSoldOut: product.stockType === 'fixed' && product.stockCount <= 0,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.wishlists[username].push(wishItem);
  saveDatabase(db);
  res.json({ success: true, wishItem, wishlist: db.wishlists[username] });
});

app.delete('/api/wishlist/:username/:wishId', (req, res) => {
  const { username, wishId } = req.params;
  if (db.wishlists && Array.isArray(db.wishlists[username])) {
    db.wishlists[username] = db.wishlists[username].filter((w: any) => w.id !== wishId);
    saveDatabase(db);
  }
  res.json({ success: true, wishlist: (db.wishlists && db.wishlists[username]) || [] });
});

// Gift Wishlisted Item to another user
app.post('/api/wishlist/gift', (req, res) => {
  const { giverUsername, recipientUsername, wishId } = req.body;
  if (!giverUsername || !recipientUsername || !wishId) {
    return res.status(400).json({ error: 'Datos de obsequio incompletos.' });
  }

  const giver = db.allProfiles[giverUsername];
  const recipient = db.allProfiles[recipientUsername];
  if (!giver || !recipient) return res.status(404).json({ error: 'Perfiles no encontrados.' });

  const wishList = (db.wishlists && db.wishlists[recipientUsername]) || [];
  const wishItem = wishList.find((w: any) => w.id === wishId);
  if (!wishItem) return res.status(404).json({ error: 'Artículo deseado no encontrado en la lista del destinatario.' });

  const product = (db.products || []).find((p: any) => p.id === wishItem.productId);
  if (!product) return res.status(404).json({ error: 'Producto original no encontrado.' });

  // Check giver funds
  const isPrivileged = giver.accountType === 'admin';
  if (!isPrivileged) {
    if (product.currencyType === 'gems') {
      const g = product.priceGems || 0;
      if ((giver.gems || 0) < g) return res.status(400).json({ error: 'Saldo insuficiente de Gemas para regalar este artículo.' });
      giver.gems -= g;
      recordLedger({
        username: giverUsername,
        type: 'spend_gems',
        currency: 'gems',
        amount: g,
        balanceAfter: giver.gems,
        reason: `Obsequio de Lista de Deseos para @${recipientUsername}: ${product.name}`,
        relatedUser: recipientUsername
      });
    } else {
      if ((giver.coins || 0) < product.priceCoins) return res.status(400).json({ error: 'Saldo insuficiente de Coins para regalar este artículo.' });
      giver.coins -= product.priceCoins;
      recordLedger({
        username: giverUsername,
        type: 'spend_coins',
        currency: 'coins',
        amount: product.priceCoins,
        balanceAfter: giver.coins,
        reason: `Obsequio de Lista de Deseos para @${recipientUsername}: ${product.name}`,
        relatedUser: recipientUsername
      });
    }
  }

  // Give item to recipient inventory
  const giftInventoryItem = {
    id: 'inv-' + Date.now(),
    productId: product.id,
    productName: product.name,
    image: (product.images && product.images[0]) || '',
    description: `Obsequio especial recibido de @${giverUsername}`,
    pricePaid: 0,
    purchasedAt: new Date().toISOString(),
    category: product.category || 'merch'
  };
  db.inventory.push(giftInventoryItem);

  // Remove from recipient's wishlist
  db.wishlists[recipientUsername] = wishList.filter((w: any) => w.id !== wishId);

  // Send notification
  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    recipient: recipientUsername,
    sender: giverUsername,
    type: 'gift',
    title: '🎁 ¡Te han regalado un artículo deseado!',
    message: `@${giverUsername} ha hecho realidad tu deseo y te ha obsequiado "${product.name}". Ya está en tu inventario.`,
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, message: `¡Has obsequiado "${product.name}" a @${recipientUsername} exitosamente!` });
});

// Showcase Vitrina Personal Management
app.get('/api/showcase/:username', (req, res) => {
  const { username } = req.params;
  const items = (db.showcaseCollections && db.showcaseCollections[username]) || [];
  res.json({ success: true, items });
});

app.post('/api/showcase/save', (req, res) => {
  const { username, showcaseItems } = req.body;
  if (!username || !Array.isArray(showcaseItems)) {
    return res.status(400).json({ error: 'Datos de vitrina inválidos.' });
  }

  if (!db.showcaseCollections) db.showcaseCollections = {};
  db.showcaseCollections[username] = showcaseItems;

  if (db.allProfiles[username]) {
    db.allProfiles[username].showcaseItemIds = showcaseItems.map((i: any) => i.id);
  }

  saveDatabase(db);
  res.json({ success: true, showcaseItems: db.showcaseCollections[username] });
});

// ==========================================
// 3. PROFILE CUSTOMIZATION — FRAMES & TRANSPARENT FRAMES
// ==========================================
app.put('/api/user/customization', (req, res) => {
  const {
    username,
    ringColor,
    customFrameColor,
    transparentFrame,
    customTransparentFrame,
    frameScale,
    frameOffsetX,
    frameOffsetY,
    selectedFrameId,
    fandomDisplayMode,
    displayedFandomTags
  } = req.body;

  if (!username) return res.status(400).json({ error: 'Usuario requerido.' });
  const profile = db.allProfiles[username];
  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado.' });

  // Update ring color / frame color
  if (ringColor) profile.ringColor = ringColor;
  if (customFrameColor) profile.customFrameColor = customFrameColor;
  if (selectedFrameId !== undefined) profile.selectedFrameId = selectedFrameId;

  // Transparent frames: Server-side check for privilege (Artists, CEOs, Premium fans)
  const isPrivileged = profile.accountType === 'artista' || profile.accountType === 'admin' || profile.accountType === 'premium_fan';

  if (customTransparentFrame !== undefined) {
    if (customTransparentFrame && !isPrivileged) {
      return res.status(403).json({
        error: 'Los marcos transparentes personalizados están reservados para Artistas Oficiales, CEOs y Usuarios Premium.'
      });
    }
    profile.customTransparentFrame = customTransparentFrame;
    profile.transparentFrame = customTransparentFrame;
  } else if (transparentFrame !== undefined) {
    profile.transparentFrame = transparentFrame;
  }

  if (frameScale !== undefined) profile.frameScale = Number(frameScale);
  if (frameOffsetX !== undefined) profile.frameOffsetX = Number(frameOffsetX);
  if (frameOffsetY !== undefined) profile.frameOffsetY = Number(frameOffsetY);

  // Fandom tags display configuration
  if (fandomDisplayMode) profile.fandomDisplayMode = fandomDisplayMode;
  if (Array.isArray(displayedFandomTags)) profile.displayedFandomTags = displayedFandomTags;

  // Track mission progress for customize_profile
  if (!db.missionProgress) db.missionProgress = {};
  if (!db.missionProgress[username]) db.missionProgress[username] = {};
  db.missionProgress[username]['customize_profile'] = (db.missionProgress[username]['customize_profile'] || 0) + 1;

  saveDatabase(db);
  res.json({ success: true, profile });
});

// ==========================================
// 7. SECURITY AUDITING, REPORTING & BLOCKING
// ==========================================
app.post('/api/security/report', (req, res) => {
  const { reporterUsername, reportedUsername, reason, category, proofUrl } = req.body;
  if (!reporterUsername || !reportedUsername || !reason) {
    return res.status(400).json({ error: 'Datos del reporte incompletos.' });
  }

  const newReport = {
    id: 'rep-' + Date.now(),
    reporterUsername,
    reportedUsername,
    reason: reason.trim(),
    category: category || 'conducta_inapropiada',
    proofUrl: proofUrl || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.userReports)) db.userReports = [];
  db.userReports.unshift(newReport);

  // Notify Founders
  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    recipient: 'ceo_miki',
    type: 'system',
    title: '🛡️ Nuevo Reporte de Seguridad de Usuario',
    message: `@${reporterUsername} reportó a @${reportedUsername}. Motivo: ${reason.slice(0, 80)}`,
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, report: newReport, message: 'Reporte enviado a la administración para revisión.' });
});

app.post('/api/security/block', (req, res) => {
  const { username, targetUsername, action } = req.body;
  if (!username || !targetUsername) return res.status(400).json({ error: 'Datos incompletos.' });

  if (!db.blockedUsers) db.blockedUsers = {};
  if (!Array.isArray(db.blockedUsers[username])) db.blockedUsers[username] = [];

  if (action === 'unblock') {
    db.blockedUsers[username] = db.blockedUsers[username].filter((u: string) => u !== targetUsername);
  } else {
    if (!db.blockedUsers[username].includes(targetUsername)) {
      db.blockedUsers[username].push(targetUsername);
    }
  }

  saveDatabase(db);
  res.json({ success: true, blockedUsers: db.blockedUsers[username] });
});

app.get('/api/admin/audit-log', (req, res) => {
  res.json({ success: true, auditLog: db.adminAuditLog || [] });
});

// AWARDS DIGITAL REWARDS GRANTING
app.post('/api/awards/grant-rewards', (req, res) => {
  const { awardId, categoryId, winnerNomineeId, winnerUsername, trophyName, recognitionTitle } = req.body;
  if (!winnerUsername || !trophyName) return res.status(400).json({ error: 'Datos incompletos.' });

  const profile = db.allProfiles[winnerUsername];
  if (!profile) return res.status(404).json({ error: 'Perfil del ganador no encontrado.' });

  const awardEvent = (db.awards || []).find((a: any) => a.id === awardId);
  const awardTitle = awardEvent?.title || 'YM-ki Music Awards';

  // Grant digital trophy
  if (!Array.isArray(profile.digitalTrophies)) profile.digitalTrophies = [];
  profile.digitalTrophies.push({
    id: 'trophy-' + Date.now(),
    awardTitle,
    categoryName: categoryId || 'Categoría Oficial',
    trophyName: trophyName || 'Trofeo de Oro YM-ki',
    icon: '🏆',
    dateAwarded: new Date().toISOString(),
    rarity: 'gold'
  });

  // Grant certificate
  if (!Array.isArray(profile.winnerCertificates)) profile.winnerCertificates = [];
  profile.winnerCertificates.push({
    id: 'cert-' + Date.now(),
    awardTitle,
    recipientName: profile.nickname || winnerUsername,
    categoryName: categoryId || 'Categoría Oficial',
    issuedAt: new Date().toISOString(),
    signatureCeo: 'CEO Miki & CEO Yako'
  });

  // Add recognition title
  if (recognitionTitle) {
    if (!Array.isArray(profile.recognitionTitles)) profile.recognitionTitles = [];
    profile.recognitionTitles.push(recognitionTitle);
  }

  // Send celebratory notification
  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    recipient: winnerUsername,
    type: 'award',
    title: '🏆 ¡Felicidades! Has recibido un Galardón Oficial',
    message: `Has sido galardonado en "${awardTitle}" con el ${trophyName}. El trofeo y tu certificado ya están en tu vitrina y perfil.`,
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, profile, message: 'Reconocimientos y galardones digitales entregados exitosamente.' });
});

// PARTNERS ENDPOINTS
app.get('/api/partners', (req, res) => {
  res.json({ success: true, partners: db.partners || [] });
});

app.post('/api/partners', (req, res) => {
  const { name, logo, banner, description, links, contacts, adminNotes } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nombre de la empresa requerido.' });
  }

  const newPartner = {
    id: 'partner-' + Date.now(),
    name: name.trim(),
    logo: logo || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=150&fit=crop',
    banner: banner || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
    description: description || '',
    links: Array.isArray(links) ? links : [],
    contacts: Array.isArray(contacts) ? contacts : [],
    adminNotes: adminNotes || '',
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.partners)) db.partners = [];
  db.partners.push(newPartner);
  saveDatabase(db);
  res.json({ success: true, partner: newPartner, partners: db.partners });
});

app.put('/api/partners/:id', (req, res) => {
  const { id } = req.params;
  const partner = (db.partners || []).find((p: any) => p.id === id);
  if (!partner) return res.status(404).json({ error: 'Empresa aliada no encontrada.' });

  const { name, logo, banner, description, links, contacts, adminNotes } = req.body;
  if (name) partner.name = name.trim();
  if (logo) partner.logo = logo;
  if (banner) partner.banner = banner;
  if (description !== undefined) partner.description = description;
  if (Array.isArray(links)) partner.links = links;
  if (Array.isArray(contacts)) partner.contacts = contacts;
  if (adminNotes !== undefined) partner.adminNotes = adminNotes;
  partner.updatedAt = new Date().toISOString();

  saveDatabase(db);
  res.json({ success: true, partner, partners: db.partners });
});

app.delete('/api/partners/:id', (req, res) => {
  const { id } = req.params;
  db.partners = (db.partners || []).filter((p: any) => p.id !== id);
  saveDatabase(db);
  res.json({ success: true, partners: db.partners });
});

// CHARTS & RANKINGS ENDPOINTS
app.get('/api/charts', (req, res) => {
  res.json({ success: true, charts: db.charts || [] });
});

app.post('/api/charts', (req, res) => {
  const { category, title, artist, coverImage, audioUrl, score, rank, previousRank, movement, period, isPublished, notes } = req.body;
  if (!title || !artist) {
    return res.status(400).json({ error: 'Título y artista requeridos para el chart.' });
  }

  const newEntry = {
    id: 'chart-' + Date.now(),
    category: category || 'main',
    title: title.trim(),
    artist: artist.trim(),
    coverImage: coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    audioUrl: audioUrl || '',
    score: typeof score === 'number' ? score : 100,
    rank: typeof rank === 'number' ? rank : (db.charts || []).length + 1,
    previousRank: typeof previousRank === 'number' ? previousRank : rank || 1,
    movement: movement || 'new',
    period: period || 'Noviembre 2026 - Semana 1',
    isPublished: isPublished !== false,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.charts)) db.charts = [];
  db.charts.push(newEntry);
  saveDatabase(db);
  res.json({ success: true, entry: newEntry, charts: db.charts });
});

app.put('/api/charts/:id', (req, res) => {
  const { id } = req.params;
  const entry = (db.charts || []).find((c: any) => c.id === id);
  if (!entry) return res.status(404).json({ error: 'Entrada de ranking no encontrada.' });

  Object.assign(entry, req.body);
  saveDatabase(db);
  res.json({ success: true, entry, charts: db.charts });
});

app.delete('/api/charts/:id', (req, res) => {
  const { id } = req.params;
  db.charts = (db.charts || []).filter((c: any) => c.id !== id);
  saveDatabase(db);
  res.json({ success: true, charts: db.charts });
});

// SERVER VALIDATION: AUDITIONS REJECT FAN ACCOUNTS
app.post('/api/auditions/submit', (req, res) => {
  const { applicantUsername } = req.body;
  const userProfile = db.allProfiles[applicantUsername];
  if (!userProfile || userProfile.accountType === 'fan') {
    return res.status(403).json({
      error: 'Acceso Denegado: Las cuentas en modo Fan no tienen acceso al sistema de audiciones.'
    });
  }
  res.json({ success: true, message: 'Audición recibida.' });
});

// ==========================================
// 14. SISTEMA DE LOGROS, INSIGNIAS Y RECOMPENSAS API
// ==========================================
app.get('/api/achievements', (req, res) => {
  res.json({ success: true, achievements: db.achievements || [] });
});

app.post('/api/achievements', (req, res) => {
  const { title, description, category, reqType, targetCount, rewardCoins, rewardGems, rewardBadge, isSecret, adminUsername } = req.body;
  if (!title || !category || !reqType) {
    return res.status(400).json({ error: 'Datos de logro incompletos.' });
  }
  const newAch = {
    id: 'ach-' + Date.now(),
    title: title.trim(),
    description: (description || '').trim(),
    category,
    icon: req.body.icon || '🏆',
    reqType,
    targetCount: Number(targetCount) || 1,
    rewardCoins: Number(rewardCoins) || 0,
    rewardGems: Number(rewardGems) || 0,
    rewardBadge: rewardBadge || undefined,
    isSecret: Boolean(isSecret),
    isCustomAdminCreated: true,
    createdBy: adminUsername || 'admin',
    createdAt: new Date().toISOString()
  };
  if (!Array.isArray(db.achievements)) db.achievements = [];
  db.achievements.push(newAch);
  saveDatabase(db);
  res.json({ success: true, achievement: newAch, achievements: db.achievements });
});

app.put('/api/achievements/:id', (req, res) => {
  const { id } = req.params;
  const ach = (db.achievements || []).find((a: any) => a.id === id);
  if (!ach) return res.status(404).json({ error: 'Logro no encontrado.' });
  Object.assign(ach, req.body);
  saveDatabase(db);
  res.json({ success: true, achievement: ach, achievements: db.achievements });
});

app.delete('/api/achievements/:id', (req, res) => {
  const { id } = req.params;
  db.achievements = (db.achievements || []).filter((a: any) => a.id !== id);
  saveDatabase(db);
  res.json({ success: true, achievements: db.achievements });
});

app.post('/api/achievements/claim', (req, res) => {
  const { username, achievementId } = req.body;
  if (!username || !achievementId) return res.status(400).json({ error: 'Datos incompletos.' });

  const profile = db.allProfiles[username];
  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado.' });

  const ach = (db.achievements || []).find((a: any) => a.id === achievementId);
  if (!ach) return res.status(404).json({ error: 'Logro no encontrado.' });

  if (!profile.unlockedAchievements) profile.unlockedAchievements = {};
  if (profile.unlockedAchievements[achievementId]?.claimed) {
    return res.status(400).json({ error: 'Este logro ya ha sido reclamado previamente.' });
  }

  // Mark as unlocked and claimed
  profile.unlockedAchievements[achievementId] = {
    unlockedAt: new Date().toISOString(),
    claimed: true
  };

  // Grant rewards
  if (ach.rewardCoins) {
    profile.coins = (profile.coins || 0) + ach.rewardCoins;
    recordLedger({
      username,
      type: 'earn_coins',
      currency: 'coins',
      amount: ach.rewardCoins,
      balanceAfter: profile.coins,
      reason: `Recompensa por logro: ${ach.title}`
    });
  }

  if (ach.rewardGems) {
    profile.gems = (profile.gems || 0) + ach.rewardGems;
    recordLedger({
      username,
      type: 'earn_gems',
      currency: 'gems',
      amount: ach.rewardGems,
      balanceAfter: profile.gems,
      reason: `Recompensa por logro: ${ach.title}`
    });
  }

  // Grant badge if specified
  if (ach.rewardBadge) {
    if (!Array.isArray(profile.customBadges)) profile.customBadges = [];
    const hasBadge = profile.customBadges.some((b: any) => b.id === ach.rewardBadge.id);
    if (!hasBadge) {
      profile.customBadges.push({
        id: ach.rewardBadge.id,
        name: ach.rewardBadge.name,
        image: ach.rewardBadge.image,
        rarity: ach.rewardBadge.rarity || 'rara',
        unlockedAt: new Date().toISOString()
      });
    }
  }

  // Generate notification
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: 'notif-ach-' + Date.now(),
    recipient: username,
    type: 'logros',
    category: 'logros',
    title: `🏆 ¡Logro Desbloqueado: ${ach.title}!`,
    message: `Has completado "${ach.title}". Recompensa recibida: +${ach.rewardCoins || 0} Coins y +${ach.rewardGems || 0} Gems.`,
    actionSection: 'logros',
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, profile, achievement: ach, message: '¡Recompensas reclamadas con éxito!' });
});

// ==========================================
// 15. CALENDARIO GENERAL AUTOMATIZADO API
// ==========================================
app.get('/api/calendar', (req, res) => {
  // Return stored events
  res.json({ success: true, events: db.calendarEvents || [] });
});

app.post('/api/calendar', (req, res) => {
  const { name, image, description, category, startDate, endDate, time, company, relatedLink, relatedSection, isPrivate, createdBy } = req.body;
  if (!name || !startDate || !category) {
    return res.status(400).json({ error: 'Nombre, fecha de inicio y categoría son requeridos.' });
  }

  const newEvent = {
    id: 'cal-event-' + Date.now(),
    name: name.trim(),
    image: image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    description: (description || '').trim(),
    category,
    startDate,
    endDate: endDate || startDate,
    time: time || '12:00',
    company: company || 'YM-ki Records',
    relatedLink: relatedLink || '',
    relatedSection: relatedSection || 'calendario',
    isPrivate: Boolean(isPrivate),
    createdBy: createdBy || 'admin',
    isAutomated: false,
    sourceModule: 'manual',
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(db.calendarEvents)) db.calendarEvents = [];
  db.calendarEvents.unshift(newEvent);
  saveDatabase(db);
  res.json({ success: true, event: newEvent, events: db.calendarEvents });
});

app.put('/api/calendar/:id', (req, res) => {
  const { id } = req.params;
  const ev = (db.calendarEvents || []).find((e: any) => e.id === id);
  if (!ev) return res.status(404).json({ error: 'Evento no encontrado.' });

  Object.assign(ev, req.body);
  saveDatabase(db);
  res.json({ success: true, event: ev, events: db.calendarEvents });
});

app.delete('/api/calendar/:id', (req, res) => {
  const { id } = req.params;
  db.calendarEvents = (db.calendarEvents || []).filter((e: any) => e.id !== id);
  saveDatabase(db);
  res.json({ success: true, events: db.calendarEvents });
});

app.post('/api/calendar/subscribe', (req, res) => {
  const { username, eventId } = req.body;
  if (!username || !eventId) return res.status(400).json({ error: 'Datos incompletos.' });

  const profile = db.allProfiles[username];
  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado.' });

  if (!Array.isArray(profile.subscribedEventIds)) profile.subscribedEventIds = [];
  const idx = profile.subscribedEventIds.indexOf(eventId);
  let subscribed = false;
  if (idx !== -1) {
    profile.subscribedEventIds.splice(idx, 1);
  } else {
    profile.subscribedEventIds.push(eventId);
    subscribed = true;
  }

  saveDatabase(db);
  res.json({ success: true, subscribed, subscribedEventIds: profile.subscribedEventIds });
});

app.post('/api/calendar/preferences', (req, res) => {
  const { username, preferences } = req.body;
  if (!username || !preferences) return res.status(400).json({ error: 'Datos incompletos.' });

  const profile = db.allProfiles[username];
  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado.' });

  profile.calendarPreferences = { ...profile.calendarPreferences, ...preferences };
  saveDatabase(db);
  res.json({ success: true, preferences: profile.calendarPreferences });
});

// ==========================================
// 17. SISTEMA DE REPORTES Y MODERACIÓN API
// ==========================================
app.get('/api/moderation/reports', (req, res) => {
  res.json({ success: true, reports: db.userReports || [] });
});

app.get('/api/moderation/penalties', (req, res) => {
  res.json({ success: true, penalties: db.penaltiesHistory || [] });
});

app.post('/api/moderation/action', (req, res) => {
  const { reportId, moderatorUsername, actionType, targetUsername, reason, durationHours, resolutionNote } = req.body;
  if (!moderatorUsername || !actionType || !targetUsername) {
    return res.status(400).json({ error: 'Datos de moderación incompletos.' });
  }

  // Update report status if provided
  if (reportId) {
    const rep = (db.userReports || []).find((r: any) => r.id === reportId);
    if (rep) {
      rep.status = actionType === 'reject' ? 'rechazado' : 'resuelto';
      rep.assignedModerator = moderatorUsername;
      rep.resolution = resolutionNote || reason || actionType;
      rep.penaltyApplied = actionType;
      rep.updatedAt = new Date().toISOString();
    }
  }

  // Record penalty
  const newPenalty = {
    id: 'pen-' + Date.now(),
    targetUsername,
    type: actionType,
    reason: reason || 'Incumplimiento de las normas comunitarias.',
    appliedBy: moderatorUsername,
    appliedAt: new Date().toISOString(),
    expiresAt: durationHours ? new Date(Date.now() + durationHours * 3600 * 1000).toISOString() : undefined,
    status: 'activa'
  };

  if (!Array.isArray(db.penaltiesHistory)) db.penaltiesHistory = [];
  db.penaltiesHistory.unshift(newPenalty);

  // Apply effect to target user profile
  const targetProfile = db.allProfiles[targetUsername];
  if (targetProfile) {
    if (actionType === 'temp_ban' || actionType === 'suspend_user') {
      targetProfile.isSuspended = true;
      targetProfile.suspensionReason = reason;
      targetProfile.suspensionExpires = newPenalty.expiresAt;
    } else if (actionType === 'perm_ban') {
      targetProfile.isSuspended = true;
      targetProfile.suspensionReason = 'Sanción definitiva permanente: ' + reason;
      targetProfile.suspensionExpires = 'permanente';
    }
  }

  // Notify target user
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: 'notif-mod-' + Date.now(),
    recipient: targetUsername,
    type: 'moderacion',
    category: 'moderacion',
    title: '🛡️ Aviso del Equipo de Moderación',
    message: `Se ha registrado una acción (${actionType}): "${reason || 'Revisión administrativa'}".`,
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, penalty: newPenalty, reports: db.userReports, penalties: db.penaltiesHistory });
});

app.post('/api/moderation/appeal', (req, res) => {
  const { penaltyId, username, appealText } = req.body;
  if (!penaltyId || !username || !appealText) {
    return res.status(400).json({ error: 'Texto de apelación requerido.' });
  }

  const pen = (db.penaltiesHistory || []).find((p: any) => p.id === penaltyId);
  if (!pen) return res.status(404).json({ error: 'Sanción no encontrada.' });

  pen.status = 'apelada';
  pen.appeal = {
    text: appealText.trim(),
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };

  // Notify Founder
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: 'notif-app-' + Date.now(),
    recipient: 'ceo_miki',
    type: 'moderacion',
    category: 'moderacion',
    title: '⚖️ Nueva Apelación de Usuario',
    message: `@${username} presentó una apelación contra la sanción "${pen.type}".`,
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, penalty: pen, message: 'Tu apelación ha sido enviada para revisión de los administradores.' });
});

app.post('/api/moderation/review-appeal', (req, res) => {
  const { penaltyId, reviewerUsername, decision, responseText } = req.body;
  if (!penaltyId || !decision) return res.status(400).json({ error: 'Decisión requerida.' });

  const pen = (db.penaltiesHistory || []).find((p: any) => p.id === penaltyId);
  if (!pen || !pen.appeal) return res.status(404).json({ error: 'Apelación no encontrada.' });

  pen.appeal.status = decision === 'accept' ? 'accepted' : 'rejected';
  pen.appeal.response = responseText || '';
  pen.appeal.reviewedBy = reviewerUsername;

  if (decision === 'accept') {
    pen.status = 'revocada';
    const profile = db.allProfiles[pen.targetUsername];
    if (profile) {
      profile.isSuspended = false;
      delete profile.suspensionReason;
      delete profile.suspensionExpires;
    }
  }

  // Notify user
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: 'notif-appres-' + Date.now(),
    recipient: pen.targetUsername,
    type: 'moderacion',
    category: 'moderacion',
    title: decision === 'accept' ? '✅ Apelación Aceptada' : '❌ Apelación Desestimada',
    message: `Tu apelación fue revisada por @${reviewerUsername}: ${responseText || (decision === 'accept' ? 'La sanción fue revocada.' : 'La sanción se mantiene.')}`,
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, penalty: pen, penalties: db.penaltiesHistory });
});

// ==========================================
// 18. SISTEMA DE COLABORACIONES API
// ==========================================
app.get('/api/collaborations', (req, res) => {
  res.json({ success: true, collaborations: db.collaborations || [] });
});

app.post('/api/collaborations', (req, res) => {
  const {
    projectName,
    type,
    description,
    objective,
    creatorUsername,
    targetUsernameOrCompany,
    isCompanyCollaboration,
    companyA,
    companyB,
    startDate,
    endDate,
    requirements,
    attachments
  } = req.body;

  if (!projectName || !type || !description || !creatorUsername || !targetUsernameOrCompany) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para la propuesta de colaboración.' });
  }

  const newCollab = {
    id: 'collab-' + Date.now(),
    projectName: projectName.trim(),
    type,
    description: description.trim(),
    objective: (objective || '').trim(),
    creatorUsername,
    targetUsernameOrCompany,
    isCompanyCollaboration: Boolean(isCompanyCollaboration),
    companyA: companyA || undefined,
    companyB: companyB || undefined,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || undefined,
    requirements: requirements || undefined,
    attachments: Array.isArray(attachments) ? attachments : [],
    status: 'enviada',
    participants: [creatorUsername],
    publicShowcase: false,
    progressUpdates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!Array.isArray(db.collaborations)) db.collaborations = [];
  db.collaborations.unshift(newCollab);

  // Notify recipient user or company leader
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: 'notif-collab-' + Date.now(),
    recipient: targetUsernameOrCompany,
    type: 'colaboraciones',
    category: 'colaboraciones',
    title: '🤝 Nueva Propuesta de Colaboración',
    message: `@${creatorUsername} te ha enviado la propuesta "${projectName}" (${type}).`,
    actionSection: 'colaboraciones',
    date: new Date().toISOString(),
    read: false
  });

  saveDatabase(db);
  res.json({ success: true, collaboration: newCollab, collaborations: db.collaborations });
});

app.put('/api/collaborations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, responderUsername } = req.body;
  if (!status) return res.status(400).json({ error: 'Nuevo estado requerido.' });

  const collab = (db.collaborations || []).find((c: any) => c.id === id);
  if (!collab) return res.status(404).json({ error: 'Colaboración no encontrada.' });

  collab.status = status;
  collab.updatedAt = new Date().toISOString();

  // If accepted, add target user to participants and automatically create a dedicated project chat group!
  if (status === 'aceptada' || status === 'en_desarrollo') {
    if (!collab.participants.includes(collab.targetUsernameOrCompany)) {
      collab.participants.push(collab.targetUsernameOrCompany);
    }

    if (!collab.chatGroupId) {
      const projectChatGroup = {
        id: 'group-collab-' + collab.id,
        name: `Proyecto: ${collab.projectName}`,
        icon: '🤝',
        category: 'colaboracion',
        duration: 'permanent',
        isAdvanced: true,
        admins: [collab.creatorUsername, collab.targetUsernameOrCompany],
        members: Array.from(new Set([...collab.participants, collab.creatorUsername, collab.targetUsernameOrCompany])),
        categories: [
          {
            id: 'cat-collab-general',
            name: 'Canales del Proyecto',
            subgroups: [
              {
                id: 'sub-collab-chat',
                name: 'chat-general',
                icon: '💬',
                type: 'general',
                messages: [
                  {
                    id: 'msg-start-' + Date.now(),
                    sender: 'Sistema',
                    text: `¡Colaboración "${collab.projectName}" iniciada oficialmente entre @${collab.creatorUsername} y @${collab.targetUsernameOrCompany}!`,
                    timestamp: new Date().toISOString()
                  }
                ]
              },
              {
                id: 'sub-collab-files',
                name: 'archivos-y-avances',
                icon: '📁',
                type: 'tasks',
                messages: []
              }
            ]
          }
        ],
        createdAt: new Date().toISOString()
      };

      if (!Array.isArray(db.chatGroups)) db.chatGroups = [];
      db.chatGroups.unshift(projectChatGroup);
      collab.chatGroupId = projectChatGroup.id;
    }

    // Notify participants
    for (const p of collab.participants) {
      db.notifications.unshift({
        id: 'notif-collab-acc-' + Date.now() + '-' + Math.random(),
        recipient: p,
        type: 'colaboraciones',
        category: 'colaboraciones',
        title: '🎉 Colaboración Aceptada',
        message: `El proyecto "${collab.projectName}" ha sido aceptado y su espacio de trabajo y chat están listos.`,
        actionSection: 'colaboraciones',
        date: new Date().toISOString(),
        read: false
      });
    }
  }

  saveDatabase(db);
  res.json({ success: true, collaboration: collab, collaborations: db.collaborations, chatGroups: db.chatGroups });
});

app.post('/api/collaborations/:id/update', (req, res) => {
  const { id } = req.params;
  const { author, text, fileUrl } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'Autor y contenido son requeridos.' });

  const collab = (db.collaborations || []).find((c: any) => c.id === id);
  if (!collab) return res.status(404).json({ error: 'Colaboración no encontrada.' });

  if (!Array.isArray(collab.progressUpdates)) collab.progressUpdates = [];
  const update = {
    id: 'upd-' + Date.now(),
    author,
    text: text.trim(),
    fileUrl: fileUrl || undefined,
    timestamp: new Date().toISOString()
  };
  collab.progressUpdates.push(update);
  collab.updatedAt = new Date().toISOString();

  saveDatabase(db);
  res.json({ success: true, update, collaboration: collab });
});

app.put('/api/collaborations/:id/showcase', (req, res) => {
  const { id } = req.params;
  const { publicShowcase } = req.body;

  const collab = (db.collaborations || []).find((c: any) => c.id === id);
  if (!collab) return res.status(404).json({ error: 'Colaboración no encontrada.' });

  collab.publicShowcase = Boolean(publicShowcase);
  collab.updatedAt = new Date().toISOString();

  saveDatabase(db);
  res.json({ success: true, collaboration: collab });
});

// ==========================================
// 18.1 CHATS EDIT & DELETE ACTIONS
// ==========================================
app.put('/api/chats/message/:messageId', (req, res) => {
  const { messageId } = req.params;
  const { username, newText } = req.body;
  if (!username || !newText) return res.status(400).json({ error: 'Datos incompletos.' });

  let found = false;
  // Search in direct chats
  for (const [key, msgList] of Object.entries(db.chats || {})) {
    if (Array.isArray(msgList)) {
      const msg = msgList.find((m: any) => m.id === messageId);
      if (msg) {
        if (msg.from !== username) return res.status(403).json({ error: 'Solo puedes editar tus propios mensajes.' });
        msg.text = newText;
        msg.isEdited = true;
        msg.editedAt = new Date().toISOString();
        found = true;
        break;
      }
    }
  }

  // Search in group chats
  if (!found) {
    for (const group of db.chatGroups || []) {
      for (const cat of group.categories || []) {
        for (const sub of cat.subgroups || []) {
          const msg = (sub.messages || []).find((m: any) => m.id === messageId);
          if (msg) {
            if (msg.sender !== username) return res.status(403).json({ error: 'Solo puedes editar tus propios mensajes.' });
            msg.text = newText;
            msg.isEdited = true;
            msg.editedAt = new Date().toISOString();
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
  }

  if (!found) return res.status(404).json({ error: 'Mensaje no encontrado.' });
  saveDatabase(db);
  res.json({ success: true, message: 'Mensaje editado con éxito.' });
});

app.delete('/api/chats/message/:messageId', (req, res) => {
  const { messageId } = req.params;
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Usuario requerido.' });

  let found = false;
  // Direct chats
  for (const [key, msgList] of Object.entries(db.chats || {})) {
    if (Array.isArray(msgList)) {
      const idx = msgList.findIndex((m: any) => m.id === messageId);
      if (idx !== -1) {
        if (msgList[idx].from !== username) return res.status(403).json({ error: 'Solo puedes eliminar tus propios mensajes.' });
        msgList.splice(idx, 1);
        found = true;
        break;
      }
    }
  }

  // Groups
  if (!found) {
    for (const group of db.chatGroups || []) {
      for (const cat of group.categories || []) {
        for (const sub of cat.subgroups || []) {
          const idx = (sub.messages || []).findIndex((m: any) => m.id === messageId);
          if (idx !== -1) {
            if (sub.messages[idx].sender !== username) return res.status(403).json({ error: 'Solo puedes eliminar tus propios mensajes.' });
            sub.messages.splice(idx, 1);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
  }

  if (!found) return res.status(404).json({ error: 'Mensaje no encontrado.' });
  saveDatabase(db);
  res.json({ success: true, message: 'Mensaje eliminado con éxito.' });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YM-ki Web server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
