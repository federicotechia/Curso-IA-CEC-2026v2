import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  History, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Copy, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  Shield,
  X,
  Info,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Edition, ClassModule, Task, ForumPost, Submission, UserProfile, UserRole } from '../types';

interface EditionsManagerProps {
  editions: Edition[];
  selectedEditionId: string;
  onSelectEdition: (id: string) => void;
  onCreateEdition: (editionData: {
    name: string;
    description: string;
    startDate?: string;
    endDate?: string;
    status: 'activa' | 'archivada' | 'planificada';
    cloneContentFrom?: string;
  }) => Promise<void>;
  onUpdateEdition: (edition: Edition) => Promise<void>;
  onSetActiveEdition: (id: string) => Promise<void>;
  onDeleteEdition: (id: string) => Promise<void>;
  onAssignUserEditions?: (userId: string, editions: string[]) => Promise<void>;
  modules: ClassModule[];
  tasks: Task[];
  forum: ForumPost[];
  submissions: Submission[];
  allUsers: UserProfile[];
  profile: UserProfile;
  onNavigateToTab: (tab: 'clases' | 'foro' | 'tareas' | 'admin') => void;
}

export const EditionsManager: React.FC<EditionsManagerProps> = ({
  editions,
  selectedEditionId,
  onSelectEdition,
  onCreateEdition,
  onUpdateEdition,
  onSetActiveEdition,
  onDeleteEdition,
  onAssignUserEditions,
  modules,
  tasks,
  forum,
  submissions,
  allUsers,
  profile,
  onNavigateToTab,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create Modal form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'activa' | 'archivada' | 'planificada'>('activa');
  const [cloneContentFrom, setCloneContentFrom] = useState<string>('');
  const [shouldClone, setShouldClone] = useState(true);

  // Student assignment modal state
  const [managingStudentsEdition, setManagingStudentsEdition] = useState<Edition | null>(null);

  // Delete confirm modal state
  const [confirmDeleteEdition, setConfirmDeleteEdition] = useState<Edition | null>(null);

  const activeEdition = editions.find(e => e.isActive) || editions[0];

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setStatus('activa');
    setCloneContentFrom(activeEdition?.id || (editions.length > 0 ? editions[0].id : ''));
    setShouldClone(editions.length > 0);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateEdition({
        name: name.trim(),
        description: description.trim(),
        startDate,
        endDate,
        status,
        cloneContentFrom: shouldClone ? cloneContentFrom : undefined,
      });
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdition || !editingEdition.name.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateEdition(editingEdition);
      setEditingEdition(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics calculators for an edition
  const getEditionMetrics = (editionId: string) => {
    const isDefault = editionId === 'edicion-ia-aplicada-cec-2026';
    
    const editionModules = modules.filter(m => m.editionId ? m.editionId === editionId : isDefault);
    const editionTasks = tasks.filter(t => t.editionId ? t.editionId === editionId : isDefault);
    const editionForum = forum.filter(p => p.editionId ? p.editionId === editionId : isDefault);
    const editionSubmissions = submissions.filter(s => s.editionId ? s.editionId === editionId : isDefault);
    
    const editionStudents = allUsers.filter(u => {
      if (u.role !== 'alumno') return false;
      if (u.enrolledEditions && u.enrolledEditions.length > 0) {
        return u.enrolledEditions.includes(editionId);
      }
      // If student has no explicit enrolledEditions, they belong to the active or default edition
      return isDefault || (editions.find(e => e.id === editionId)?.isActive ?? false);
    });

    return {
      modulesCount: editionModules.length,
      tasksCount: editionTasks.length,
      forumCount: editionForum.length,
      submissionsCount: editionSubmissions.length,
      studentsCount: editionStudents.length,
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-dark via-slate-900 to-brand-dark text-white p-8 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/15 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-red flex items-center justify-center shadow-lg shadow-brand-red/30">
                <Layers size={22} className="text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-red bg-brand-red/10 px-3 py-1 rounded-full border border-brand-red/20">
                Control Multi-Edición
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ediciones y Cohortes del Curso
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Administra múltiples dictados del programa formativo. Crea nuevas ediciones reutilizando el material base, 
              manteniendo independientes los foros, entregas de tareas y las interacciones históricas de cada grupo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              id="btn-create-new-edition"
              onClick={handleOpenCreate}
              className="px-6 py-4 bg-brand-red hover:bg-brand-red/90 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl shadow-brand-red/25 flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <Plus size={18} /> Nueva Edición / Cohorte
            </button>
          </div>
        </div>
      </div>

      {/* Editions List */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-brand-dark tracking-tight">Todas las Ediciones</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {editions.length} registradas
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Edición actual visualizada: <strong className="text-slate-700">{editions.find(e => e.id === selectedEditionId)?.name || 'Ninguna'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {editions.map((edition) => {
            const metrics = getEditionMetrics(edition.id);
            const isCurrentlySelected = edition.id === selectedEditionId;

            return (
              <motion.div
                key={edition.id}
                id={`edition-card-${edition.id}`}
                layout
                className={`bg-white rounded-[28px] p-6 sm:p-8 border transition-all duration-300 relative shadow-sm hover:shadow-md ${
                  edition.isActive 
                    ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' 
                    : isCurrentlySelected
                    ? 'border-brand-red/40 ring-1 ring-brand-red/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Active / Current indicator badges */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {edition.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Edición Activa (Principal)
                      </span>
                    ) : edition.status === 'archivada' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20">
                        <Archive size={13} />
                        Archivada (Histórico)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-700 border border-blue-500/20">
                        <Calendar size={13} />
                        Planificada
                      </span>
                    )}

                    {isCurrentlySelected && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white shadow-sm">
                        <Check size={13} /> En Vista
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-medium">
                      ID: <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{edition.id}</code>
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingEdition({ ...edition })}
                      className="p-2 text-slate-400 hover:text-brand-dark hover:bg-slate-100 rounded-xl transition-all"
                      title="Editar información de la edición"
                    >
                      <Edit size={16} />
                    </button>
                    {!edition.isActive && editions.length > 1 && (
                      <button
                        onClick={() => setConfirmDeleteEdition(edition)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar edición"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Edition Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6 space-y-3">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                      {edition.name}
                    </h4>
                    {edition.description ? (
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {edition.description}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs italic">
                        Sin descripción adicional.
                      </p>
                    )}

                    {(edition.startDate || edition.endDate) && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pt-1">
                        <Calendar size={14} className="text-slate-400" />
                        <span>
                          {edition.startDate ? new Date(edition.startDate).toLocaleDateString() : 'Sin fecha inicio'} 
                          {' '}&rarr;{' '} 
                          {edition.endDate ? new Date(edition.endDate).toLocaleDateString() : 'Sin fecha cierre'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metrics Bento Grid */}
                  <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs text-center">
                      <Users size={16} className="text-blue-500 mb-1" />
                      <span className="text-lg font-black text-slate-800">{metrics.studentsCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alumnos</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs text-center">
                      <BookOpen size={16} className="text-brand-red mb-1" />
                      <span className="text-lg font-black text-slate-800">{metrics.modulesCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clases</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs text-center">
                      <FileText size={16} className="text-purple-500 mb-1" />
                      <span className="text-lg font-black text-slate-800">{metrics.tasksCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tareas</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs text-center">
                      <MessageSquare size={16} className="text-emerald-500 mb-1" />
                      <span className="text-lg font-black text-slate-800">{metrics.forumCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultas</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {!edition.isActive && (
                      <button
                        id={`btn-set-active-${edition.id}`}
                        onClick={() => onSetActiveEdition(edition.id)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                      >
                        <CheckCircle size={15} /> Establecer como Activa
                      </button>
                    )}

                    <button
                      id={`btn-manage-students-${edition.id}`}
                      onClick={() => setManagingStudentsEdition(edition)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Users size={15} /> Asignar Alumnos ({metrics.studentsCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      id={`btn-explore-${edition.id}`}
                      onClick={() => {
                        onSelectEdition(edition.id);
                        onNavigateToTab('clases');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <span>Ver Clases y Contenido</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Create New Edition Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-red text-white flex items-center justify-center font-bold">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">Nueva Edición / Cohorte</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Configura un nuevo ciclo del curso</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                    Nombre de la Edición *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: IA Aplicada - CEC / 2° Cohorte 2026"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                    Descripción / Enfoque
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles sobre el grupo, objetivos o modificaciones específicas..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                      Fecha de Finalización
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                    Estado Inicial
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['activa', 'planificada', 'archivada'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`py-3 px-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                          status === st
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Cloning Section */}
                {editions.length > 0 && (
                  <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={shouldClone}
                        onChange={(e) => setShouldClone(e.target.checked)}
                        className="w-4 h-4 text-brand-red rounded border-slate-300 focus:ring-brand-red"
                      />
                      <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Copy size={14} /> Clonar contenido de una edición existente
                      </span>
                    </label>

                    {shouldClone && (
                      <div className="pt-2 space-y-2">
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Se duplicarán todos los módulos, materiales y tareas asociándolos a la nueva edición. 
                          Podrás editarlos, cambiar fechas y agregar nuevo material sin alterar el curso anterior.
                        </p>
                        <select
                          value={cloneContentFrom}
                          onChange={(e) => setCloneContentFrom(e.target.value)}
                          className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        >
                          {editions.map((ed) => (
                            <option key={ed.id} value={ed.id}>
                              {ed.name} {ed.isActive ? '(Activa)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-brand-red text-white rounded-2xl font-black hover:bg-brand-red/90 transition-all text-xs uppercase tracking-wider shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Edición'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Edition Modal */}
      <AnimatePresence>
        {editingEdition && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold">
                    <Edit size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">Editar Edición</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Modificar parámetros generales</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingEdition(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                    Nombre de la Edición *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEdition.name}
                    onChange={(e) => setEditingEdition({ ...editingEdition, name: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                    Descripción
                  </label>
                  <textarea
                    value={editingEdition.description || ''}
                    onChange={(e) => setEditingEdition({ ...editingEdition, description: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={editingEdition.startDate?.split('T')[0] || ''}
                      onChange={(e) => setEditingEdition({ ...editingEdition, startDate: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                      Fecha de Finalización
                    </label>
                    <input
                      type="date"
                      value={editingEdition.endDate?.split('T')[0] || ''}
                      onChange={(e) => setEditingEdition({ ...editingEdition, endDate: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
                    Estado de la Edición
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['activa', 'planificada', 'archivada'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditingEdition({ ...editingEdition, status: st })}
                        className={`py-3 px-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                          editingEdition.status === st
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingEdition(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-brand-dark text-white rounded-2xl font-black hover:bg-brand-dark/90 transition-all text-xs uppercase tracking-wider shadow-lg shadow-brand-dark/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Students in Edition Modal */}
      <AnimatePresence>
        {managingStudentsEdition && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">
                      Inscripciones en {managingStudentsEdition.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Asigna o desvincula alumnos de esta cohorte
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setManagingStudentsEdition(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Los alumnos seleccionados tendrán acceso a los módulos, tareas y foros de esta edición:
                </p>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {allUsers.filter(u => u.role === 'alumno').map(student => {
                    const isEnrolled = (student.enrolledEditions || []).includes(managingStudentsEdition.id) ||
                      (!student.enrolledEditions?.length && (managingStudentsEdition.isActive || managingStudentsEdition.id === 'edicion-ia-aplicada-cec-2026'));

                    return (
                      <div
                        key={student.uid}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center font-bold text-xs uppercase">
                            {student.displayName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{student.displayName}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            if (!onAssignUserEditions) return;
                            const current = student.enrolledEditions || (
                              managingStudentsEdition.isActive ? [managingStudentsEdition.id] : []
                            );
                            const updated = isEnrolled
                              ? current.filter(id => id !== managingStudentsEdition.id)
                              : [...current, managingStudentsEdition.id];
                            await onAssignUserEditions(student.uid, updated);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            isEnrolled
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isEnrolled ? (
                            <>
                              <Check size={14} /> Inscripto
                            </>
                          ) : (
                            <>
                              <Plus size={14} /> Inscribir
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {allUsers.filter(u => u.role === 'alumno').length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold">
                      No hay alumnos registrados en el sistema.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setManagingStudentsEdition(null)}
                  className="px-6 py-3 bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Listo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmDeleteEdition && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden p-8 text-center border border-slate-100"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">¿Eliminar Edición?</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Vas a eliminar la edición <strong className="text-slate-700">{confirmDeleteEdition.name}</strong>. 
                Ten en cuenta que esta acción es permanente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteEdition(null)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await onDeleteEdition(confirmDeleteEdition.id);
                    setConfirmDeleteEdition(null);
                  }}
                  className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
