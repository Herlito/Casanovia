import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingTask, TaskPhase } from '../../types';
import { 
  CheckSquare, 
  Square,
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PhaseDef {
  key: TaskPhase;
  aliases: string[];
  title: string;
  badge: string;
  timeframe: string;
  color: string;
}

const PHASES_METADATA: PhaseDef[] = [
  {
    key: 'fase_1',
    aliases: ['fase_1', '12_meses'],
    title: 'Fase 1: Fundamentos y Reservas Principales',
    timeframe: '12 a 9 meses antes',
    badge: '12-9 Meses',
    color: 'border-l-amber-600 bg-amber-50/40',
  },
  {
    key: 'fase_2',
    aliases: ['fase_2', '6_9_meses'],
    title: 'Fase 2: Estilo, Proveedores Clave y Diseño',
    timeframe: '8 a 6 meses antes',
    badge: '8-6 Meses',
    color: 'border-l-rose-600 bg-rose-50/40',
  },
  {
    key: 'fase_3',
    aliases: ['fase_3', '2_3_meses'],
    title: 'Fase 3: Logística, Detalles y Convocatoria',
    timeframe: '5 a 3 meses antes',
    badge: '5-3 Meses',
    color: 'border-l-emerald-600 bg-emerald-50/40',
  },
  {
    key: 'fase_4',
    aliases: ['fase_4', '1_mes'],
    title: 'Fase 4: Confirmaciones y Protocolo',
    timeframe: '2 meses a 3 semanas antes',
    badge: '2 Meses - 3 Semanas',
    color: 'border-l-blue-600 bg-blue-50/40',
  },
  {
    key: 'fase_5',
    aliases: ['fase_5', 'semana_final'],
    title: 'Fase 5: Recta Final',
    timeframe: 'Semana previa al evento',
    badge: 'Semana Final',
    color: 'border-l-indigo-600 bg-indigo-50/40',
  },
  {
    key: 'fase_6',
    aliases: ['fase_6', 'dia_boda'],
    title: 'Fase 6: El Día de la Boda y Post-Boda',
    timeframe: 'Día del Evento & Post-Boda',
    badge: 'Día B & Post',
    color: 'border-l-[#8B3A4A] bg-[#8B3A4A]/5',
  },
];

export const ChecklistModule: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    toggleAllTasks, 
    deleteAllTasks, 
    deleteTask, 
    resetTasksToMaster 
  } = useWedding();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<TaskPhase>('fase_1');
  const [newTaskPriority, setNewTaskPriority] = useState<'alta' | 'media' | 'baja'>('alta');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Novios & Wedding Planner');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      phase: newTaskPhase,
      priority: newTaskPriority,
      isCompleted: false,
      assignee: newTaskAssignee,
    });

    setNewTaskTitle('');
  };

  const toggleCollapse = (phaseKey: string) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [phaseKey]: !prev[phaseKey]
    }));
  };

  const isTaskInPhase = (task: WeddingTask, phase: PhaseDef) => {
    return phase.aliases.includes(task.phase);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Master KPI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#8A9A86] font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Master Wedding Checklist • 6 Fases Cronológicas</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
            Plan Maestro de Tareas
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7268]">
            Estructurado cronológicamente desde los fundamentos iniciales (12 a 9 meses) hasta el día del evento y post-boda.
          </p>
        </div>

        {/* Progress & Quick Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Marcar todas */}
          <button
            type="button"
            onClick={() => toggleAllTasks(true)}
            title="Marcar todas las tareas como completadas"
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Marcar todas</span>
          </button>

          {/* Desmarcar todas */}
          <button
            type="button"
            onClick={() => toggleAllTasks(false)}
            title="Desmarcar todas las tareas"
            className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Desmarcar</span>
          </button>

          {/* Borrar todas */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Estás seguro de que deseas borrar TODAS las tareas de esta boda?')) {
                deleteAllTasks();
              }
            }}
            title="Borrar todas las tareas de la boda"
            className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Borrar todas</span>
          </button>

          {/* Restaurar Lista Maestra */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Deseas restaurar la lista maestra completa de 6 fases predeterminada para esta boda?')) {
                resetTasksToMaster();
              }
            }}
            title="Restablecer a la lista maestra oficial"
            className="px-3 py-2 rounded-xl border border-[#D9CEBF] bg-white text-xs font-semibold text-[#524B42] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer Maestra</span>
            <span className="sm:hidden">Reset</span>
          </button>

          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[#E8DCCF] shadow-2xs flex items-center space-x-2.5">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8276] block">Listas</span>
              <span className="text-sm font-serif-display font-bold text-[#8B3A4A]">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-8 h-8 rounded-full border-3 border-[#8B3A4A] flex items-center justify-center font-bold text-[10px] text-[#2D2A26]">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Task Form */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs">
        <h3 className="font-serif-display text-sm font-bold text-[#2D2A26] mb-3 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-[#8B3A4A]" />
          <span>Agregar Tarea Personalizada a una Fase</span>
        </h3>

        <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Descripción de la tarea (ej. Contratar carrito de helados gourmet)..."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={newTaskPhase}
              onChange={(e) => setNewTaskPhase(e.target.value as TaskPhase)}
              className="px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-[#524B42]"
            >
              <option value="fase_1">Fase 1 (12 a 9 meses)</option>
              <option value="fase_2">Fase 2 (8 a 6 meses)</option>
              <option value="fase_3">Fase 3 (5 a 3 meses)</option>
              <option value="fase_4">Fase 4 (2 meses a 3 sem)</option>
              <option value="fase_5">Fase 5 (Semana previa)</option>
              <option value="fase_6">Fase 6 (Día B & Post)</option>
            </select>

            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-[#524B42]"
            >
              <option value="alta">Prioridad Alta</option>
              <option value="media">Prioridad Media</option>
              <option value="baja">Prioridad Baja</option>
            </select>

            <input
              type="text"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              placeholder="Responsable"
              className="px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-[#524B42] w-36"
            />

            <button
              type="submit"
              className="px-4 py-2.5 bg-[#8B3A4A] text-white text-xs font-semibold rounded-xl hover:bg-[#6E2937] transition-all shadow-xs flex items-center justify-center space-x-1 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Añadir</span>
            </button>
          </div>
        </form>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedPhaseFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
            selectedPhaseFilter === 'all'
              ? 'bg-[#2D2A26] text-white'
              : 'bg-white border border-[#D9CEBF] text-[#6B6358] hover:bg-[#EFEAE2]'
          }`}
        >
          Todas las Fases ({totalCount})
        </button>

        {PHASES_METADATA.map((p, idx) => {
          const phaseTasks = tasks.filter(t => isTaskInPhase(t, p));
          const phaseDone = phaseTasks.filter(t => t.isCompleted).length;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelectedPhaseFilter(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors flex items-center space-x-1.5 ${
                selectedPhaseFilter === p.key
                  ? 'bg-[#8B3A4A] text-white'
                  : 'bg-white border border-[#D9CEBF] text-[#6B6358] hover:bg-[#EFEAE2]'
              }`}
            >
              <span>Fase {idx + 1}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedPhaseFilter === p.key ? 'bg-white/20 text-white' : 'bg-[#EFEAE2] text-[#524B42]'
              }`}>
                {phaseDone}/{phaseTasks.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6-Phase Tasks View */}
      <div className="space-y-5">
        {PHASES_METADATA.filter(p => selectedPhaseFilter === 'all' || selectedPhaseFilter === p.key).map((phase, idx) => {
          const phaseTasks = tasks.filter(t => isTaskInPhase(t, phase));
          const phaseDone = phaseTasks.filter(t => t.isCompleted).length;
          const phaseTotal = phaseTasks.length;
          const isCollapsed = !!collapsedPhases[phase.key];

          return (
            <div 
              key={phase.key} 
              className="bg-white rounded-2xl border border-[#E8DCCF] shadow-2xs overflow-hidden transition-all"
            >
              {/* Phase Header Bar */}
              <div 
                onClick={() => toggleCollapse(phase.key)}
                className={`p-4 sm:px-6 flex items-center justify-between cursor-pointer border-b border-[#F0EAE1] hover:bg-[#FAF8F5] transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#8B3A4A] text-white flex items-center justify-center font-serif-display font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif-display text-base font-bold text-[#2D2A26]">
                        {phase.title}
                      </h3>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EFEAE2] text-[#524B42]">
                        {phase.timeframe}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A7268] sm:hidden">{phase.timeframe}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#2D2A26]">
                      {phaseDone} de {phaseTotal}
                    </span>
                    <span className="text-[10px] text-[#8C8276] block">
                      {phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0}% completado
                    </span>
                  </div>
                  {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#8C8276]" /> : <ChevronUp className="w-4 h-4 text-[#8C8276]" />}
                </div>
              </div>

              {/* Task Items in Phase */}
              {!isCollapsed && (
                <div className="divide-y divide-[#F5EFE6]">
                  {phaseTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8C8276]">
                      No hay tareas en esta fase. Puedes agregar una con el formulario superior.
                    </div>
                  ) : (
                    phaseTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 sm:px-6 flex items-start justify-between gap-3 hover:bg-[#FAF8F5] transition-colors ${
                          task.isCompleted ? 'bg-[#FAF8F5]/60' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 text-[#8B3A4A] hover:scale-110 transition-transform cursor-pointer shrink-0"
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#C5A880] hover:text-[#8B3A4A]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className={`text-xs sm:text-sm ${
                              task.isCompleted 
                                ? 'line-through text-[#8C8276]' 
                                : 'text-[#2D2A26] font-medium'
                            }`}>
                              {task.title}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#7A7268]">
                              {task.assignee && (
                                <span className="inline-flex items-center gap-1">
                                  <User className="w-3 h-3 text-[#8C8276]" />
                                  <span>{task.assignee}</span>
                                </span>
                              )}

                              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${
                                task.priority === 'alta' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : task.priority === 'media'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-stone-50 text-stone-700 border border-stone-200'
                              }`}>
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          title="Eliminar tarea"
                          className="text-[#B3A89B] hover:text-rose-600 p-1 rounded-md transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
