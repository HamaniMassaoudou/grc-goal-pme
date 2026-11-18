from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Rate limiting spécifique pour l'endpoint de login.
    Limite à 5 tentatives par minute par adresse IP.
    """
    scope = 'login'
    rate = '5/min'


class BurstRateThrottle(UserRateThrottle):
    """
    Rate limiting pour les utilisateurs authentifiés en cas de pics d'activité.
    """
    scope = 'burst'
    rate = '100/min'


class SustainedRateThrottle(UserRateThrottle):
    """
    Rate limiting soutenu pour les utilisateurs authentifiés.
    """
    scope = 'sustained'
    rate = '1000/hour'
