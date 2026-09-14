import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingTask, TaskPhase } from '../../types';
import { TasksExcelModal } from './TasksExcelModal';
import { 
  CheckSquare, 
  Check,
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
    title: 'Inicializar y Reservar',
    timeframe: '12 a 9 meses antes',
    badge: '12-9 Meses',
    color: 'border-l-amber-600 bg-amber-50/40',
  },
  {
    key: 'fase_2',
    aliases: ['fase_2', '6_9_meses'],
    title: 'Estilo, Proveedores y Diseño',
    timeframe: '8 a 6 meses antes',
    badge: '8-6 Meses',
    color: 'border-l-rose-600 bg-rose-50/40',
  },
  {
    key: 'fase_3',
    aliases: ['fase_3', '2_3_meses'],
    title: 'Logística, Detalles y Convocatoria',
    timeframe: '5 a 3 meses antes',
    badge: '5-3 Meses',
    color: 'border-l-emerald-600 bg-emerald-50/40',
  },
  {
    key: 'fase_4',
    aliases: ['fase_4', '1_mes'],
    title: 'Confirmaciones y Protocolo',
    timeframe: '2 meses a 3 semanas antes',
    badge: '2 Meses - 3 Semanas',
    color: 'border-l-blue-600 bg-blue-50/40',
  },
  {
    key: 'fase_5',
    aliases: ['fase_5', 'semana_final'],
    title: 'Recta Final',
    timeframe: 'Semana previa al evento',
    badge: 'Semana Final',
    color: 'border-l-indigo-600 bg-indigo-50/40',
  },
  {
    key: 'fase_6',
    aliases: ['fase_6', 'dia_boda'],
    title: 'Día de Boda y Post-Boda',
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
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
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
    setShowAddForm(false);
  };

  const toggleExpand = (phaseKey: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseKey]: !prev[phaseKey]
    }));
  };

  const isTaskInPhase = (task: WeddingTask, phase: PhaseDef) => {
    return phase.aliases.includes(task.phase);
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 sm:pb-0">
      
      {/* Header & Master KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-1 sm:px-0">
        <div>
          <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26]">
            CheckList de Bodas
          </h1>
        </div>

        {/* Progress & Quick Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {canEditActiveWedding && (
            <div className="hidden sm:flex items-center gap-2.5">
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
            </div>
          )}

          <div className="hidden sm:flex bg-[#EBEBEB] p-1.5 sm:px-3 sm:py-2 rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] items-center">
            <div className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center font-bold text-[11px] text-gray-900">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Task Form */}
      {canEditActiveWedding && (
        <div className={`${showAddForm ? 'block' : 'hidden sm:block'} bg-[#EBEBEB] p-5 sm:p-6 rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif-display text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-gray-700" />
              <span>Agregar Tarea Personalizada a una Fase</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="sm:hidden text-gray-500 hover:text-gray-900 p-1 text-xs font-bold rounded-lg cursor-pointer"
              title="Cerrar formulario"
              aria-label="Cerrar formulario"
            >
              ✕
            </button>
          </div>

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
                <option value="fase_1">Inicializar y Reservar (12 a 9 meses)</option>
                <option value="fase_2">Estilo, Proveedores y Diseño (8 a 6 meses)</option>
                <option value="fase_3">Logística, Detalles y Convocatoria (5 a 3 meses)</option>
                <option value="fase_4">Confirmaciones y Protocolo (2 meses a 3 sem)</option>
                <option value="fase_5">Recta Final (Semana previa)</option>
                <option value="fase_6">Día de Boda y Post-Boda</option>
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
      <div className="hidden sm:flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
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
          const isExpanded = !!expandedPhases[phase.key];
          const tasksToRender = isExpanded ? phaseTasks : phaseTasks.filter(t => !t.isCompleted);

          return (
            <div 
              key={phase.key} 
              className="bg-[#EBEBEB] rounded-3xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] overflow-hidden transition-all"
            >
              {/* Phase Header Bar */}
              <div 
                onClick={() => toggleExpand(phase.key)}
                className="p-3 sm:px-6 flex items-center justify-between cursor-pointer border-b border-gray-300/60 hover:bg-[#E5E5E5] transition-colors"
                role="button"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-900 items-center justify-center font-serif-display font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif-display text-sm sm:text-base font-bold text-gray-900">
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
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                </div>
              </div>

              {/* Task Items in Phase */}
              <div className="divide-y divide-gray-300/50">
                {phaseTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-600 font-medium">
                    No hay tareas en esta fase. Puedes agregar una con el formulario superior.
                  </div>
                ) : !isExpanded && tasksToRender.length === 0 ? (
                  <div 
                    onClick={() => toggleExpand(phase.key)}
                    className="hidden sm:block p-5 text-center text-xs text-gray-500 font-medium hover:text-gray-800 cursor-pointer transition-colors"
                  >
                    ✓ Todas las tareas están completadas ({phaseDone}/{phaseTotal}). Toca para verlas.
                  </div>
                ) : (
                  tasksToRender.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 sm:px-6 flex items-center justify-between gap-3 transition-colors ${
                        task.isCompleted ? 'bg-[#E5E5E5]/50' : 'hover:bg-[#E5E5E5]/30'
                      }`}
                    >
                      {/* Task Title and Metadata */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          task.isCompleted 
                            ? 'text-gray-500 font-medium' 
                            : 'text-gray-900 font-semibold'
                        }`}>
                          {task.title}
                        </p>

                        <div className="hidden sm:flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-gray-600">
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

                      {/* Right: Delete (desktop) and Square Checkbox */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {canEditActiveWedding && (
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            title="Eliminar tarea"
                            className="hidden sm:block text-gray-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Recuadro tipo Check alineado a la derecha sin fondo verde y símbolo check en negro */}
                        <button
                          type="button"
                          disabled={!canEditActiveWedding}
                          onClick={() => canEditActiveWedding && toggleTask(task.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all bg-[#EBEBEB] border-2 border-gray-400 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] ${
                            canEditActiveWedding ? 'cursor-pointer active:scale-95' : 'cursor-default'
                          }`}
                          title={task.isCompleted ? "Marcar como pendiente" : "Completar tarea"}
                          aria-label={task.isCompleted ? "Marcar como pendiente" : "Completar tarea"}
                        >
                          {task.isCompleted && (
                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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

      {/* Mobile Sticky Footer Action Bar (Matched to Asignación de Mesas footer bar style) */}
      <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 bg-[#EBEBEB] p-2 rounded-full shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border-none">
        {canEditActiveWedding && (
          <>
            <button
              type="button"
              onClick={() => toggleAllTasks(true)}
              className="p-2 text-gray-700 hover:text-emerald-700 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer flex items-center justify-center"
              title="Marcar Todas"
              aria-label="Marcar Todas"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => toggleAllTasks(false)}
              className="p-2 text-gray-700 hover:text-gray-900 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer flex items-center justify-center"
              title="Desmarcar"
              aria-label="Desmarcar"
            >
              <Square className="w-4 h-4 text-gray-600" />
            </button>

            {/* In the middle: +Añadir button that reveals the add form */}
            <button
              type="button"
              onClick={() => {
                setShowAddForm(prev => !prev);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 text-xs font-bold text-gray-900 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer flex items-center space-x-1"
              title="Añadir Tarea"
              aria-label="Añadir Tarea"
            >
              <Plus className="w-3.5 h-3.5 text-gray-900" />
              <span>Añadir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas borrar TODAS las tareas de esta boda?')) {
                  deleteAllTasks();
                }
              }}
              className="p-2 text-rose-600 hover:text-rose-700 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer flex items-center justify-center"
              title="Borrar Todas"
              aria-label="Borrar Todas"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
            </button>

            <button
              type="button"
              onClick={() => setShowExcelModal(true)}
              className="p-2 text-emerald-800 hover:text-emerald-900 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all border-none cursor-pointer flex items-center justify-center"
              title="Excel (Exportar / Importar)"
              aria-label="Excel (Exportar / Importar)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            </button>
          </>
        )}
      </div>

    </div>
  );
};
