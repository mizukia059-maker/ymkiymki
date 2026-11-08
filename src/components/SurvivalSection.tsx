import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Vote,
  Trophy,
  Users,
  Video,
  Music,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  Mic,
  Activity,
  Layers,
  ChevronRight,
  ClipboardList,
  Award,
  PlayCircle,
  BarChart3,
  Sliders,
  Send,
  UserCheck,
  Check,
  Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  SurvivalShow,
  SurvivalParticipant,
  SurvivalStage,
  FormFieldConfig,
  SurvivalApplication,
  SurvivalRound,
  SurvivalSubmission,
  SurvivalEpisode
} from '../types';

export const SurvivalSection: React.FC = () => {
  const {
    userProfile,
    currentUser,
    isPrivileged,
    primaryButtonColor,
    survivals,
    createSurvivalShow,
    registerToSurvival,
    advanceSurvivalStage,
    submitSurvivalApplication,
    reviewSurvivalApplication,
    submitSurvivalMission,
    voteSurvivalRound,
    gradeSurvivalParticipant,
    addSurvivalEpisode,
    updateSurvivalParticipantStatus,
    showToast
  } = useApp();

  const isAdmin = isPrivileged();
  const isFan = userProfile.accountType === 'fan';
  const [selectedSurvival, setSelectedSurvival] = useState<SurvivalShow | null>(() => survivals[0] || null);
  const currentShow = selectedSurvival || survivals[0] || null;

  // Tabs for Competition: 'rondas' | 'participants' | 'episodes' | 'rules' | 'applications'
  const [activeTab, setActiveTab] = useState<'rondas' | 'participants' | 'episodes' | 'rules' | 'applications'>('rondas');
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // Modals state
  const [isCreateShowModalOpen, setIsCreateShowModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitMissionModalOpen, setIsSubmitMissionModalOpen] = useState(false);
  const [isJudgeGradeModalOpen, setIsJudgeGradeModalOpen] = useState(false);
  const [isAddEpisodeModalOpen, setIsAddEpisodeModalOpen] = useState(false);
  const [viewingAuditionParticipant, setViewingAuditionParticipant] = useState<SurvivalParticipant | null>(null);
  const [selectedApplicantToReview, setSelectedApplicantToReview] = useState<SurvivalApplication | null>(null);
  const [participantToGrade, setParticipantToGrade] = useState<SurvivalParticipant | null>(null);

  // Dynamic Application Form state
  const [formResponses, setFormResponses] = useState<Record<string, string>>({
    name: userProfile.nickname || '',
    age: String(userProfile.idCard?.age || 19),
    specialty: userProfile.idCard?.specialties?.[0] || 'vocal',
    audition_media: '',
    motto: '',
    experience: ''
  });

  // Mission Submission Form state
  const [missionTitle, setMissionTitle] = useState('');
  const [missionMediaUrl, setMissionMediaUrl] = useState('');
  const [missionNotes, setMissionNotes] = useState('');

  // Judge Grade state
  const [judgeScore, setJudgeScore] = useState<number>(85);
  const [judgeFeedback, setJudgeFeedback] = useState('');

  // Episode state
  const [epNumber, setEpNumber] = useState(1);
  const [epTitle, setEpTitle] = useState('');
  const [epDesc, setEpDesc] = useState('');
  const [epVideoUrl, setEpVideoUrl] = useState('');
  const [epThumbnail, setEpThumbnail] = useState('');

  // Create Show Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBanner, setNewBanner] = useState('');
  const [newRules, setNewRules] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newMaxParticipants, setNewMaxParticipants] = useState<number>(30);

  // Derive Show stages and details
  const stage: SurvivalStage = currentShow?.stage || 'applications';
  const isCreatorOrAdmin = isAdmin || currentShow?.createdBy === currentUser;

  // Applications
  const applications = currentShow?.applications || [];
  const pendingApps = applications.filter((a) => a.status === 'pending');
  const myApplication = applications.find((a) => a.applicantUsername === currentUser);

  // Participants & rounds
  const participants = currentShow?.participants || [];
  const remainingSlots = Math.max(0, (currentShow?.maxParticipants || 30) - participants.length);
  const rounds: SurvivalRound[] = currentShow?.rounds && currentShow.rounds.length > 0 ? currentShow.rounds : [
    {
      id: 'round-1',
      roundNumber: 1,
      name: 'Ronda 1: Evaluación Inicial de Talento',
      title: 'Ronda 1: Evaluación Inicial de Talento',
      description: 'Presentación individual de concepto y habilidades en canto, rap o baile.',
      mission: 'Presentación individual de concepto y habilidades en canto, rap o baile.',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      rules: 'Evaluación combinada de fans y jurados.',
      evaluationMode: 'hybrid',
      evaluationWeights: {
        fanVotes: 40,
        judges: 40,
        contestants: 20
      },
      status: 'active',
      deadline: '2026-11-30',
      submissions: []
    },
    {
      id: 'round-2',
      roundNumber: 2,
      name: 'Ronda 2: Misión de Equipos & Batalla de Concepto',
      title: 'Ronda 2: Misión de Equipos & Batalla de Concepto',
      description: 'Desafío grupal con coreografía coordinada y armonías vocales.',
      mission: 'Desafío grupal con coreografía coordinada y armonías vocales.',
      startDate: '2026-12-01',
      endDate: '2026-12-15',
      rules: 'Evaluación grupal.',
      evaluationMode: 'judges',
      evaluationWeights: { fanVotes: 30, judges: 70 },
      status: 'upcoming',
      deadline: '2026-12-15',
      submissions: []
    }
  ];

  const currentRound = rounds[selectedRoundIndex] || rounds[0];
  const isParticipantInShow = participants.some((p) => p.username === currentUser);

  // Filter participants
  const filteredParticipants = participants
    .filter((p) => {
      if (specialtyFilter === 'all') return true;
      return p.specialty === specialtyFilter;
    })
    .sort((a, b) => b.votes - a.votes);

  const handleCreateShowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Por favor introduce el título del Survival.');
      return;
    }
    createSurvivalShow({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Competencia Oficial de Supervivencia',
      description: newDesc.trim() || 'Programa para seleccionar los mejores talentos.',
      banner: newBanner.trim() || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
      rules: newRules.trim() || 'Abierto a aspirantes seleccionados. Votaciones comunitarias y evaluación del jurado.',
      deadline: newDeadline || '2026-12-31',
      maxParticipants: newMaxParticipants || 30,
      status: 'open',
      stage: 'applications',
      createdBy: currentUser || 'Admin',
      participants: [],
      applications: [],
      rounds: [],
      teams: [],
      judges: [],
      episodes: [],
      applicationFormConfig: []
    });

    setIsCreateShowModalOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewDesc('');
    setNewBanner('');
    setNewRules('');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow) return;
    if (!formResponses['name']?.trim() || !formResponses['audition_media']?.trim()) {
      showToast('Por favor completa tu nombre y el enlace a tu audición.');
      return;
    }
    const success = submitSurvivalApplication(currentShow.id, formResponses);
    if (success) {
      setIsApplyModalOpen(false);
    }
  };

  const handleMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow || !currentRound) return;
    if (!missionMediaUrl.trim()) {
      showToast('Debes ingresar el enlace de tu entrega o video.');
      return;
    }
    submitSurvivalMission(
      currentShow.id,
      currentRound.id,
      missionMediaUrl.trim(),
      missionNotes.trim()
    );
    setIsSubmitMissionModalOpen(false);
    setMissionTitle('');
    setMissionMediaUrl('');
    setMissionNotes('');
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow || !currentRound || !participantToGrade) return;
    gradeSurvivalParticipant(
      currentShow.id,
      currentRound.id,
      participantToGrade.username,
      judgeScore
    );
    setIsJudgeGradeModalOpen(false);
    setParticipantToGrade(null);
    setJudgeFeedback('');
  };

  const handleAddEpisodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow || !epTitle.trim()) return;
    addSurvivalEpisode(currentShow.id, {
      episodeNumber: epNumber,
      title: epTitle.trim(),
      description: epDesc.trim() || 'Transmisión oficial del episodio.',
      videoUrl: epVideoUrl.trim() || 'https://youtube.com',
      thumbnail: epThumbnail.trim() || currentShow.banner,
      broadcastDate: new Date().toLocaleDateString('es-MX')
    });
    setIsAddEpisodeModalOpen(false);
    setEpTitle('');
    setEpDesc('');
    setEpVideoUrl('');
    setEpThumbnail('');
  };

  const getSpecialtyBadge = (spec: string) => {
    switch (spec) {
      case 'vocal':
        return { label: 'Vocal', color: 'bg-indigo-600 text-white' };
      case 'rap':
        return { label: 'Rap', color: 'bg-rose-600 text-white' };
      case 'baile':
        return { label: 'Baile', color: 'bg-amber-600 text-white' };
      case 'all_rounder':
        return { label: 'All-Rounder', color: 'bg-emerald-600 text-white' };
      default:
        return { label: spec, color: 'bg-slate-700 text-white' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div
            style={{
              backgroundColor: `${primaryButtonColor}20`,
              borderColor: `${primaryButtonColor}50`,
              color: primaryButtonColor
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            Ecosistema de Supervivencia Artística
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Survival Shows & Misiones de Competencia
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {stage === 'applications'
              ? 'Etapa 1 activa: Recolección y revisión de aspirantes para ingresar a la competencia oficial.'
              : 'Etapa 2 activa: Competencia en vivo, rondas de evaluación, misiones de canto y baile, y votaciones.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {isAdmin && (
            <button
              onClick={() => setIsCreateShowModalOpen(true)}
              style={{ backgroundColor: primaryButtonColor }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow hover:opacity-90 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Show
            </button>
          )}

          {/* Stage 1: Apply Button */}
          {stage === 'applications' && (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              disabled={!!myApplication || remainingSlots === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs shadow transition active:scale-95 cursor-pointer ${
                myApplication
                  ? 'bg-emerald-600 text-white cursor-default'
                  : remainingSlots === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              {myApplication ? '✓ Solicitud Enviada' : 'Aplicar al Survival (Formulario)'}
            </button>
          )}

          {/* Stage 2 Shortcut: "VER PRIMERA RONDA" */}
          {stage === 'competition' && (
            <button
              onClick={() => {
                setActiveTab('rondas');
                setSelectedRoundIndex(0);
              }}
              style={{ backgroundColor: primaryButtonColor }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-black text-xs shadow hover:opacity-90 transition active:scale-95 cursor-pointer animate-pulse"
            >
              <PlayCircle className="w-4 h-4" />
              VER PRIMERA RONDA
            </button>
          )}
        </div>
      </div>

      {/* Show Selector (if multiple shows exist) */}
      {survivals.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {survivals.map((show) => {
            const isSelected = currentShow?.id === show.id;
            return (
              <button
                key={show.id}
                onClick={() => setSelectedSurvival(show)}
                style={isSelected ? { backgroundColor: primaryButtonColor } : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'text-white shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                {show.title}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-normal">
                  {show.stage === 'applications' ? 'Etapa 1: Aspirantes' : 'Etapa 2: Competencia'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Show Workspace */}
      {currentShow && (
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl space-y-0">
          {/* Cover Banner & Quick Info */}
          <div className="relative h-56 sm:h-72 w-full bg-slate-950 overflow-hidden">
            <img
              src={currentShow.banner}
              alt={currentShow.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 sm:p-8 flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    stage === 'applications'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {stage === 'applications'
                    ? 'Etapa 1: Recolección de Aspirantes'
                    : 'Etapa 2: Competencia en Vivo'}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800/90 text-slate-200 flex items-center gap-1.5 border border-slate-700">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  {participants.length} / {currentShow.maxParticipants || 30} Cupos Ocupados
                  <span className="text-amber-400 font-black">({remainingSlots} restantes)</span>
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800/90 text-slate-300 flex items-center gap-1.5 border border-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Límite: {currentShow.deadline}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentShow.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-3xl mt-1 font-medium">
                {currentShow.description}
              </p>
            </div>
          </div>

          {/* Navigation Bar between Sub-Tabs */}
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 backdrop-blur-md">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('rondas')}
                style={activeTab === 'rondas' ? { backgroundColor: primaryButtonColor } : undefined}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'rondas'
                    ? 'text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Rondas & Misiones ({rounds.length})
              </button>

              <button
                onClick={() => setActiveTab('participants')}
                style={activeTab === 'participants' ? { backgroundColor: primaryButtonColor } : undefined}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'participants'
                    ? 'text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Aspirantes Admitidos ({participants.length})
              </button>

              <button
                onClick={() => setActiveTab('episodes')}
                style={activeTab === 'episodes' ? { backgroundColor: primaryButtonColor } : undefined}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'episodes'
                    ? 'text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Episodios & Resúmenes ({currentShow.episodes?.length || 0})
              </button>

              {/* Creator / Admin Application Review Tab */}
              {isCreatorOrAdmin && (
                <button
                  onClick={() => setActiveTab('applications')}
                  style={activeTab === 'applications' ? { backgroundColor: primaryButtonColor } : undefined}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'applications'
                      ? 'text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                  Postulaciones Recibidas ({applications.length})
                  {pendingApps.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                      {pendingApps.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('rules')}
                style={activeTab === 'rules' ? { backgroundColor: primaryButtonColor } : undefined}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'rules'
                    ? 'text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Reglamento & Criterios
              </button>
            </div>

            {/* Stage Transition Control for Creator / Admin */}
            {isCreatorOrAdmin && (
              <div className="flex items-center gap-2">
                {stage === 'applications' ? (
                  <button
                    onClick={() => advanceSurvivalStage(currentShow.id, 'competition')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Iniciar Competencia (Etapa 2)
                  </button>
                ) : (
                  <button
                    onClick={() => advanceSurvivalStage(currentShow.id, 'applications')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    Volver a Recolección
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 1: RONDAS & MISIONES */}
          {activeTab === 'rondas' && (
            <div className="p-5 sm:p-7 space-y-6">
              {/* Round Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {rounds.map((r, idx) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoundIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                      selectedRoundIndex === idx
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>Ronda {r.roundNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-medium">
                      {r.status === 'active' ? 'En Curso' : 'Próxima'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Round Card */}
              {currentRound && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase">
                          Ronda {currentRound.roundNumber}
                        </span>
                        <h3 className="text-lg font-black text-white">{currentRound.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{currentRound.description}</p>
                    </div>

                    {/* Participant Mission Submission Trigger */}
                    {isParticipantInShow && (
                      <button
                        onClick={() => setIsSubmitMissionModalOpen(true)}
                        style={{ backgroundColor: primaryButtonColor }}
                        className="px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" />
                        Subir Mi Entrega de Ronda
                      </button>
                    )}
                  </div>

                  {/* Evaluation Weightings Breakdown */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Sistema & Ponderación de Evaluación de la Ronda
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400 block font-medium">Votos de Fans</span>
                        <span className="text-base font-black text-indigo-400">
                          {currentRound.evaluationWeights?.fanVotes ?? 40}%
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400 block font-medium">Decisión de Jueces</span>
                        <span className="text-base font-black text-amber-400">
                          {currentRound.evaluationWeights?.judges ?? 40}%
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400 block font-medium">Voto entre Concursantes</span>
                        <span className="text-base font-black text-rose-400">
                          {currentRound.evaluationWeights?.contestants ?? 20}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Participants Live Ranking for this Round */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Participantes & Calificaciones de la Ronda ({filteredParticipants.length})
                    </h4>

                    {filteredParticipants.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No hay aspirantes admitidos aún. El creador debe revisar las postulaciones en la Etapa 1.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredParticipants.map((p, idx) => {
                          const badge = getSpecialtyBadge(p.specialty);
                          const hasVoted = p.voters.includes(currentUser || '');

                          return (
                            <div
                              key={p.id}
                              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow flex flex-col justify-between"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs">
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-sm text-white">{p.name}</h4>
                                    <p className="text-[11px] text-slate-400">@{p.username} · {p.age} años</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${badge.color}`}>
                                  {badge.label}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-lg bg-slate-950 text-xs italic text-slate-300 line-clamp-2 border border-slate-800">
                                "{p.motto}"
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1">
                                <button
                                  onClick={() => setViewingAuditionParticipant(p)}
                                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Video className="w-3.5 h-3.5" /> Ver Material
                                </button>
                                <span className="font-black text-amber-400 flex items-center gap-1">
                                  <Trophy className="w-3 h-3" /> {p.votes} votos
                                </span>
                              </div>

                              {/* Voting and Grading Actions */}
                              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                                <button
                                  onClick={() => voteSurvivalRound(currentShow.id, currentRound.id, p.username, 'fan')}
                                  disabled={hasVoted}
                                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow ${
                                    hasVoted
                                      ? 'bg-emerald-600 text-white cursor-default'
                                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                                  }`}
                                >
                                  <Vote className="w-3.5 h-3.5" />
                                  {hasVoted ? 'Voto Emitido ✓' : 'Votar (Fan)'}
                                </button>

                                {/* Judge Evaluation Button */}
                                {(isAdmin || isCreatorOrAdmin) && (
                                  <button
                                    onClick={() => {
                                      setParticipantToGrade(p);
                                      setIsJudgeGradeModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer active:scale-95"
                                    title="Calificar como Juez"
                                  >
                                    <Award className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PARTICIPANTES ADMITIDOS */}
          {activeTab === 'participants' && (
            <div className="p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">
                  Lista Oficial de Aspirantes Admitidos ({participants.length})
                </h3>

                {/* Specialty Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'vocal', label: 'Vocal' },
                    { id: 'rap', label: 'Rap' },
                    { id: 'baile', label: 'Baile' },
                    { id: 'all_rounder', label: 'All-Rounder' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSpecialtyFilter(s.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        specialtyFilter === s.id ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredParticipants.map((p, idx) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 text-sm">#{idx + 1}</span>
                      <span className="text-xs text-slate-400">{p.age} años</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white">{p.name}</h4>
                      <p className="text-xs text-slate-400">@{p.username}</p>
                    </div>
                    <p className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      "{p.motto}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EPISODIOS & ESTADÍSTICAS */}
          {activeTab === 'episodes' && (
            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">Episodios Oficiales & Resúmenes</h3>
                  <p className="text-xs text-slate-400">Contenido audiovisual y emisiones semanales.</p>
                </div>
                {isCreatorOrAdmin && (
                  <button
                    onClick={() => setIsAddEpisodeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Añadir Episodio
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(currentShow.episodes || []).map((ep) => (
                  <div key={ep.id} className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow">
                    <div className="relative aspect-video w-full bg-slate-900">
                      <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                      <a
                        href={ep.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition"
                      >
                        <PlayCircle className="w-10 h-10 text-white drop-shadow-md" />
                      </a>
                    </div>
                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
                        <span>Episodio {ep.episodeNumber}</span>
                        <span className="text-slate-500">{ep.broadcastDate}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white">{ep.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{ep.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: POSTULACIONES RECIBIDAS (Creator / Admin Only) */}
          {activeTab === 'applications' && isCreatorOrAdmin && (
            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">
                    Panel de Revisión de Postulaciones ({applications.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evalúa las solicitudes enviadas por los usuarios en la Etapa 1.
                  </p>
                </div>
                <div className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                  {remainingSlots} Cupos Disponibles
                </div>
              </div>

              {applications.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                  No hay solicitudes registradas todavía.
                </p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.applicantAvatar}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-white">
                              {app.applicantNickname}
                            </h4>
                            <span className="text-xs text-slate-400">@{app.applicantUsername}</span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                app.status === 'accepted'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            Lema: "{app.responses['motto'] || 'Sin lema'}" · Especialidad: {app.responses['specialty']}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.responses['audition_media'] && (
                          <a
                            href={app.responses['audition_media']}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400 flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Ver Audición
                          </a>
                        )}

                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => reviewSurvivalApplication(currentShow.id, app.id, 'accepted')}
                              disabled={remainingSlots === 0}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Aprobar y Admitir
                            </button>
                            <button
                              onClick={() => reviewSurvivalApplication(currentShow.id, app.id, 'rejected')}
                              className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold text-xs active:scale-95 cursor-pointer flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" /> Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REGLAMENTO */}
          {activeTab === 'rules' && (
            <div className="p-6 sm:p-8 space-y-4 max-w-3xl">
              <h3 className="text-base font-black text-white">Reglamento Oficial & Código de Competencia</h3>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                <p>{currentShow.rules}</p>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>Creador: @{currentShow.createdBy}</span>
                  <span>Fecha de Cierre: {currentShow.deadline}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: APPLICATION FORM (STAGE 1) */}
      {isApplyModalOpen && currentShow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                  Formulario Oficial de Aspirante al Survival
                </h3>
                <p className="text-xs text-slate-400">Etapa 1: Admisión de Trainees</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo o Artístico</label>
                <input
                  type="text"
                  required
                  value={formResponses['name'] || ''}
                  onChange={(e) => setFormResponses({ ...formResponses, name: e.target.value })}
                  placeholder="Tu nombre para el programa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Edad</label>
                  <input
                    type="number"
                    min={14}
                    max={35}
                    required
                    value={formResponses['age'] || ''}
                    onChange={(e) => setFormResponses({ ...formResponses, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Especialidad Principal</label>
                  <select
                    value={formResponses['specialty'] || 'vocal'}
                    onChange={(e) => setFormResponses({ ...formResponses, specialty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                  >
                    <option value="vocal">Vocal</option>
                    <option value="rap">Rap</option>
                    <option value="baile">Baile</option>
                    <option value="all_rounder">All-Rounder</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Enlace de Audición (Video / YouTube / Drive)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  value={formResponses['audition_media'] || ''}
                  onChange={(e) => setFormResponses({ ...formResponses, audition_media: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Lema / Mensaje para el Fandom</label>
                <textarea
                  rows={2}
                  placeholder="Tu mensaje de determinación..."
                  value={formResponses['motto'] || ''}
                  onChange={(e) => setFormResponses({ ...formResponses, motto: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Enviar Postulación Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT MISSION (STAGE 2) */}
      {isSubmitMissionModalOpen && currentRound && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">Entrega de Ronda: {currentRound.title}</h3>
              <button onClick={() => setIsSubmitMissionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMissionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Título de tu Performance</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Cover de ECLIPSE / Performance Baile"
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Enlace del Video o Grabación (URL)</label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/..."
                  value={missionMediaUrl}
                  onChange={(e) => setMissionMediaUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Notas de Producción / Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Concepto presentado, arreglos o detalles para los jueces..."
                  value={missionNotes}
                  onChange={(e) => setMissionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitMissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryButtonColor }}
                  className="px-5 py-2 rounded-xl text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Publicar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: JUDGE GRADE */}
      {isJudgeGradeModalOpen && participantToGrade && currentRound && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">
                Evaluar a {participantToGrade.name} ({currentRound.title})
              </h3>
              <button onClick={() => setIsJudgeGradeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-300">Puntaje Numérico del Juez</label>
                  <span className="text-sm font-black text-amber-400">{judgeScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={judgeScore}
                  onChange={(e) => setJudgeScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Feedback Técnico del Jurado</label>
                <textarea
                  rows={3}
                  placeholder="Comentarios sobre técnica, afinación, tiempo o presencia..."
                  value={judgeFeedback}
                  onChange={(e) => setJudgeFeedback(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsJudgeGradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Guardar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EPISODE */}
      {isAddEpisodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">Publicar Episodio del Survival</h3>
              <button onClick={() => setIsAddEpisodeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEpisodeSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-300 mb-1">Nº Episodio</label>
                  <input
                    type="number"
                    min={1}
                    value={epNumber}
                    onChange={(e) => setEpNumber(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Misión 1: Primera Eliminación"
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Enlace del Video (YouTube / MP4)</label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  value={epVideoUrl}
                  onChange={(e) => setEpVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">URL Miniatura (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={epThumbnail}
                  onChange={(e) => setEpThumbnail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={epDesc}
                  onChange={(e) => setEpDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEpisodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow cursor-pointer active:scale-95"
                >
                  Publicar Episodio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW AUDITION MEDIA */}
      {viewingAuditionParticipant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">
                Audición de {viewingAuditionParticipant.name}
              </h3>
              <button onClick={() => setViewingAuditionParticipant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white text-sm">@{viewingAuditionParticipant.username}</div>
                <div className="text-slate-400">
                  Especialidad: {viewingAuditionParticipant.specialty.toUpperCase()} · {viewingAuditionParticipant.age} años
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 block">Enlace Multimedia:</span>
                <a
                  href={viewingAuditionParticipant.auditionMedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline break-all font-mono flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  {viewingAuditionParticipant.auditionMedia}
                </a>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingAuditionParticipant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
