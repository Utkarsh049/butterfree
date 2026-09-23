import React, { useState, useEffect, useCallback } from "react";

const SEVERITY_COLORS = {
    Critical: { bg: "#FCEAEC", text: "#A8273A", dot: "#A8273A" },
    High: { bg: "#FEF3E2", text: "#D4870A", dot: "#D4870A" },
    Medium: { bg: "#E4F2F8", text: "#1A5F7A", dot: "#2A8FAD" },
    Low: { bg: "#E6F5EC", text: "#1C6B47", dot: "#28A065" },
    default: { bg: "#F4F4F6", text: "#3D3D5C", dot: "#3D3D5C" },
};

function HashDisplay({ hash }) {
    const [copied, setCopied] = useState(false);
    const short = hash.slice(0, 10) + "…" + hash.slice(-6);
    const copy = () => {
        navigator.clipboard.writeText(hash).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <span
            onClick={copy}
            title={hash}
            style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                background: "#1C1C2E",
                color: "#F5A623",
                padding: "2px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                userSelect: "none",
                transition: "background 0.2s",
            }}
        >
            {copied ? "✓ Copied" : short}
        </span>
    );
}

export function SafetyLedger({ chain = [], integrity = null, onVerify, verifying = false }) {
    const isValid = integrity?.is_valid ?? true;

    return (
        <div className="animate-emergence">
            {/* Header bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h2 className="bf-section-title">🔗 Blockchain Safety Ledger</h2>
                    <p className="bf-section-subtitle">
                        Every safety incident is SHA-256 hashed into an immutable chain — tamper-proof, audit-ready.
                    </p>
                </div>

                {/* Integrity badge + verify button */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    {integrity && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            borderRadius: "10px",
                            background: isValid ? "#E6F5EC" : "#FCEAEC",
                            border: `1.5px solid ${isValid ? "var(--bf-emerald)" : "var(--bf-magenta)"}`,
                        }}>
                            <span style={{ fontSize: "1.1rem" }}>{isValid ? "✅" : "❌"}</span>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "0.85rem", color: isValid ? "var(--bf-emerald)" : "var(--bf-magenta)" }}>
                                    {isValid ? "Chain Verified — Intact" : "Chain Broken!"}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "var(--bf-slate)" }}>
                                    {integrity.chain_length} blocks · {integrity.message}
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={onVerify}
                        disabled={verifying}
                        style={{
                            background: "linear-gradient(135deg, #1A5F7A, #2A8FAD)",
                            color: "#FFF",
                            border: "none",
                            padding: "0.55rem 1.25rem",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.85rem",
                        }}
                    >
                        {verifying
                            ? <><span className="animate-spin" style={{ display: "inline-block" }}>⟳</span> Verifying…</>
                            : "🔍 Verify Chain Integrity"}
                    </button>
                </div>
            </div>

            {/* Chain stats row */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                {[
                    { label: "Total Blocks", value: chain.length, icon: "🧱" },
                    { label: "Incident Blocks", value: Math.max(0, chain.length - 1), icon: "⚠️" },
                    { label: "Algorithm", value: "SHA-256", icon: "🔐" },
                    { label: "Structure", value: "Linked Chain", icon: "🔗" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="bf-card animate-emergence"
                        style={{
                            padding: "0.9rem 1.2rem",
                            flex: 1,
                            minWidth: "130px",
                            animationDelay: `${i * 0.07}s`,
                        }}
                    >
                        <div style={{ fontSize: "1.2rem" }}>{stat.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: "1.3rem", marginTop: "0.25rem" }}>{stat.value}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--bf-slate)", marginTop: "2px" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Blockchain timeline */}
            <div className="ledger-chain">
                {[...chain].reverse().map((block, idx) => {
                    const isGenesis = block.index === 0;
                    const colors = SEVERITY_COLORS[block.severity] ?? SEVERITY_COLORS.default;
                    return (
                        <div
                            key={block.index}
                            className="ledger-block animate-block"
                            style={{ animationDelay: `${idx * 0.06}s` }}
                        >
                            {/* Chain node dot */}
                            <div
                                className={`ledger-block__dot ${isGenesis ? "ledger-block__dot--genesis" : ""}`}
                                style={{ background: colors.dot }}
                            />

                            {/* Block card */}
                            <div
                                className="bf-card"
                                style={{
                                    flex: 1,
                                    padding: "1rem 1.25rem",
                                    marginBottom: "0.75rem",
                                    borderLeft: `4px solid ${colors.dot}`,
                                    background: isGenesis
                                        ? "linear-gradient(135deg, #FAF7F0, #F2EDE0)"
                                        : "#FFFFFF",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {/* Left: block info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                            <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--bf-slate)" }}>
                                                Block #{block.index}
                                            </span>
                                            {!isGenesis && (
                                                <span style={{
                                                    background: colors.bg,
                                                    color: colors.text,
                                                    padding: "2px 8px",
                                                    borderRadius: "10px",
                                                    fontSize: "0.72rem",
                                                    fontWeight: 700,
                                                }}>
                                                    {block.severity}
                                                </span>
                                            )}
                                            {isGenesis && (
                                                <span className="bf-badge bf-badge--teal">🦋 Genesis</span>
                                            )}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginTop: "0.3rem", color: "var(--bf-charcoal)" }}>
                                            {block.alert_type}
                                        </div>
                                        <div style={{ fontSize: "0.83rem", color: "var(--bf-slate)", marginTop: "0.2rem" }}>
                                            {block.incident_summary}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.3rem" }}>
                                            {block.machine_id} · {block.operator_id} · {new Date(block.timestamp).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Right: hash chain */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", minWidth: "200px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{ fontSize: "0.7rem", color: "var(--bf-slate)" }}>Block Hash</span>
                                            <HashDisplay hash={block.block_hash} />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{ fontSize: "0.7rem", color: "var(--bf-slate)" }}>Prev Hash</span>
                                            <HashDisplay hash={block.prev_hash} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {chain.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--bf-slate)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔗</div>
                    <div style={{ fontWeight: 600 }}>No incidents logged yet</div>
                    <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Simulate a telemetry ping on the Machine Health page to generate safety events.</div>
                </div>
            )}
        </div>
    );
}
