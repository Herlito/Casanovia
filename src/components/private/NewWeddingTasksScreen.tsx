import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingTask, TaskPhase, TaskPriority } from '../../types';
import { 
  CheckCircle2, 
  Circle, 
  CheckSquare, 
  Square, 
  Trash2, 
  RotateCcw, 
  Plus, 
  ArrowLeft, 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  Filter,
  Search,
  Users,
  ShieldAlert
} from 'lucide-react';

const PHASE_LABELS: Record<string, { name: string; time: string; color: string; badgeBg: string }> = {
  fase_1: {
    name: 'Fase 1: Fundamentos y Reservas Principales',
    time: '12 a 9 meses antes',
    color: 'border-transparent text-[#2D3748]',
    badgeBg: 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748]',
  },
  fase_2: {
    name: 'Fase 2: Estilo, Proveedores Clave y Diseño',
    time: '8 a 6 meses antes',
    color: 'border-[#C5A880] text-[#8C6B3E]',
    badgeBg: 'bg-amber-100 text-amber-900',
  },
  fase_3: {
    name: 'Fase 3: Coordinación de Detalles y Logística',
    time: '5 a 3 meses antes',
    color: 'border-[#8A9A86] text-[#4A5D46]',
    badgeBg: 'bg-emerald-100 text-emerald-900',
  },
  fase_4: {
    name: 'Fase 4: Confirmaciones y Protocolo Final',
    time: '2 meses a 2 semanas antes',
    color: 'border-[#4A5568] text-[#2D3748]',
    badgeBg: 'bg-slate-100 text-slate-800',
  },
  fase_5: {
    name: 'Fase 5: Recta Final',
    time: 'Semana previa al evento',
    color: 'border-[#D4AF37] text-[#977B1E]',
    badgeBg: 'bg-yellow-100 text-yellow-900',
  },
  fase_6: {
    name: 'Fase 6: El Día de la Boda y Post-Boda',
    time: 'Día D y días posteriores',
    color: 'border-rose-600 text-rose-700',
    badgeBg: 'bg-rose-100 text-rose-900',
  },
};

