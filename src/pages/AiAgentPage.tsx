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
  Globe,
  Search,
  ExternalLink,
  BookOpen,
  Layers,
  X,
  RefreshCw,
  Brain,
  Target,
  BookmarkCheck,
  Plus,
} from 'lucide-react';
import { useWorkspace, Account } from '../context/WorkspaceContext';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';

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
  learnedMemory?: {
    title: string;
    fact: string;
    category: string;
  };
  actionCard?: {
    type: 'transaction' | 'balance' | 'cashflow' | 'budget' | 'web_rag' | 'memory_synthesis';
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
        'Halo Mas Iman Azizi! Saya adalah **Nexa AI Agent**, asisten otonom keuangan Anda.\n\nSaya tidak hanya bisa menjawab pertanyaan finansial, tetapi juga **dapat belajar dari percakapan Anda dan mengolah seluruh informasi secara mendalam**:\n- 🧠 **Continuous Learning & Memory**: Saya mengingat target, kebiasaan, dan preferensi yang Anda ajarkan.\n- ⚡ **Pencatatan Transaksi Otomatis**: Misal: *"Catat makan siang 35rb dari BCA"*\n- 🌐 **Full Web & Google Economic Crawling**: Meneliti berita ekonomi & moneter terkini.\n- 📊 **Pengolahan Informasi Real-Time**: Evaluasi target terhadap saldo & arus kas riil Anda.\n\nSilakan beri perintah atau ajarkan target/aturan baru Anda kapan saja!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Crawler Modal States
  const [showCrawlerModal, setShowCrawlerModal] = useState(false);
  const [modalTopic, setModalTopic] = useState('');
  const [modalSource, setModalSource] = useState<'GOOGLE_WEB' | 'DIRECT_URL'>('GOOGLE_WEB');
  const [crawlingModal, setCrawlingModal] = useState(false);
  const [crawlerResult, setCrawlerResult] = useState<any | null>(null);

  // Memory & Learning Modal States
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memories, setMemories] = useState<LearnedMemory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState<'FINANCIAL_GOAL' | 'FINANCIAL_RULE' | 'USER_PREFERENCE'>('FINANCIAL_GOAL');
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryFact, setNewMemoryFact] = useState('');
  const [addingMemory, setAddingMemory] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadMemories = async () => {
    if (!activeWorkspace) return;
    setLoadingMemories(true);
    try {
      const res = await apiFetch(`/workspaces/${activeWorkspace.id}/ai/memories`);
      if (res?.success) {
        setMemories(res.memories || []);
      }
    } catch (err) {
      console.warn('Failed to load memories:', err);
    } finally {
      setLoadingMemories(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [activeWorkspace]);

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
      else if (lower.includes('kas') && accNameLower.includes('kas')) matchedAccount = acc;
      else if (lower.includes('rdpu') && accNameLower.includes('rdpu')) matchedAccount = acc;
      else if (lower.includes(accNameLower)) matchedAccount = acc;
    }

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
            amount: local.amount,
            description: local.description,
            accountId: local.account?.id || accounts[0]?.id,
            accountName: local.account?.name || accounts[0]?.name || 'Rekening Utama',
          };
        }

        if (parsedData.amount > 0 && parsedData.accountId) {
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
    // AGENT INTENT 2: ECONOMIC & FINANCIAL WEB/GOOGLE CRAWLER (RAG)
    // ---------------------------------------------------------
    const isCrawlIntent =
      lower.includes('crawl') ||
      lower.includes('crawling') ||
      lower.includes('cari di google') ||
      lower.includes('google berita') ||
      lower.includes('berita ekonomi') ||
      lower.includes('analisis ekonomi') ||
      lower.startsWith('http://') ||
      lower.startsWith('https://');

    if (isCrawlIntent) {
      setActiveTool('Google & Web Economic Crawler (Neon pgvector)');
      try {
        let crawlQuery = promptText
          .replace(/tolong/gi, '')
          .replace(/coba/gi, '')
          .replace(/crawl(?:ing)?/gi, '')
          .replace(/cari di google/gi, '')
          .replace(/dari google/gi, '')
          .replace(/tentang/gi, '')
          .replace(/terbaru|terkini/gi, '')
          .trim();

        if (!crawlQuery || crawlQuery.length < 3) {
          crawlQuery = 'kebijakan moneter dan ekonomi Indonesia';
        }

        const isDirectUrl = /^https?:\/\//i.test(promptText);

        const res = await apiFetch(`/workspaces/${activeWorkspace.id}/rag/crawl`, {
          method: 'POST',
          body: JSON.stringify({
            query: isDirectUrl ? promptText.trim() : crawlQuery,
            source: isDirectUrl ? 'DIRECT_URL' : 'GOOGLE_WEB',
            limit: 4,
            crawlFullText: true,
          }),
        });

        if (res?.success) {
          const articles = res.articles || [];
          const agentMsg: Message = {
            id: `agent-${Date.now()}`,
            role: 'agent',
            content: `⚡ **Hasil Crawling Google & Web Ekonomi Berhasil Diindeks!**\n\nSaya telah meng-crawl **${res.crawledCount || articles.length} dokumen/artikel ekonomi** dan menyimpan **${res.totalChunksCount || articles.length} vektor semantik** ke dalam database Neon pgvector Anda.\n\nBerikut ringkasan dokumen yang berhasil diekstraksi secara real-time:`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            toolExecuted: {
              name: 'google_web_crawler',
              label: `Google Financial Crawler (${res.source || 'Web'})`,
              status: 'success',
            },
            actionCard: {
              type: 'web_rag',
              data: {
                query: crawlQuery,
                source: res.source,
                crawledCount: res.crawledCount,
                totalChunksCount: res.totalChunksCount,
                articles,
              },
            },
          };

          setMessages((prev) => [...prev, agentMsg]);
          setLoading(false);
          setActiveTool(null);
          return;
        }
      } catch (err: any) {
        console.error('Crawler execution error:', err);
      }
    }

    // ---------------------------------------------------------
    // AGENT INTENT 3: MEMORY & COGNITIVE PROGRESS SYNTHESIS QUERY
    // ---------------------------------------------------------
    const isMemorySynthesisIntent =
      lower.includes('apa yang kamu pelajari') ||
      lower.includes('kamu ingat apa') ||
      lower.includes('ingat apa saja') ||
      lower.includes('progress target') ||
      lower.includes('target saya') ||
      lower.includes('evaluasi target') ||
      lower.includes('memori saya');

    if (isMemorySynthesisIntent) {
      setActiveTool('Cognitive Memory & Information Processing Engine');
      await loadMemories();

      const goals = memories.filter((m) => m.category === 'FINANCIAL_GOAL');
      const rules = memories.filter((m) => m.category === 'FINANCIAL_RULE');
      const prefs = memories.filter((m) => m.category === 'USER_PREFERENCE');

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: `🧠 **Sintesis Pemahaman & Pengolahan Informasi AI**\n\nSaya mengingat dan memantau seluruh instruksi, target, dan aturan yang telah Anda ajarkan:\n- 🎯 **Target Finansial Terpantau**: ${goals.length} target\n- ⚡ **Aturan Transaksi Kustom**: ${rules.length} aturan aktif\n- 💡 **Preferensi & Gaya Hidup**: ${prefs.length} catatan\n\nBerikut adalah evaluasi real-time antara target yang Anda tetapkan dengan likuiditas kas saat ini (**${formatRupiah(totalBalance)}**):`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        toolExecuted: {
          name: 'memory_synthesis',
          label: 'Cognitive Memory & Information Synthesis Engine',
          status: 'success',
        },
        actionCard: {
          type: 'memory_synthesis',
          data: {
            goals,
            rules,
            prefs,
            totalBalance,
          },
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
      setLoading(false);
      setActiveTool(null);
      return;
    }

    // ---------------------------------------------------------
    // AGENT INTENT 4: CHECK SALDO & REKENING (Check Balances)
    // ---------------------------------------------------------
    const isBalanceIntent =
      lower.includes('saldo') ||
      lower.includes('rekening') ||
      lower.includes('portofolio') ||
      lower.includes('uang saya') ||
      lower.includes('kas tunai') ||
      (lower.includes('bca') && !isRecordIntent);

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
    // AGENT INTENT 5: AUDIT ARUS KAS & PENGELUARAN (Audit Cashflow)
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
    // AGENT INTENT 6: GENERAL FINANCIAL CHAT & CONTINUOUS LEARNING VIA LLM
    // ---------------------------------------------------------
    setActiveTool('Nexa AI Reasoning & Information Synthesis');
    try {
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
          label: 'Gemini 2.5 Active Cognitive Reasoning',
          status: 'success',
        },
        learnedMemory: res.learnedMemory || undefined,
      };

      setMessages((prev) => [...prev, agentMsg]);

      // If a new memory was learned, refresh memories state
      if (res.learnedMemory) {
        await loadMemories();
      }
    } catch {
      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: `Berdasarkan data keuangan terkini di **${activeWorkspace.name}**:\n- **Total Likuiditas**: ${formatRupiah(
          totalBalance
        )}\n- **Rekening Aktif**: ${accounts.map((a) => a.name).join(', ')}\n\nKondisi kas Anda siap untuk operasional harian. Anda dapat memberi perintah langsung seperti *"Catat beli kopi 25rb bayar bca"* atau ajarkan target baru seperti *"Target saya kumpulin 20 juta"*.`,
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

  const handleModalCrawl = async () => {
    if (!modalTopic.trim() || !activeWorkspace || crawlingModal) return;
    setCrawlingModal(true);
    setCrawlerResult(null);

    try {
      const isDirectUrl = modalSource === 'DIRECT_URL' || /^https?:\/\//i.test(modalTopic);
      const res = await apiFetch(`/workspaces/${activeWorkspace.id}/rag/crawl`, {
        method: 'POST',
        body: JSON.stringify({
          query: modalTopic.trim(),
          source: isDirectUrl ? 'DIRECT_URL' : 'GOOGLE_WEB',
          limit: 5,
          crawlFullText: true,
        }),
      });

      setCrawlerResult(res);
    } catch (err: any) {
      setCrawlerResult({ error: err.message || 'Gagal melakukan crawling' });
    } finally {
      setCrawlingModal(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryTitle.trim() || !newMemoryFact.trim() || !activeWorkspace || addingMemory) return;

    setAddingMemory(true);
    try {
      const res = await apiFetch(`/workspaces/${activeWorkspace.id}/ai/memories`, {
        method: 'POST',
        body: JSON.stringify({
          category: newMemoryCategory,
          title: newMemoryTitle.trim(),
          fact: newMemoryFact.trim(),
        }),
      });

      if (res?.success) {
        setNewMemoryTitle('');
        setNewMemoryFact('');
        await loadMemories();
      }
    } catch (err: any) {
      alert(`Gagal menyimpan memori: ${err.message}`);
    } finally {
      setAddingMemory(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!activeWorkspace) return;
    try {
      await apiFetch(`/workspaces/${activeWorkspace.id}/ai/memories?memoryId=${memoryId}`, {
        method: 'DELETE',
      });
      await loadMemories();
    } catch (err: any) {
      alert(`Gagal menghapus memori: ${err.message}`);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'agent',
        content:
          'Riwayat percakapan telah dibersihkan. Saya tetap mengingat seluruh aturan dan target yang telah Anda ajarkan sebelumnya, Mas Iman Azizi!',
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
                Continuous Learning Active
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
              Belajar dari chat user • Pengolahan informasi target • Vektorisasi Neon pgvector
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Memory Modal Trigger */}
          <button
            onClick={() => {
              loadMemories();
              setShowMemoryModal(true);
            }}
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#4f46e5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            title="Buka basis memori dan pemahaman AI"
          >
            <Brain size={14} />
            <span>Memori AI ({memories.length})</span>
          </button>

          {/* Web Crawler Modal Trigger */}
          <button
            onClick={() => setShowCrawlerModal(true)}
            style={{
              background: 'rgba(24, 122, 186, 0.08)',
              border: '1px solid rgba(24, 122, 186, 0.25)',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#187aba',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            title="Buka panel crawling web & Google ekonomi"
          >
            <Globe size={14} />
            <span>Web Crawler</span>
          </button>

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
          { label: '🧠 Cek Memori & Pemahaman AI', prompt: 'Apa saja yang sudah kamu pelajari tentang target dan kebiasaan saya?' },
          { label: '🎯 Cek Progress Target Finansial', prompt: 'Bagaimana progress target tabungan dan dana darurat saya sekarang?' },
          { label: '🌐 Crawl Berita Ekonomi Google', prompt: 'Crawl berita ekonomi terkini tentang inflasi dan BI-Rate dari Google' },
          { label: '⚡ Cek Saldo & Portofolio', prompt: 'Berapa saldo dan portofolio saya sekarang?' },
          { label: '✍️ Catat Makan 35rb (BCA)', prompt: 'Catat pengeluaran makan siang 35rb dari BCA' },
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

                {/* Newly Learned Memory Notification Badge */}
                {m.learnedMemory && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#4f46e5',
                      width: 'fit-content',
                    }}
                  >
                    <Brain size={13} />
                    <span>AI Mempelajari: &ldquo;{m.learnedMemory.title}&rdquo;</span>
                  </div>
                )}

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

                    {/* 2. Web & Google RAG Card */}
                    {m.actionCard.type === 'web_rag' && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #187aba',
                          borderRadius: '10px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 2px 10px rgba(24, 122, 186, 0.12)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#002244',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            <Globe size={16} color="#187aba" /> Dokumen Ekonomi Terindeks (Neon pgvector)
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#1d4ed8',
                            }}
                          >
                            {m.actionCard.data.totalChunksCount || m.actionCard.data.articles?.length} Vector Chunks
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {m.actionCard.data.articles?.map((art: any, i: number) => (
                            <div
                              key={i}
                              style={{
                                padding: '10px 12px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#187aba',
                                    background: '#e0f2fe',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {art.source || 'Google News'}
                                </span>
                                {art.category && (
                                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                                    {art.category}
                                  </span>
                                )}
                              </div>

                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                {art.title}
                              </div>

                              {art.snippet && (
                                <p style={{ fontSize: '12px', color: '#475569', margin: '2px 0 4px', lineHeight: 1.45 }}>
                                  {art.snippet.replace(/<[^>]+>/g, '').slice(0, 180)}...
                                </p>
                              )}

                              {art.url && (
                                <a
                                  href={art.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '11.5px',
                                    color: '#187aba',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    textDecoration: 'none',
                                    marginTop: '2px',
                                  }}
                                >
                                  <span>Buka Rujukan Asli</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Memory & Cognitive Synthesis Card */}
                    {m.actionCard.type === 'memory_synthesis' && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #6366f1',
                          borderRadius: '10px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          boxShadow: '0 2px 10px rgba(99, 102, 241, 0.12)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#312e81',
                              fontWeight: 800,
                              fontSize: '13.5px',
                            }}
                          >
                            <Brain size={17} color="#4f46e5" /> Pengolahan Target & Memori Pengguna
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowMemoryModal(true)}
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#4f46e5',
                              background: '#eef2ff',
                              border: 'none',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Kelola Memori →
                          </button>
                        </div>

                        {/* Goals with Progress Evaluation */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                            🎯 Evaluasi Target vs Saldo Riil ({formatRupiah(m.actionCard.data.totalBalance)}):
                          </div>
                          {m.actionCard.data.goals?.length === 0 ? (
                            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                              Belum ada target finansial yang diajarkan. Anda dapat mengetik &ldquo;Target saya kumpulin 20 juta&rdquo;.
                            </div>
                          ) : (
                            m.actionCard.data.goals?.map((g: LearnedMemory, i: number) => {
                              // extract nominal
                              const matchNum = g.fact.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i);
                              const targetVal = matchNum ? parseFloat(matchNum[1].replace(',', '.')) * 1000000 : 20000000;
                              const pct = Math.min(100, Math.round((m.actionCard.data.totalBalance / targetVal) * 100));

                              return (
                                <div
                                  key={i}
                                  style={{
                                    padding: '10px 12px',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{g.title}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5' }}>{pct}% Tercapai</span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{g.fact}</div>
                                  {/* Progress bar */}
                                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div
                                      style={{
                                        width: `${pct}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                                        borderRadius: '4px',
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Rules & Preferences */}
                        {m.actionCard.data.rules?.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>⚡ Aturan Transaksi Kustom Aktif:</div>
                            {m.actionCard.data.rules.map((r: LearnedMemory, i: number) => (
                              <div key={i} style={{ fontSize: '12px', color: '#1e293b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                                &bull; <strong>{r.title}</strong>: {r.actionableRule || r.fact}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. Account Balances Card */}
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

                    {/* 5. Cashflow Card */}
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

                    {/* 6. Budget Card */}
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
                  {activeTool ? `Agent Tool aktif: ${activeTool}...` : 'Nexa AI Agent sedang menganalisis & memproses...'}
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
            placeholder="Ketik instruksi ke Agent (contoh: 'Target saya kumpulin 20 juta', 'Crawl berita BI-Rate')..."
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

      {/* Memory & Continuous Learning Modal */}
      {showMemoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 34, 68, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Brain size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#002244' }}>
                    Cognitive Memory & Pemahaman AI
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Hal-hal yang dipelajari AI dari percakapan Anda (Neon pgvector)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMemoryModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form: Ajarkan Hal Baru */}
            <form
              onSubmit={handleAddMemory}
              style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                + Ajarkan Target / Aturan Baru ke AI
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                <select
                  className="form-select"
                  value={newMemoryCategory}
                  onChange={(e: any) => setNewMemoryCategory(e.target.value)}
                  style={{ fontSize: '12px' }}
                >
                  <option value="FINANCIAL_GOAL">🎯 Target Finansial</option>
                  <option value="FINANCIAL_RULE">⚡ Aturan Transaksi</option>
                  <option value="USER_PREFERENCE">💡 Preferensi Kebiasaan</option>
                </select>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Judul (contoh: Target Dana Darurat 20 Juta)"
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  required
                  style={{ fontSize: '12px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Instruksi lengkap (contoh: Kumpulkan dana darurat 20jt di RDPU tahun ini)"
                  value={newMemoryFact}
                  onChange={(e) => setNewMemoryFact(e.target.value)}
                  required
                  style={{ fontSize: '12px' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addingMemory || !newMemoryTitle.trim() || !newMemoryFact.trim()}
                  style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  {addingMemory ? 'Menyimpan...' : 'Ajarkan'}
                </button>
              </div>
            </form>

            {/* List of active learned memories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#002244' }}>
                  Daftar Memori Aktif ({memories.length})
                </span>
                {loadingMemories && <RefreshCw size={13} className="animate-spin" color="#187aba" />}
              </div>

              {memories.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '12.5px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                  Belum ada memori yang dipelajari. Chat AI seperti &ldquo;Target saya kumpulin 20 juta&rdquo; atau gunakan form di atas!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {memories.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '10px 12px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background:
                                m.category === 'FINANCIAL_GOAL'
                                  ? '#dcfce7'
                                  : m.category === 'FINANCIAL_RULE'
                                  ? '#e0e7ff'
                                  : '#fef3c7',
                              color:
                                m.category === 'FINANCIAL_GOAL'
                                  ? '#166534'
                                  : m.category === 'FINANCIAL_RULE'
                                  ? '#3730a3'
                                  : '#92400e',
                            }}
                          >
                            {m.category}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{m.title}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569' }}>{m.fact}</div>
                        {m.actionableRule && (
                          <div style={{ fontSize: '11px', color: '#4f46e5', fontStyle: 'italic' }}>
                            ⚡ Aturan: {m.actionableRule}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Hapus memori ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* On-Demand Web Crawler Modal */}
      {showCrawlerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 34, 68, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(24, 122, 186, 0.1)',
                    color: '#187aba',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#002244' }}>
                    Google & Web Economic Crawler
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Crawl data ekonomi real-time dan vektorisasi ke Neon pgvector
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCrawlerModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setModalSource('GOOGLE_WEB')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: modalSource === 'GOOGLE_WEB' ? '2px solid #187aba' : '1px solid #e2e8f0',
                  background: modalSource === 'GOOGLE_WEB' ? '#f0f9ff' : '#ffffff',
                  color: modalSource === 'GOOGLE_WEB' ? '#187aba' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                🌐 Google Berita Ekonomi
              </button>
              <button
                type="button"
                onClick={() => setModalSource('DIRECT_URL')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: modalSource === 'DIRECT_URL' ? '2px solid #187aba' : '1px solid #e2e8f0',
                  background: modalSource === 'DIRECT_URL' ? '#f0f9ff' : '#ffffff',
                  color: modalSource === 'DIRECT_URL' ? '#187aba' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                🔗 URL Website Spesifik
              </button>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                {modalSource === 'GOOGLE_WEB' ? 'Topik Ekonomi / Kata Kunci' : 'Alamat URL Lengkap Website'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={
                    modalSource === 'GOOGLE_WEB'
                      ? 'Contoh: Suku bunga acuan BI-Rate 2026, IHSG, Inflasi pangan...'
                      : 'Contoh: https://www.bi.go.id/id/publikasi/kajian/Pages/KSK.aspx'
                  }
                  value={modalTopic}
                  onChange={(e) => setModalTopic(e.target.value)}
                  disabled={crawlingModal}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleModalCrawl}
                  disabled={crawlingModal || !modalTopic.trim()}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {crawlingModal ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                  <span>{crawlingModal ? 'Crawling...' : 'Mulai Crawl'}</span>
                </button>
              </div>
            </div>

            {/* Modal Results Display */}
            {crawlerResult && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {crawlerResult.error ? (
                  <div style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                    ❌ {crawlerResult.error}
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> Berhasil di-crawl & diindeks ke Neon pgvector!
                      </span>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#187aba' }}>
                        {crawlerResult.totalChunksCount} Vektor Chunks
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                      {crawlerResult.articles?.map((art: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 10px',
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                          }}
                        >
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{art.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Sumber: {art.source} &bull; Kategori: {art.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
