import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingTask, TaskPhase } from '../../types';
import { TasksExcelModal } from './TasksExcelModal';
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
  ChevronUp,
  FileSpreadsheet
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
    color: 'border-l-gray-700 bg-[#EBEBEB]',
  },
];

export const ChecklistModule: React.FC = () => {
  const {
    appTheme, 
    activeWedding,
    tasks, 
    addTask, 
    toggleTask, 
    toggleAllTasks, 
    deleteAllTasks, 
    setAllTasks,
    deleteTask, 
    resetTasksToMaster,
    canEditActiveWedding
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<TaskPhase>('fase_1');
  const [newTaskPriority, setNewTaskPriority] = useState<'alta' | 'media' | 'baja'>('alta');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Novios & Wedding Planner');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleImportTasks = async (newTasks: WeddingTask[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      await setAllTasks(newTasks);
    } else {
      await setAllTasks([...tasks, ...newTasks]);
    }
  };

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
          <div className="flex items-center space-x-2 text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 text-gray-700" />
            <span>Master Wedding Checklist • 6 Fases Cronológicas</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-gray-900">
            Plan Maestro de Tareas
          </h2>
        </div>

        {/* Progress & Quick Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {canEditActiveWedding && (
            <>
              {/* Marcar todas */}
              <button
                type="button"
                onClick={() => toggleAllTasks(true)}
                title="Marcar todas las tareas como completadas"
                className="px-3.5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-bold text-gray-800 hover:text-emerald-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Marcar todas</span>
              </button>

              {/* Desmarcar todas */}
              <button
                type="button"
                onClick={() => toggleAllTasks(false)}
                title="Desmarcar todas las tareas"
                className="px-3.5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Square className="w-4 h-4 text-gray-500" />
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
                className="px-3.5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-rose-600 hover:text-rose-700 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
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
                className="px-3.5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">Restablecer Maestra</span>
                <span className="sm:hidden">Reset</span>
              </button>

              {/* Exportar / Importar Excel */}
              <button
                type="button"
                id="btn-excel-checklist-import-export"
                onClick={() => setShowExcelModal(true)}
                title="Exportar o importar lista de tareas en formato Excel (.xlsx)"
                className="px-3.5 py-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel (Exportar / Importar)</span>
              </button>
            </>
          )}

          <div className="bg-[#EBEBEB] px-4 py-2.5 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 block">Listas</span>
              <span className="text-sm font-serif-display font-bold text-gray-900">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center font-bold text-[11px] text-gray-900">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Task Form */}
      {canEditActiveWedding && (
        <div className="bg-[#EBEBEB] p-5 sm:p-6 rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
          <h3 className="font-serif-display text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-gray-700" />
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
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <select
                value={newTaskPhase}
                onChange={(e) => setNewTaskPhase(e.target.value as TaskPhase)}
                className="px-3 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 focus:outline-none cursor-pointer"
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
                className="px-3 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 focus:outline-none cursor-pointer"
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
                className="px-3 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 placeholder-gray-500 focus:outline-none w-36"
              />

              <button
                type="submit"
                className="px-4 py-2.5 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] text-gray-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Añadir</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Phase Filter Tabs */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedPhaseFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedPhaseFilter === 'all'
              ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900'
              : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900'
          }`}
        >
          Todas las Fases ({totalCount})
        </button>

        {PHASES_METADATA.map((p, idx) => {
          const phaseTasks = tasks.filter(t => isTaskInPhase(t, p));
          const phaseDone = phaseTasks.filter(t => t.isCompleted).length;
          const isSelected = selectedPhaseFilter === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelectedPhaseFilter(p.key)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center space-x-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900'
                  : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900'
              }`}
            >
              <span>Fase {idx + 1}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-gray-300 text-gray-900' : 'bg-gray-200 text-gray-700'
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
              className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] overflow-hidden transition-all"
            >
              {/* Phase Header Bar */}
              <div 
                onClick={() => toggleCollapse(phase.key)}
                className="p-4 sm:px-6 flex items-center justify-between cursor-pointer border-b border-gray-300/60 hover:bg-[#E5E5E5] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-900 flex items-center justify-center font-serif-display font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif-display text-base font-bold text-gray-900">
                        {phase.title}
                      </h3>
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700">
                        {phase.timeframe}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium sm:hidden mt-0.5">{phase.timeframe}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900">
                      {phaseDone} de {phaseTotal}
                    </span>
                    <span className="text-[10px] text-gray-600 font-medium block">
                      {phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0}% completado
                    </span>
                  </div>
                  {isCollapsed ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronUp className="w-4 h-4 text-gray-600" />}
                </div>
              </div>

              {/* Task Items in Phase */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-300/50">
                  {phaseTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-600 font-medium">
                      No hay tareas en esta fase. Puedes agregar una con el formulario superior.
                    </div>
                  ) : (
                    phaseTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 sm:px-6 flex items-start justify-between gap-3 transition-colors ${
                          task.isCompleted ? 'bg-[#E5E5E5]/50' : 'hover:bg-[#E5E5E5]/30'
                        }`}
                      >
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <button
                            type="button"
                            disabled={!canEditActiveWedding}
                            onClick={() => canEditActiveWedding && toggleTask(task.id)}
                            className={`mt-0.5 transition-transform shrink-0 ${
                              canEditActiveWedding ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-gray-700" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className={`text-xs sm:text-sm leading-relaxed ${
                              task.isCompleted 
                                ? 'line-through text-gray-500 font-medium' 
                                : 'text-gray-900 font-semibold'
                            }`}>
                              {task.title}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-gray-600">
                              {task.assignee && (
                                <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                                  <User className="w-3 h-3 text-gray-500" />
                                  <span>{task.assignee}</span>
                                </span>
                              )}

                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                task.priority === 'alta' 
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200' 
                                  : task.priority === 'media'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-stone-200 text-stone-900 border border-stone-300'
                              }`}>
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {canEditActiveWedding && (
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            title="Eliminar tarea"
                            className="text-gray-500 hover:text-rose-600 p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Excel Modal */}
      <TasksExcelModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onImport={handleImportTasks}
        tasks={tasks}
        coupleNames={activeWedding?.coupleNames || 'Boda'}
      />

    </div>
  );
};
