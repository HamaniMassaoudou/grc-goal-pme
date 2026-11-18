from datetime import date
from .models import SoAControl
from .catalog import ISO27001_CONTROLS


def generate_soa_for_organization(org, is_demo=False):
    """
    Génère les 93 contrôles ISO/IEC 27001:2022 pour une organisation donnée.
    Si is_demo=True, applique la configuration de démonstration réaliste issue de initialData.ts.
    Sinon, initialise une SoA propre avec valeurs par défaut.
    """
    today = date(2026, 10, 20) if is_demo else date.today()
    created_controls = []

    for item in ISO27001_CONTROLS:
        code = item['code']
        title = item['title']
        domain = item['domain']
        description = item['description']
        control_id = f"soa-{org.id}-{code.lower().replace('.', '-')}"

        if is_demo:
            is_applicable = True
            justification = "Mesure indispensable pour assurer la confidentialité, l’intégrité et la disponibilité des activités de la PME."
            implementation_status = "partiellement_mis_en_oeuvre"
            maturity_level = 2
            evidence_ref = ""
            gap_description = ""
            linked_action_id = None

            if code == 'A.8.5':
                is_applicable = True
                justification = "Applicable : Obligation stricte de sécuriser l’accès à la base de données clients et à la messagerie professionnelle."
                implementation_status = "partiellement_mis_en_oeuvre"
                maturity_level = 3
                evidence_ref = "Capture de configuration TOTP console administrateur v1.2"
                gap_description = "La double authentification n’est pas encore généralisée à l’ensemble des collaborateurs tiers."
                linked_action_id = "act-01"
            elif code == 'A.6.3':
                is_applicable = True
                justification = "Applicable : Le facteur humain représente le premier vecteur d’entrée des attaques par phishing."
                implementation_status = "planifie"
                maturity_level = 2
                evidence_ref = "Support de formation diaporama v1.0 prêt pour diffusion"
                gap_description = "La session prévue n’a pas encore été délivrée à la totalité du personnel."
                linked_action_id = "act-02"
            elif code == 'A.8.13':
                is_applicable = True
                justification = "Applicable : Protection impérative contre les rançongiciels et les pannes matérielles."
                implementation_status = "mis_en_oeuvre"
                maturity_level = 4
                evidence_ref = "PV-RESTORE-2026-10-18.pdf & script de sauvegarde journalier cron"
                gap_description = "Aucun écart critique : les tests de restauration périodiques sont en place."
                linked_action_id = "act-03"
            elif code == 'A.5.10':
                is_applicable = True
                justification = "Applicable : Fixe le cadre contractuel d’usage des matériels et des données de l’entreprise."
                implementation_status = "planifie"
                maturity_level = 1
                evidence_ref = "Projet de charte informatique en cours de relecture"
                gap_description = "Absence de signature par les collaborateurs en poste."
                linked_action_id = "act-05"
            elif code == 'A.7.11':
                is_applicable = True
                justification = "Applicable : Les délestages fréquents nécessitent un dispositif d’alimentation ininterruptible fiable."
                implementation_status = "partiellement_mis_en_oeuvre"
                maturity_level = 2
                evidence_ref = "Facture d’achat de l’onduleur existant"
                gap_description = "Autonomie batterie trop faible en cas de coupure de plus de 5 minutes."
                linked_action_id = "act-04"
            elif code in ['A.8.4', 'A.8.28', 'A.8.25']:
                is_applicable = False
                justification = "Non applicable : La PME ne développe pas de logiciels sur mesure en interne et s’appuie sur des solutions SaaS du marché certifiées."
                implementation_status = "non_applicable"
                maturity_level = 1
                evidence_ref = "Contrats fournisseurs SaaS avec engagement de maintenance éditeur"
                gap_description = "Non applicable."
            elif code == 'A.7.6':
                is_applicable = False
                justification = "Non applicable : La structure ne possède pas de salle blanche ni de zone d’accès restreint militaire ou bancaire haute sécurité."
                implementation_status = "non_applicable"
                maturity_level = 1
                evidence_ref = "Plan des locaux à bureau unique"
                gap_description = "Non applicable."
            elif code in ['A.5.1', 'A.5.2', 'A.5.15', 'A.8.1', 'A.8.7', 'A.8.20']:
                is_applicable = True
                justification = "Mesure fondamentale pour la gouvernance et le contrôle technique."
                implementation_status = "mis_en_oeuvre"
                maturity_level = 3
                evidence_ref = "Procédure documentée et vérifiée lors de l’audit initial"
                gap_description = "Contrôle opérationnel régulier requis."
            elif code.startswith('A.5'):
                implementation_status = "partiellement_mis_en_oeuvre"
                maturity_level = 2
                evidence_ref = "Documentation administrative PME"
                gap_description = "Formalisation écrite partielle des pratiques orales existantes."
            else:
                implementation_status = "non_commence"
                maturity_level = 1
                evidence_ref = ""
                gap_description = "À traiter selon le plan de maturité pluriannuel."

            reviewed_by = "Hamani Massaoudou"
        else:
            is_applicable = True
            justification = "Contrôle à évaluer dans le cadre de la démarche de conformité ISO/IEC 27001:2022."
            implementation_status = "non_commence"
            maturity_level = 1
            evidence_ref = ""
            gap_description = "Évaluation initiale à réaliser par le référent GRC ou l’administrateur organisation."
            linked_action_id = None
            reviewed_by = "Administrateur Organisation"

        control, _ = SoAControl.objects.update_or_create(
            id=control_id,
            defaults={
                'code': code,
                'title': title,
                'domain': domain,
                'description': description,
                'is_applicable': is_applicable,
                'justification': justification,
                'implementation_status': implementation_status,
                'maturity_level': maturity_level,
                'evidence_ref': evidence_ref,
                'gap_description': gap_description,
                'linked_action_id': linked_action_id,
                'last_review_date': today,
                'reviewed_by': reviewed_by,
                'organization': org
            }
        )
        created_controls.append(control)

    return created_controls
