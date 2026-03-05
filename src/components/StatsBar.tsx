'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPollService } from '@/lib/pollService';

interface Stats {
  totalPolls: number;
  totalVotes: number;
  totalXLM: number;
  yourEarnings: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({
    totalPolls: 0,
    totalVotes: 0,
    totalXLM: 0,
    yourEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const pollService = getPollService();
      
      // Toplam anket sayısını al
      const pollCount = await pollService.getPollCount();
      
      let totalVotes = 0;
      let totalXLM = 0;
      
      // Her anketin verilerini al
      for (let i = 0; i < pollCount; i++) {
        const poll = await pollService.getPoll(i);
        if (poll) {
          const pollVotes = poll.votes.reduce((sum, v) => sum + v, 0);
          totalVotes += pollVotes;
          totalXLM += poll.reward_pool;
        }
      }
      
      setStats({
        totalPolls: pollCount,
        totalVotes,
        totalXLM,
        yourEarnings: 0, // Claim edilen ödüller için ayrı bir tracking gerekli
      });
    } catch (err) {
      console.error('[MicroPoll] Fetch stats error:', err);
      // Hata durumunda 0 değerleri göster
      setStats({
        totalPolls: 0,
        totalVotes: 0,
        totalXLM: 0,
        yourEarnings: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Her 10 saniyede güncelle
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="brutalist-card flex items-center gap-3">
          <div className="w-4 h-4 bg-[#FF0000] flex-shrink-0" />
          <div>
            <div className="text-xs uppercase font-bold text-gray-600">Total Polls</div>
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>

        <div className="brutalist-card flex items-center gap-3">
          <div className="w-4 h-4 bg-[#0000FF] rotate-45 flex-shrink-0" />
          <div>
            <div className="text-xs uppercase font-bold text-gray-600">Total Votes</div>
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>

        <div className="brutalist-card flex items-center gap-3">
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-[#FFFF00] flex-shrink-0" />
          <div>
            <div className="text-xs uppercase font-bold text-gray-600">XLM Pooled</div>
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>

        <div className="brutalist-card flex items-center gap-3">
          <div className="w-4 h-4 bg-[#800080] flex-shrink-0" />
          <div>
            <div className="text-xs uppercase font-bold text-gray-600">Your Earnings</div>
            <div className="text-2xl font-bold">...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Toplam Anketler - kırmızı nokta */}
      <div className="brutalist-card flex items-center gap-3">
        <div className="w-4 h-4 bg-[#FF0000] flex-shrink-0" />
        <div>
          <div className="text-xs uppercase font-bold text-gray-600">Total Polls</div>
          <div className="text-2xl font-bold">{stats.totalPolls}</div>
        </div>
      </div>

      {/* Toplam Oylar - mavi elmas */}
      <div className="brutalist-card flex items-center gap-3">
        <div className="w-4 h-4 bg-[#0000FF] rotate-45 flex-shrink-0" />
        <div>
          <div className="text-xs uppercase font-bold text-gray-600">Total Votes</div>
          <div className="text-2xl font-bold">{stats.totalVotes}</div>
        </div>
      </div>

      {/* Toplam XLM Havuzu - sarı üçgen */}
      <div className="brutalist-card flex items-center gap-3">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-[#FFFF00] flex-shrink-0" />
        <div>
          <div className="text-xs uppercase font-bold text-gray-600">XLM Pooled</div>
          <div className="text-2xl font-bold">{stats.totalXLM}</div>
        </div>
      </div>

      {/* Kazanımlarınız - mor kare */}
      <div className="brutalist-card flex items-center gap-3">
        <div className="w-4 h-4 bg-[#800080] flex-shrink-0" />
        <div>
          <div className="text-xs uppercase font-bold text-gray-600">Your Earnings</div>
          <div className="text-2xl font-bold">{stats.yourEarnings} XLM</div>
        </div>
      </div>
    </div>
  );
}
