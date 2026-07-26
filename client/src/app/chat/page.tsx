/**
 * Chat Page — IRIS Intelligence Chat
 * Full-height layout hosting the AI ChatBot component.
 */
'use client';

import React from 'react';
import ChatBot from '@/components/chat/ChatBot';
import styles from './page.module.css';
import PageBanner from '@/components/layout/PageBanner';

export default function ChatPage() {
  return (
    <main className={styles.main}>
      <PageBanner
        titleAccent="AI Intelligence"
        title="Chat"
        subtitle="Natural language queries across crime databases"
        imageSrc="/images/chat_banner.jpg"
      />
      <ChatBot />
    </main>
  );
}
