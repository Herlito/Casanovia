import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { SystemUser } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  UserCheck, 
  HeartHandshake, 
  Calendar,
  Briefcase,
  Layers
} from 'lucide-react';

export const UserManagementModal: React.FC = () => {
  const { 
    showUserManagementModal, 
    setShowUserManagementModal, 
    systemUsers, 
    addSystemUser, 
    updateSystemUser, 
    deleteSystemUser, 
    weddings,
    accessibleWeddings,
    setShowNewWeddingModal,
    currentUser,
    isLevel1Admin,
    isLevel3Planner
  } = useWedding();
  const { appTheme } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form State
  const [username, setUsername] = useState('');
  const [clave, setClave] = useState('');
  const [level, setLevel] = useState<number>(2); // Default to Anfitrión (Level 2)
  const [roleTitle, setRoleTitle] = useState('Anfitriona de Boda (Nivel 2 - Anfitrión)');
  const [assignedWeddingIds, setAssignedWeddingIds] = useState<string[]>([]);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [formShowPassword, setFormShowPassword] = useState(false);
  
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!showUserManagementModal) return null;

  const resetForm = () => {
    setUsername('');
    setClave('');
    setLevel(2);
    setRoleTitle('Anfitriona de Boda (Nivel 2 - Anfitrión)');
    setAssignedWeddingIds([]);
    setIsEditing(false);
    setEditingUserId(null);
    setFormShowPassword(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsEditing(true);
    // Pre-select first wedding or active wedding
    if (availableWeddingsForAssignment.length > 0) {
      setAssignedWeddingIds([availableWeddingsForAssignment[0].id]);
    }
  };

  const handleEditClick = (user: SystemUser) => {
    setEditingUserId(user.id);
    setUsername(user.username);
    setClave(user.clave);
    setLevel(user.level);
    setRoleTitle(user.roleTitle);
    setAssignedWeddingIds(user.assignedWeddingIds || []);
    setIsEditing(true);
    setFormShowPassword(true);
  };

  const toggleWeddingAssignment = (weddingId: string) => {
    if (assignedWeddingIds.includes(weddingId)) {
      setAssignedWeddingIds(assignedWeddingIds.filter(id => id !== weddingId));
    } else {
      setAssignedWeddingIds([...assignedWeddingIds, weddingId]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!username.trim() || !clave.trim()) {
      setAlertMsg({ type: 'error', text: 'El nombre de usuario y la clave son obligatorios.' });
      return;
    }

    try {
      if (editingUserId) {
        // Update existing user
        await updateSystemUser(editingUserId, {
          username: username.trim(),
          clave: clave.trim(),
          level,
          roleTitle: roleTitle.trim(),
          assignedWeddingIds: level === 1 ? [] : assignedWeddingIds,
          createdWeddingIds: editingUserId ? (systemUsers.find(u => u.id === editingUserId)?.createdWeddingIds || []) : [],
        });
        setAlertMsg({ type: 'success', text: `Usuario "${username}" actualizado exitosamente.` });
      } else {
        // Create new user
        await addSystemUser({
          username: username.trim(),
          clave: clave.trim(),
          level,
          roleTitle: roleTitle.trim(),
          assignedWeddingIds: level === 1 ? [] : assignedWeddingIds,
          createdWeddingIds: editingUserId ? (systemUsers.find(u => u.id === editingUserId)?.createdWeddingIds || []) : [],
        });
        setAlertMsg({ type: 'success', text: `Usuario "${username}" creado exitosamente con permisos de ${level === 3 ? 'Wedding Planner' : level === 1 ? 'Super Admin' : 'Anfitrión'}.` });
      }
      resetForm();
      setTimeout(() => setAlertMsg(null), 3000);
    } catch {
      setAlertMsg({ type: 'error', text: 'Error al guardar el usuario en Firestore.' });
    }
  };

  const handleDelete = async (userId: string, targetUsername: string, targetLevel: number) => {
    if (targetUsername.toLowerCase() === 'herly lizarazo') {
      alert('El Administrador General principal no puede ser eliminado.');
      return;
    }
    // If current user is Level 3 Planner, forbid deleting admins or other planners
    if (isLevel3Planner && targetLevel !== 2) {
      alert('Como Wedding Planner solo puedes gestionar usuarios con rol de Anfitrión.');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario "${targetUsername}"?`)) {
      try {
        await deleteSystemUser(userId);
        setAlertMsg({ type: 'success', text: `Usuario "${targetUsername}" eliminado.` });
        setTimeout(() => setAlertMsg(null), 3000);
      } catch {
        setAlertMsg({ type: 'error', text: 'Error al eliminar usuario.' });
      }
    }
  };

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Filter selectable weddings for Level 3 Planner: only weddings created by this planner
  const availableWeddingsForAssignment = isLevel3Planner ? accessibleWeddings : weddings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#EBEBEB] rounded-[2.5rem] max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] flex flex-col">
        
        {/* Header */}
        <div className="p-6 relative text-gray-800 shrink-0 border-b border-gray-300/60 bg-[#EBEBEB]">
          <button
            onClick={() => setShowUserManagementModal(false)}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-600 hover:text-gray-900 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold tracking-widest text-gray-600 uppercase block">
                  Panel de Control de Accesos & Roles
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800">
                  {isLevel1Admin ? 'Nivel 1: Super Admin' : 'Nivel 3: Wedding Planner'}
                </span>
              </div>
              <h3 className="font-serif-display text-xl font-bold text-gray-900">
                Gestión de Usuarios
              </h3>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#EBEBEB]">
          
          {alertMsg && (
            <div className={`p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-semibold ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-100 text-emerald-900 shadow-[inset_2px_2px_4px_#a7f3d0,inset_-2px_-2px_4px_#ffffff]' 
                : 'bg-rose-100 text-rose-900 shadow-[inset_2px_2px_4px_#fecdd3,inset_-2px_-2px_4px_#ffffff]'
            }`}>
              {alertMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>{alertMsg.text}</span>
            </div>
          )}

          {/* Add / Edit Form Block */}
          {isEditing ? (
            <div className="bg-[#EBEBEB] rounded-3xl p-5 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-gray-300/60">
                <h4 className="font-serif-display font-bold text-sm text-gray-900 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-gray-700" />
                  <span>{editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario / Asignar Anfitrión'}</span>
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-lg hover:bg-gray-200/50 transition-colors font-medium cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nombre Completo / Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej. Zenaida Anahua o Guest Planner"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Clave de Acceso *
                    </label>
                    <div className="relative">
                      <input
                        type={formShowPassword ? 'text' : 'password'}
                        required
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        placeholder="Ej. 70242438"
                        className="w-full pl-3 pr-10 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 placeholder-gray-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormShowPassword(!formShowPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                      >
                        {formShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nivel de Permisos / Rol *
                    </label>
                    <select
                      value={level}
                      onChange={(e) => {
                        const newLvl = parseInt(e.target.value, 10);
                        setLevel(newLvl);
                        if (newLvl === 1) {
                          setRoleTitle('Director General & Protocolo (Nivel 1 - Super Admin)');
                        } else if (newLvl === 3) {
                          setRoleTitle('Wedding Planner Senior (Nivel 3 - Wedding Planner)');
                        } else if (newLvl === 5) {
                          setRoleTitle('Observador de Evento (Nivel 5 - Solo Lectura)');
                        } else {
                          setRoleTitle('Anfitriona de Boda (Nivel 2 - Anfitrión)');
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 focus:outline-none cursor-pointer"
                    >
                      {isLevel1Admin && (
                        <option value={1}>Nivel 1: Super Administrador (Acceso total & Creación de Bodas)</option>
                      )}
                      {isLevel1Admin && (
                        <option value={3}>Nivel 3: Wedding Planner (Gestión de bodas y asignación de Anfitriones)</option>
                      )}
                      <option value={2}>Nivel 2: Anfitrión (Permisos de edición exclusivos en bodas asignadas)</option>
                      <option value={5}>Nivel 5: Observador (Solo Lectura, sin cambios ni impresión)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Título / Cargo
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="Ej. Anfitriona de Boda"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Assigned Weddings Selector for Level 2 Anfitrion, Level 3 Planner, or Level 5 Observador */}
                {(level === 2 || level === 3 || level === 5) && (
                  <div className="pt-2 border-t border-gray-300/60">
                    <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center space-x-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-gray-700" />
                      <span>
                        {level === 5
                          ? 'Asignar Bodas con Permiso de Observación (Solo Lectura):'
                          : level === 2 
                          ? 'Asignar Permisos como "Anfitrión" a las siguientes Bodas:' 
                          : 'Asignar Bodas Gestionadas para este Wedding Planner:'}
                      </span>
                    </label>
                    <div className="bg-[#EBEBEB] p-3 rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      {availableWeddingsForAssignment.length === 0 ? (
                        <div className="text-center py-3 space-y-2">
                          <p className="text-xs text-gray-600 font-medium">
                            {isLevel3Planner 
                              ? 'No tienes bodas creadas todavía. Primero debes crear una boda para poder asignar anfitriones a ella.' 
                              : 'No hay bodas disponibles en el sistema.'}
                          </p>
                          {isLevel3Planner && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowUserManagementModal(false);
                                setShowNewWeddingModal(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800 text-xs font-bold hover:text-gray-900 transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Crear Boda Ahora</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableWeddingsForAssignment.map((w) => {
                            const isSelected = assignedWeddingIds.includes(w.id);
                            return (
                              <label
                                key={w.id}
                                className={`flex items-center space-x-2 p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                                  isSelected 
                                    ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-900 font-bold' 
                                    : 'bg-[#EBEBEB] hover:shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleWeddingAssignment(w.id)}
                                  className="rounded text-gray-800 focus:ring-gray-400 h-3.5 w-3.5"
                                />
                                <div className="truncate">
                                  <span className="block truncate font-semibold text-gray-900">{w.coupleNames}</span>
                                  <span className="text-[10px] text-gray-600 block truncate">{w.locationSummary}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 rounded-xl text-xs font-semibold hover:text-gray-900 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-900 rounded-xl text-xs font-bold hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] transition-all cursor-pointer"
                  >
                    {editingUserId ? 'Guardar Cambios' : (level === 2 ? 'Asignar Permisos de Anfitrión' : 'Crear Usuario')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-serif-display font-bold text-base text-gray-900">
                  Usuarios Registrados ({systemUsers.length})
                </h4>
                <p className="text-xs text-gray-600 font-medium">
                  {isLevel1Admin 
                    ? 'Lista de administradores, wedding planners y anfitriones con acceso.' 
                    : 'Lista de anfitriones y accesos configurados.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddForm}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-900 text-xs font-bold hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isLevel3Planner ? '+ Asignar Nuevo Anfitrión' : '+ Nuevo Usuario'}</span>
              </button>
            </div>
          )}

          {/* User Cards List */}
          <div className="space-y-3">
            {systemUsers.map((user) => {
              const isHerlyAdmin = user.username.toLowerCase() === 'herly lizarazo';
              const isCurrentLoggedIn = currentUser.username.toLowerCase() === user.username.toLowerCase();
              const isPasswordVisible = showPasswordMap[user.id] || false;
              const canEditThisUser = isLevel1Admin || (isLevel3Planner && user.level === 2);

              let badgeStyle = 'bg-purple-100 text-purple-900 border border-purple-300';
              let badgeText = 'Nivel 2: Anfitrión';
              let iconBoxStyle = 'bg-purple-100 text-purple-800';

              if (user.level === 1) {
                badgeStyle = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
                badgeText = 'Nivel 1: Super Admin';
                iconBoxStyle = 'bg-emerald-100 text-emerald-800';
              } else if (user.level === 3) {
                badgeStyle = 'bg-teal-100 text-teal-900 border border-teal-300';
                badgeText = 'Nivel 3: Wedding Planner';
                iconBoxStyle = 'bg-teal-100 text-teal-800';
              } else if (user.level === 5) {
                badgeStyle = 'bg-blue-100 text-blue-900 border border-blue-300';
                badgeText = 'Nivel 5: Observador';
                iconBoxStyle = 'bg-blue-100 text-blue-800';
              }

              return (
                <div
                  key={user.id}
                  className="bg-[#EBEBEB] rounded-2xl p-4 sm:p-5 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: User Info */}
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] ${iconBoxStyle}`}>
                        {user.level === 1 ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-700" />
                        ) : user.level === 3 ? (
                          <Briefcase className="w-5 h-5 text-teal-700" />
                        ) : user.level === 5 ? (
                          <Eye className="w-5 h-5 text-blue-700" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-purple-700" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-serif-display font-bold text-sm sm:text-base text-gray-900">
                            {user.username}
                          </span>
                          
                          {/* Role Badge */}
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
                            {badgeText}
                          </span>

                          {isCurrentLoggedIn && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-800">
                              (Sesión Actual)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 font-medium mt-0.5">
                          {user.roleTitle}
                        </p>

                        {/* Assigned Weddings for Anfitrion, Planner, or Observador */}
                        {user.level === 2 && (
                          <div className="mt-2 text-xs text-gray-700">
                            <span className="font-bold text-purple-900">Bodas con permiso de Anfitrión: </span>
                            {user.assignedWeddingIds && user.assignedWeddingIds.length > 0 ? (
                              <span className="text-gray-800 font-semibold">
                                {user.assignedWeddingIds.map(wId => {
                                  const wed = weddings.find(w => w.id === wId);
                                  return wed ? wed.coupleNames : wId;
                                }).join(', ')}
                              </span>
                            ) : (
                              <span className="italic text-gray-500 font-medium">Bodas donde esté registrado como Anfitrión</span>
                            )}
                          </div>
                        )}

                        {user.level === 5 && (
                          <div className="mt-2 text-xs text-gray-700">
                            <span className="font-bold text-blue-900">Bodas asignadas para Observación (Solo Lectura): </span>
                            {user.assignedWeddingIds && user.assignedWeddingIds.length > 0 ? (
                              <span className="text-gray-800 font-semibold">
                                {user.assignedWeddingIds.map(wId => {
                                  const wed = weddings.find(w => w.id === wId);
                                  return wed ? wed.coupleNames : wId;
                                }).join(', ')}
                              </span>
                            ) : (
                              <span className="italic text-gray-500 font-medium">Todas las bodas del sistema (Solo Lectura)</span>
                            )}
                          </div>
                        )}

                        {user.level === 3 && (
                          <div className="mt-2 text-xs text-gray-700">
                            <span className="font-bold text-teal-900">Bodas Gestionadas / Creadas: </span>
                            {((user.createdWeddingIds && user.createdWeddingIds.length > 0) || (user.assignedWeddingIds && user.assignedWeddingIds.length > 0)) ? (
                              <span className="text-gray-800 font-semibold">
                                {[...(user.createdWeddingIds || []), ...(user.assignedWeddingIds || [])]
                                  .filter((v, i, a) => a.indexOf(v) === i)
                                  .map(wId => {
                                    const wed = weddings.find(w => w.id === wId);
                                    return wed ? wed.coupleNames : wId;
                                  }).join(', ')}
                              </span>
                            ) : (
                              <span className="text-gray-600 font-medium">Bodas creadas como usuario activo</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Passkey & Action Buttons */}
                    <div className="flex items-center space-x-3 self-end sm:self-center border-t border-gray-300/60 sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Password pill */}
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-gray-600" />
                        <span className="font-mono font-bold text-gray-900 tracking-wider">
                          {isPasswordVisible ? user.clave : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(user.id)}
                          className="text-gray-600 hover:text-gray-900 p-0.5 cursor-pointer"
                          title={isPasswordVisible ? 'Ocultar clave' : 'Ver clave'}
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {canEditThisUser && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-gray-700 hover:text-gray-900 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-xl transition-all cursor-pointer"
                            title="Editar permisos / usuario"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {!isHerlyAdmin && canEditThisUser && (
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id, user.username, user.level)}
                            className="p-2 text-rose-600 hover:text-rose-700 bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-xl transition-all cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EBEBEB] border-t border-gray-300/60 flex items-center justify-end text-xs shrink-0">
          <button
            type="button"
            onClick={() => setShowUserManagementModal(false)}
            className="px-5 py-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-gray-900 rounded-xl font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
