import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  FolderPlus,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Clock,
  Hourglass,
  Flame,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Megaphone,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Upload,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarWithFrame } from './AvatarWithFrame';
import { UserBadges } from './UserBadges';
import { Forum, Post } from '../types';

interface ForumsSectionProps {
  onOpenUserProfile: (username: string) => void;
  onGoToFansClub?: (clubId: string) => void;
}

export const ForumsSection: React.FC<ForumsSectionProps> = ({
  onOpenUserProfile,
  onGoToFansClub
}) => {
  const {
    forums,
    posts,
    currentUser,
    userProfile,
    fanClubs,
    isPrivileged,
    createForum,
    createFandomForum,
    editForum,
    deleteForum,
    joinForum,
    leaveForum,
    createPost,
    reactPost,
    votePoll,
    addComment,
    getProfileOf,
    products,
    buyProduct,
    buyOutletProduct,
    themeGradient,
    themeBannerGradient,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'feed' | 'panel'>('feed');
  const [activeForumFilter, setActiveForumFilter] = useState<string | null>(null);
  const [currentTagFilter, setCurrentTagFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<'recent' | 'old' | 'controversial'>('recent');

  // Context Menu state (Right click on forum card)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    forum: Forum;
  } | null>(null);

  // Edit Forum Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingForumId, setEditingForumId] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [editBgValue, setEditBgValue] = useState('#0f172a');

  // Create standard forum modal
  const [isCreateForumOpen, setIsCreateForumOpen] = useState(false);
  const [forumName, setForumName] = useState('');
  const [forumDesc, setForumDesc] = useState('');
  const [forumBanner, setForumBanner] = useState('');
  const [forumAvatar, setForumAvatar] = useState('');

  // Create fandom forum modal (name and description only)
  const [isCreateFandomForumOpen, setIsCreateFandomForumOpen] = useState(false);
  const [selectedClubForFandomForum, setSelectedClubForFandomForum] = useState('');
  const [fandomForumName, setFandomForumName] = useState('');
  const [fandomForumDesc, setFandomForumDesc] = useState('');

  // Create post modal
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postForumId, setPostForumId] = useState('general');
  const [postType, setPostType] = useState<'normal' | 'poll' | 'announcement'>('normal');
  const [postTag, setPostTag] = useState('Música');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [promotedProdId, setPromotedProdId] = useState<string>('');

  // Post Detail Modal
  const [activePostDetail, setActivePostDetail] = useState<Post | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const currentForum = activeForumFilter ? forums.find((f) => f.id === activeForumFilter) : null;

  const canAccessFandomForum = (f: Forum) => {
    if (!f.isFandomForum || !f.fanClubId) return true;
    const club = fanClubs.find((c) => c.id === f.fanClubId);
    if (!club) return true;
    return club.members.includes(currentUser || '');
  };

  const canManageForum = (f: Forum) => {
    if (userProfile.accountType === 'admin') return true;
    if (f.creator === currentUser) return true;
    if (f.isFandomForum && f.fanClubId) {
      const club = fanClubs.find((c) => c.id === f.fanClubId);
      if (club) {
        return club.artists.includes(currentUser || '') || club.manager === currentUser;
      }
    }
    return false;
  };

  const clubsUserCanManage = fanClubs.filter((club) => {
    return club.artists.includes(currentUser || '') || club.manager === currentUser || isPrivileged();
  });

  const handleContextMenu = (e: React.MouseEvent, forum: Forum) => {
    e.preventDefault();
    if (!canManageForum(forum)) return;
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      forum
    });
  };

  const openEditForumWindow = (forum: Forum) => {
    setEditingForumId(forum.id);
    setEditName(forum.name);
    setEditDesc(forum.description);
    setEditAvatar(forum.avatar || '');
    setEditBanner(forum.banner || '');
    setEditBgValue(forum.bgValue || '#0f172a');
    setIsEditModalOpen(true);
    setContextMenu(null);
  };

  const handleSaveEditForum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForumId) return;
    editForum(editingForumId, {
      name: editName.trim(),
      description: editDesc.trim(),
      avatar: editAvatar.trim() || undefined,
      banner: editBanner.trim() || undefined,
      bgValue: editBgValue
    });
    setIsEditModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'avatar') setEditAvatar(reader.result);
        if (target === 'banner') setEditBanner(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStandardForumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumName.trim()) return;
    createForum({
      name: forumName.trim(),
      description: forumDesc.trim(),
      banner: forumBanner || undefined,
      avatar: forumAvatar || undefined
    });
    setIsCreateForumOpen(false);
    setForumName('');
    setForumDesc('');
  };

  const handleCreateFandomForumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForFandomForum || !fandomForumName.trim()) return;
    const ok = createFandomForum(
      selectedClubForFandomForum,
      fandomForumName.trim(),
      fandomForumDesc.trim()
    );
    if (ok) {
      setIsCreateFandomForumOpen(false);
      setFandomForumName('');
      setFandomForumDesc('');
    }
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetForum = forums.find((f) => f.id === postForumId);
    if (!targetForum) return;

    if (postType === 'announcement' && !isPrivileged()) {
      showToast('Solo administradores pueden crear anuncios fijados.');
      return;
    }

    createPost({
      author: currentUser || 'Usuario',
      forumId: targetForum.id,
      forumName: targetForum.name,
      tag: postTag.trim() || 'General',
      title: postTitle.trim(),
      content: postContent.trim(),
      type: postType,
      isFandomOnly: targetForum.isFandomForum,
      fandomName: targetForum.fandomName,
      promotedProductId: promotedProdId || undefined
    });

    setIsCreatePostOpen(false);
    setPostTitle('');
    setPostContent('');
    setPromotedProdId('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePostDetail || !commentInput.trim()) return;
    addComment(activePostDetail.id, commentInput);
    setCommentInput('');
    const updated = posts.find((p) => p.id === activePostDetail.id);
    if (updated) setActivePostDetail(updated);
  };

  const pinnedPost = activeForumFilter
    ? posts.find((p) => p.forumId === activeForumFilter && p.type === 'announcement')
    : null;

  const filteredPosts = posts
    .filter((post) => {
      // Eliminate ghost or corrupted posts
      if (!post || !post.id || !post.author || post.author === 'null' || post.author === 'undefined') return false;
      if (!post.title?.trim() && !post.content?.trim()) return false;
      if (pinnedPost && post.id === pinnedPost.id) return false;
      if (activeForumFilter && post.forumId !== activeForumFilter) return false;
      if (currentTagFilter !== 'all' && post.tag !== currentTagFilter) return false;
      if (post.isFandomOnly) {
        const forum = forums.find((f) => f.id === post.forumId);
        if (forum && !canAccessFandomForum(forum)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortMode === 'old') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortMode === 'controversial') {
        const score = (p: Post) => p.likes + p.dislikes - Math.abs(p.likes - p.dislikes);
        return score(b) - score(a);
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Top Bar with View Tabs and Create Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('feed');
              setActiveForumFilter(null);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'feed' && !activeForumFilter
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Publicaciones Globales
          </button>
          <button
            onClick={() => setActiveTab('panel')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'panel'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Panel de Foros (3 por fila)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {clubsUserCanManage.length > 0 && (
            <button
              onClick={() => {
                setSelectedClubForFandomForum(clubsUserCanManage[0].id);
                setIsCreateFandomForumOpen(true);
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Crear Foro de Fandom
            </button>
          )}

          <button
            onClick={() => setIsCreateForumOpen(true)}
            style={{ background: themeGradient }}
            className="theme-btn px-3.5 py-1.5 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" /> Crear Foro
          </button>
        </div>
      </div>

      {/* FULL FORUM DETAIL HEADER (Ajustado para que el nombre NUNCA se amontone con el banner) */}
      {currentForum && (
        <div
          className="rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
          style={{ backgroundColor: currentForum.bgValue || '#0f172a' }}
        >
          {/* Banner section with clean height and no text overlap */}
          {currentForum.isFandomForum ? (
            <div
              className="p-6 border-b border-white/10"
              style={{ backgroundColor: currentForum.bgValue || '#1e1b4b' }}
            >
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white uppercase tracking-wider inline-block mb-1">
                ⭐ Foro de Fandom: {currentForum.fandomName}
              </span>
              <p className="text-xs text-slate-300">Comunidad privada de miembros</p>
            </div>
          ) : (
            <div className="w-full h-44 sm:h-52 bg-slate-800 overflow-hidden relative">
              <img
                src={currentForum.banner}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Details Bar separated cleanly below the banner */}
          <div className="p-5 sm:p-6 bg-slate-900/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {!currentForum.isFandomForum && (
                <img
                  src={currentForum.avatar}
                  alt=""
                  className="w-16 h-16 rounded-full border-4 border-slate-800 object-cover bg-slate-800 shadow-xl flex-shrink-0"
                />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {currentForum.name}
                  </h2>
                  {currentForum.isOfficial && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 inline" />
                  )}
                  {currentForum.isFandomForum && (
                    <span className="text-[11px] font-semibold text-pink-400">
                      [Fandom: {currentForum.fandomName}]
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {currentForum.description}
                </p>
                <span className="text-[11px] text-slate-500 block">
                  {currentForum.followers} miembros unidos · Creado por @{currentForum.creator}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {canManageForum(currentForum) && (
                <button
                  onClick={() => openEditForumWindow(currentForum)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar Foro
                </button>
              )}
              <button
                onClick={() => setActiveForumFilter(null)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                ← Salir a Foros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FEED */}
      {(activeTab === 'feed' || activeForumFilter) && (
        <div className="flex flex-col gap-4">
          {/* Create Post Bar */}
          <div
            onClick={() => {
              if (activeForumFilter) setPostForumId(activeForumFilter);
              setIsCreatePostOpen(true);
            }}
            className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer shadow-lg transition"
          >
            <AvatarWithFrame
              src={userProfile.avatar}
              size="sm"
              ringColor={userProfile.ringColor}
              transparentFrame={userProfile.transparentFrame}
            />
            <div className="flex-1 bg-slate-800/80 rounded-full px-4 py-2 text-xs text-slate-400">
              ¿Qué quieres compartir con la comunidad hoy?
            </div>
            <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow">
              <Plus className="w-3.5 h-3.5" /> Publicar
            </button>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['all', 'Música', 'Audiciones', 'Fans', 'General'].map((t) => (
                <button
                  key={t}
                  onClick={() => setCurrentTagFilter(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    currentTagFilter === t
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'Todas' : `#${t}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setSortMode('recent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  sortMode === 'recent' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" /> Recientes
              </button>
              <button
                onClick={() => setSortMode('old')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  sortMode === 'old' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hourglass className="w-3 h-3" /> Viejos
              </button>
              <button
                onClick={() => setSortMode('controversial')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  sortMode === 'controversial' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" /> Controversiales
              </button>
            </div>
          </div>

          {/* Pinned Announcement */}
          {pinnedPost && (
            <div
              onClick={() => setActivePostDetail(pinnedPost)}
              className="p-4 rounded-2xl border border-rose-500/40 bg-slate-900 cursor-pointer shadow-lg hover:border-rose-500 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Megaphone className="w-3 h-3 text-rose-400" /> ANUNCIO OFICIAL FIJADO
                </span>
                <span className="text-[11px] text-slate-400">@{pinnedPost.author}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{pinnedPost.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{pinnedPost.content}</p>
            </div>
          )}

          {/* Posts Feed */}
          {filteredPosts.length === 0 && !pinnedPost ? (
            <div className="py-12 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                No hay publicaciones en este foro todavía.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredPosts.map((post) => {
                const authorProf = getProfileOf(post.author);
                return (
                  <div
                    key={post.id}
                    onClick={() => setActivePostDetail(post)}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-md cursor-pointer transition flex flex-col gap-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUserProfile(post.author);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-90"
                      >
                        <AvatarWithFrame
                          src={authorProf.avatar}
                          size="sm"
                          ringColor={authorProf.ringColor}
                          transparentFrame={authorProf.transparentFrame}
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white">
                              {authorProf.nickname || post.author}
                            </span>
                            <UserBadges user={authorProf} fanClubs={fanClubs} />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            En: <strong>{post.forumName}</strong>
                            {post.isFandomOnly && ` [⭐ ${post.fandomName}]`}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        #{post.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>

                      {post.type === 'poll' && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5"
                        >
                          <div className="text-xs font-semibold text-amber-300">📊 Encuesta:</div>
                          <button
                            onClick={() => votePoll(post.id, 'option1')}
                            className="w-full text-left px-3 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-white transition flex justify-between"
                          >
                            <span>👍 Sí / Opción A</span>
                            <span className="font-bold text-indigo-400">{post.pollVotes?.option1 || 0}</span>
                          </button>
                          <button
                            onClick={() => votePoll(post.id, 'option2')}
                            className="w-full text-left px-3 py-1.5 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-white transition flex justify-between"
                          >
                            <span>👎 No / Opción B</span>
                            <span className="font-bold text-indigo-400">{post.pollVotes?.option2 || 0}</span>
                          </button>
                        </div>
                      )}

                      {/* Promoted Store / Outlet Product Card */}
                      {post.promotedProductId && (() => {
                        const prod = products.find((p) => p.id === post.promotedProductId);
                        if (!prod) return null;
                        return (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] font-black uppercase text-amber-400">
                                  {prod.isOutlet ? '🛍️ Promoción Outlet' : '✨ Producto Oficial'}
                                </span>
                                <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                                <p className="text-[11px] text-amber-400 font-extrabold">{prod.priceCoins} Coins</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (prod.isOutlet) {
                                  buyOutletProduct(prod.id);
                                } else {
                                  buyProduct(prod.id);
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95 flex-shrink-0 shadow"
                            >
                              Comprar
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400"
                    >
                      <button
                        onClick={() => reactPost(post.id, 'like')}
                        className={`flex items-center gap-1 font-semibold transition ${
                          post.myReaction === 'like' ? 'text-indigo-400' : 'hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes}</span>
                      </button>
                      <button
                        onClick={() => reactPost(post.id, 'dislike')}
                        className={`flex items-center gap-1 font-semibold transition ${
                          post.myReaction === 'dislike' ? 'text-pink-400' : 'hover:text-white'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{post.dislikes}</span>
                      </button>
                      <button
                        onClick={() => setActivePostDetail(post)}
                        className="flex items-center gap-1 font-semibold hover:text-white transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: PANEL DE FOROS (MINIATURAS MÁS PEQUEÑAS, CABEN 3 EN UNA LÍNEA) */}
      {activeTab === 'panel' && !activeForumFilter && (
        <div className="flex flex-col gap-6">
          {/* Foros unidos: 3 por línea */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Foros a los que te has unido (3 por línea)
              </h3>
              <span className="text-[11px] text-slate-500">
                💡 Clic derecho para editar foro (Admins y Creadores)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {forums
                .filter((f) => f.isJoined)
                .map((f) => {
                  const hasAccess = canAccessFandomForum(f);
                  return (
                    <div
                      key={f.id}
                      onContextMenu={(e) => handleContextMenu(e, f)}
                      onClick={() => {
                        if (!hasAccess) {
                          showToast(`Foro exclusivo del fandom ${f.fandomName}. Únete a su club de fans.`);
                          return;
                        }
                        setActiveForumFilter(f.id);
                      }}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden cursor-pointer shadow-md transition flex flex-col justify-between group h-36"
                    >
                      {f.isFandomForum ? (
                        <div
                          className="h-14 p-2.5 flex flex-col justify-between"
                          style={{ backgroundColor: f.bgValue || '#1e1b4b' }}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider text-pink-300">
                            ⭐ Fandom: {f.fandomName}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                        </div>
                      ) : (
                        <div className="relative h-14 bg-slate-800">
                          <img src={f.banner} alt="" className="w-full h-full object-cover" />
                          <img
                            src={f.avatar}
                            alt=""
                            className="absolute -bottom-2.5 left-2.5 w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                          />
                        </div>
                      )}

                      <div className="p-3 pt-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          {!f.isFandomForum && (
                            <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                          )}
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {f.description}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{f.followers} miembros</span>
                          {canManageForum(f) && (
                            <span className="text-indigo-400 text-[10px] font-medium">
                              Clic derecho: opciones
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Descubrir otros foros: 3 por línea */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Descubrir Otros Foros (3 por línea)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {forums
                .filter((f) => !f.isJoined)
                .map((f) => {
                  const hasAccess = canAccessFandomForum(f);
                  return (
                    <div
                      key={f.id}
                      onContextMenu={(e) => handleContextMenu(e, f)}
                      onClick={() => {
                        if (!hasAccess) {
                          showToast(`Este foro pertenece al Fandom ${f.fandomName}. Únete al club de fans para acceder.`);
                          return;
                        }
                        setActiveForumFilter(f.id);
                      }}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden cursor-pointer shadow-md transition flex flex-col justify-between group h-36"
                    >
                      {f.isFandomForum ? (
                        <div
                          className="h-14 p-2.5 flex flex-col justify-between"
                          style={{ backgroundColor: f.bgValue || '#1e1b4b' }}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider text-pink-300">
                            ⭐ Fandom: {f.fandomName}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                        </div>
                      ) : (
                        <div className="relative h-14 bg-slate-800">
                          <img src={f.banner} alt="" className="w-full h-full object-cover" />
                          <img
                            src={f.avatar}
                            alt=""
                            className="absolute -bottom-2.5 left-2.5 w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                          />
                        </div>
                      )}

                      <div className="p-3 pt-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          {!f.isFandomForum && (
                            <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                          )}
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {f.description}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{f.followers} miembros</span>
                          {hasAccess ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                joinForum(f.id);
                              }}
                              className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold"
                            >
                              Unirse
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400 text-[9px] font-semibold">
                              <Lock className="w-2.5 h-2.5" /> Fandom Requerido
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* CONTEXT MENU (Click Derecho) */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 w-48 text-xs text-white animate-fadeIn"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 truncate">
            {contextMenu.forum.name}
          </div>
          <button
            onClick={() => openEditForumWindow(contextMenu.forum)}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Editar Foro
          </button>
          <button
            onClick={() => {
              deleteForum(contextMenu.forum.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" /> Eliminar Foro
          </button>
        </div>
      )}

      {/* MODAL: EDITAR FORO (Abre con click derecho o botón editar) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveEditForum}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" /> Editar Foro
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Foro:
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción del Foro:
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[60px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Foto / Icono del Foro:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="URL de foto o usa el botón..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs rounded-xl font-medium text-slate-200">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Banner del Foro:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editBanner}
                  onChange={(e) => setEditBanner(e.target.value)}
                  placeholder="URL de banner o sube archivo..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs rounded-xl font-medium text-slate-200">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Color de Fondo del Foro:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editBgValue}
                  onChange={(e) => setEditBgValue(e.target.value)}
                  className="w-12 h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-400">{editBgValue}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREAR PUBLICACIÓN */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreatePostSubmit}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Crear Publicación
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatePostOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Foro Destino:
              </label>
              <select
                value={postForumId}
                onChange={(e) => setPostForumId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              >
                {forums
                  .filter((f) => canAccessFandomForum(f))
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.isFandomForum ? `[Fandom: ${f.fandomName}]` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo:
              </label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              >
                <option value="normal">Normal</option>
                <option value="poll">📊 Encuesta</option>
                {isPrivileged() && (
                  <option value="announcement">📢 Anuncio Oficial (Fijado)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Etiqueta:
              </label>
              <input
                type="text"
                value={postTag}
                onChange={(e) => setPostTag(e.target.value)}
                placeholder="Ej: Música, Tips, Covers..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título:
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Título descriptivo..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contenido:
              </label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white min-h-[80px]"
                required
              />
            </div>

            {/* Promocionar Producto de la Tienda (Oficial u Outlet) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Promocionar Producto de la Tienda / Outlet (Opcional):
              </label>
              <select
                value={promotedProdId}
                onChange={(e) => setPromotedProdId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="">-- Sin promoción de producto --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.isOutlet ? '[Outlet] ' : p.category === 'fashion' ? '[Fashion] ' : '[Oficial] '}
                    {p.name} ({p.priceCoins} Coins)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatePostOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Publicar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREAR FORO ESTÁNDAR */}
      {isCreateForumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateStandardForumSubmit}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" /> Crear Foro Comunitario
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateForumOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Foro:
              </label>
              <input
                type="text"
                value={forumName}
                onChange={(e) => setForumName(e.target.value)}
                placeholder="Ej: Compositores & Beatmakers"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción:
              </label>
              <textarea
                value={forumDesc}
                onChange={(e) => setForumDesc(e.target.value)}
                placeholder="Objetivo y temas de la comunidad..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[60px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Banner:
              </label>
              <input
                type="url"
                value={forumBanner}
                onChange={(e) => setForumBanner(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Avatar del Foro:
              </label>
              <input
                type="url"
                value={forumAvatar}
                onChange={(e) => setForumAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateForumOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                Crear Foro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREAR FORO DE FANDOM */}
      {isCreateFandomForumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateFandomForumSubmit}
            className="relative w-full max-w-md bg-slate-900 border border-pink-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 text-pink-300">
                  <Sparkles className="w-5 h-5 text-pink-400" /> Crear Foro de Fandom
                </h3>
                <p className="text-[11px] text-slate-400">
                  Solo nombre y descripción (sin banner ni avatar).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateFandomForumOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Club de Fans Asociado:
              </label>
              <select
                value={selectedClubForFandomForum}
                onChange={(e) => setSelectedClubForFandomForum(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                {clubsUserCanManage.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name} (Fandom: {club.fandomName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Foro de Fandom:
              </label>
              <input
                type="text"
                value={fandomForumName}
                onChange={(e) => setFandomForumName(e.target.value)}
                placeholder="Ej: Sala de Proyectos & Votaciones"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción:
              </label>
              <textarea
                value={fandomForumDesc}
                onChange={(e) => setFandomForumDesc(e.target.value)}
                placeholder="Temas exclusivos para miembros del club..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white min-h-[60px]"
                required
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateFandomForumOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                Crear Foro Fandom
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: DETALLE DE PUBLICACIÓN */}
      {activePostDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div
                onClick={() => {
                  onOpenUserProfile(activePostDetail.author);
                  setActivePostDetail(null);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-90"
              >
                <AvatarWithFrame
                  src={getProfileOf(activePostDetail.author).avatar}
                  size="sm"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    {activePostDetail.author}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Foro: {activePostDetail.forumName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActivePostDetail(null)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-1.5">{activePostDetail.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {activePostDetail.content}
              </p>
            </div>

            <div className="border-t border-slate-800 pt-3 flex flex-col gap-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Comentarios ({activePostDetail.comments?.length || 0})
              </h4>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {activePostDetail.comments?.length === 0 ? (
                  <span className="text-xs text-slate-500 py-3 text-center">
                    Aún no hay comentarios. ¡Sé el primero en participar!
                  </span>
                ) : (
                  activePostDetail.comments?.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-800/60 rounded-xl border-l-2 border-indigo-500 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong
                          onClick={() => {
                            onOpenUserProfile(c.author);
                            setActivePostDetail(null);
                          }}
                          className="text-indigo-400 cursor-pointer hover:underline"
                        >
                          @{c.author}
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-200">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Comentar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
