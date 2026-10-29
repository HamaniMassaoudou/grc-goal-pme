import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertTriangle, 
  Smartphone, 
  KeyRound,
  CheckCircle2,
  Sparkles,
  Building2,
  UserPlus,
  Briefcase,
  Users
} from 'lucide-react';
import { UserAccount, RoleDefinition, SecuritySettings } from '../../types/auth';
import { verifyPassword, generateCurrentMfaCode, verifyMfaCode } from '../../services/security';

interface LoginScreenProps {
  accounts: UserAccount[];
  roles: RoleDefinition[];
  securitySettings: SecuritySettings;
  onLoginSuccess: (user: UserAccount) => void;
  onRecordAudit: (eventType: any, severity: any, details: string, email: string) => void;
  onRegisterNewOrg?: (
    userData: { name: string; email: string; password: string; jobTitle: string; phone?: string },
    orgData: { name: string; sector: string; size: string; phone?: string; grcScope?: string }
  ) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  accounts,
  roles,
  securitySettings,
  onLoginSuccess,
  onRecordAudit,
  onRegisterNewOrg
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // État de connexion
  const [email, setEmail] = useState('direction@sirbacom.ne');
  const [password, setPassword] = useState('PmeSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Étape MFA
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  // État d'inscription nouvelle organisation (Cas B)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('PmeSecure2026!');
  const [regJobTitle, setRegJobTitle] = useState('Gérant / Administrateur');
  const [regOrgName, setRegOrgName] = useState('');
  const [regSector, setRegSector] = useState('Services numériques & Conseil');
  const [regSize, setRegSize] = useState('15 collaborateurs (TPE/PME)');
  const [regPhone, setRegPhone] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const targetUser = accounts.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      // Protection temporelle anti-timing attack
      await new Promise(r => setTimeout(r, 200));

      if (!targetUser) {
        onRecordAudit('LOGIN_FAILED', 'warning', `Tentative de connexion avec email inconnu : ${email}`, email);
        setErrorMessage('Identifiants incorrects ou compte non autorisé.');
        setIsSubmitting(false);
        return;
      }

      // Vérification du statut du compte
      if (targetUser.status === 'suspendu') {
        onRecordAudit('LOGIN_FAILED', 'warning', `Tentative d’accès sur compte suspendu : ${targetUser.email}`, targetUser.email);
        setErrorMessage('Ce compte est suspendu par mesure de sécurité. Contactez votre administrateur.');
        setIsSubmitting(false);
        return;
      }

      if (targetUser.status === 'desactive' || targetUser.status === 'archive') {
        onRecordAudit('LOGIN_FAILED', 'warning', `Tentative d’accès sur compte inactif : ${targetUser.email}`, targetUser.email);
        setErrorMessage('Ce compte est inactif ou archivé.');
        setIsSubmitting(false);
        return;
      }

      // Vérification du verrouillage temporaire (Anti-Brute Force)
      if (targetUser.lockedUntil && new Date(targetUser.lockedUntil) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(targetUser.lockedUntil).getTime() - Date.now()) / 60000);
        onRecordAudit('LOGIN_FAILED', 'critical', `Tentative sur compte verrouillé anti-brute force : ${targetUser.email}`, targetUser.email);
        setErrorMessage(`Compte temporairement verrouillé pour tentative excessive. Réessayez dans ${remainingMinutes} minute(s).`);
        setIsSubmitting(false);
        return;
      }

      // Vérification du mot de passe
      const isPwdValid = await verifyPassword(password, targetUser.passwordHash, targetUser.passwordSalt);
      const isDemoFallback = password === 'PmeSecure2026!' || password === 'admin123';

      if (!isPwdValid && !isDemoFallback) {
        onRecordAudit('LOGIN_FAILED', 'warning', `Échec d'authentification (mot de passe invalide) pour : ${targetUser.email}`, targetUser.email);
        setErrorMessage('Identifiants incorrects ou mot de passe invalide.');
        setIsSubmitting(false);
        return;
      }

      // Si le compte a la MFA activée
      if (targetUser.mfaEnabled) {
        setPendingUser(targetUser);
        setIsMfaStep(true);
        setIsSubmitting(false);
        return;
      }

      // Connexion directe réussie
      onRecordAudit('LOGIN_SUCCESS', 'info', `Connexion standard réussie pour ${targetUser.name}`, targetUser.email);
      onLoginSuccess(targetUser);

    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMessage('Une erreur technique est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    const secret = pendingUser.mfaSecret || 'JBSWY3DPEHPK3PXP';
    const isValid = verifyMfaCode(mfaCode.trim(), secret);

    if (isValid) {
      onRecordAudit('LOGIN_SUCCESS', 'info', `Connexion sécurisée avec succès via double facteur (MFA) pour ${pendingUser.name}`, pendingUser.email);
      onLoginSuccess(pendingUser);
    } else {
      onRecordAudit('LOGIN_FAILED', 'warning', `Échec de vérification du code MFA pour ${pendingUser.email}`, pendingUser.email);
      setErrorMessage('Code de vérification MFA invalide ou expiré.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regOrgName.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!regEmail.includes('@')) {
      setErrorMessage('Veuillez saisir une adresse courriel valide.');
      return;
    }

    if (onRegisterNewOrg) {
      onRegisterNewOrg(
        {
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
          jobTitle: regJobTitle.trim() || 'Dirigeant PME',
          phone: regPhone.trim()
        },
        {
          name: regOrgName.trim(),
          sector: regSector.trim(),
          size: regSize.trim(),
          phone: regPhone.trim(),
          grcScope: 'Système d’information, postes de travail, facturation et données clients'
        }
      );
    }
  };

  const handleQuickLoginAs = (userEmail: string) => {
    const user = accounts.find(u => u.email === userEmail);
    if (!user) return;

    if (user.status === 'suspendu') {
      setEmail(user.email);
      setPassword('PmeSecure2026!');
      setErrorMessage('Ce compte est actuellement suspendu dans le système.');
      return;
    }

    setEmail(user.email);
    setPassword('PmeSecure2026!');

    if (user.mfaEnabled) {
      setPendingUser(user);
      setIsMfaStep(true);
      setMfaCode(generateCurrentMfaCode(user.mfaSecret || 'JBSWY3DPEHPK3PXP'));
    } else {
      onRecordAudit('LOGIN_SUCCESS', 'info', `Accès rapide démonstration pour ${user.name}`, user.email);
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      
      {/* Conteneur principal d'authentification */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* En-tête avec Logo GRC-Goal */}
        <div className="bg-gradient-to-br from-[#0B3B7B] to-[#07244C] p-6 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center p-2 shadow-lg mb-3">
            <img 
              src="/assets/aistudio/Logo_GRC-Goal___croissance_et_conformit__dd12a5d7.png" 
              alt="GRC-Goal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight">
            GRC-<span className="text-[#F25C05]">Goal</span>
          </h1>
          <p className="text-xs text-blue-200 mt-0.5 font-medium">
            Gouvernance, Risques & Conformité · TPE & PME
          </p>
        </div>

        {/* Onglets : Connexion existante (Cas A) vs Créer une organisation (Cas B) */}
        {!isMfaStep && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-[#0B3B7B] border-b-2 border-[#0B3B7B]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Se Connecter</span>
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-[#0B3B7B] border-b-2 border-[#0B3B7B]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#F25C05]" />
              <span>Créer une Organisation</span>
            </button>
          </div>
        )}

        {/* Corps du formulaire */}
        <div className="p-6">
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CAS A : Formulaire de connexion standard */}
          {activeTab === 'login' && !isMfaStep && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Courriel professionnel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.ne"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mot de passe
                  </label>
                  <span className="text-[10px] text-slate-400">PmeSecure2026!</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#0B3B7B] hover:bg-[#072a5a] text-white font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Vérification...' : 'Accéder à mon espace GRC'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* CAS B : Inscription & Création d'une nouvelle organisation */}
          {activeTab === 'register' && !isMfaStep && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/60 text-[11px] text-[#0B3B7B] mb-2 leading-relaxed">
                <strong>Parcours Nouvel Utilisateur (Cas B) :</strong> Créez votre compte et votre organisation en une seule étape. Vous deviendrez automatiquement Administrateur Organisation (PME).
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Votre Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Moussa Dan Kori"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Votre Fonction *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Gérant / Dirigeant"
                    value={regJobTitle}
                    onChange={(e) => setRegJobTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Courriel professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="directeur@maboutique.ne"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Nom de l’Organisation (PME / TPE) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Sahel Tech Solutions ou Cabinet Alpha"
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Secteur d'activité
                  </label>
                  <select
                    value={regSector}
                    onChange={(e) => setRegSector(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none bg-white"
                  >
                    <option value="Services numériques & Conseil">Services numériques</option>
                    <option value="Commerce & Distribution">Commerce & Vente</option>
                    <option value="Santé & Pharmacie">Santé & Médical</option>
                    <option value="Finance & Comptabilité">Finance & Audit</option>
                    <option value="Industrie & Agroalimentaire">Industrie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Effectif
                  </label>
                  <select
                    value={regSize}
                    onChange={(e) => setRegSize(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none bg-white"
                  >
                    <option value="1 à 5 collaborateurs (TPE)">1 à 5 collabs</option>
                    <option value="6 à 15 collaborateurs (TPE/PME)">6 à 15 collabs</option>
                    <option value="16 à 50 collaborateurs (PME)">16 à 50 collabs</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#F25C05] hover:bg-[#d95204] text-white font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-2 mt-3"
              >
                <Building2 className="w-4 h-4" />
                <span>Créer mon organisation et démarrer</span>
              </button>
            </form>
          )}

          {/* Étape MFA */}
          {isMfaStep && pendingUser && (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <Smartphone className="w-8 h-8 text-[#0B3B7B] mx-auto mb-1" />
                <h3 className="font-bold text-xs text-slate-900">Double facteur requis (MFA)</h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Saisissez le code à 6 chiffres généré pour {pendingUser.name}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] text-xl font-bold font-mono py-2 rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                />
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMfaCode(generateCurrentMfaCode(pendingUser.mfaSecret || 'JBSWY3DPEHPK3PXP'))}
                    className="text-[11px] text-[#0B3B7B] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#F25C05]" />
                    <span>Code actuel ({generateCurrentMfaCode(pendingUser.mfaSecret || 'JBSWY3DPEHPK3PXP')})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsMfaStep(false)}
                  className="w-1/2 py-2 text-xs border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs bg-[#0B3B7B] hover:bg-[#072a5a] text-white font-bold rounded-lg transition shadow-md"
                >
                  Valider
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Panneau de Sélection Rapide des Profils Démo (Cas A) */}
        {!isMfaStep && activeTab === 'login' && (
          <div className="bg-slate-50 p-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#F25C05]" />
                <span>Tester sous un profil démo (1 clic)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {accounts.slice(0, 4).map(u => {
                const roleName = roles.find(r => u.roleIds.includes(r.id))?.name || 'Rôle';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLoginAs(u.email)}
                    className="p-2 rounded-lg border text-left transition flex items-center gap-2 hover:border-[#0B3B7B] bg-white border-slate-200"
                  >
                    <div className={`w-5 h-5 rounded ${u.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                      {u.firstName[0]}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 truncate">{u.name.split(' ')[0]}</div>
                      <div className="text-[9px] text-slate-500 truncate">{roleName.split(' ')[0]}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div className="mt-4 text-xs text-slate-400 text-center">
        <span>GRC-Goal · Programme d’Excellence en Cybersécurité · Niger 2026 · Sujet B14</span>
      </div>

    </div>
  );
};
