import React, { useState, useCallback } from "react";
import { SafetyLedger } from "../components/ledger/SafetyLedger";
import { fetchLedger, verifyLedger } from "../services/api";

export function LedgerPage({ chain, setChain }) {
    const [integrity, setIntegrity] = useState(null);
    const [verifying, setVerifying] = useState(false);

    const handleVerify = useCallback(async () => {
        setVerifying(true);
        try {
            const [freshChain, result] = await Promise.all([
                fetchLedger().catch(() => chain),
                verifyLedger(),
            ]);
            setChain(freshChain);
            setIntegrity(result);
        } catch (err) {
            setIntegrity({ is_valid: false, chain_length: chain.length, message: "Backend unreachable — cannot verify." });
        } finally {
            setVerifying(false);
        }
    }, [chain, setChain]);

    return (
        <SafetyLedger
            chain={chain}
            integrity={integrity}
            onVerify={handleVerify}
            verifying={verifying}
        />
    );
}
