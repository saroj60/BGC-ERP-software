from django.db import models
from accounts.models import User

class Tender(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        AWARDED = 'AWARDED', 'Awarded'
        CANCELLED = 'CANCELLED', 'Cancelled'

    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    issue_date = models.DateField(auto_now_add=True)
    submission_deadline = models.DateField()
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tenders'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Bid(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'

    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bids')
    contractor_name = models.CharField(max_length=255)
    bid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    estimated_duration_days = models.IntegerField(help_text="Estimated time to complete in days")
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED
    )
    
    submission_date = models.DateTimeField(auto_now_add=True)
    # documents_url = models.URLField(blank=True, null=True) # Optional link to PDF proposal
    
    def __str__(self):
        return f"{self.contractor_name} - {self.bid_amount} for {self.tender.title}"
