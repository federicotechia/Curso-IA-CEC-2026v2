import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Layers, History, Calendar, Plus, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { Edition, UserProfile } from '../types';

interface EditionSelectorProps {
  editions: Edition[];
  selectedEditionId: string;
  onSelectEdition: (editionId: string) => void;
  profile: UserProfile;
  onOpenManageEditions?: () => void;
}

export const EditionSelector: React.FC<EditionSelectorProps> = ({
  editions,
  selectedEditionId,
  onSelectEdition,
  profile,
  onOpenManageEditions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdminOrTeacher = profile.role === 'profesor' || profile.role === 'administrador';

  // Filter available editions based on role
  const getStudentEditions = () => {
    if (isAdminOrTeacher) return editions;
    
    // Check explicit student enrollments
    const enrolledIds = profile.enrolledEditions || [];
    const matched = editions.filter(e => enrolledIds.includes(e.id));
    
    if (matched.length > 0) {
      // Sort so active edition is first, then planned, then archived
      return [...matched].sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }

    // Fallback: If no explicit enrollment, assign the active or latest edition
    const activeOrLatest = editions.find(e => e.isActive && e.status !== 'archivada')
      || editions.find(e => e.isActive)
      || editions[editions.length - 1]
      || editions[0];

    return activeOrLatest ? [activeOrLatest] : editions;
  };

  const availableEditions = getStudentEditions();

  const currentEdition = availableEditions.find(e => e.id === selectedEditionId) 
    || availableEditions.find(e => e.isActive && e.status !== 'archivada')
    || availableEditions[0]
    || editions.find(e => e.id === selectedEditionId)
    || editions[0];

  useEffect(() => {
    // If selected edition is not valid for this user, automatically select their default active edition
    if (currentEdition && selectedEditionId !== currentEdition.id && !availableEditions.some(e => e.id === selectedEditionId)) {
      onSelectEdition(currentEdition.id);
    }
  }, [availableEditions, selectedEditionId, currentEdition, onSelectEdition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadge = (edition?: Edition) => {
    if (!edition) return null;
    if (edition.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Activa
        </span>
      );
    }
    if (edition.status === 'archivada') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <History size={10} />
          Archivada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
        <Calendar size={10} />
        Planificada
      </span>
    );
  };

  if (!currentEdition && availableEditions.length === 0) {
    return null;
  }

  // If a student only has access to 1 edition, show a static badge instead of a dropdown
  if (!isAdminOrTeacher && availableEditions.length <= 1) {
    return (
      <div 
        id="edition-badge-single"
        className="flex items-center gap-2.5 px-3.5 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm"
      >
        <div className="w-8 h-8 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center font-bold">
          <Layers size={16} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Edición en curso</span>
          <span className="text-xs font-bold text-slate-800 line-clamp-1">{currentEdition?.name || 'Edición 2026'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="edition-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all text-left group"
        aria-expanded={isOpen}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-transform group-hover:scale-105 ${
          currentEdition?.isActive 
            ? 'bg-brand-red/10 text-brand-red' 
            : 'bg-amber-500/10 text-amber-600'
        }`}>
          {currentEdition?.isActive ? <Layers size={16} /> : <History size={16} />}
        </div>
        
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isAdminOrTeacher ? 'Edición Seleccionada' : 'Mi Cohorte / Edición'}
            </span>
            {getStatusBadge(currentEdition)}
          </div>
          <span className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[260px]">
            {currentEdition?.name || 'Seleccionar Edición'}
          </span>
        </div>

        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-dark' : 'group-hover:text-slate-600'}`} 
        />
      </button>

      {isOpen && (
        <div 
          id="edition-selector-menu"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {isAdminOrTeacher ? 'Ediciones del Curso' : 'Mis Cursos Inscriptos'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isAdminOrTeacher 
                  ? 'Cambia de cohorte para ver o gestionar sus contenidos' 
                  : 'Selecciona el curso al que deseas ingresar'}
              </p>
            </div>
            {isAdminOrTeacher && onOpenManageEditions && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenManageEditions();
                }}
                className="text-xs font-bold text-brand-red hover:text-brand-red/80 flex items-center gap-1 p-1"
                title="Administrar ediciones"
              >
                <Plus size={14} /> Nueva
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto py-1 space-y-1">
            {availableEditions.map((edition) => {
              const isSelected = edition.id === (currentEdition?.id || selectedEditionId);
              return (
                <button
                  key={edition.id}
                  id={`select-edition-${edition.id}`}
                  onClick={() => {
                    onSelectEdition(edition.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 ${
                    isSelected 
                      ? 'bg-slate-100/90 text-brand-dark font-medium' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      edition.isActive 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : edition.status === 'archivada'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {edition.isActive ? <Layers size={14} /> : <History size={14} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-slate-800 truncate">{edition.name}</p>
                        {getStatusBadge(edition)}
                      </div>
                      {edition.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{edition.description}</p>
                      )}
                      {(edition.startDate || edition.endDate) && (
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={10} />
                          {edition.startDate ? new Date(edition.startDate).toLocaleDateString() : 'Inicio'} - {edition.endDate ? new Date(edition.endDate).toLocaleDateString() : 'Fin'}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="text-brand-red p-1 shrink-0">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {isAdminOrTeacher && onOpenManageEditions && (
            <div className="pt-2 mt-1 border-t border-slate-100">
              <button
                id="btn-goto-manage-editions"
                onClick={() => {
                  setIsOpen(false);
                  onOpenManageEditions();
                }}
                className="w-full py-2.5 px-3 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Layers size={14} /> Administrar Todas las Ediciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
