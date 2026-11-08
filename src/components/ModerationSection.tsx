import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserX,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  Filter,
  ExternalLink,
  Lock,
  MessageSquare,
  HelpCircle,
  Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModerationReport, UserPenalty } from '../types';

export const ModerationSection: React.FC = () => {
  const { currentUser, userProfile, showToast, isPrivileged } = useApp();

  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [penalties, setPenalties] = useState<UserPenalty[]>([]);
  const [activeTab, setActiveTab] = useState<
    'pendiente' | 'en_revision' | 'resuelto' | 'rechazado' | 'urgente' | 'sanciones' | 'apelaciones'
  >('pendiente');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected report for action modal
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [actionType, setActionType] = useState<
    'warning' | 'remove_content' | 'hide_content' | 'suspend_user' | 'restrict_features' | 'temp_ban' | 'perm_ban' | 'reject'
  >('warning');
  const [actionReason, setActionReason] = useState('');
  const [durationHours, setDurationHours] = useState(24);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Appeal review modal
  const [selectedAppealPenalty, setSelectedAppealPenalty] = useState<UserPenalty | null>(null);
  const [appealDecision, setAppealDecision] = useState<'accept' | 'reject'>('accept');
  const [appealResponseText, setAppealResponseText] = useState('');
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

  // User appeal submission modal (if current user has an active sanction)
  const [myAppealText, setMyAppealText] = useState('');
  const [isMyAppealModalOpen, setIsMyAppealModalOpen] = useState(false);

  const isAdmin = userProfile.accountType === 'admin';

  // Load reports and penalties
  const loadModerationData = async () => {
    try {
      const [resReports, resPenalties] = await Promise.all([
        fetch('/api/moderation/reports'),
        fetch('/api/moderation/penalties')
      ]);

      if (resReports.ok) {
        const data = await resReports.json();
        if (data.reports) setReports(data.reports);
      }
      if (resPenalties.ok) {
        const data = await resPenalties.json();
        if (data.penalties) setPenalties(data.penalties);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadModerationData();
  }, []);

  const handleApplyAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await fetch('/api/moderation/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          moderatorUsername: currentUser,
          actionType,
          targetUsername: selectedReport.reportedTargetUsername,
          reason: actionReason.trim() || 'Sanción disciplinaria aplicada tras revisión de denuncia.',
          durationHours: actionType === 'temp_ban' || actionType === 'suspend_user' ? durationHours : undefined,
          resolutionNote: resolutionNote.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Acción disciplinaria (${actionType}) ejecutada con éxito.`);
        setIsActionModalOpen(false);
        setSelectedReport(null);
        setActionReason('');
        setResolutionNote('');
        loadModerationData();
      } else {
        showToast(data.error || 'Error al aplicar acción.');
      }
    } catch {
      showToast('Error de conexión.');
    }
  };

  const handleReviewAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppealPenalty) return;

    try {
      const res = await fetch('/api/moderation/review-appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          penaltyId: selectedAppealPenalty.id,
          reviewerUsername: currentUser,
          decision: appealDecision,
          responseText: appealResponseText.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          appealDecision === 'accept'
            ? 'Apelación aceptada y sanción revocada.'
            : 'Apelación desestimada.'
        );
        setIsAppealModalOpen(false);
        setSelectedAppealPenalty(null);
        setAppealResponseText('');
        loadModerationData();
      } else {
        showToast(data.error || 'Error al procesar apelación.');
      }
    } catch {
      showToast('Error de conexión.');
    }
  };

  const handleSubmitMyAppeal = async (penaltyId: string) => {
    if (!myAppealText.trim()) {
      showToast('Por favor redacta los motivos de tu apelación.');
      return;
    }

    try {
      const res = await fetch('/api/moderation/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          penaltyId,
          username: currentUser,
          appealText: myAppealText.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Tu apelación ha sido enviada al tribunal de moderación.');
        setIsMyAppealModalOpen(false);
        setMyAppealText('');
        loadModerationData();
      } else {
        showToast(data.error || 'Error al enviar apelación.');
      }
    } catch {
      showToast('Error de conexión.');
    }
  };

  // Filter reports
  const filteredReports = reports.filter((rep) => {
    if (activeTab === 'sanciones' || activeTab === 'apelaciones') return false;
    if (rep.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rep.reportedTargetUsername.toLowerCase().includes(q) ||
        rep.description.toLowerCase().includes(q) ||
        rep.motive.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const appealPenalties = penalties.filter((p) => p.status === 'apelada');

  // Penalties affecting the current user
  const myActivePenalties = penalties.filter(
    (p) => p.targetUsername === currentUser && p.status === 'activa'
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Tribunal de Moderación & Seguridad
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Panel Administrativo de Moderación & Reportes
            </h1>
            <p className="text-sm text-slate-300">
              Gestión privada y confidencial de denuncias, investigación de infracciones,
              aplicación de sanciones y resolución de apelaciones de usuarios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pendientes</span>
              <span className="text-xl font-black text-rose-400">
                {reports.filter((r) => r.status === 'pendiente').length}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Apelaciones</span>
              <span className="text-xl font-black text-amber-400">{appealPenalties.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Active Sanctions Banner (If any) */}
      {myActivePenalties.length > 0 && (
        <div className="p-5 bg-rose-950/40 border border-rose-500/40 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Tienes una sanción activa en tu cuenta</h4>
              <p className="text-xs text-rose-200/90">
                Tipo: <span className="font-bold uppercase">{myActivePenalties[0].type}</span> • Motivo:{' '}
                {myActivePenalties[0].reason}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMyAppealModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition cursor-pointer"
          >
            Presentar Apelación
          </button>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'pendiente', label: 'Pendientes', badge: reports.filter((r) => r.status === 'pendiente').length },
            { id: 'en_revision', label: 'En Revisión', badge: reports.filter((r) => r.status === 'en_revision').length },
            { id: 'urgente', label: 'Urgentes', badge: reports.filter((r) => r.status === 'urgente').length },
            { id: 'resuelto', label: 'Resueltos', badge: reports.filter((r) => r.status === 'resuelto').length },
            { id: 'rechazado', label: 'Rechazados', badge: reports.filter((r) => r.status === 'rechazado').length },
            { id: 'apelaciones', label: 'Apelaciones', badge: appealPenalties.length },
            { id: 'sanciones', label: 'Historial Sanciones', badge: penalties.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === tab.id ? 'bg-white text-rose-600' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario o motivo..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* TAB CONTENT: APELACIONES */}
      {activeTab === 'apelaciones' && (
        <div className="space-y-3">
          {appealPenalties.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800">
              No hay apelaciones pendientes de revisión.
            </div>
          ) : (
            appealPenalties.map((pen) => (
              <div
                key={pen.id}
                className="p-5 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-300 uppercase">
                      Apelación de @{pen.targetUsername}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • Sanción original: {pen.type} ({pen.reason})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-200">
                    <p className="font-semibold text-slate-400 text-[11px] mb-1">
                      Argumento del usuario:
                    </p>
                    "{pen.appeal?.text}"
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAppealPenalty(pen);
                    setIsAppealModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition cursor-pointer"
                >
                  Evaluar Apelación
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORIAL DE SANCIONES */}
      {activeTab === 'sanciones' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Usuario Sancionado</th>
                  <th className="p-4">Tipo Sanción</th>
                  <th className="p-4">Motivo / Causa</th>
                  <th className="p-4">Aplicado Por</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {penalties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No se han emitido sanciones disciplinarias.
                    </td>
                  </tr>
                ) : (
                  penalties.map((pen) => (
                    <tr key={pen.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-white">@{pen.targetUsername}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                          {pen.type}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate">{pen.reason}</td>
                      <td className="p-4 text-indigo-300">@{pen.appliedBy}</td>
                      <td className="p-4 text-slate-400">{pen.appliedAt.split('T')[0]}</td>
                      <td className="p-4 font-bold capitalize">
                        <span
                          className={
                            pen.status === 'activa'
                              ? 'text-rose-400'
                              : pen.status === 'revocada'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }
                        >
                          {pen.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REPORT LIST */}
      {activeTab !== 'sanciones' && activeTab !== 'apelaciones' && (
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800">
              No hay reportes en la bandeja {activeTab}.
            </div>
          ) : (
            filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {rep.reportedItemType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Motivo: {rep.motive}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rep.createdAt.split('T')[0]}
                    </span>
                  </div>

                  <div className="text-xs">
                    <p className="font-bold text-white">
                      Denunciado: <span className="text-rose-400">@{rep.reportedTargetUsername}</span>{' '}
                      {rep.reportedItemTitle && (
                        <span className="text-slate-400 font-normal">({rep.reportedItemTitle})</span>
                      )}
                    </p>
                    <p className="text-slate-300 mt-1 line-clamp-2">"{rep.description}"</p>
                  </div>

                  {rep.evidenceUrls && rep.evidenceUrls.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-400 font-semibold">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <a
                        href={rep.evidenceUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        Ver evidencia adjunta ({rep.evidenceUrls[0]})
                      </a>
                    </div>
                  )}

                  {/* Private Whistleblower Information (Restricted to Mod) */}
                  <div className="text-[10px] text-slate-500 font-mono">
                    <Lock className="w-3 h-3 inline mr-1 text-slate-500" />
                    Denunciante confidencial: @{rep.reporterUsername}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => {
                      setSelectedReport(rep);
                      setIsActionModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition cursor-pointer"
                  >
                    Tomar Acción Disciplinaria
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: ACCIONES ADMINISTRATIVAS DISCIPLINARIAS */}
      {isActionModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleApplyAction}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" /> Aplicar Medida Disciplinaria
              </h3>
              <button
                type="button"
                onClick={() => setIsActionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <p className="font-bold text-white">
                Usuario en revisión:{' '}
                <span className="text-rose-400">@{selectedReport.reportedTargetUsername}</span>
              </p>
              <p className="text-slate-400 text-[11px] mt-1">
                Reporte por {selectedReport.motive}: "{selectedReport.description}"
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Tipo de Medida</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
              >
                <option value="warning">Enviar Advertencia Oficial</option>
                <option value="remove_content">Retirar Contenido / Publicación</option>
                <option value="hide_content">Ocultar Contenido Temporalmente</option>
                <option value="restrict_features">Restringir Funciones (Mensajes, Foros)</option>
                <option value="suspend_user">Suspender Cuenta Temporalmente</option>
                <option value="perm_ban">Sanción Permanente (Expulsión / Ban)</option>
                <option value="reject">Desestimar / Rechazar Denuncia</option>
              </select>
            </div>

            {(actionType === 'temp_ban' || actionType === 'suspend_user') && (
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Duración de la Suspensión (Horas)
                </label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  min={1}
                  max={720}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Motivo / Justificación de la Sanción
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                required
                placeholder="Explica la norma violada y la resolución que se notificará al usuario..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Nota Interna de Resolución (Opcional)
              </label>
              <input
                type="text"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Registro para auditoría interna de moderadores..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsActionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow transition"
              >
                Ejecutar Sanción
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EVALUAR APELACIÓN (ADMINS) */}
      {isAppealModalOpen && selectedAppealPenalty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleReviewAppeal}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-amber-400">
                <Scale className="w-5 h-5" /> Revisión de Apelación
              </h3>
              <button
                type="button"
                onClick={() => setIsAppealModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <p className="font-bold text-white">
                Apelante: <span className="text-amber-300">@{selectedAppealPenalty.targetUsername}</span>
              </p>
              <p className="text-slate-300 mt-1 italic">
                "{selectedAppealPenalty.appeal?.text}"
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Veredicto</label>
              <select
                value={appealDecision}
                onChange={(e) => setAppealDecision(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="accept">Aceptar Apelación (Revocar Sanción y Restaurar Acceso)</option>
                <option value="reject">Rechazar Apelación (Mantener Sanción Vigente)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Respuesta Oficial del Tribunal al Usuario
              </label>
              <textarea
                value={appealResponseText}
                onChange={(e) => setAppealResponseText(e.target.value)}
                rows={3}
                placeholder="Indica las razones del veredicto..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAppealModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Emitir Veredicto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: USUARIO PRESENTA APELACIÓN */}
      {isMyAppealModalOpen && myActivePenalties.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-rose-400">
                <Scale className="w-5 h-5" /> Presentar Apelación de Sanción
              </h3>
              <button
                type="button"
                onClick={() => setIsMyAppealModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300">
              Explica respetuosamente tu perspectiva o pruebas que respalden la reconsideración de tu
              sanción por parte del cuerpo administrativo:
            </p>

            <textarea
              value={myAppealText}
              onChange={(e) => setMyAppealText(e.target.value)}
              rows={5}
              placeholder="Escribe tus argumentos y consideraciones aquí..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white resize-none placeholder-slate-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsMyAppealModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSubmitMyAppeal(myActivePenalties[0].id)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow"
              >
                Enviar Apelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
