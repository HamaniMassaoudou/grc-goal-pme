from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import CommonPasswordValidator, MinimumLengthValidator, NumericPasswordValidator
from django.utils.translation import gettext as _
import re
from .models import SecuritySettings


class CustomMinimumLengthValidator(MinimumLengthValidator):
    """
    Validator personnalisé pour la longueur minimale du mot de passe.
    Utilise les paramètres de SecuritySettings si disponibles.
    """
    def __init__(self, min_length=8):
        super().__init__(min_length)

    def validate(self, password, user=None):
        # Essayer de récupérer les paramètres de sécurité
        try:
            settings = SecuritySettings.objects.first()
            if settings:
                self.min_length = settings.password_min_length
        except:
            pass
        
        super().validate(password, user)


class CustomComplexityValidator:
    """
    Validator pour la complexité du mot de passe.
    Vérifie la présence de majuscules, minuscules, chiffres et caractères spéciaux.
    """
    def validate(self, password, user=None):
        errors = []
        
        # Essayer de récupérer les paramètres de sécurité
        require_upper = True
        require_lower = True
        require_digit = True
        require_special = True
        
        try:
            settings = SecuritySettings.objects.first()
            if settings:
                require_upper = settings.password_require_uppercase
                # require_lower has no setting in model, defaults to True
                require_digit = settings.password_require_numbers
                require_special = settings.password_require_symbols
        except:
            pass
        
        if require_upper and not re.search(r'[A-Z]', password):
            errors.append(_("Le mot de passe doit contenir au moins une majuscule."))
        
        if require_lower and not re.search(r'[a-z]', password):
            errors.append(_("Le mot de passe doit contenir au moins une minuscule."))
        
        if require_digit and not re.search(r'\d', password):
            errors.append(_("Le mot de passe doit contenir au moins un chiffre."))
        
        if require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append(_("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?\":{}|<>)."))
        
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Le mot de passe doit contenir au moins une majuscule, une minuscule, "
            "un chiffre et un caractère spécial."
        )


class PasswordHistoryValidator:
    """
    Validator pour empêcher la réutilisation des anciens mots de passe.
    """
    def __init__(self, history_count=5):
        self.history_count = history_count

    def validate(self, password, user=None):
        if not user:
            return
        
        # Pour l'instant, nous n'avons pas d'historique de mots de passe dans le modèle
        # Cette validation sera activée quand l'historique sera implémenté
        pass

    def get_help_text(self):
        return _(
            f"Le mot de passe ne doit pas être identique aux {self.history_count} derniers mots de passe utilisés."
        )


class CommonPasswordValidatorFr(CommonPasswordValidator):
    """
    Validator pour les mots de passe courants avec messages en français.
    """
    def get_help_text(self):
        return _("Votre mot de passe ne doit pas être un mot de passe courant.")
