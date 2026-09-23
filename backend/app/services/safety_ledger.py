"""Immutable Blockchain Safety Ledger — SHA-256 linked-list chain for tamper-proof incident logging."""

import hashlib
import json
from datetime import datetime
from typing import List, Optional
from ..models.ledger import LedgerBlock, LedgerVerifyResponse


class SafetyLedgerChain:
    """In-memory SHA-256 linked-list blockchain for safety incidents."""

    def __init__(self):
        self._chain: List[LedgerBlock] = []
        # Genesis block
        genesis = LedgerBlock(
            index=0,
            timestamp=datetime.utcnow().isoformat() + "Z",
            alert_id="GENESIS",
            alert_type="Chain Initialized",
            severity="Low",
            machine_id="SYSTEM",
            operator_id="SYSTEM",
            incident_summary="Butterfree Safety Ledger — Genesis Block",
            prev_hash="0" * 64,
            block_hash="",
        )
        genesis.block_hash = self._compute_hash(genesis)
        self._chain.append(genesis)

    def _compute_hash(self, block: LedgerBlock) -> str:
        """Compute the SHA-256 hash for a block (excluding block_hash itself)."""
        record = {
            "index": block.index,
            "timestamp": block.timestamp,
            "alert_id": block.alert_id,
            "alert_type": block.alert_type,
            "severity": block.severity,
            "machine_id": block.machine_id,
            "operator_id": block.operator_id,
            "incident_summary": block.incident_summary,
            "prev_hash": block.prev_hash,
        }
        payload = json.dumps(record, sort_keys=True).encode()
        return hashlib.sha256(payload).hexdigest()

    def add_incident(
        self,
        alert_id: str,
        alert_type: str,
        severity: str,
        machine_id: str,
        operator_id: str,
        incident_summary: str,
        timestamp: Optional[str] = None,
    ) -> LedgerBlock:
        """Append a new incident block to the chain."""
        prev_block = self._chain[-1]
        new_block = LedgerBlock(
            index=len(self._chain),
            timestamp=timestamp or (datetime.utcnow().isoformat() + "Z"),
            alert_id=alert_id,
            alert_type=alert_type,
            severity=severity,
            machine_id=machine_id,
            operator_id=operator_id,
            incident_summary=incident_summary,
            prev_hash=prev_block.block_hash,
            block_hash="",
        )
        new_block.block_hash = self._compute_hash(new_block)
        self._chain.append(new_block)
        return new_block

    def get_chain(self) -> List[LedgerBlock]:
        return list(self._chain)

    def verify_integrity(self) -> LedgerVerifyResponse:
        """Walk the full chain and verify every hash and prev_hash link."""
        for i in range(1, len(self._chain)):
            current = self._chain[i]
            previous = self._chain[i - 1]

            # Recompute expected hash
            expected_hash = self._compute_hash(current)
            if current.block_hash != expected_hash:
                return LedgerVerifyResponse(
                    is_valid=False,
                    chain_length=len(self._chain),
                    broken_at_index=i,
                    message=f"Block {i} hash mismatch — data may have been tampered.",
                )

            # Verify back-link
            if current.prev_hash != previous.block_hash:
                return LedgerVerifyResponse(
                    is_valid=False,
                    chain_length=len(self._chain),
                    broken_at_index=i,
                    message=f"Block {i} prev_hash does not match block {i-1} hash — chain broken.",
                )

        return LedgerVerifyResponse(
            is_valid=True,
            chain_length=len(self._chain),
            broken_at_index=None,
            message="Chain integrity verified — all blocks intact and unmodified.",
        )


# Module-level singleton shared across the app
SAFETY_LEDGER = SafetyLedgerChain()
