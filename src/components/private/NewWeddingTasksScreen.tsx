import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingTask, TaskPhase, TaskPriority } from '../../types';
import { TasksExcelModal } from './TasksExcelModal';
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
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';

const PHASE_LABELS: Record<string, { name: string; time: string; color: string; badgeBg: string }> = {
  fase_1: {
    name: 'Inicializar y Reservar',
    time: '12 a 9 meses antes',
    color: 'border-transparent text-[#2D3748]',
    badgeBg: 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748]',
  },
  fase_2: {
    name: 'Estilo, Proveedores y Diseño',
    time: '8 a 6 meses antes',
    color: 'border-[#C5A880] text-[#8C6B3E]',
    badgeBg: 'bg-amber-100 text-amber-900',
  },
  fase_3: {
    name: 'Logística, Detalles y Convocatoria',
    time: '5 a 3 meses antes',
    color: 'border-[#8A9A86] text-[#4A5D46]',
    badgeBg: 'bg-emerald-100 text-emerald-900',
  },
  fase_4: {
    name: 'Confirmaciones y Protocolo',
    time: '2 meses a 2 semanas antes',
    color: 'border-[#4A5568] text-[#2D3748]',
    badgeBg: 'bg-slate-100 text-slate-800',
  },
  fase_5: {
    name: 'Recta Final',
    time: 'Semana previa al evento',
    color: 'border-[#D4AF37] text-[#977B1E]',
    badgeBg: 'bg-yellow-100 text-yellow-900',
  },
  fase_6: {
    name: 'Día de Boda y Post-Boda',
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
    setAllTasks,
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
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);

  const handleImportTasks = async (newTasks: WeddingTask[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      await setAllTasks(newTasks);
    } else {
      await setAllTasks([...tasks, ...newTasks]);
    }
  };

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
    <div className="min-h-screen bg-[#EBEBEB] pb-16">
      
      {/* Top Banner Bar - Neumorphic Style */}
      <div className="bg-[#EBEBEB] text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div>
              <h1 className="font-serif-display text-2xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Lista de Tareas
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl font-light leading-relaxed">
                Revisa y personaliza la lista cronológica de actividades para <strong className="text-gray-800 font-semibold">{settings.coupleNames}</strong>. 
                Marca las tareas listas, agrega pendientes o sal al dashboard cuando desees.
              </p>
            </div>

            {/* Exit to Dashboard Button */}
            <div className="shrink-0 flex items-center space-x-3">
              <button
                type="button"
                id="btn-exit-to-dashboard-top"
                onClick={handleExitToDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#EBEBEB] text-gray-800 font-bold text-xs sm:text-sm shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-700" />
                <span>Regresar al Dashboard</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

          </div>

          {/* Progress Bar Card */}
          <div className="mt-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] font-bold text-gray-800 text-sm sm:text-base flex items-center justify-center shrink-0">
                {progressPercent}%
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500">Progreso de Tareas</div>
                <div className="text-sm font-bold text-gray-800">
                  {completedCount} de {totalCount} tareas completadas
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-4 hidden sm:block">
              <div className="w-full bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] h-3.5 rounded-full relative p-0.5 flex items-center">
                <div 
                  className="bg-linear-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500 relative flex items-center justify-end"
                  style={{ width: `${Math.max(progressPercent, 2)}%` }}
                >
                  {progressPercent > 3 && (
                    <span className="absolute -right-1.5 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_2px_6px_rgba(16,185,129,0.5),inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.7)] border border-emerald-300" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-xs text-gray-600 shrink-0">
              <span className="text-gray-500">Boda:</span>
              <span className="font-bold text-gray-800">
                {settings.coupleNames}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Bulk Actions Toolbar */}
        <div className="bg-[#EBEBEB] p-3 sm:p-4 rounded-3xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex flex-wrap items-center justify-between gap-3 mb-6">
          
          {/* Left: Bulk toggle and delete actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Marcar todas */}
            <button
              type="button"
              id="btn-mark-all-tasks"
              onClick={() => toggleAllTasks(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] text-xs font-bold text-gray-700 hover:text-emerald-700 transition-all cursor-pointer"
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
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all cursor-pointer"
              title="Desmarcar todas las tareas"
            >
              <Square className="w-4 h-4 text-gray-500" />
              <span>Desmarcar todas</span>
            </button>

            {/* Borrar todas */}
            <button
              type="button"
              id="btn-delete-all-tasks"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] text-xs font-semibold text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
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
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] text-xs font-medium text-gray-700 hover:text-gray-900 transition-all cursor-pointer"
              title="Cargar las tareas predefinidas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Restaurar Lista Maestra</span>
            </button>

            {/* Exportar / Importar Excel */}
            <button
              type="button"
              id="btn-excel-tasks-import-export"
              onClick={() => setShowExcelModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-all cursor-pointer"
              title="Exportar o importar lista de tareas en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel (Exportar / Importar)</span>
            </button>

          </div>

          {/* Right: Add new task button */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[5px_5px_10px_#c8c8c8,-5px_-5px_10px_#ffffff] text-gray-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-700" />
              <span>{showAddForm ? 'Cerrar Formulario' : '+ Agregar Tarea'}</span>
            </button>
          </div>

        </div>

        {/* Add Task Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleCreateTask} className="bg-[#EBEBEB] p-6 rounded-3xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] mb-6 animate-fadeIn">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-gray-600" />
              <span>Nueva Tarea Personalizada</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descripción de la Tarea <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Realizar prueba de peinado y maquillaje..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fase Cronológica
                </label>
                <select
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value as TaskPhase)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 focus:outline-hidden"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 focus:outline-hidden"
                >
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-4 pt-3 border-t border-gray-200/50">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 text-xs font-bold hover:text-gray-900 transition-all cursor-pointer"
              >
                Guardar Tarea
              </button>
            </div>
          </form>
        )}

        {/* Delete All Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-[#EBEBEB] rounded-3xl max-w-md w-full p-6 shadow-[10px_10px_20px_#a3a3a3,-10px_-10px_20px_#ffffff] relative">
              <div className="flex items-center space-x-3 text-rose-600 mb-3">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold text-base text-gray-900">¿Borrar todas las tareas?</h3>
              </div>
              <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                Esta acción eliminará todas las {tasks.length} tareas de esta boda. Podrás restaurar la lista maestra predeterminada en cualquier momento con el botón "Restaurar Lista Maestra".
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteAllTasks();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer"
                >
                  Sí, Borrar Todas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Excel Import/Export Modal */}
        <TasksExcelModal
          isOpen={showExcelModal}
          onClose={() => setShowExcelModal(false)}
          tasks={tasks}
          coupleNames={settings.coupleNames || 'Boda'}
          onImport={handleImportTasks}
        />

        {/* Search & Phase Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          
          {/* Phase Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedPhase('all')}
              className={`px-3.5 py-1.5 rounded-2xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                selectedPhase === 'all'
                  ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 font-bold'
                  : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 font-medium hover:text-gray-900 hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff]'
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
                  className={`px-3.5 py-1.5 rounded-2xl text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                    selectedPhase === p
                      ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 font-bold'
                      : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-600 font-medium hover:text-gray-900 hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff]'
                  }`}
                >
                  <span>{p.replace('_', ' ').toUpperCase()}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedPhase === p ? 'bg-black/10 text-gray-800' : 'bg-black/5 text-gray-500'}`}>
                    {pCompleted}/{pCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative shrink-0 sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarea o responsable..."
              className="w-full pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 font-medium rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-hidden border border-transparent"
            />
          </div>

        </div>

        {/* Tasks List Organized by Phase */}
        {tasks.length === 0 ? (
          <div className="bg-[#EBEBEB] rounded-3xl p-12 text-center shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
            <div className="w-12 h-12 rounded-full bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-400 mx-auto flex items-center justify-center mb-3">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-gray-900 mb-1">
              No hay tareas registradas para esta boda
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
              Puedes restaurar las 28 tareas maestras organizadas en 6 fases o agregar tareas manualmente.
            </p>
            <button
              type="button"
              onClick={resetTasksToMaster}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-800 text-xs font-bold hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all cursor-pointer"
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
                  <div key={phaseKey} className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-5 sm:p-6 mb-6 overflow-hidden">
                    
                    {/* Phase Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-200/50">
                      <div>
                        <h3 className="font-serif-display font-bold text-sm sm:text-base text-gray-900">
                          {phaseInfo.name}
                        </h3>
                        <span className="text-[11px] text-gray-500 font-normal">
                          {phaseInfo.time}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-[10px] font-bold text-gray-600">
                          {pCompleted} de {phaseTasks.length} listas
                        </span>
                      </div>
                    </div>

                    {/* Phase Tasks list */}
                    {phaseTasks.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400 italic">
                        No hay tareas que coincidan con la búsqueda en esta fase.
                      </div>
                    ) : (
                      <div>
                        {phaseTasks.map((task) => (
                          <div
                            key={task.id}
                            className="py-3.5 sm:py-4 border-b border-gray-200/40 last:border-b-0 flex items-start justify-between gap-3"
                          >
                            
                            {/* Checkbox and Title */}
                            <div className="flex items-start space-x-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleTask(task.id)}
                                className="mt-0.5 shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-hidden"
                              >
                                {task.isCompleted ? (
                                  <div className="w-6 h-6 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100/50" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-transparent hover:shadow-[inset_3px_3px_6px_#c8c8c8,inset_-3px_-3px_6px_#ffffff]" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <p
                                  onClick={() => toggleTask(task.id)}
                                  className={`text-xs sm:text-sm cursor-pointer transition-all leading-snug ${
                                    task.isCompleted
                                      ? 'text-gray-400 font-normal'
                                      : 'text-gray-800 font-medium'
                                  }`}
                                >
                                  {task.title}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-500">
                                  {task.assignee && (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-[#EBEBEB] shadow-[inset_1px_1px_3px_#d1d1d1,inset_-1px_-1px_3px_#ffffff] text-[10px] font-medium text-gray-600">
                                      <Users className="w-3 h-3 text-gray-400" />
                                      <span>{task.assignee}</span>
                                    </span>
                                  )}

                                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                                    task.priority === 'alta' ? 'bg-rose-50/80 text-rose-600 border border-rose-100/60' :
                                    task.priority === 'media' ? 'bg-amber-50/80 text-amber-600 border border-amber-100/60' :
                                    'bg-emerald-50/80 text-emerald-600 border border-emerald-100/60'
                                  }`}>
                                    Prioridad {task.priority.toUpperCase()}
                                  </span>

                                  {task.dueDate && (
                                    <span className="flex items-center space-x-1 text-gray-500">
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
                              className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-400 hover:text-rose-600 transition-all shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        <div className="mt-8 bg-[#EBEBEB] p-5 rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Tus cambios y checks se sincronizan en tiempo real en <strong>Firebase Firestore</strong>.
            </span>
          </div>

          <button
            type="button"
            id="btn-exit-to-dashboard-bottom"
            onClick={handleExitToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-[#EBEBEB] text-gray-800 font-bold text-xs shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-700" />
            <span>Listo, Regresar al Dashboard</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

      </div>

    </div>
  );
};
