import React, { useState } from 'react';
import {
  CreditCard,
  Sparkles,
  Camera,
  RefreshCw,
  CheckCircle2,
  Save,
  Music,
  Shield,
  Layers,
  Award,
  Download,
  Palette
} from 'lucide-react';
import { useApp, generateMatricula } from '../context/AppContext';
import { IdCardData } from '../types';
import { getDarkerShade } from '../utils/themeColors';

export const IdCardSection: React.FC = () => {
  const { userProfile, updateIdCard, themeGradient, showToast } = useApp();

  const isTrainee = userProfile.accountType === 'trainee';
  const isArtist = userProfile.accountType === 'artista' || userProfile.accountType === 'admin';

  // Load existing card or initial values
  const currentCard = userProfile.idCard || {
    pseudonym: userProfile.nickname || userProfile.username,
    age: 20,
    gender: 'Femenino',
    matricula: generateMatricula(),
    faceclaim: userProfile.avatar,
    cardColor: '#4f46e5',
    stripeColor: '#ec4899',
    specialties: ['vocal']
  };

  const [pseudonym, setPseudonym] = useState(currentCard.pseudonym || userProfile.username);
  const [age, setAge] = useState<number>(currentCard.age || 20);
  const [gender, setGender] = useState<string>(currentCard.gender || 'Femenino');
  const [matricula, setMatricula] = useState<string>(currentCard.matricula || generateMatricula());
  const [faceclaim, setFaceclaim] = useState<string>(currentCard.faceclaim || userProfile.avatar);
  const [cardColor, setCardColor] = useState<string>(currentCard.cardColor || '#4f46e5');
  const [stripeColor, setStripeColor] = useState<string>(currentCard.stripeColor || '#ec4899');
  const [specialties, setSpecialties] = useState<('vocal' | 'rap' | 'baile' | 'all_rounder')[]>(
    currentCard.specialties || ['vocal']
  );

  // Preset rainbow colors
  const rainbowGradients: Record<string, { label: string; class: string; hex: string }> = {
    rojo: {
      label: 'Rojo Carmesí',
      class: 'from-rose-600 via-rose-800 to-rose-950',
      hex: '#e11d48'
    },
    naranja: {
      label: 'Naranja Fuego',
      class: 'from-orange-500 via-orange-700 to-amber-950',
      hex: '#ea580c'
    },
    amarillo: {
      label: 'Amarillo Dorado',
      class: 'from-amber-400 via-amber-600 to-amber-950',
      hex: '#d97706'
    },
    verde: {
      label: 'Verde Esmeralda',
      class: 'from-emerald-500 via-emerald-800 to-teal-950',
      hex: '#059669'
    },
    azul: {
      label: 'Azul Zafiro',
      class: 'from-blue-600 via-blue-800 to-slate-950',
      hex: '#2563eb'
    },
    añil: {
      label: 'Añil Profundo',
      class: 'from-indigo-600 via-indigo-900 to-slate-950',
      hex: '#4f46e5'
    },
    violeta: {
      label: 'Violeta Neón',
      class: 'from-purple-600 via-purple-900 to-indigo-950',
      hex: '#9333ea'
    }
  };

  const handleToggleSpecialty = (spec: 'vocal' | 'rap' | 'baile' | 'all_rounder') => {
    if (spec === 'all_rounder') {
      if (specialties.includes('all_rounder')) {
        setSpecialties(['vocal']);
      } else {
        setSpecialties(['vocal', 'rap', 'baile', 'all_rounder']);
      }
    } else {
      let copy: ('vocal' | 'rap' | 'baile' | 'all_rounder')[] = specialties.filter((s) => s !== 'all_rounder');
      if (copy.includes(spec)) {
        copy = copy.filter((s) => s !== spec);
        if (copy.length === 0) copy = [spec];
      } else {
        copy.push(spec);
      }

      if (copy.includes('vocal') && copy.includes('rap') && copy.includes('baile')) {
        copy.push('all_rounder');
      }
      setSpecialties(copy);
    }
  };

  const handleFaceclaimFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFaceclaim(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegenerateMatricula = () => {
    const newMat = generateMatricula();
    setMatricula(newMat);
    showToast(`Nueva matrícula generada: ${newMat}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateIdCard({
      pseudonym: pseudonym.trim() || userProfile.username,
      age: Number(age) || 20,
      gender,
      matricula,
      faceclaim,
      cardColor,
      stripeColor,
      specialties
    });
    showToast('¡Credencial ID-Card guardada exitosamente!');
  };

  const isAllRounder = specialties.includes('all_rounder');

  // Compute artist background gradient style
  const artistHex = cardColor.startsWith('#')
    ? cardColor
    : rainbowGradients[cardColor]?.hex || '#4f46e5';
  const artistDark = getDarkerShade(artistHex, 0.42);
  const artistDarker = getDarkerShade(artistHex, 0.72);
  const artistGradientStyle = {
    background: `linear-gradient(135deg, ${artistHex} 0%, ${artistDark} 60%, ${artistDarker} 100%)`
  };

  // Download ID-Card strictly as PNG using HTML5 canvas
  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    if (isTrainee) {
      // Pure White card
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 760);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.6, '#fafbfc');
      bgGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(0, 0, 1200, 760, 44) : ctx.rect(0, 0, 1200, 760);
      ctx.fill();

      // Trainee decorative stripe
      ctx.fillStyle = stripeColor || '#ec4899';
      ctx.fillRect(0, 150, 1200, 22);
      ctx.fillRect(0, 736, 1200, 24);

      // Card border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // Artist Gradient card
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 760);
      bgGrad.addColorStop(0, artistHex);
      bgGrad.addColorStop(0.55, artistDark);
      bgGrad.addColorStop(1, artistDarker);
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(0, 0, 1200, 760, 44) : ctx.rect(0, 0, 1200, 760);
      ctx.fill();

      // Holographic sheen
      const sheen = ctx.createLinearGradient(0, 0, 1200, 760);
      sheen.addColorStop(0, 'rgba(255,255,255,0.18)');
      sheen.addColorStop(0.4, 'rgba(255,255,255,0.04)');
      sheen.addColorStop(1, 'transparent');
      ctx.fillStyle = sheen;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    const textColor = isTrainee ? '#0f172a' : '#ffffff';
    const subtextColor = isTrainee ? '#64748b' : 'rgba(255,255,255,0.75)';

    // Header Logo & Brand
    ctx.fillStyle = isTrainee ? (stripeColor || '#ec4899') : '#fbbf24';
    ctx.font = '900 36px sans-serif';
    ctx.fillText('YM', 65, 85);

    ctx.fillStyle = textColor;
    ctx.font = '900 30px sans-serif';
    ctx.fillText('YM-KI ENTERTAINMENT', 145, 75);

    ctx.fillStyle = subtextColor;
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('OFFICIAL TALENT PASS · IDENTITY CARD', 145, 105);

    // Pass Type Badge
    ctx.fillStyle = isTrainee ? '#0f172a' : 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(880, 45, 255, 60, 18) : ctx.rect(880, 45, 255, 60);
    ctx.fill();

    ctx.fillStyle = isTrainee ? '#ffffff' : '#fcd34d';
    ctx.font = '900 21px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isTrainee ? 'TRAINEE PASS' : 'OFFICIAL ARTIST', 1007, 83);
    ctx.textAlign = 'left';

    // Faceclaim photo
    const photo = new Image();
    photo.crossOrigin = 'anonymous';

    const finishDraw = () => {
      // Text details
      ctx.fillStyle = subtextColor;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('SEUDÓNIMO / ARTIST NAME', 370, 250);

      ctx.fillStyle = textColor;
      ctx.font = '900 44px sans-serif';
      ctx.fillText(pseudonym, 370, 300);

      ctx.fillStyle = subtextColor;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('EDAD', 370, 355);
      ctx.fillText('GÉNERO', 520, 355);
      ctx.fillText('MATRÍCULA REGISTRADA', 750, 355);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${age} años`, 370, 395);
      ctx.fillText(gender || 'Femenino', 520, 395);

      ctx.fillStyle = isTrainee ? (stripeColor || '#ec4899') : '#fbbf24';
      ctx.font = '900 26px monospace';
      ctx.fillText(matricula, 750, 395);

      // Specialties
      ctx.fillStyle = subtextColor;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('ESPECIALIDAD', 370, 455);

      const specText = isAllRounder ? '⭐ ALL ROUNDER' : specialties.map((s) => s.toUpperCase()).join(' · ');
      ctx.fillStyle = textColor;
      ctx.font = '900 28px sans-serif';
      ctx.fillText(specText, 370, 498);

      // Barcode footer
      ctx.fillStyle = subtextColor;
      ctx.font = 'bold 18px monospace';
      ctx.fillText('||| | |||| | |||||| || | ||| ||||||| | |||| |||', 65, 680);

      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('VERIFIED TALENT REGISTRATION · YM-KI ARTISTIC AGENCY', 540, 680);

      // Download
      try {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `YM-ID-Card-${pseudonym.replace(/\s+/g, '_')}.png`;
        link.href = url;
        link.click();
        showToast('¡ID-Card exportada en formato PNG con éxito!');
      } catch (err) {
        showToast('Descarga completada.');
      }
    };

    photo.onload = () => {
      try {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(65, 215, 260, 330, 24) : ctx.rect(65, 215, 260, 330);
        ctx.clip();
        ctx.drawImage(photo, 65, 215, 260, 330);
        ctx.restore();

        ctx.strokeStyle = isTrainee ? '#cbd5e1' : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(65, 215, 260, 330, 24) : ctx.rect(65, 215, 260, 330);
        ctx.stroke();
      } catch (e) {
        // Fallback
      }
      finishDraw();
    };

    photo.onerror = () => {
      ctx.fillStyle = isTrainee ? '#f1f5f9' : '#1e293b';
      ctx.fillRect(65, 215, 260, 330);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('YM TALENT', 115, 380);
      finishDraw();
    };

    photo.src = faceclaim;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Exclusivo {isTrainee ? 'Trainees' : 'Artistas'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
            <CreditCard className="w-6 h-6 text-amber-400" /> ID-Card Oficial YM-ki
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isTrainee
              ? 'Credencial oficial de trainee (tarjeta blanca con franja decorativa personalizable).'
              : 'Credencial oficial de artista expedida por YM-ki Entertainment con registro de talentos.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* PREVIEW OF THE ID CARD */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Vista Previa de la ID-Card
          </span>

          {/* CARD CONTAINER */}
          <div
            style={isTrainee ? undefined : artistGradientStyle}
            className={`w-full max-w-sm aspect-[1.58/1] rounded-3xl p-5 shadow-2xl relative overflow-hidden select-none transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between ${
              isTrainee
                ? 'bg-white text-slate-900 border-2 border-slate-300 shadow-slate-200/50'
                : 'text-white border border-white/20'
            }`}
          >
            {/* Trainee Decorative Stripe */}
            {isTrainee && (
              <>
                <div
                  style={{ backgroundColor: stripeColor }}
                  className="absolute top-11 inset-x-0 h-2.5 z-0 shadow-sm"
                />
                <div
                  style={{ backgroundColor: stripeColor }}
                  className="absolute bottom-0 inset-x-0 h-1.5 z-0 shadow-sm"
                />
              </>
            )}

            {/* Artist Sheen */}
            {!isTrainee && (
              <>
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/5 blur-xl pointer-events-none" />
              </>
            )}

            {/* Top Bar of the Card */}
            <div
              className={`relative z-10 flex items-center justify-between pb-2 ${
                isTrainee ? 'border-b border-slate-200' : 'border-b border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  style={isTrainee ? { backgroundColor: stripeColor, color: '#ffffff' } : undefined}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow ${
                    isTrainee
                      ? 'shadow-sm font-black'
                      : 'bg-black/40 text-amber-400 border border-white/20'
                  }`}
                >
                  YM
                </div>
                <div>
                  <span className="text-[11px] font-black tracking-wider block leading-none">
                    YM-KI ENTERTAINMENT
                  </span>
                  <span
                    className={`text-[9px] tracking-widest uppercase ${
                      isTrainee ? 'text-slate-500 font-semibold' : 'text-white/70'
                    }`}
                  >
                    Official Talent Pass
                  </span>
                </div>
              </div>

              <span
                style={isTrainee ? { backgroundColor: '#0f172a', color: '#ffffff' } : undefined}
                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                  isTrainee
                    ? 'border border-slate-700 shadow'
                    : 'bg-black/40 border border-white/20 text-amber-300'
                }`}
              >
                {isTrainee ? 'TRAINEE' : 'OFFICIAL ARTIST'}
              </span>
            </div>

            {/* Card Body */}
            <div className="relative z-10 flex items-center gap-3.5 py-1.5">
              {/* Faceclaim Photo */}
              <div
                className={`w-24 h-28 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 relative group ${
                  isTrainee
                    ? 'bg-slate-100 border-2 border-slate-300'
                    : 'bg-slate-950 border-2 border-white/40'
                }`}
              >
                <img
                  src={faceclaim}
                  alt={pseudonym}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center font-bold py-0.5 text-white/90">
                  FACECLAIM
                </div>
              </div>

              {/* Data fields */}
              <div className="flex-1 space-y-1 min-w-0">
                <div>
                  <span
                    className={`text-[8px] uppercase tracking-wider block ${
                      isTrainee ? 'text-slate-500 font-bold' : 'text-white/70'
                    }`}
                  >
                    SEUDÓNIMO / ARTIST NAME
                  </span>
                  <h3 className="text-base font-extrabold truncate drop-shadow-sm">
                    {pseudonym}
                  </h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <div>
                    <span
                      className={`text-[8px] uppercase tracking-wider block ${
                        isTrainee ? 'text-slate-500 font-bold' : 'text-white/70'
                      }`}
                    >
                      EDAD
                    </span>
                    <span className="text-xs font-bold">{age} años</span>
                  </div>

                  <div>
                    <span
                      className={`text-[8px] uppercase tracking-wider block ${
                        isTrainee ? 'text-slate-500 font-bold' : 'text-white/70'
                      }`}
                    >
                      GÉNERO
                    </span>
                    <span className="text-xs font-bold">{gender}</span>
                  </div>

                  <div>
                    <span
                      className={`text-[8px] uppercase tracking-wider block ${
                        isTrainee ? 'text-slate-500 font-bold' : 'text-white/70'
                      }`}
                    >
                      MATRÍCULA
                    </span>
                    <span
                      style={isTrainee ? { color: stripeColor } : undefined}
                      className={`text-xs font-mono font-extrabold tracking-wider ${
                        isTrainee ? '' : 'text-amber-300'
                      }`}
                    >
                      {matricula}
                    </span>
                  </div>
                </div>

                <div>
                  <span
                    className={`text-[8px] uppercase tracking-wider block mb-0.5 ${
                      isTrainee ? 'text-slate-500 font-bold' : 'text-white/70'
                    }`}
                  >
                    ESPECIALIDAD
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {isAllRounder ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow">
                        ⭐ ALL ROUNDER
                      </span>
                    ) : (
                      specialties.map((s) => (
                        <span
                          key={s}
                          className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider ${
                            isTrainee
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-black/40 border border-white/20 text-white'
                          }`}
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Barcode aesthetic and verification chip */}
            <div
              className={`relative z-10 flex items-center justify-between pt-1.5 text-[8px] ${
                isTrainee
                  ? 'border-t border-slate-200 text-slate-500'
                  : 'border-t border-white/20 text-white/70'
              }`}
            >
              <div className="font-mono tracking-widest text-[8px]">
                ||| | |||| | |||||| || | |||
              </div>
              <span className="flex items-center gap-1 font-semibold text-[8px]">
                <Shield className={`w-3 h-3 ${isTrainee ? 'text-indigo-600' : 'text-cyan-300'}`} /> VERIFIED REGISTRATION
              </span>
            </div>
          </div>

          {/* Download PNG Button as requested */}
          <button
            type="button"
            onClick={handleDownloadPng}
            style={{ background: themeGradient }}
            className="theme-btn px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 cursor-pointer mt-1"
          >
            <Download className="w-4 h-4 text-white" /> Descargar ID-Card (PNG)
          </button>
        </div>

        {/* EDIT FORM FOR THE ID-CARD */}
        <form
          onSubmit={handleSave}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Personalizar Datos de la Credencial
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seudónimo / Nombre Artístico:
            </label>
            <input
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Edad:
              </label>
              <input
                type="number"
                min="8"
                max="99"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            {/* Gender selector as requested */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Género:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="No binario">No binario</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Matrícula:
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateMatricula}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  title="Generar nueva matrícula aleatoria"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Aleatoria
                </button>
              </div>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full bg-slate-800/80 font-mono font-bold text-amber-300 border border-slate-700 rounded-xl p-2.5 text-xs"
                placeholder="YM-2026-XXXX"
                required
              />
            </div>
          </div>

          {/* Faceclaim upload/import */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Faceclaim (Importar foto de IA, idol, artista o foto propia):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={faceclaim}
                onChange={(e) => setFaceclaim(e.target.value)}
                placeholder="URL de imagen o sube archivo..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <label className="cursor-pointer px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition flex items-center gap-1.5 flex-shrink-0">
                <Camera className="w-3.5 h-3.5 text-indigo-400" /> Subir
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaceclaimFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Color Customization: Trainee vs Artist */}
          {isTrainee ? (
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Color de la Franja Decorativa:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    La credencial de trainee es blanca oficial; personaliza la franja decorativa.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stripeColor}
                    onChange={(e) => setStripeColor(e.target.value)}
                    className="w-10 h-8 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-pink-400 uppercase">
                    {stripeColor}
                  </span>
                </div>
              </div>

              {/* Preset chips for stripe */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['#ec4899', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setStripeColor(col)}
                    className="w-6 h-6 rounded-full border border-white/20 transition transform hover:scale-110"
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Color de la ID-Card (Color Picker personalizado):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Degradado automático a tono más oscuro
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={artistHex}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="w-10 h-8 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-indigo-300 uppercase">
                    {artistHex}
                  </span>
                </div>
              </div>

              {/* Rainbow Presets */}
              <div className="grid grid-cols-7 gap-1.5">
                {Object.entries(rainbowGradients).map(([key, item]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCardColor(item.hex)}
                    className={`h-8 rounded-xl transition flex items-center justify-center border ${
                      cardColor === item.hex
                        ? 'ring-2 ring-white scale-105 border-white shadow'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: item.hex }}
                    title={item.label}
                  >
                    {cardColor === item.hex && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specialties selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Especialidades (selección múltiple o All Rounder):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleToggleSpecialty('vocal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  specialties.includes('vocal')
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                🎤 Vocal
              </button>

              <button
                type="button"
                onClick={() => handleToggleSpecialty('rap')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  specialties.includes('rap')
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                🔥 Rap
              </button>

              <button
                type="button"
                onClick={() => handleToggleSpecialty('baile')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  specialties.includes('baile')
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                💃 Baile
              </button>

              <button
                type="button"
                onClick={() => handleToggleSpecialty('all_rounder')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  specialties.includes('all_rounder')
                    ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-md'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                ⭐ All Rounder
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{ background: themeGradient }}
            className="theme-btn w-full py-3 text-white font-bold rounded-2xl text-xs transition shadow-xl flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Guardar Credencial ID-Card
          </button>
        </form>
      </div>
    </div>
  );
};
