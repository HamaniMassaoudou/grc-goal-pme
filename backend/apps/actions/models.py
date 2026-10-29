from django.db import models
import secrets


class ActionComment(models.Model):
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    author = models.CharField(max_length=200)
    date = models.DateField()
    text = models.TextField()
    
    class Meta:
        db_table = 'action_comments'
        verbose_name = 'Commentaire d\'action'
        verbose_name_plural = 'Commentaires d\'action'
        ordering = ['date']
    
    def __str__(self):
        return f"Commentaire par {self.author} - {self.date}"


class CorrectiveAction(models.Model):
    ACTION_PRIORITY_CHOICES = [
        ('Basse', 'Basse'),
        ('Moyenne', 'Moyenne'),
        ('Haute', 'Haute'),
        ('Critique', 'Critique'),
    ]
    
    ACTION_STATUS_CHOICES = [
        ('a_faire', 'À faire'),
        ('en_cours', 'En cours'),
        ('en_retard', 'En retard'),
        ('cloturee', 'Clôturée'),
        ('rejetee', 'Rejetée'),
    ]
    
    ACTION_SOURCE_CHOICES = [
        ('risque', 'Risque'),
        ('soa_ecart', 'Écart SoA'),
        ('audit_interne', 'Audit interne'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=300)
    description = models.TextField()
    
    source = models.CharField(max_length=30, choices=ACTION_SOURCE_CHOICES)
    linked_risk_id = models.CharField(max_length=100, blank=True, null=True)
    linked_control_code = models.CharField(max_length=50, blank=True, null=True)
    
    owner = models.CharField(max_length=200, verbose_name='Responsable')
    priority = models.CharField(max_length=20, choices=ACTION_PRIORITY_CHOICES)
    due_date = models.DateField(verbose_name='Date d\'échéance')
    status = models.CharField(max_length=20, choices=ACTION_STATUS_CHOICES, default='a_faire')
    
    evidence_of_closure = models.TextField(blank=True, verbose_name='Preuve de clôture')
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='actions'
    )
    
    created_at = models.DateField(auto_now_add=True)
    closed_at = models.DateField(blank=True, null=True)
    
    class Meta:
        db_table = 'corrective_actions'
        verbose_name = 'Action corrective'
        verbose_name_plural = 'Actions correctives'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.title}"
