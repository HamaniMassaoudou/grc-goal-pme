import hashlib
import secrets
from django.db import models


def evidence_file_path(instance, filename):
    org_id = instance.organization_id if instance.organization_id else 'common'
    return f'evidences/{org_id}/{secrets.token_hex(4)}_{filename}'


class EvidenceFile(models.Model):
    LINKED_TYPE_CHOICES = [
        ('soa_control', 'Mesure SoA ISO 27001'),
        ('corrective_action', 'Action Corrective'),
        ('risk', 'Risque'),
        ('general', 'Document Général'),
    ]

    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    title = models.CharField(max_length=255, verbose_name="Titre du document")
    file = models.FileField(upload_to=evidence_file_path, verbose_name="Fichier justificatif")
    filename = models.CharField(max_length=255, verbose_name="Nom de fichier original")
    file_size = models.BigIntegerField(default=0, verbose_name="Taille (octets)")
    mime_type = models.CharField(max_length=100, blank=True, verbose_name="Type MIME")
    sha256_hash = models.CharField(max_length=64, blank=True, verbose_name="Empreinte SHA-256")
    
    linked_type = models.CharField(max_length=50, choices=LINKED_TYPE_CHOICES, default='soa_control')
    linked_id = models.CharField(max_length=100, verbose_name="Identifiant lié (ex: code A.5.1 ou ID action)")
    
    notes = models.TextField(blank=True, verbose_name="Commentaires / Justification")
    uploaded_by_name = models.CharField(max_length=200, blank=True)
    uploaded_by_email = models.CharField(max_length=200, blank=True)
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='evidences',
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_evidence_files'
        verbose_name = 'Fichier de preuve'
        verbose_name_plural = 'Fichiers de preuves'
        ordering = ['-created_at']

    def calculate_hash(self):
        """Calcule l'empreinte cryptographique SHA-256 pour garantir l'intégrité face à l'audit."""
        if not self.file:
            return ''
        hasher = hashlib.sha256()
        try:
            for chunk in self.file.chunks():
                hasher.update(chunk)
            return hasher.hexdigest()
        except Exception:
            return ''

    def save(self, *args, **kwargs):
        if self.file and not self.sha256_hash:
            self.sha256_hash = self.calculate_hash()
            if hasattr(self.file, 'size') and not self.file_size:
                self.file_size = self.file.size
            if not self.filename:
                self.filename = self.file.name
        super().save(*args, **kwargs)
