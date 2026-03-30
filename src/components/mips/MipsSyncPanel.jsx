/**
 * MipsSyncPanel
 *
 * Reusable panel to sync a member or staff to MIPS hardware.
 * Drop into any member/staff profile page.
 *
 * Props:
 *   type       — "member" | "staff"
 *   id         — DB id (member.id or user.id)
 *   name       — display name
 *   branchId   — optional override (SuperAdmin)
 *   compact    — boolean, render as small inline badge+button (default: false)
 */

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, ShieldOff, RefreshCw, Wifi, AlertTriangle,
    CheckCircle, XCircle, Clock, Unlock, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    syncMemberToMips,
    syncStaffToMips,
    revokeMipsAccess,
    restoreMipsAccess,
    getMemberSyncStatus,
    getStaffSyncStatus,
} from '../../api/gymDeviceApi';

// ─── Status badge config ──────────────────────────────────────
const STATUS_CONFIG = {
    synced: {
        label: 'Synced',
        icon: CheckCircle,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    pending: {
        label: 'Not Synced',
        icon: Clock,
        color: 'bg-amber-50 text-amber-600 border-amber-200',
        dot: 'bg-amber-400',
    },
    failed: {
        label: 'Sync Failed',
        icon: XCircle,
        color: 'bg-red-50 text-red-600 border-red-200',
        dot: 'bg-red-500',
    },
    revoked: {
        label: 'Access Revoked',
        icon: ShieldOff,
        color: 'bg-slate-100 text-slate-500 border-slate-200',
        dot: 'bg-slate-400',
    },
};

// ─── Main Component ───────────────────────────────────────────
const MipsSyncPanel = ({ type = 'member', id, name, branchId, compact = false }) => {
    const [status, setStatus] = useState(null); // full status object from API
    const [syncing, setSyncing] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        if (id) loadStatus();
    }, [id]);

    const loadStatus = async () => {
        try {
            const data = type === 'member'
                ? await getMemberSyncStatus(id)
                : await getStaffSyncStatus(id);
            setStatus(data);
        } catch {
            // silently ignore — panel works without pre-loaded status
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = type === 'member'
                ? await syncMemberToMips(id, branchId)
                : await syncStaffToMips(id, branchId);

            toast.success(result.message || 'Synced to MIPS successfully');
            await loadStatus();
        } catch (error) {
            toast.error(error.message || 'MIPS sync failed');
        } finally {
            setSyncing(false);
        }
    };

    const handleRevoke = async () => {
        if (!window.confirm(`Revoke hardware access for "${name}"? They will be blocked at the gate immediately.`)) return;
        setRevoking(true);
        try {
            const result = await revokeMipsAccess(id, branchId);
            toast.success(result.message || 'Hardware access revoked');
            await loadStatus();
        } catch (error) {
            toast.error(error.message || 'Revoke failed');
        } finally {
            setRevoking(false);
        }
    };

    const handleRestore = async () => {
        setRestoring(true);
        try {
            const result = await restoreMipsAccess(id, branchId);
            toast.success(result.message || 'Hardware access restored');
            await loadStatus();
        } catch (error) {
            toast.error(error.message || 'Restore failed');
        } finally {
            setRestoring(false);
        }
    };

    const syncStatus = status?.mipsSyncStatus || 'pending';
    const cfg = STATUS_CONFIG[syncStatus] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    const isSynced = syncStatus === 'synced';
    const isRevoked = syncStatus === 'revoked';

    // ── Compact mode — single row badge + sync button ──────────
    if (compact) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                </span>
                {status?.mipsPersonSn && (
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {status.mipsPersonSn}
                    </span>
                )}
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-[10px] font-black rounded-lg hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                    <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing...' : 'Sync to MIPS'}
                </button>
            </div>
        );
    }

    // ── Full panel mode ─────────────────────────────────────────
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                        <ShieldCheck size={16} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Smart AIoT</p>
                        <p className="text-[9px] text-slate-400 font-medium">Hardware Access Control</p>
                    </div>
                </div>
                <button
                    onClick={loadStatus}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                >
                    <RefreshCw size={13} />
                </button>
            </div>

            <div className="p-5 space-y-4">
                {/* Status Row */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.color}`}>
                        <StatusIcon size={11} />
                        {cfg.label}
                    </span>
                </div>

                {/* MIPS Person SN */}
                {status?.mipsPersonSn && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Person SN</span>
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            {status.mipsPersonSn}
                        </span>
                    </div>
                )}

                {/* Last synced time */}
                {status?.mipsSyncedAt && (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced</span>
                        <span className="text-[10px] font-bold text-slate-600">
                            {new Date(status.mipsSyncedAt).toLocaleString()}
                        </span>
                    </div>
                )}

                {/* Warning if not synced */}
                {!isSynced && !isRevoked && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                            {syncStatus === 'failed'
                                ? 'Last sync failed. Check MIPS connection and retry.'
                                : 'Not synced to MIPS yet. This person cannot use the face recognition gate.'}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-1">
                    {/* Main sync button */}
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 uppercase tracking-wider"
                    >
                        <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing to MIPS...' : isSynced ? 'Re-sync to MIPS' : 'Sync to MIPS'}
                    </button>

                    {/* Revoke / Restore — members only */}
                    {type === 'member' && isSynced && (
                        <button
                            onClick={handleRevoke}
                            disabled={revoking}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-200 text-xs font-black rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 uppercase tracking-wider"
                        >
                            <Lock size={13} />
                            {revoking ? 'Revoking...' : 'Revoke Gate Access'}
                        </button>
                    )}

                    {type === 'member' && isRevoked && (
                        <button
                            onClick={handleRestore}
                            disabled={restoring}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-black rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50 uppercase tracking-wider"
                        >
                            <Unlock size={13} />
                            {restoring ? 'Restoring...' : 'Restore Gate Access'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MipsSyncPanel;
