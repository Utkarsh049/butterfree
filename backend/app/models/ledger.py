"""Pydantic models for the SHA-256 blockchain safety ledger."""

from typing import Optional
from pydantic import BaseModel


class LedgerBlock(BaseModel):
    index: int
    timestamp: str
    alert_id: str
    alert_type: str
    severity: str
    machine_id: str
    operator_id: str
    incident_summary: str
    prev_hash: str
    block_hash: str


class LedgerVerifyResponse(BaseModel):
    is_valid: bool
    chain_length: int
    broken_at_index: Optional[int] = None
    message: str
