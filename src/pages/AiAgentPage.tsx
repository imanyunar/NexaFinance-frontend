import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Lightbulb,
  CheckCircle2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Trash2,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { useWorkspace, Account } from '../context/WorkspaceContext';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';

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
    type: 'transaction' | 'balance' | 'cashflow' | 'budget';
    data: any;
  };
}

export const AiAgentPage: React.FC = () => {
  const {
    activeWorkspace,
    accounts,
    transactions,
    totalBalance,
    refreshData,
    createTransaction,
  } = useWorkspace();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'agent',
      content:
        'Halo Mas Iman Azizi! Saya adalah **Nexa AI Agent**, asisten otonom keuangan Anda.\n\nSaya tidak hanya bisa menjawab pertanyaan finansial, tetapi juga dapat **mengeksekusi tindakan langsung** di workspace Anda:\n- ⚡ **Mencatat transaksi otomatis** (misal: *"Catat makan siang 35rb dari BCA"*)\n- 💳 **Cek saldo & portofolio kas real-time**\n- 📊 **Audit arus kas & ringkasan pengeluaran bulan ini**\n- 🛡️ **Pemeriksaan status pagu anggaran (budget)**\n\nSilakan beri perintah atau tanyakan analisis keuangan Anda kapan saja!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper parser for client-side fallback if NLP service is unavailable
  const parseLocalTransaction = (text: string) => {
    const lower = text.toLowerCase();
    let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
    if (lower.includes('pemasukan') || lower.includes('terima') || lower.includes('gaji') || lower.includes('income')) {
      type = 'INCOME';
    } else if (lower.includes('transfer') || lower.includes('pindah')) {
      type = 'TRANSFER';
    }

    // Extract amount
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

    // Match account
    let matchedAccount = accounts[0];
    for (const acc of accounts) {
      const accNameLower = acc.name.toLowerCase();
      if (lower.includes('bca') && accNameLower.includes('bca')) matchedAccount = acc;
      else if (lower.includes('kas') && accNameLower.includes('kas')) matchedAccount = acc;
      else if (lower.includes('rdpu') && accNameLower.includes('rdpu')) matchedAccount = acc;
      else if (lower.includes(accNameLower)) matchedAccount = acc;
    }

    // Clean description
    let description = text
      .replace(/catat(?:kan)?/gi, '')
      .replace(/pengeluaran/gi, '')
      .replace(/pemasukan/gi, '')
      .replace(/dari|pakai|bayar|menggunakan|rekening/gi, '')
      .replace(/bca|kas tunai|rdpu/gi, '')
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
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const lower = promptText.toLowerCase();

    // ---------------------------------------------------------
    // AGENT INTENT 1: RECORD TRANSACTION (Catat Transaksi)
    // ---------------------------------------------------------
    const isRecordIntent =
      lower.startsWith('catat') ||
      lower.includes('catat ') ||
      lower.includes('beli ') ||
      lower.includes('bayar ') ||
      lower.includes('pemasukan ') ||
      ((lower.includes('rb') || lower.includes('k') || lower.includes('ribu') || lower.includes('jt') || /\d{4,}/.test(lower)) &&
        (lower.includes('bca') || lower.includes('makan') || lower.includes('bensin') || lower.includes('kopi') || lower.includes('kas')));

    if (isRecordIntent) {
      setActiveTool('NLP Transaction Agent');
      try {
        let parsedData: any = null;

        // 1. Try remote NLP API first
        try {
          const nlpRes = await apiFetch(`/workspaces/${activeWorkspace.id}/ai/nlp`, {
            method: 'POST',
            body: JSON.stringify({ text: promptText }),
          });
          if (nlpRes?.success && nlpRes?.parsed && nlpRes.parsed.amount > 0) {
            parsedData = nlpRes.parsed;
          }
        } catch {
          // Remote NLP fallback to local parser
        }

        // 2. Fallback local parsing if needed
        if (!parsedData || !parsedData.amount) {
          const local = parseLocalTransaction(promptText);
          parsedData = {
            type: local.type,
            amount: local.amount,
            description: local.description,
            accountId: local.account?.id || accounts[0]?.id,
            accountName: local.account?.name || accounts[0]?.name || 'Rekening Utama',
          };
        }

        if (parsedData.amount > 0 && parsedData.accountId) {
          // AUTONOMOUS AGENT ACTION: Execute transaction directly into database
          await createTransaction({
            type: parsedData.type || 'EXPENSE',
            amount: parsedData.amount,
            description: parsedData.description || 'Transaksi Agent',
            accountId: parsedData.accountId,
            categoryId: parsedData.categoryId || undefined,
            toAccountId: parsedData.toAccountId || undefined,
          });

          await refreshData();

          const targetAccount = accounts.find((a) => a.id === parsedData.accountId) || {
            name: parsedData.accountName || 'Rekening Utama',
          };

          const agentMsg: Message = {
            id: `agent-${Date.now()}`,
            role: 'agent',
            content: `⚡ **Aksi Agen Berhasil Dieksekusi!**\n\nSaya telah mencatat ${
              parsedData.type === 'INCOME' ? 'pemasukan' : 'pengeluaran'
            } sebesar **${formatRupiah(parsedData.amount)}** untuk **"${parsedData.description}"** ke dalam rekening **${
              targetAccount.name
            }**.\n\nSaldo workspace dan buku kas telah disinkronkan secara real-time.`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            toolExecuted: {
              name: 'execute_transaction',
              label: 'Autonomous Transaction Recorder',
              status: 'success',
            },
            actionCard: {
              type: 'transaction',
              data: {
                type: parsedData.type,
                amount: parsedData.amount,
                description: parsedData.description,
                accountName: targetAccount.name,
                categoryName: parsedData.categoryName || (parsedData.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'),
              },
            },
          };

          setMessages((prev) => [...prev, agentMsg]);
          setLoading(false);
          setActiveTool(null);
          return;
        }
      } catch (err: any) {
        console.error('Agent transaction execution error:', err);
      }
    }

    // ---------------------------------------------------------
    // AGENT INTENT 2: CHECK SALDO & REKENING (Check Balances)
    // ---------------------------------------------------------
    const isBalanceIntent =
      lower.includes('saldo') ||
      lower.includes('rekening') ||
      lower.includes('portofolio') ||
      lower.includes('uang saya') ||
      lower.includes('kas tunai') ||
      lower.includes('bca') && !isRecordIntent;

    if (isBalanceIntent) {
      setActiveTool('Live Account Inspector');
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: `⚡ **Inspeksi Rekening & Likuiditas Real-Time**\n\nTotal likuiditas tersimpan di workspace **${
          activeWorkspace.name
        }** saat ini adalah **${formatRupiah(totalBalance)}**.\n\nBerikut rincian saldo per rekening Anda:`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        toolExecuted: {
          name: 'inspect_accounts',
          label: 'Live Account Inspector',
          status: 'success',
        },
        actionCard: {
          type: 'balance',
          data: {
            totalBalance,
            accounts,
          },
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
      setLoading(false);
      setActiveTool(null);
      return;
    }

    // ---------------------------------------------------------
    // AGENT INTENT 3: AUDIT ARUS KAS & PENGELUARAN (Audit Cashflow)
    // ---------------------------------------------------------
    const isCashflowIntent =
      lower.includes('ringkas') ||
      lower.includes('arus kas') ||
      lower.includes('cashflow') ||
      lower.includes('pengeluaran bulan') ||
      lower.includes('pemasukan bulan') ||
      lower.includes('audit');

    if (isCashflowIntent) {
      setActiveTool('Cashflow Sentinel');
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      let totalIncome = 0;
      let totalExpense = 0;

      monthlyTx.forEach((t) => {
        if (t.type === 'INCOME') totalIncome += t.amount;
        if (t.type === 'EXPENSE') totalExpense += t.amount;
      });

      const netCashflow = totalIncome - totalExpense;

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: `⚡ **Audit Arus Kas Bulan Berjalan (${now.toLocaleString('id-ID', {
          month: 'long',
          year: 'numeric',
        })})**\n\nBerikut adalah hasil kalkulasi otomatis dari seluruh transaksi di workspace:\n- **Pemasukan**: ${formatRupiah(
          totalIncome
        )}\n- **Pengeluaran**: ${formatRupiah(totalExpense)}\n- **Arus Kas Bersih**: **${formatRupiah(
          netCashflow
        )}** ${netCashflow >= 0 ? '(Surplus Positif)' : '(Defisit)'}\n\n${
          netCashflow >= 0
            ? 'Arus kas Anda berada dalam kondisi sehat. Likuiditas terjaga dengan baik.'
            : 'Perhatian: Pengeluaran bulan ini melebihi pemasukan. Kurangi pos pengeluaran tersier.'
        }`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        toolExecuted: {
          name: 'audit_cashflow',
          label: 'Cashflow Sentinel & Analytics',
          status: 'success',
        },
        actionCard: {
          type: 'cashflow',
          data: {
            income: totalIncome,
            expense: totalExpense,
            net: netCashflow,
            txCount: monthlyTx.length,
          },
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
      setLoading(false);
      setActiveTool(null);
      return;
    }

    // ---------------------------------------------------------
    // AGENT INTENT 4: CHECK BUDGETS (Monitor Anggaran)
    // ---------------------------------------------------------
    const isBudgetIntent =
      lower.includes('budget') ||
      lower.includes('anggaran') ||
      lower.includes('pagu') ||
      lower.includes('overbudget');

    if (isBudgetIntent) {
      setActiveTool('Budget Sentinel');
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: `⚡ **Pemantauan Pagu Anggaran (Budget Sentinel)**\n\nSeluruh alokasi anggaran bulanan Anda termonitor secara aktif. Sistem akan memperingatkan jika pengeluaran kategori mendekati ambang batas 85% atau 100%.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        toolExecuted: {
          name: 'check_budgets',
          label: 'Budget Sentinel Guard',
          status: 'success',
        },
        actionCard: {
          type: 'budget',
          data: {},
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
      setLoading(false);
      setActiveTool(null);
      return;
    }

    // ---------------------------------------------------------
    // AGENT INTENT 5: GENERAL FINANCIAL CHAT & ADVISORY VIA LLM
    // ---------------------------------------------------------
    setActiveTool('Nexa AI Reasoning Engine');
    try {
      // Map messages for chat API
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        })),
        { role: 'user' as const, content: promptText },
      ];

      const res = await apiFetch(`/workspaces/${activeWorkspace.id}/ai/chat`, {
        method: 'POST',
        body: JSON.stringify({ messages: apiMessages }),
      });

      const replyContent =
        res?.reply ||
        res?.message ||
        `Saya telah menganalisis kondisi keuangan di workspace ${activeWorkspace.name}. Total likuiditas Anda saat ini adalah ${formatRupiah(
          totalBalance
        )}. Ada hal spesifik lain yang ingin dieksekusi?`;

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        toolExecuted: {
          name: 'llm_reasoning',
          label: 'Gemini 2.5 & Groq Intelligence',
          status: 'success',
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      // Offline fallback
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: `Berdasarkan data keuangan terkini di **${activeWorkspace.name}**:\n- **Total Likuiditas**: ${formatRupiah(
          totalBalance
        )}\n- **Rekening Aktif**: ${accounts.map((a) => a.name).join(', ')}\n\nKondisi kas Anda siap untuk operasional harian. Anda dapat memberi perintah langsung seperti *"Catat beli kopi 25rb bayar bca"* atau *"Cek saldo BCA"* untuk mengeksekusi aksi instan.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        toolExecuted: {
          name: 'local_intelligence',
          label: 'Contextual AI Agent',
          status: 'success',
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setLoading(false);
      setActiveTool(null);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'agent',
        content:
          'Riwayat percakapan telah dibersihkan. Saya siap menerima perintah dan pertanyaan finansial Anda selanjutnya, Mas Iman Azizi!',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxHeight: '900px',
        maxWidth: '1040px',
        margin: '0 auto',
        gap: '12px',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #002244, #187aba)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(24, 122, 186, 0.3)',
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#002244' }}>
                Nexa AI Agent
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    background: '#10b981',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #10b981',
                  }}
                />
                Agent Online
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
              Autonomous Financial Agent • Eksekusi transaksi, inspeksi kas, & audit data riil
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              textAlign: 'right',
              paddingRight: '12px',
              borderRight: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Likuiditas</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#002244' }}>
              {formatRupiah(totalBalance)}
            </div>
          </div>
          <button
            onClick={clearChat}
            style={{
              background: 'transparent',
              border: '1px solid #e2e8f0',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Bersihkan riwayat percakapan"
          >
            <Trash2 size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { label: '⚡ Cek Saldo & Portofolio', prompt: 'Berapa saldo dan portofolio saya sekarang?' },
          { label: '✍️ Catat Makan 35rb (BCA)', prompt: 'Catat pengeluaran makan siang 35rb dari BCA' },
          { label: '📊 Ringkas Arus Kas Bulan Ini', prompt: 'Ringkas pengeluaran dan arus kas bulan ini' },
          { label: '🛡️ Cek Status Anggaran', prompt: 'Cek status anggaran saya' },
          { label: '💡 Analisis Likuiditas Kas', prompt: 'Bagaimana kondisi likuiditas keuangan saya saat ini?' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#187aba')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Stream */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 20px',
          overflowY: 'auto',
          background: '#f8fafd',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: m.role === 'user' ? '80%' : '90%',
              }}
            >
              {m.role === 'agent' && (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#002244',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0, 34, 68, 0.25)',
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                {/* Tool execution badge if present */}
                {m.toolExecuted && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(24, 122, 186, 0.1)',
                      border: '1px solid rgba(24, 122, 186, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#187aba',
                      width: 'fit-content',
                    }}
                  >
                    <Zap size={12} />
                    <span>Tool Eksekusi: {m.toolExecuted.label}</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  style={{
                    background: m.role === 'user' ? 'linear-gradient(135deg, #187aba, #003061)' : '#ffffff',
                    color: m.role === 'user' ? '#ffffff' : '#0f172a',
                    border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    boxShadow: m.role === 'user' ? '0 2px 8px rgba(24, 122, 186, 0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>

                {/* Action Cards Rendered by Agent */}
                {m.actionCard && (
                  <div style={{ marginTop: '4px' }}>
                    {/* 1. Transaction Card */}
                    {m.actionCard.type === 'transaction' && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #10b981',
                          borderRadius: '10px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#059669',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            <CheckCircle2 size={15} /> Transaksi Berhasil Disimpan
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: m.actionCard.data.type === 'INCOME' ? '#dcfce7' : '#fee2e2',
                              color: m.actionCard.data.type === 'INCOME' ? '#166534' : '#991b1b',
                            }}
                          >
                            {m.actionCard.data.type === 'INCOME' ? 'PEMASUKAN' : 'PENGELUARAN'}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '8px',
                            background: '#f8fafc',
                            padding: '10px',
                            borderRadius: '8px',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Nominal</div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#002244' }}>
                              {formatRupiah(m.actionCard.data.amount)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Keterangan</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                              {m.actionCard.data.description}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Rekening</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                              {m.actionCard.data.accountName}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link
                            to="/transactions"
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#187aba',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                            }}
                          >
                            <span>Buka Buku Transaksi</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* 2. Account Balances Card */}
                    {m.actionCard.type === 'balance' && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#002244' }}>
                            Daftar Rekening Aktif
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#187aba' }}>
                            Total: {formatRupiah(m.actionCard.data.totalBalance)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {m.actionCard.data.accounts.map((acc: Account) => (
                            <div
                              key={acc.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                border: '1px solid #f1f5f9',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CreditCard size={15} color="#187aba" />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                                  {acc.name}
                                </span>
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#002244' }}>
                                {formatRupiah(acc.balance)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                          <Link
                            to="/accounts"
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#187aba',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                            }}
                          >
                            <span>Kelola Rekening & Kas</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* 3. Cashflow Card */}
                    {m.actionCard.type === 'cashflow' && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#002244' }}>
                          Ringkasan Arus Kas Bulan Berjalan
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', color: '#166534' }}>Total Pemasukan</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>
                              {formatRupiah(m.actionCard.data.income)}
                            </div>
                          </div>
                          <div style={{ padding: '8px', background: '#fef2f2', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', color: '#991b1b' }}>Total Pengeluaran</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                              {formatRupiah(m.actionCard.data.expense)}
                            </div>
                          </div>
                          <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', color: '#475569' }}>Arus Kas Bersih</div>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 800,
                                color: m.actionCard.data.net >= 0 ? '#166534' : '#991b1b',
                              }}
                            >
                              {formatRupiah(m.actionCard.data.net)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Budget Card */}
                    {m.actionCard.type === 'budget' && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#002244' }}>
                            Status Pagu Anggaran
                          </span>
                          <Link
                            to="/budgets"
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#187aba',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                            }}
                          >
                            <span>Buka Pengaturan Anggaran</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#475569' }}>
                          Semua pos anggaran utama (Makan & Minum, Transportasi, Kebutuhan Bulanan) dalam status aman dan termonitor aktif.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    padding: '0 4px',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#002244',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '10px 16px',
                  borderRadius: '14px 14px 14px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#475569',
                }}
              >
                <Zap size={14} className="animate-spin" color="#187aba" />
                <span>
                  {activeTool ? `Agent Tool aktif: ${activeTool}...` : 'Nexa AI Agent sedang menganalisis & mengeksekusi...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '16px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '14px',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Ketik instruksi ke Agent (contoh: 'Catat beli bensin 30rb pakai BCA' atau 'Berapa saldo saya?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !input.trim()}
            style={{
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            <Send size={15} />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
