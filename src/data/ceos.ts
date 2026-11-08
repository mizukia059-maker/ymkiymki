import { CeoInfo } from '../types';

export const INITIAL_CEOS: CeoInfo[] = [
  {
    id: 'ceo-miki',
    name: 'CEO Miki',
    username: 'ceo_miki',
    title: 'Fundador & Director Ejecutivo General',
    specialty: 'Desarrollo Vocal Integral, Identidad Artística & Dirección Conceptual',
    motto: 'Tu voz tiene el poder de conmover al mundo; la autenticidad es tu mayor virtud.',
    bio: 'Pionero en la industria y fundador de YM-ki Entertainment. Con más de 15 años forjando estrellas globales, Miki evalúa la fuerza emotiva, control de diafragma, resistencia escénica y el brillo intrínseco de cada aspirante.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    criteria: [
      'Capacidad de transmitir emociones genuinas a través del canto o rap',
      'Afinación consistente y rango dinámico controlado',
      'Fuerte disciplina, ética de trabajo y pasión inquebrantable',
      'Versatilidad para evolucionar dentro de la visión conceptual de YM-ki'
    ]
  },
  {
    id: 'ceo-yako',
    name: 'CEO Yako',
    username: 'ceo_yako',
    title: 'Fundador & Director Ejecutivo de Producción y Estrategia Global',
    specialty: 'Dirección Musical, Visión de Mercado, Coreografía & Desarrollo de Conceptos',
    motto: 'La pasión sin dirección se diluye; la visión ejecutiva transforma el talento en historia viva.',
    bio: 'Cofundador de YM-ki Records y estratega global de la compañía. Yako lidera la arquitectura de producción de alto impacto, expansión internacional y formación de agrupaciones icónicas.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    criteria: [
      'Visión escénica panorámica y magnetismo de estrella',
      'Originalidad estética y adaptabilidad conceptual internacional',
      'Resistencia física, disciplina técnica y resiliencia profesional',
      'Habilidad para conectar y liderar dentro de dinámicas de equipo'
    ]
  }
];