export const NewWeddingTasksScreen: React.FC = () => {
  const { 
    settings, 
    tasks, 
    toggleTask, 
    toggleAllTasks, 
    deleteAllTasks, 
    addTask, 
    deleteTask, 
    resetTasksToMaster, 
    setActiveView,
    activeWedding
  } = useWedding();

  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState<TaskPhase>('fase_1');
  const [newPriority, setNewPriority] = useState<TaskPriority>('alta');
  const [newAssignee, setNewAssignee] = useState('Novios & Wedding Planner');

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedPhase !== 'all' && t.phase !== selectedPhase) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchAssignee = t.assignee?.toLowerCase().includes(q) || false;
      return matchTitle || matchAssignee;
    }
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      phase: newPhase,
      priority: newPriority,
      assignee: newAssignee,
      isCompleted: false
    });
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleExitToDashboard = () => {
    setActiveView('private');
  };

  const phasesList: TaskPhase[] = ['fase_1', 'fase_2', 'fase_3', 'fase_4', 'fase_5', 'fase_6'];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      
      {/* Top Banner Bar */}
      <div className="bg-linear-to-r from-[#2D3748] via-[#6A2534] to-[#4A1521] text-[#2D3748] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div>
              <h1 className="font-serif-display text-2xl sm:text-4xl font-bold tracking-wide">
                Lista de Tareas & Checklist
              </h1>
              <p className="text-sm text-[#4A5568] mt-1 max-w-2xl font-light">
                Revisa y personaliza la lista cronológica de actividades para <strong className="text-[#2D3748] font-semibold">{settings.coupleNames}</strong>. 
                Marca las tareas listas, agrega pendientes o sal al dashboard cuando desees.
              </p>
            </div>

            {/* Exit to Dashboard Button */}
            <div className="shrink-0 flex items-center space-x-3">
              <button
                type="button"
                id="btn-exit-to-dashboard-top"
                onClick={handleExitToDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#EBEBEB] text-[#2D3748] font-bold text-sm hover:bg-[#EBEBEB] transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] cursor-pointer transform hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2D3748]" />
                <span>Regresar al Dashboard Novios</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Progress Bar Card */}
          <div className="mt-6 bg-[#EBEBEB]/10 rounded-2xl p-4 border border-transparent backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBEBEB]/20 flex items-center justify-center font-bold text-base">
                {progressPercent}%
              </div>
              <div>
                <div className="text-xs font-semibold text-[#4A5568]">Progreso de Tareas</div>
                <div className="text-sm font-bold text-[#2D3748]">
                  {completedCount} de {totalCount} tareas completadas
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-2 hidden sm:block">
              <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-stone-300">Boda:</span>
              <span className="font-semibold text-[#2D3748] bg-[#EBEBEB]/20 px-2.5 py-1 rounded-lg">
                {settings.coupleNames}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Bulk Actions Toolbar */}
        <div className="bg-[#EBEBEB] p-4 rounded-2xl shadow-xs border border-transparent flex flex-wrap items-center justify-between gap-3 mb-6">
          
          {/* Left: Bulk toggle and delete actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Marcar todas */}
            <button
              type="button"
              id="btn-mark-all-tasks"
              onClick={() => toggleAllTasks(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
              title="Marcar todas las tareas como completadas"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Marcar todas</span>
            </button>

            {/* Desmarcar todas */}
            <button
              type="button"
              id="btn-unmark-all-tasks"
              onClick={() => toggleAllTasks(false)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Desmarcar todas las tareas"
            >
              <Square className="w-4 h-4 text-stone-500" />
              <span>Desmarcar todas</span>
            </button>

            {/* Borrar todas */}
            <button
              type="button"
              id="btn-delete-all-tasks"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Borrar todas las tareas de la boda"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Borrar todas</span>
            </button>

            {/* Restaurar Lista Maestra */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas restaurar la lista maestra de 6 fases cronológicas?')) {
                  resetTasksToMaster();
                }
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] text-[#6B6358] hover:text-[#2D2A26] hover:bg-[#EFEAE2] border border-[#D9CEBF] text-xs font-medium transition-colors"
              title="Cargar las tareas predefinidas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8C8276]" />
              <span>Restaurar Lista Maestra</span>
            </button>

          </div>

          {/* Right: Add new task button */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cerrar Formulario' : '+ Agregar Tarea'}</span>
            </button>
          </div>

        </div>

        {/* Add Task Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleCreateTask} className="bg-[#EBEBEB] p-5 rounded-2xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-transparent mb-6 animate-fadeIn">
            <h3 className="text-xs font-bold text-[#2D3748] uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea Personalizada</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Descripción de la Tarea <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Realizar prueba de peinado y maquillaje..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Fase Cronológica
                </label>
                <select
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value as TaskPhase)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                >
                  <option value="fase_1">Fase 1: 12-9 meses antes</option>
                  <option value="fase_2">Fase 2: 8-6 meses antes</option>
                  <option value="fase_3">Fase 3: 5-3 meses antes</option>
                  <option value="fase_4">Fase 4: 2 meses a 2 sem</option>
                  <option value="fase_5">Fase 5: Semana previa</option>
                  <option value="fase_6">Fase 6: Día D y Post-boda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1">
                  Prioridad
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                >
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-4 pt-3 border-t border-[#F0EAE1]">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-[#7A7268] hover:bg-[#EFEAE2]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB]"
              >
                Guardar Tarea
              </button>
            </div>
          </form>
        )}

        {/* Delete All Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-[#EBEBEB] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 relative">
              <div className="flex items-center space-x-3 text-rose-600 mb-3">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold text-base text-[#2D2A26]">¿Borrar todas las tareas?</h3>
              </div>
              <p className="text-xs text-[#7A7268] mb-5">
                Esta acción eliminará todas las {tasks.length} tareas de esta boda. Podrás restaurar la lista maestra predeterminada en cualquier momento con el botón "Restaurar Lista Maestra".
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#7A7268] hover:bg-[#EFEAE2]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteAllTasks();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#2D3748] bg-rose-600 hover:bg-rose-700 shadow-xs"
                >
                  Sí, Borrar Todas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Phase Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          
          {/* Phase Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedPhase('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedPhase === 'all'
                  ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs'
                  : 'bg-[#EBEBEB] text-[#524B42] hover:bg-[#EFEAE2] border border-transparent'
              }`}
            >
              Todas las Fases ({tasks.length})
            </button>
            {phasesList.map((p) => {
              const pCount = tasks.filter((t) => t.phase === p).length;
              const pCompleted = tasks.filter((t) => t.phase === p && t.isCompleted).length;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPhase(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 ${
                    selectedPhase === p
                      ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs'
                      : 'bg-[#EBEBEB] text-[#524B42] hover:bg-[#EFEAE2] border border-transparent'
                  }`}
                >
                  <span>{p.replace('_', ' ').toUpperCase()}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedPhase === p ? 'bg-[#EBEBEB]/20 text-[#2D3748]' : 'bg-stone-100 text-stone-600'}`}>
                    {pCompleted}/{pCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative shrink-0 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8C8276] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarea o responsable..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
            />
          </div>

        </div>

        {/* Tasks List Organized by Phase */}
        {tasks.length === 0 ? (
          <div className="bg-[#EBEBEB] rounded-2xl p-12 text-center border border-transparent shadow-xs">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-[#2D2A26] mb-1">
              No hay tareas registradas para esta boda
            </h3>
            <p className="text-xs text-[#7A7268] max-w-md mx-auto mb-4">
              Puedes restaurar las 28 tareas maestras organizadas en 6 fases o agregar tareas manualmente.
            </p>
            <button
              type="button"
              onClick={resetTasksToMaster}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB] shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Lista Maestra de 6 Fases</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {phasesList
              .filter((p) => selectedPhase === 'all' || selectedPhase === p)
              .map((phaseKey) => {
                const phaseTasks = filteredTasks.filter((t) => t.phase === phaseKey);
                if (phaseTasks.length === 0 && selectedPhase === 'all' && searchQuery.trim()) {
                  return null;
                }
                const phaseInfo = PHASE_LABELS[phaseKey];
                const pCompleted = phaseTasks.filter((t) => t.isCompleted).length;

                return (
                  <div key={phaseKey} className="bg-[#EBEBEB] rounded-2xl border border-transparent shadow-xs overflow-hidden">
                    
                    {/* Phase Header */}
                    <div className="bg-[#FAF8F5] px-4 py-3.5 border-b border-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif-display font-bold text-sm text-[#2D2A26]">
                          {phaseInfo.name}
                        </h3>
                        <span className="text-[11px] text-[#7A7268] font-light">
                          {phaseInfo.time}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${phaseInfo.badgeBg}`}>
                          {pCompleted} de {phaseTasks.length} listas
                        </span>
                      </div>
                    </div>

                    {/* Phase Tasks list */}
                    {phaseTasks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#8C8276] italic">
                        No hay tareas que coincidan con la búsqueda en esta fase.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F0EAE1]">
                        {phaseTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3.5 sm:p-4 flex items-start justify-between gap-3 transition-colors ${
                              task.isCompleted ? 'bg-emerald-50/30' : 'hover:bg-[#FAF8F5]'
                            }`}
                          >
                            
                            {/* Checkbox and Title */}
                            <div className="flex items-start space-x-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleTask(task.id)}
                                className="mt-0.5 shrink-0 text-[#2D3748] focus:outline-hidden hover:scale-110 transition-transform cursor-pointer"
                              >
                                {task.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Circle className="w-5 h-5 text-[#8C8276] hover:text-[#2D3748]" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <p
                                  onClick={() => toggleTask(task.id)}
                                  className={`text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                                    task.isCompleted
                                      ? 'line-through text-[#8C8276]'
                                      : 'text-[#2D2A26]'
                                  }`}
                                >
                                  {task.title}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-[#7A7268]">
                                  {task.assignee && (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-transparent text-[#524B42]">
                                      <Users className="w-3 h-3 text-[#8C8276]" />
                                      <span>{task.assignee}</span>
                                    </span>
                                  )}

                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    task.priority === 'alta' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                    task.priority === 'media' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}>
                                    Prioridad {task.priority.toUpperCase()}
                                  </span>

                                  {task.dueDate && (
                                    <span className="flex items-center space-x-1 text-[#8C8276]">
                                      <Calendar className="w-3 h-3" />
                                      <span>{task.dueDate}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delete single task */}
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              title="Eliminar tarea"
                              className="p-1 text-[#8C8276] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
          </div>
        )}

        {/* Bottom Exit Bar */}
        <div className="mt-8 bg-[#EBEBEB] p-5 rounded-2xl border border-transparent shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-[#7A7268]">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Tus cambios y checks se sincronizan en tiempo real en <strong>Firebase Firestore</strong>.
            </span>
          </div>

          <button
            type="button"
            id="btn-exit-to-dashboard-bottom"
            onClick={handleExitToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] font-bold text-xs hover:bg-[#EBEBEB] transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Listo, Regresar al Dashboard Novios</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
