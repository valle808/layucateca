"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Terminal, 
  User, 
  Cpu, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Database,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";

interface TelemetryLog {
  id: string;
  type: string;
  event: string;
  details: string;
  userId: string | null;
  agentId: string | null;
  path: string | null;
  status: string;
  createdAt: string;
}

interface TelemetryKPIs {
  totalLogs: number;
  errorCount: number;
  userActions: number;
  agentActions: number;
}

interface TelemetryDashboardClientProps {
  initialLogs: TelemetryLog[];
  initialKPIs: TelemetryKPIs;
}

export default function TelemetryDashboardClient({
  initialLogs,
  initialKPIs,
}: TelemetryDashboardClientProps) {
  const [logs, setLogs] = useState<TelemetryLog[]>(initialLogs);
  const [kpis, setKpis] = useState<TelemetryKPIs>(initialKPIs);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Poll for telemetry logs and stats
  const fetchTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/telemetry/stats");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setKpis(data.kpis);
      }
    } catch (err) {
      console.error("Error fetching telemetry updates:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  // Filter & Search Logic
  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "ALL" || log.type === filterType;
    const matchesStatus = filterStatus === "ALL" || log.status === filterStatus;
    
    const searchString = `${log.event} ${log.path || ""} ${log.details}`.toLowerCase();
    const matchesSearch = searchQuery === "" || searchString.includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // Calculate percentage ratios
  const successRate = kpis.totalLogs > 0 
    ? ((kpis.totalLogs - kpis.errorCount) / kpis.totalLogs * 100).toFixed(1)
    : "100.0";

  return (
    <div className="min-h-screen bg-[#050508] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Decorative Glowing Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#ff5500]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ff5500]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Breadcrumbs and Controls */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 z-10 relative">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#ff5500] uppercase mb-2">
            <ShieldCheck className="w-4 h-4 text-[#ff5500]" />
            SYSTEMS GATEWAY / INTERNAL TELEMETRY
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Observability Dashboard
            <span className="text-xs px-2.5 py-1 bg-[#ff5500]/15 border border-[#ff5500]/30 rounded-full text-[#ff5500] uppercase tracking-wider font-mono">
              Live AI Orchestrator
            </span>
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-xl">
            Real-time telemetry stream showing M2M autonomous agent decision trees, background jobs, database mutations, and system state transitions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-white/5 backdrop-blur-md border border-white/10 p-2.5 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-white/60 px-2">
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-white/30'}`} />
            {autoRefresh ? "Auto-polling Active" : "Polling Paused"}
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              autoRefresh 
                ? "bg-white/10 border-white/10 text-white/80 hover:bg-white/15" 
                : "bg-[#ff5500]/15 border-[#ff5500]/30 text-[#ff5500] hover:bg-[#ff5500]/25"
            }`}
          >
            {autoRefresh ? "Pause Update" : "Resume Update"}
          </button>

          <button
            onClick={fetchTelemetry}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-50 transition-all flex items-center gap-1.5"
            title="Force refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#ff5500]" : ""}`} />
            <span className="text-xs font-semibold px-1">Sync</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 z-10 relative mb-8">
        
        {/* KPI: Total Actions */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-white/50 uppercase">Total Operations</span>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#ff5500]/10 transition-all">
              <Layers className="w-5 h-5 text-white/70 group-hover:text-[#ff5500]" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight font-mono text-white">
              {kpis.totalLogs}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Healthy telemetry stream
            </div>
          </div>
        </div>

        {/* KPI: User Operations */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-white/50 uppercase">User Interactions</span>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#ff5500]/10 transition-all">
              <User className="w-5 h-5 text-white/70 group-hover:text-[#ff5500]" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight font-mono text-white">
              {kpis.userActions}
            </h3>
            <p className="text-xs text-white/40 mt-1">
              {((kpis.userActions / (kpis.totalLogs || 1)) * 100).toFixed(0)}% of total operations
            </p>
          </div>
        </div>

        {/* KPI: Agent Invocation */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-white/50 uppercase">Agent Operations</span>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#ff5500]/10 transition-all">
              <Cpu className="w-5 h-5 text-white/70 group-hover:text-[#ff5500]" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight font-mono text-white">
              {kpis.agentActions}
            </h3>
            <p className="text-xs text-white/40 mt-1">
              {((kpis.agentActions / (kpis.totalLogs || 1)) * 100).toFixed(0)}% of total operations
            </p>
          </div>
        </div>

        {/* KPI: Success Rate */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold tracking-wider text-white/50 uppercase">Health Ratio</span>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#ff5500]/10 transition-all">
              <Activity className="w-5 h-5 text-white/70 group-hover:text-[#ff5500]" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight font-mono text-white">
              {successRate}%
            </h3>
            <div className={`text-xs mt-1 flex items-center gap-1.5 ${kpis.errorCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {kpis.errorCount} system errors logged
            </div>
          </div>
        </div>
      </div>

      {/* Systems Administration & Quick Triggers */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 relative">
        {/* News Generator Trigger */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-white/15 transition-all">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#ff5500]" />
              Closed-Loop AI Newsroom Monitor
            </h3>
            <p className="text-sm text-white/60 mb-6">
              Our automated content agents publish Yucatan-specific multi-lingual articles across regional categories. The loop executes automatically via continuous background jobs.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Interval</span>
                <span className="text-sm font-semibold font-mono text-white/90">1 Minute</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Total Agents</span>
                <span className="text-sm font-semibold font-mono text-white/90">7 Dedicated</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Distribution</span>
                <span className="text-sm font-semibold font-mono text-white/90">FB + SEO</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Auto-Moderated</span>
                <span className="text-sm font-semibold font-mono text-white/90">Yes (AI Check)</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 items-center mt-6 pt-6 border-t border-white/5">
            <Link
              href="/news"
              className="text-xs font-bold text-[#ff5500] hover:text-[#ff7733] transition-all flex items-center gap-1 group"
            >
              Browse Curated Portal
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="text-white/20">|</span>
            <Link
              href="/admin"
              className="text-xs font-semibold text-white/60 hover:text-white transition-all"
            >
              Access Writer Node Dashboard
            </Link>
          </div>
        </div>

        {/* Database Node Health */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-white/15 transition-all">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-[#ff5500]" />
              Autonomous Engine Status
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Decentralized database synchronization status running on Supabase PostgreSQL.
            </p>
            
            <div className="space-y-3 font-mono text-xs mt-2">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/40">DB Server</span>
                <span className="text-[#ff5500] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                  ONLINE
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/40">Node Region</span>
                <span className="text-white/80">us-east-1 (Supabase)</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-white/40">Schema Sync</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  PRISMA V7 STABLE
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5">
            <Link 
              href="/soluciones-digitales"
              className="btn-primary w-full py-2 flex justify-center text-center text-xs gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <Zap className="w-3.5 h-3.5 text-[#ff5500]" />
              View Cloud Architecture
            </Link>
          </div>
        </div>
      </div>

      {/* Operations Log Stream */}
      <div className="max-w-7xl mx-auto z-10 relative">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          
          {/* Stream Header & Filters */}
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ff5500]/10 rounded-xl">
                <Terminal className="w-5 h-5 text-[#ff5500]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Telemetry Log Stream</h2>
                <p className="text-xs text-white/40 font-mono mt-0.5">Real-time system transaction state records</p>
              </div>
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap gap-2.5 items-center">
              {/* Type Select */}
              <div className="flex items-center bg-white/5 rounded-lg border border-white/10 px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-white/40 mr-1.5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white/80 focus:outline-none border-none cursor-pointer pr-1"
                >
                  <option value="ALL" className="bg-[#0f1018]">All Operations</option>
                  <option value="USER_ACTION" className="bg-[#0f1018]">User Actions</option>
                  <option value="AGENT_ACTION" className="bg-[#0f1018]">Agent Actions</option>
                  <option value="ERROR" className="bg-[#0f1018]">Errors</option>
                  <option value="DATA_MUTATION" className="bg-[#0f1018]">Mutations</option>
                </select>
              </div>

              {/* Status Select */}
              <div className="flex items-center bg-white/5 rounded-lg border border-white/10 px-2 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-white/40 mr-1.5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white/80 focus:outline-none border-none cursor-pointer pr-1"
                >
                  <option value="ALL" className="bg-[#0f1018]">All Status</option>
                  <option value="SUCCESS" className="bg-[#0f1018]">Success</option>
                  <option value="FAILED" className="bg-[#0f1018]">Failed</option>
                  <option value="INFO" className="bg-[#0f1018]">Info</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="flex items-center bg-white/5 rounded-lg border border-white/10 px-3 py-1 w-full md:w-48">
                <Search className="w-3.5 h-3.5 text-white/40 mr-1.5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-white/40 focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Logs List Container */}
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-16 text-center">
                <Terminal className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No matching telemetry logs found.</p>
                {searchQuery || filterType !== "ALL" || filterStatus !== "ALL" ? (
                  <button
                    onClick={() => {
                      setFilterType("ALL");
                      setFilterStatus("ALL");
                      setSearchQuery("");
                    }}
                    className="text-xs text-[#ff5500] font-semibold mt-2 hover:underline"
                  >
                    Clear active filters
                  </button>
                ) : null}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                
                // Color badges based on type
                let typeColor = "bg-white/5 text-white/70 border-white/10";
                if (log.type === "USER_ACTION") typeColor = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                if (log.type === "AGENT_ACTION") typeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                if (log.type === "ERROR") typeColor = "bg-red-500/10 text-red-400 border-red-500/20";
                if (log.type === "DATA_MUTATION") typeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";

                // Status glow outline
                let statusGlow = "bg-white/30 text-white/60";
                if (log.status === "SUCCESS") statusGlow = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                if (log.status === "FAILED") statusGlow = "bg-red-500/20 text-red-400 border border-red-500/30";
                if (log.status === "INFO") statusGlow = "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";

                let detailsObj = {};
                try {
                  detailsObj = JSON.parse(log.details);
                } catch {
                  detailsObj = { raw: log.details };
                }

                return (
                  <div 
                    key={log.id} 
                    className={`transition-all ${isExpanded ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"}`}
                  >
                    {/* Row Summary */}
                    <div 
                      onClick={() => toggleExpandLog(log.id)}
                      className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                        {/* Event indicator */}
                        <div className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold uppercase border ${typeColor} shrink-0`}>
                          {log.type.replace("_", " ")}
                        </div>

                        <div className="min-w-0">
                          <span className="text-sm font-bold text-white/95 truncate block md:inline mr-2">
                            {log.event}
                          </span>
                          {log.path && (
                            <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {log.path}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timestamp & Status Badge */}
                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 font-mono text-xs">
                        <span className="text-white/40">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusGlow}`}>
                            {log.status}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Collapsible Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/40">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1">Operational Node ID</span>
                                <span className="text-xs font-mono text-white/80">{log.id}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1">Target Account UUID</span>
                                <span className="text-xs font-mono text-white/80">{log.userId || "GUEST_SESSION"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1">AI Orchestrator Agent ID</span>
                                <span className="text-xs font-mono text-white/80">{log.agentId || "NONE"}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-2">Payload Data (Decrypted State)</span>
                              <pre className="p-4 bg-[#0a0a0f] rounded-xl border border-white/10 font-mono text-xs text-emerald-400 overflow-x-auto max-h-60 shadow-inner">
                                <code>{JSON.stringify(detailsObj, null, 2)}</code>
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Log Stream Footer */}
          <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs text-white/40">
            <span>Showing {filteredLogs.length} of {logs.length} operations</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Observability node synced: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
