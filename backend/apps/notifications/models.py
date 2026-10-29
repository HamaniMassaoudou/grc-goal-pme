from django.db import models
import secrets


class AppNotification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('risk', 'Risque'),
        ('action', 'Action'),
        ('action_closed', 'Action clôturée'),
        ('soa_gap', 'Écart SoA'),
        ('security_alert', 'Alerte sécurité'),
        ('info', 'Information'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=300)
    message = models.TextField()
    
    # Target resource for navigation
    resource_type = models.CharField(max_length=50, blank=True)
    resource_id = models.CharField(max_length=100, blank=True, null=True)
    
    # User targeting
    target_user_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Read status
    is_read = models.BooleanField(default=False, verbose_name='Lu')
    read_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.created_at}"
