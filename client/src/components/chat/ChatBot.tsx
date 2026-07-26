/**
 * ChatBot.tsx — Full AI chat interface for Project IRIS
 * Features: message bubbles, data tables/stats/lists in AI responses,
 * typing indicator, voice input (Web Speech API), PDF export (jsPDF),
 * welcome screen with suggested queries, and collapsible generated SQL.
 */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChatBot.module.css';
import { getAIResponse, ChatResponse } from '@/data/chatMockResponses';

/* ── SpeechRecognition type shim ─────────────────────────── */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

/* ── Message interface ───────────────────────────────────── */
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  data?: ChatResponse['data'];
  query?: string;
  suggestions?: string[];
}

/* ── Welcome screen suggested queries ────────────────────── */
const WELCOME_SUGGESTIONS = [
  {
    icon: '📊',
    title: 'Cybercrime Trends',
    query: 'Show cybercrime trends in Bengaluru',
  },
  {
    icon: '🔁',
    title: 'Repeat Offenders',
    query: 'Who are the repeat offenders?',
  },
  {
    icon: '📈',
    title: 'Crime Statistics',
    query: 'Show me the latest crime trend analysis',
  },
  {
    icon: '🔍',
    title: 'Case Matching',
    query: 'Find similar cases to FIR #10443',
  },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'kn-IN'>('en-IN');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Auto-scroll to latest message ─────────────────────── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /* ── Send message handler ──────────────────────────────── */
  const handleSend = useCallback(
    (text: string = input) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      /* Add user message */
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      /* Simulate async AI processing */
      setTimeout(async () => {
        try {
          const response = await getAIResponse(trimmed);
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: response.text,
            timestamp: new Date(),
            data: response.data,
            query: response.query,
            suggestions: response.suggestions,
          };
          setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
          const errMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: 'Error connecting to Catalyst Zia AI.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errMsg]);
        } finally {
          setIsTyping(false);
        }
      }, 500);
    },
    [input]
  );

  /* ── Voice input (Web Speech API) ──────────────────────── */
  const startVoiceInput = useCallback(() => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        /* Auto-send after a brief delay so user can see the transcript */
        setTimeout(() => handleSend(transcript), 300);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      alert('Speech recognition is not available.');
    }
  }, [handleSend]);

  /* ── PDF export (jsPDF) ────────────────────────────────── */
  const exportToPDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let y = 20;

      /* Title */
      pdf.setFontSize(16);
      pdf.setTextColor(0, 212, 170);
      pdf.text('IRIS Intelligence Chat — Export', margin, y);
      y += 8;

      pdf.setFontSize(8);
      pdf.setTextColor(140, 140, 160);
      pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, y);
      y += 12;

      /* Messages */
      pdf.setFontSize(10);
      messages.forEach((msg) => {
        const prefix = msg.sender === 'user' ? '👤 You' : '🤖 IRIS';
        const time = msg.timestamp.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });

        /* Check page overflow */
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }

        pdf.setTextColor(msg.sender === 'user' ? 0 : 0, msg.sender === 'user' ? 180 : 140, msg.sender === 'user' ? 150 : 160);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${prefix}  [${time}]`, margin, y);
        y += 5;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        const lines = pdf.splitTextToSize(msg.text, maxWidth);
        lines.forEach((line: string) => {
          if (y > 275) { pdf.addPage(); y = 20; }
          pdf.text(line, margin, y);
          y += 5;
        });

        y += 6;
      });

      pdf.save('IRIS_Chat_Report.pdf');
    } catch {
      alert('Failed to export PDF. Please try again.');
    }
  }, [messages]);

  /* ── Format timestamp ──────────────────────────────────── */
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.container}>
      {/* ── Header ───────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerLogo}>
            <span className={styles.logoGlyph}>◆</span>
            IRIS
          </div>
          <h2 className={styles.headerTitle}>Intelligence Chat</h2>
          <span className={styles.headerBeta}>AI-POWERED</span>
        </div>
        <div className={styles.headerActions}>
          {messages.length > 0 && (
            <button className={styles.exportBtn} onClick={exportToPDF} title="Export chat to PDF">
              <span>📄</span> Export PDF
            </button>
          )}
          {messages.length > 0 && (
            <button
              className={styles.clearBtn}
              onClick={() => setMessages([])}
              title="Clear conversation"
            >
              <span>🗑️</span> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Area ────────────────────────────────── */}
      <div className={styles.messagesArea} ref={chatContainerRef}>
        {messages.length === 0 ? (
          /* ── Welcome Screen ────────────────────────────── */
          <div className={styles.welcome}>
            <div className={styles.welcomeLogo}>
              <div className={styles.welcomeGlow} />
              <span className={styles.welcomeIcon}>◆</span>
              <span className={styles.welcomeText}>IRIS</span>
            </div>
            <p className={styles.welcomeSubtitle}>
              Karnataka State Police Intelligence Assistant
            </p>
            <h3 className={styles.welcomePrompt}>What would you like to investigate?</h3>
            <div className={styles.suggestionsGrid}>
              {WELCOME_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className={styles.suggestionCard}
                  onClick={() => handleSend(s.query)}
                >
                  <span className={styles.suggestionIcon}>{s.icon}</span>
                  <span className={styles.suggestionTitle}>{s.title}</span>
                  <span className={styles.suggestionQuery}>{s.query}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message Thread ────────────────────────────── */
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${styles[msg.sender]}`}
              >
                {msg.sender === 'ai' && (
                  <div className={styles.avatar}>
                    <span>◆</span>
                  </div>
                )}
                <div className={styles.messageContent}>
                  <div className={`${styles.bubble} ${styles[`bubble_${msg.sender}`]}`}>
                    <p className={styles.bubbleText}>{msg.text}</p>

                    {/* ── Table response ────────────────── */}
                    {msg.data?.type === 'table' && (
                      <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                          <thead>
                            <tr>
                              {msg.data.content.headers.map((h: string, i: number) => (
                                <th key={i}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.data.content.rows.map((row: any[], i: number) => (
                              <tr key={i}>
                                {row.map((cell: any, j: number) => (
                                  <td key={j}>{typeof cell === 'number' ? cell.toLocaleString() : cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ── Stats response ────────────────── */}
                    {msg.data?.type === 'stats' && (
                      <div className={styles.statsGrid}>
                        {msg.data.content.map((stat: any, i: number) => (
                          <div key={i} className={styles.statCard}>
                            <div className={styles.statCardLabel}>{stat.label}</div>
                            <div
                              className={styles.statCardValue}
                              style={{ color: `var(--accent-${stat.color})` }}
                            >
                              {stat.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── List response ──────────────────── */}
                    {msg.data?.type === 'list' && (
                      <div className={styles.listWrapper}>
                        {msg.data.content.map((item: any, i: number) => (
                          <div key={i} className={styles.listItem}>
                            <div className={styles.listItemHeader}>
                              <strong>{item.name}</strong>
                              {item.risk && (
                                <span
                                  className={`${styles.riskBadge} ${
                                    styles[`risk_${item.risk.toLowerCase()}`]
                                  }`}
                                >
                                  {item.risk}
                                </span>
                              )}
                            </div>
                            {item.cases && (
                              <span className={styles.listItemMeta}>
                                {item.cases} cases — {item.type}
                                {item.district ? ` · ${item.district}` : ''}
                              </span>
                            )}
                            {item.desc && (
                              <p className={styles.listItemDesc}>{item.desc}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Generated SQL collapsible ────────── */}
                  {msg.query && (
                    <details className={styles.queryDetails}>
                      <summary>View Generated Query</summary>
                      <code>{msg.query}</code>
                    </details>
                  )}

                  {/* ── Suggestion pills ─────────────────── */}
                  {msg.suggestions && (
                    <div className={styles.pillsRow}>
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          className={styles.pill}
                          onClick={() => handleSend(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── Timestamp ─────────────────────────── */}
                  <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {/* ── Typing indicator ────────────────────────── */}
            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.ai}`}>
                <div className={styles.avatar}>
                  <span>◆</span>
                </div>
                <div className={`${styles.bubble} ${styles.bubble_ai}`}>
                  <div className={styles.typingIndicator}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Bar ────────────────────────────────────── */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask IRIS about crime data, patterns, suspects…"
            disabled={isTyping}
          />
          <button
            className={`${styles.iconBtn} ${isListening ? styles.listening : ''}`}
            onClick={startVoiceInput}
            title={`Voice Input (${speechLang === 'en-IN' ? 'English' : 'Kannada'})`}
            disabled={isTyping}
          >
            🎤
          </button>
          <button
            className={styles.langToggleBtn}
            onClick={() => setSpeechLang(prev => prev === 'en-IN' ? 'kn-IN' : 'en-IN')}
            title="Toggle Speech Language (EN/KN)"
            disabled={isTyping || isListening}
            style={{ 
              background: 'transparent', border: '1px solid #333', color: '#e8e8ed', 
              borderRadius: '4px', padding: '0 8px', fontSize: '0.8rem', cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            {speechLang === 'en-IN' ? 'EN' : 'KN'}
          </button>
          <button
            className={styles.sendBtn}
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            title="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.inputHint}>
          IRIS can analyze FIRs, find patterns, and query the crime intelligence database.
        </div>
      </div>
    </div>
  );
}
