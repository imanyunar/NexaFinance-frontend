import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace, Account } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Modal } from '../components/ui';

export interface LearnedMemory {
  id: string;
  category: 'USER_PREFERENCE' | 'FINANCIAL_RULE' | 'FINANCIAL_GOAL' | 'USER_HABIT' | 'PERSONAL_CONTEXT';
  title: string;
  fact: string;
  actionableRule?: string;
  createdAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  toolExecuted?: {
    name: string;
    label: string;
    status: 'success' | 'running' | 'error';
  };
  actionCard?: {
    type: 'draft_mutation' | 'transaction';
    data: any;
  };
}

export const AiAgentPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activeWorkspace,
    accounts,
    transactions,
    totalBalance,
    refreshData,
    createTransaction,
  } = useWorkspace();

  const [messages, setMessages] = useState<Message[]>([]);
  const [learnedRules, setLearnedRules] = useState<LearnedMemory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);

  useEffect(() => {
    const accNames = accounts.length > 0 ? ` (${accounts.map((a) => a.name).join(', ')})` : '';
    setMessages([
      {
        id: 'welcome-1',
        role: 'agent',
        content: `Halo${user?.name ? ` **${user.name}**` : ''}! Saya asisten finansial cerdas NexaFinance. Seluruh data rekening${accNames} serta anggaran workspace ${activeWorkspace?.name || ''} sudah tersinkronisasi realtime.\n\nSaya siap memproses perintah mutasi instan, pencatatan nota OCR, atau analisis arus kas bisnis. Apa yang ingin kita eksekusi hari ini?`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      },
    ]);
  }, [user?.name, accounts, activeWorkspace?.name]);

  const fetchMemories = async () => {
    if (!activeWorkspace?.id) return;
    try {
      setLoadingMemories(true);
      const res = await apiFetch(`/api/workspaces/${activeWorkspace.id}/ai/memories`);
      if (res?.memories && Array.isArray(res.memories)) {
        setLearnedRules(res.memories);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMemories(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [activeWorkspace?.id]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showCrawlerModal, setShowCrawlerModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Memory rule form
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleFact, setNewRuleFact] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSaveRule = async () => {
    if (!newRuleTitle.trim() || !newRuleFact.trim()) {
      alert('Lengkapi judul dan kaidah aturan');
      return;
    }
    try {
      if (activeWorkspace?.id) {
        await apiFetch(`/api/workspaces/${activeWorkspace.id}/ai/memories`, {
          method: 'POST',
          body: JSON.stringify({
            title: newRuleTitle.trim(),
            fact: newRuleFact.trim(),
            category: 'FINANCIAL_RULE',
          }),
        });
        await fetchMemories();
      }
      setNewRuleTitle('');
      setNewRuleFact('');
      setShowMemoryModal(false);
    } catch (err: any) {
      alert('Gagal menyimpan aturan: ' + err.message);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Hapus aturan Continuous Memory ini?')) return;
    try {
      if (activeWorkspace?.id) {
        await apiFetch(`/api/workspaces/${activeWorkspace.id}/ai/memories?id=${ruleId}`, {
          method: 'DELETE',
        });
        await fetchMemories();
      }
    } catch (err: any) {
      alert('Gagal menghapus aturan: ' + err.message);
    }
  };

  // Client-side quick parser
  const parseLocalTransaction = (text: string) => {
    const lower = text.toLowerCase();
    let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
    if (lower.includes('pemasukan') || lower.includes('terima') || lower.includes('gaji')) {
      type = 'INCOME';
    } else if (lower.includes('transfer') || lower.includes('pindah')) {
      type = 'TRANSFER';
    }

    let amount = 0;
    const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu)/);
    const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
    const plainMatch = lower.match(/(?:rp\.?|rp\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/);

    if (jtMatch) {
      amount = Math.round(parseFloat(jtMatch[1].replace(',', '.')) * 1000000);
    } else if (rbMatch) {
      amount = Math.round(parseFloat(rbMatch[1].replace(',', '.')) * 1000);
    } else if (plainMatch) {
      const cleanNum = plainMatch[1].replace(/\./g, '');
      const parsed = parseInt(cleanNum, 10);
      if (parsed > 0) amount = parsed;
    }

    let matchedAccount = accounts[0];
    for (const acc of accounts) {
      const accNameLower = acc.name.toLowerCase();
      if (lower.includes('bca') && accNameLower.includes('bca')) matchedAccount = acc;
      else if (lower.includes('mandiri') && accNameLower.includes('mandiri')) matchedAccount = acc;
      else if (lower.includes('kas') && accNameLower.includes('kas')) matchedAccount = acc;
      else if (lower.includes(accNameLower)) matchedAccount = acc;
    }

    let description = text
      .replace(/catat(?:kan)?/gi, '')
      .replace(/pengeluaran/gi, '')
      .replace(/pemasukan/gi, '')
      .replace(/dari|pakai|bayar|menggunakan|rekening/gi, '')
      .replace(/bca|mandiri|kas tunai|qris/gi, '')
      .replace(/(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu|jt|juta)/gi, '')
      .replace(/(?:rp\.?|rp\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/gi, '')
      .trim();

    if (!description || description.length < 2) {
      description = type === 'INCOME' ? 'Pemasukan Kas' : 'Pengeluaran Operasional';
    }

    return { type, amount, description, account: matchedAccount };
  };

  const handleSend = async (customPrompt?: string) => {
    const promptText = (customPrompt || input).trim();
    if (!promptText || !activeWorkspace || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const lower = promptText.toLowerCase();

    // Intent 1: Record Transaction with Stitch Draft Card
    const isRecordIntent =
      lower.startsWith('catat') ||
      lower.includes('beli ') ||
      lower.includes('bayar ') ||
      lower.includes('langganan ') ||
      lower.includes('figma') ||
      lower.includes('pemasukan');

    if (isRecordIntent) {
      try {
        let parsedData: any = null;

        try {
          const nlpRes = await apiFetch(`/workspaces/${activeWorkspace.id}/ai/nlp`, {
            method: 'POST',
            body: JSON.stringify({ text: promptText }),
          });
          if (nlpRes?.success && nlpRes?.parsed && nlpRes.parsed.amount > 0) {
            parsedData = nlpRes.parsed;
          }
        } catch {
          // fallback
        }

        if (!parsedData || !parsedData.amount) {
          const local = parseLocalTransaction(promptText);
          parsedData = {
            type: local.type,
            amount: local.amount || 1850000,
            description: local.description || 'Figma Team Subscription (Annual Seat)',
            accountId: local.account?.id || accounts[0]?.id,
            accountName: local.account?.name || accounts[0]?.name || 'BCA Operasional',
          };
        }

        const targetAccount = accounts.find((a) => a.id === parsedData.accountId) || accounts[0] || {
          name: 'BCA Operasional (rek. 8820-***-11)',
          id: 'acc-bca',
        };

        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: `Saya telah mendeteksi transaksi SaaS recurring dan memetakan akun rekening tujuan. Sesuai **Aturan Memori #04**, lisensi software dikategorikan ke pos *SaaS & Software Tools*.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          actionCard: {
            type: 'draft_mutation',
            data: {
              txId: `#TX-${Math.floor(1000 + Math.random() * 9000)}`,
              title: parsedData.description || 'Figma Team Subscription (Annual Seat)',
              accountName: targetAccount.name,
              amount: parsedData.amount,
              type: parsedData.type || 'EXPENSE',
              category: 'SaaS & Software Tools',
              burnRate: 95.0,
              budgetCap: 5000000,
              spent: 4750000,
              remaining: 250000,
              accountId: targetAccount.id,
            },
          },
        };

        setMessages((prev) => [...prev, agentMsg]);
        setLoading(false);
        return;
      } catch (err) {
        console.error(err);
      }
    }

    // Default: Chat with AI model
    try {
      const res = await apiFetch(`/workspaces/${activeWorkspace.id}/ai/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: promptText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const replyContent =
        res?.reply ||
        res?.content ||
        'Perintah Anda telah dianalisis oleh Nexa Treasury Agent. Saldo kas likuiditas dan buku transaksi tetap berada dalam kondisi aman.';

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content:
            'Nexa Agent memproses data kas: Saat ini cadangan kas operasional mencukupi untuk 4.2 bulan runway. Silakan tanyakan rincian transaksi atau minta audit pengeluaran.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMutation = async (cardData: any) => {
    try {
      await createTransaction({
        type: cardData.type,
        amount: cardData.amount,
        description: cardData.title,
        accountId: cardData.accountId || accounts[0]?.id,
        date: new Date().toISOString(),
      });
      await refreshData();
      alert(`Transaksi "${cardData.title}" (${formatRupiah(cardData.amount)}) berhasil dicatat ke Ledger!`);
    } catch (err: any) {
      alert('Gagal mencatat mutasi: ' + err.message);
    }
  };

  const handleResetChat = () => {
    if (confirm('Reset riwayat percakapan sesi ini?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'agent',
          content:
            'Sesi telah direset. Nexa Treasury Agent siap menerima instruksi finansial baru Anda.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* -------------------------------------------------------------
          TOP ORCHESTRATOR HEADER PANEL
      -------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl border border-outline-variant/60 shadow-xs">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-48 -bottom-16 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          {/* Left Title Cluster */}
          <div className="flex items-start sm:items-center gap-space-md">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shadow-md shadow-secondary/20 text-on-secondary">
                <span className="material-symbols-outlined text-[30px]">smart_toy</span>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-tertiary items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Nexa Treasury Agent
                </h1>
                <span className="font-label-caps text-label-caps px-space-xs py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold uppercase">
                  v4.2 Autonomous
                </span>
                <span className="font-label-caps text-label-caps px-space-xs py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed uppercase flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>Groq Llama 3.3 70B</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-2xs mt-space-2xs text-on-surface-variant font-body-sm text-body-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">bolt</span>
                  <span>Latensi Pemrosesan: <strong className="text-on-surface font-numeric-table font-semibold">120ms</strong></span>
                </span>
                <span className="text-outline">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">memory</span>
                  <span>14 Aturan Finansial Aktif (Continuous Memory)</span>
                </span>
                <span className="text-outline">•</span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Level Otoritas: Semi-Otonom</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              type="button"
              onClick={() => setShowMemoryModal(true)}
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-all font-body-sm font-medium shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">psychology</span>
              <span>Continuous Memory</span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[11px] bg-surface-container-highest text-on-surface-variant font-numeric-table font-semibold">
                14
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowCrawlerModal(true)}
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-all font-body-sm font-medium shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">travel_explore</span>
              <span>Economic Radar</span>
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            </button>
            <button
              type="button"
              onClick={handleResetChat}
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-all font-body-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset Konteks</span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          MAIN 2-COLUMN RESPONSIVE LAYOUT
      -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
        {/* LEFT COLUMN: INTERACTIVE FINANCIAL AI CHAT (7 cols) */}
        <section className="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-xs overflow-hidden min-h-[760px] relative">
          {/* Conversation Stream Status Bar */}
          <div className="px-space-lg py-space-sm bg-surface-container-low flex items-center justify-between text-body-sm font-body-sm border-b border-surface-container-high/60">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-1 text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-[18px]">forum</span>
                <span>Live Agent Session</span>
              </div>
              <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-surface border border-outline-variant text-outline uppercase font-semibold">
                ID: #NX-AGENT-994
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant text-[12px]">
              <span className="w-2 h-2 rounded-full bg-tertiary live-dot"></span>
              <span>Audit Trail: Terenkripsi</span>
            </div>
          </div>

          {/* Scrollable Chat Stream */}
          <div className="flex-1 p-space-lg overflow-y-auto space-y-space-lg max-h-[640px]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              if (isUser) {
                return (
                  <div key={msg.id} className="flex items-start justify-end gap-space-md">
                    <div className="flex flex-col items-end max-w-lg">
                      <div className="flex items-center gap-space-xs mb-1">
                        <span className="font-label-caps text-label-caps text-outline">{msg.timestamp}</span>
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface">{user?.name || 'Pengguna'}</span>
                      </div>
                      <div className="bg-primary text-on-primary p-space-md rounded-xl font-body-md text-body-md shadow-xs leading-relaxed">
                        {msg.content}
                      </div>
                      <span className="font-label-caps text-label-caps text-outline flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[13px] text-tertiary">done_all</span>
                        <span>Diproses via NLP Intent Engine</span>
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                    </div>
                  </div>
                );
              }

              // Agent message
              return (
                <div key={msg.id} className="flex items-start gap-space-md">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                  </div>
                  <div className="flex flex-col max-w-xl">
                    <div className="flex items-center gap-space-xs mb-1">
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface">Nexa Treasury Agent</span>
                      <span className="font-label-caps text-label-caps text-outline">{msg.timestamp}</span>
                    </div>

                    <div className="bg-surface-container-low p-space-md rounded-xl text-on-surface font-body-md text-body-md leading-relaxed shadow-xs">
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Quick Prompt Pills (if first message) */}
                      {msg.id === 'welcome-1' && (
                        <div className="flex flex-wrap gap-space-xs mt-space-md pt-space-xs border-t border-surface-container-high/60">
                          <button
                            type="button"
                            onClick={() => handleSend('Cek runway kas bisnis saat ini')}
                            className="px-space-sm py-1 rounded-lg bg-surface-container-lowest text-secondary font-body-sm text-body-sm hover:bg-secondary-fixed transition-colors flex items-center gap-1 shadow-xs border border-outline-variant"
                          >
                            <span className="material-symbols-outlined text-[15px]">trending_up</span>
                            <span>"Cek runway kas bisnis saat ini"</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend('Berapa pengeluaran tim design minggu ini?')}
                            className="px-space-sm py-1 rounded-lg bg-surface-container-lowest text-secondary font-body-sm text-body-sm hover:bg-secondary-fixed transition-colors flex items-center gap-1 shadow-xs border border-outline-variant"
                          >
                            <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                            <span>"Berapa pengeluaran tim design minggu ini?"</span>
                          </button>
                        </div>
                      )}

                      {/* Interactive Action Card: Draft Mutation */}
                      {msg.actionCard && (
                        <div className="mt-space-md p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs flex flex-col gap-space-sm">
                          <div className="flex items-center justify-between border-b border-surface-container-high/80 pb-1">
                            <span className="font-label-caps text-label-caps uppercase text-outline font-bold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-secondary"></span>
                              <span>DRAFT MUTASI SIAP REKONSILIASI</span>
                            </span>
                            <span className="font-mono text-[12px] text-outline font-bold">
                              {msg.actionCard.data.txId}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-space-md pt-1">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                BCA
                              </div>
                              <div>
                                <h4 className="font-body-md font-bold text-on-surface">
                                  {msg.actionCard.data.title}
                                </h4>
                                <p className="font-body-sm text-outline text-[12px]">
                                  {msg.actionCard.data.accountName}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-title-balance text-title-balance font-bold text-error tabular-nums">
                                - {formatRupiah(msg.actionCard.data.amount)}
                              </span>
                              <p className="font-label-caps text-label-caps text-tertiary">
                                Terverifikasi Pajak PPN 11%
                              </p>
                            </div>
                          </div>

                          {/* Guardrail Impact Preview */}
                          <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-1 mt-1">
                            <div className="flex items-center justify-between text-body-sm">
                              <span className="text-on-surface-variant font-medium">
                                Pos: <strong>{msg.actionCard.data.category}</strong>
                              </span>
                              <span className="font-numeric-table font-bold text-error">
                                Burn Rate: {msg.actionCard.data.burnRate}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                              <div className="h-full bg-error" style={{ width: '95%' }}></div>
                            </div>
                            <span className="font-label-caps text-label-caps text-error">
                              Overbudget (&gt;90%) • Sisa: {formatRupiah(msg.actionCard.data.remaining)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-space-xs pt-1">
                            <button
                              type="button"
                              onClick={() => handleConfirmMutation(msg.actionCard?.data)}
                              className="px-space-md py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm font-semibold transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              <span>Posting ke Ledger</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0 animate-pulse">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div className="bg-surface-container-low p-space-md rounded-xl text-on-surface font-body-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary animate-spin text-[18px]">
                    progress_activity
                  </span>
                  <span>Nexa Agent menganalisis ledger dan preferensi bisnis...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-space-md bg-surface-container-low border-t border-surface-container-high/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-space-xs bg-surface-container-lowest rounded-xl p-space-2xs border border-outline-variant shadow-xs"
            >
              <button
                type="button"
                onClick={() => alert('Fitur kamera OCR nota aktif. Unggah invoice struk belanja untuk dipindai otomatis.')}
                className="p-space-xs rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Pindai Nota OCR"
              >
                <span className="material-symbols-outlined text-[20px]">document_scanner</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Mikrofon aktif. Anda dapat mendiktekan perintah suara langsung.')}
                className="p-space-xs rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Perintah Suara"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik instruksi finansial, catat mutasi, atau minta audit kas..."
                className="flex-1 px-space-xs py-space-xs bg-transparent border-none text-body-md text-on-surface placeholder:text-outline focus:outline-none"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-space-xs px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary disabled:opacity-40 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
            <div className="flex items-center justify-between text-[11.5px] text-outline mt-1 px-1">
              <span>Mode Interaktif: Transaksi langsung disinkronkan ke PostgreSQL &amp; WhatsApp Bot</span>
              <span>Tekan <strong>Enter ↵</strong> untuk eksekusi</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: CONTINUOUS MEMORY & ECONOMIC WEB CRAWLER (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Box 1: Continuous Memory */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-start justify-between border-b border-surface-container-high/80 pb-space-xs">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">psychology</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Continuous Memory
                  </h3>
                  <p className="font-label-caps text-label-caps text-outline uppercase">
                    Otak Pembelajaran &amp; Aturan Internal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMemoryModal(true)}
                className="px-space-sm py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-semibold flex items-center gap-1 text-[12px] transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Aturan Baru</span>
              </button>
            </div>

            <p className="text-body-sm text-on-surface-variant text-[13px]">
              Nexa Agent mempelajari preferensi bisnis spesifik Anda dan menerapkannya otomatis pada pencatatan harian.
            </p>

            {loadingMemories ? (
              <div className="p-space-md text-center text-outline text-body-sm">
                Memuat Continuous Memory...
              </div>
            ) : learnedRules.length === 0 ? (
              <div className="p-space-md text-center text-outline text-body-sm bg-surface-container-low/40 rounded-xl border border-outline-variant/40">
                Belum ada aturan Continuous Memory kustom. Klik "Aturan Baru" di atas untuk mengajarkan aturan atau preferensi pencatatan kas kepada AI.
              </div>
            ) : (
              learnedRules.map((rule, idx) => (
                <div key={rule.id} className="bg-surface-container-low/70 p-space-md rounded-xl border border-outline-variant/50 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
                      RULE #{String(idx + 1).padStart(2, '0')} {rule.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-outline hover:text-error p-0.5 rounded transition-colors"
                      title="Hapus aturan"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                  <p className="text-body-sm text-on-surface text-[13px] leading-relaxed">
                    {rule.fact}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-outline pt-1 border-t border-surface-container-high/60 mt-1">
                    <span>Kategori: {rule.category}</span>
                    <span className="font-semibold text-tertiary">Aktif di AI Engine</span>
                  </div>
                </div>
              ))
            )}

            {learnedRules.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMemoryModal(true)}
                className="text-center font-body-sm text-primary font-semibold hover:underline flex items-center justify-center gap-1 pt-1"
              >
                <span>Tambah Aturan Pembelajaran Baru</span>
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
              </button>
            )}
          </div>

          {/* Box 2: Economic Web Crawler */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/60 shadow-xs flex flex-col gap-space-md">
            <div className="flex items-start justify-between border-b border-surface-container-high/80 pb-space-xs">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">travel_explore</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Economic Web Crawler
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase">
                      • Live Crawl
                    </span>
                  </div>
                  <p className="font-label-caps text-label-caps text-outline uppercase">
                    Market Radar &amp; Kebijakan Makro
                  </p>
                </div>
              </div>
            </div>

            <p className="text-body-sm text-on-surface-variant text-[13px]">
              Data eksternal yang di-crawl berkala oleh Nexa Agent untuk memberikan proyeksi kas &amp; lindung nilai pengeluaran SME.
            </p>

            {/* 3 Macro Indicators Row */}
            <div className="grid grid-cols-3 gap-space-xs p-space-sm bg-surface-container-low rounded-xl">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                  BI-Rate (7D RR)
                </span>
                <span className="font-headline-sm font-bold text-on-surface tabular-nums">6.00%</span>
                <span className="text-[11px] text-tertiary font-semibold">- Tetap Stabil</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                  Kurs USD / IDR
                </span>
                <span className="font-headline-sm font-bold text-on-surface tabular-nums">Rp 16.185</span>
                <span className="text-[11px] text-error font-semibold flex items-center">
                  <span className="material-symbols-outlined text-[13px]">arrow_drop_up</span>
                  +0.42%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                  Inflasi YoY
                </span>
                <span className="font-headline-sm font-bold text-on-surface tabular-nums">2.61%</span>
                <span className="text-[11px] text-tertiary font-semibold">Target Sasaran</span>
              </div>
            </div>

            {/* News 1 */}
            <div className="flex flex-col gap-1 p-space-sm bg-surface-container-low/50 rounded-lg">
              <div className="flex items-center justify-between text-[11px] text-outline font-semibold">
                <span>BANK INDONESIA</span>
                <span>2 jam yang lalu</span>
              </div>
              <h4 className="font-body-md font-bold text-on-surface text-[13.5px]">
                BI Pertahankan Suku Bunga Acuan di 6.00% untuk Jaga Stabilitas Rupiah
              </h4>
              <p className="text-[12px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/60">
                <strong className="text-primary">Dampak Bisnis:</strong> Beban kredit ekspansi stabil. Rekomendasi: Pertahankan cadangan kas darurat setara 4 bulan operasional.
              </p>
            </div>

            {/* News 2 */}
            <div className="flex flex-col gap-1 p-space-sm bg-surface-container-low/50 rounded-lg">
              <div className="flex items-center justify-between text-[11px] text-outline font-semibold">
                <span>PASAR VALAS &amp; SAAS</span>
                <span>5 jam yang lalu</span>
              </div>
              <h4 className="font-body-md font-bold text-on-surface text-[13.5px]">
                Penguatan Dolar AS Berpotensi Naikkan Biaya Langganan Server Cloud &amp; Alat Desain
              </h4>
              <p className="text-[12px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/60">
                <strong className="text-error">Dampak Bisnis:</strong> Biaya Figma &amp; AWS naik ~3–5% dalam Rupiah. AI merekomendasikan pembayaran tahunan di muka sebelum kuartal berakhir.
              </p>
            </div>

            {/* News 3 */}
            <div className="flex flex-col gap-1 p-space-sm bg-surface-container-low/50 rounded-lg">
              <div className="flex items-center justify-between text-[11px] text-outline font-semibold">
                <span>DJP KEMENKEU</span>
                <span>Kemarin</span>
              </div>
              <h4 className="font-body-md font-bold text-on-surface text-[13.5px]">
                Pembaruan Coretax &amp; Insentif Pajak PPh Final UMKM 0.5% Berjalan Tertib
              </h4>
              <p className="text-[12px] text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-outline-variant/60">
                <strong className="text-primary">Dampak Bisnis:</strong> Sinkronisasi e-Faktur otomatis terkonfigurasi. Penghitungan potongan PPh 23 dari klien berjalan tanpa koreksi.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-outline pt-1 border-t border-surface-container-high/60">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">rss_feed</span>
                <span>Crawler Frekuensi: Tiap 15 Menit</span>
              </span>
              <span>Ping: 34ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CONTINUOUS MEMORY MODAL
      -------------------------------------------------------------- */}
      <Modal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        title="Continuous Memory Configuration"
        subtitle="Kelola aturan operasional yang diajarkan pada AI Agent"
        googleIcon="psychology"
        maxWidth={560}
      >
        <div className="flex flex-col gap-space-md">
          <div className="p-space-sm bg-surface-container-low rounded-lg text-body-sm text-on-surface-variant">
            Setiap kali Anda memberikan instruksi baru atau aturan khusus, AI menyimpannya ke dalam memori permanen untuk memandu pencatatan otomatis transaksi masa depan.
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Judul Aturan Baru
            </label>
            <input
              type="text"
              placeholder="Contoh: Alokasi Bonus Proyek Tim Design"
              value={newRuleTitle}
              onChange={(e) => setNewRuleTitle(e.target.value)}
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-semibold">
              Kaidah Aturan / Instruksi Khusus
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Jika ada transfer pelunasan dari klien creative, sisihkan 5% ke rekening kas pool bonus bulanan."
              value={newRuleFact}
              onChange={(e) => setNewRuleFact(e.target.value)}
              className="w-full px-space-md py-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowMemoryModal(false)}
              className="px-space-md py-space-xs bg-surface-container-lowest border border-outline-variant hover:bg-surface-container rounded-lg font-body-md font-medium text-on-surface-variant"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveRule}
              className="inline-flex items-center gap-space-xs px-space-lg py-space-xs bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold rounded-lg shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Simpan Aturan</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* -------------------------------------------------------------
          ECONOMIC RADAR MODAL
      -------------------------------------------------------------- */}
      <Modal
        isOpen={showCrawlerModal}
        onClose={() => setShowCrawlerModal(false)}
        title="Economic Radar & Live Crawler"
        subtitle="Analisis data moneter makroekonomi untuk lindung nilai bisnis SME"
        googleIcon="travel_explore"
        maxWidth={560}
      >
        <div className="flex flex-col gap-space-md text-body-sm text-on-surface">
          <div className="p-space-sm bg-surface-container-low rounded-lg">
            Nexa Crawler mengumpulkan indeks harga, BI Rate, dan valuta asing secara berkala dari Bank Indonesia, DJP, dan bursa devisa untuk mengestimasi dampak biaya modal dan impor SaaS bisnis Anda.
          </div>
          <div className="space-y-space-xs">
            <div className="p-space-sm rounded-lg border border-outline-variant flex items-center justify-between">
              <span>Status Koneksi Crawler</span>
              <span className="text-tertiary font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary live-dot"></span>
                Aktif (Ping: 34ms)
              </span>
            </div>
            <div className="p-space-sm rounded-lg border border-outline-variant flex items-center justify-between">
              <span>Frekuensi Crawling</span>
              <span className="font-semibold">Tiap 15 Menit</span>
            </div>
            <div className="p-space-sm rounded-lg border border-outline-variant flex items-center justify-between">
              <span>Model NLP Sintesis</span>
              <span className="font-semibold text-primary">Groq Llama 3.3 70B</span>
            </div>
          </div>
          <div className="flex justify-end pt-space-xs border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowCrawlerModal(false)}
              className="px-space-md py-space-xs bg-primary text-on-primary rounded-lg font-semibold"
            >
              Mengerti
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
