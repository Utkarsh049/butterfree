"""Blockchain Safety Ledger API endpoints."""

from typing import List
from fastapi import APIRouter
from ...models.ledger import LedgerBlock, LedgerVerifyResponse
from ...services.safety_ledger import SAFETY_LEDGER

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("", response_model=List[LedgerBlock])
def get_ledger():
    """Retrieve the full immutable blockchain safety ledger chain."""
    return SAFETY_LEDGER.get_chain()


@router.get("/verify", response_model=LedgerVerifyResponse)
def verify_ledger():
    """Cryptographically verify the integrity of the entire chain."""
    return SAFETY_LEDGER.verify_integrity()
