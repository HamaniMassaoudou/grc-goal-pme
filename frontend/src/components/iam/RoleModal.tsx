import React, { useState, useEffect } from 'react';
import { X, Shield, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { RoleDefinition, ModuleResource, PermissionAction } from '../../types/auth';
import { ALL_RESOURCES_CONFIG, ALL_ACTIONS_CONFIG } from '../../data/rolesData';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: Partial<RoleDefinition>) => void;
  initialRole?: RoleDefinition | null;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRole
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('bg-blue-600');
  const [permissions, setPermissions] = useState<Record<ModuleResource, PermissionAction[]>>({
    dashboard: ['view'],
    risks: ['view'],
    soa: ['view'],
    actions: ['view'],
    assets: ['view'],
    governance: ['view'],
    users: [],
    roles: [],
    audit_logs: [],
    test_protocol: ['view'],
    notifications: ['view']
  });

  useEffect(() => {
    if (initialRole) {
      setName(initialRole.name);
      setCode(initialRole.code);
      setDescription(initialRole.description);
      setColor(initialRole.color || 'bg-blue-600');
      setPermissions(initialRole.permissions);
    } else {
      setName('');
      setCode('CUSTOM_ROLE');
      setDescription('');
      setColor('bg-blue-600');
      setPermissions({
        dashboard: ['view'],
        risks: ['view', 'create', 'update'],
        soa: ['view'],
        actions: ['view', 'create', 'update'],
        assets: ['view'],
        governance: ['view'],
        users: [],
        roles: [],
        audit_logs: [],
        test_protocol: ['view'],
        notifications: ['view']
      });
    }
  }, [initialRole]);

  if (!isOpen) return null;

  const handleTogglePermission = (resource: ModuleResource, action: PermissionAction) => {
    const current = permissions[resource] || [];
    let updated: PermissionAction[];

    if (current.includes(action)) {
      updated = current.filter(a => a !== action);
    } else {
      updated = [...current, action];
    }

    setPermissions({
      ...permissions,
      [resource]: updated
    });
  };

  const handleToggleAllForResource = (resource: ModuleResource) => {
    const current = permissions[resource] || [];
    const allActions: PermissionAction[] = ['view', 'create', 'update', 'delete', 'approve', 'export', 'manage'];
    
    if (current.length === allActions.length) {
      setPermissions({
        ...permissions,
        [resource]: []
      });
    } else {
      setPermissions({
        ...permissions,
        [resource]: allActions
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    onSave({
      id: initialRole?.id,
      name: name.trim(),
      code: code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
      description: description.trim(),
      color,
      isSystem: initialRole?.isSystem || false,
      isActive: true,
      permissions
    });
  };

  const colorOptions = [
    { label: 'Bleu', class: 'bg-blue-600' },
    { label: 'Indigo', class: 'bg-indigo-600' },
    { label: 'Émeraude', class: 'bg-emerald-600' },
    { label: 'Ambre', class: 'bg-amber-600' },
    { label: 'Violet', class: 'bg-purple-600' },
    { label: 'Rose', class: 'bg-rose-600' },
    { label: 'Ardoise', class: 'bg-slate-600' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialRole ? `Modifier le rôle : ${initialRole.name}` : 'Créer un nouveau rôle personnalisé (RBAC)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Définition granulaire des autorisations par ressource et action
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nom du rôle *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Contrôleur de Gestion Interne"
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code identifiant unique *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={initialRole?.isSystem}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono uppercase bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description des responsabilités</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Raison d’être du rôle, périmètre de délégation et responsabilités opérationnelles..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Couleur d'identification */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Couleur distinctive du badge</label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.class}
                  type="button"
                  onClick={() => setColor(c.class)}
                  className={`w-6 h-6 rounded-full ${c.class} transition ${
                    color === c.class ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Grille granulaire des permissions */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm">
                Matrice des Droits et Privilèges Granulaires
              </label>
              <span className="text-[11px] text-slate-500">
                Cochez les actions autorisées pour ce rôle
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 min-w-[180px]">Ressource / Module</th>
                      {ALL_ACTIONS_CONFIG.map(act => (
                        <th key={act.id} className="py-2.5 px-2 text-center" title={act.description}>
                          {act.label}
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-center">Tous</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ALL_RESOURCES_CONFIG.map((res) => {
                      const currentActs = permissions[res.id] || [];
                      const hasAll = currentActs.length >= ALL_ACTIONS_CONFIG.length;

                      return (
                        <tr key={res.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4">
                            <span className="font-semibold text-slate-900">{res.name}</span>
                            <p className="text-[10px] text-slate-400">{res.description}</p>
                          </td>

                          {ALL_ACTIONS_CONFIG.map(act => {
                            const isChecked = currentActs.includes(act.id) || currentActs.includes('manage');
                            return (
                              <td key={act.id} className="py-2.5 px-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(res.id, act.id)}
                                  className="rounded text-[#0B3B7B] focus:ring-0"
                                />
                              </td>
                            );
                          })}

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAllForResource(res.id)}
                              className="text-[10px] font-semibold text-[#0B3B7B] hover:underline"
                            >
                              {hasAll ? 'Aucun' : 'Tous'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
            >
              {initialRole ? 'Enregistrer le rôle' : 'Créer le rôle'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
