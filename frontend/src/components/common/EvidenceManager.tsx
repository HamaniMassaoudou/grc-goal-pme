import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertCircle,
  FileCheck,
  File,
  Plus
} from 'lucide-react';
import { EvidenceFile } from '../../types/grc';
import { apiService } from '../../services/api';

interface EvidenceManagerProps {
  linkedType: 'soa_control' | 'corrective_action' | 'risk' | 'general';
  linkedId: string;
  titleContext?: string;
  organizationId?: string;
  onEvidenceChange?: () => void;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  linkedType,
  linkedId,
  titleContext,
  organizationId,
  onEvidenceChange
}) => {
  const [evidences, setEvidences] = useState<EvidenceFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Formulaire d'upload
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadEvidences = async () => {
    if (!linkedId) return;
    setIsLoading(true);
    try {
      const list = await apiService.getEvidences(linkedType, linkedId);
      setEvidences(list);
    } catch (err) {
      console.error('Erreur chargement preuves:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvidences();
  }, [linkedType, linkedId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFileToUpload(selected);
      if (!evidenceTitle) {
        setEvidenceTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setErrorMessage('Veuillez sélectionner un fichier à téléverser.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await apiService.uploadEvidence(
        fileToUpload,
        linkedType,
        linkedId,
        evidenceTitle.trim() || fileToUpload.name,
        evidenceNotes.trim(),
        organizationId
      );

      setSuccessMessage('Fichier de preuve téléversé et empreinte SHA-256 générée.');
      setFileToUpload(null);
      setEvidenceTitle('');
      setEvidenceNotes('');
      setShowUploadForm(false);
      await loadEvidences();
      if (onEvidenceChange) onEvidenceChange();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erreur lors du téléversement.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Confirmez-vous la suppression de la preuve "${name}" ?`)) return;
    try {
      await apiService.deleteEvidence(id);
      setEvidences(prev => prev.filter(e => e.id !== id));
      if (onEvidenceChange) onEvidenceChange();
    } catch (err) {
      alert('Impossible de supprimer ce fichier.');
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
      {/* En-tête de section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Coffre-fort de Preuves & Intégrité SHA-256
            </h4>
            <p className="text-xs text-slate-500">
              Justificatifs d'audit ISO 27001 certifiés par empreinte cryptographique
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
        >
          {showUploadForm ? 'Annuler' : (
            <>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Ajouter une preuve
            </>
          )}
        </button>
      </div>

      {/* Messages d'alerte */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-700">
          <FileCheck className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formulaire de téléversement */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="bg-white rounded-lg p-3 border border-slate-200 space-y-3">
          <div className="text-xs font-semibold text-slate-800">
            Téléverser un justificatif pour {titleContext || linkedId}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Fichier justificatif (PDF, image, document) *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Titre de la preuve
              </label>
              <input
                type="text"
                value={evidenceTitle}
                onChange={e => setEvidenceTitle(e.target.value)}
                placeholder="Ex: PSSI approuvée 2026, Rapport d'audit..."
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Commentaires / Références d'audit
              </label>
              <input
                type="text"
                value={evidenceNotes}
                onChange={e => setEvidenceNotes(e.target.value)}
                placeholder="Ex: Validé en CODIR le 10/10/2026"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUploading || !fileToUpload}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm disabled:opacity-50"
            >
              {isUploading ? (
                <>Téléversement et calcul SHA-256...</>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Valider et sceller la preuve
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Liste des preuves existantes */}
      {isLoading ? (
        <div className="text-center py-4 text-xs text-slate-500">
          Chargement des pièces justificatives...
        </div>
      ) : evidences.length === 0 ? (
        <div className="text-center py-4 bg-white rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
          <File className="w-6 h-6 mx-auto text-slate-400 mb-1" />
          Aucun document de preuve scellé pour cet élément.
        </div>
      ) : (
        <div className="space-y-2">
          {evidences.map(ev => (
            <div
              key={ev.id}
              className="bg-white rounded-lg border border-slate-200 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {ev.title}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      {ev.formattedSize}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate">
                    Fichier : {ev.filename}
                    {ev.uploadedByName && ` · Par ${ev.uploadedByName}`}
                    {ev.notes && ` · ${ev.notes}`}
                  </div>

                  {/* Badge d'empreinte SHA-256 */}
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" />
                      SHA-256: {ev.sha256Hash ? `${ev.sha256Hash.slice(0, 10)}...${ev.sha256Hash.slice(-8)}` : 'Généré'}
                    </span>
                    {ev.sha256Hash && (
                      <button
                        type="button"
                        onClick={() => handleCopyHash(ev.sha256Hash)}
                        title="Copier l'empreinte complète SHA-256"
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                      >
                        {copiedHash === ev.sha256Hash ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons d'actions */}
              <div className="flex items-center space-x-1 self-end sm:self-center shrink-0">
                {ev.fileUrl && (
                  <a
                    href={ev.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={ev.filename}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md text-xs inline-flex items-center"
                    title="Consulter / Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(ev.id, ev.title)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Supprimer la preuve"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
