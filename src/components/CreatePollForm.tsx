'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { getPollService, getStellarExpertUrl } from '@/lib/pollService';

interface Option {
  id: number;
  value: string;
}

const DURATION_OPTIONS = [
  { label: '1h', value: 3600 },
  { label: '6h', value: 21600 },
  { label: '24h', value: 86400 },
  { label: '7d', value: 604800 },
];

export default function CreatePollForm() {
  // Cüzdan bağlantısı kontrolü
  const { isConnected, account } = useWallet();
  const isWalletConnected = isConnected;

  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { id: 1, value: '' },
    { id: 2, value: '' },
  ]);
  const [rewardPool, setRewardPool] = useState('');
  const [duration, setDuration] = useState(3600);

  // Submit durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, { id: Date.now(), value: '' }]);
    }
  };

  const handleRemoveOption = (id: number) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const handleOptionChange = (id: number, value: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, value } : opt)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      const pollService = getPollService();
      const validOptions = options.filter(o => o.value.trim()).map(o => o.value);
      const rewardXLM = parseFloat(rewardPool);
      
      const result = await pollService.createPoll(
        question,
        validOptions,
        rewardXLM,
        duration
      );

      setTxHash(result.txHash);
      setSuccess(true);
      console.log('[MicroPoll] Poll created:', result);

      // Formu temizle
      setQuestion('');
      setOptions([
        { id: 1, value: '' },
        { id: 2, value: '' },
      ]);
      setRewardPool('');
      setDuration(3600);

      // 3 saniye sonra başarı mesajını gizle
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[MicroPoll] Create poll error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = question.trim() && options.filter((o) => o.value.trim()).length >= 2 && rewardPool;

  return (
    <div className="brutalist-card">
      {/* Kırmızı accent noktası - sağ üst köşe */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-[#FF0000] m-2" />

      <h2 className="brutalist-heading text-xl mb-4">CREATE NEW POLL</h2>

      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border-3 border-red-600 p-3 mb-4 font-bold text-red-800">
          ❌ {error}
        </div>
      )}

      {/* Başarı mesajı */}
      {success && txHash && (
        <div className="bg-green-100 border-3 border-green-600 p-3 mb-4">
          <div className="font-bold text-green-800">✓ Poll created successfully!</div>
          <a 
            href={getStellarExpertUrl(txHash)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm underline text-green-700"
          >
            View on Stellar Expert
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Soru inputu */}
        <div>
          <label className="block font-bold uppercase text-sm mb-1">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question..."
            data-testid="poll-question"
            className="brutalist-input"
            disabled={!isWalletConnected || isSubmitting}
          />
        </div>

        {/* Seçenekler */}
        <div>
          <label className="block font-bold uppercase text-sm mb-1">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={option.id} className="flex gap-2">
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  data-testid={`poll-option-${index}`}
                  className="brutalist-input flex-1"
                  disabled={!isWalletConnected || isSubmitting}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    data-testid="remove-option"
                    className="border-[3px] border-black px-3 font-bold hover:bg-black hover:text-white disabled:opacity-50"
                    disabled={!isWalletConnected || isSubmitting}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Seçenek ekle butonu */}
          {options.length < 4 && (
            <button
              type="button"
              onClick={handleAddOption}
              data-testid="add-option"
              className="mt-2 text-sm font-bold uppercase border-2 border-black px-3 py-1 hover:bg-black hover:text-white disabled:opacity-50"
              disabled={!isWalletConnected || isSubmitting}
            >
              + Add Option
            </button>
          )}
        </div>

        {/* Ödül havuzu */}
        <div>
          <label className="block font-bold uppercase text-sm mb-1">Reward Pool (XLM)</label>
          <input
            type="number"
            value={rewardPool}
            onChange={(e) => setRewardPool(e.target.value)}
            placeholder="10"
            min="1"
            step="1"
            data-testid="reward-pool"
            className="brutalist-input"
            disabled={!isWalletConnected || isSubmitting}
          />
        </div>

        {/* Süre seçici */}
        <div>
          <label className="block font-bold uppercase text-sm mb-1">Duration</label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                data-testid={`duration-${opt.label}`}
                className={`flex-1 border-[3px] border-black py-2 font-bold uppercase ${
                  duration === opt.value ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'
                } disabled:opacity-50`}
                disabled={!isWalletConnected || isSubmitting}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit butonu */}
        <button
          type="submit"
          data-testid="create-poll"
          disabled={!isWalletConnected || !isFormValid || isSubmitting}
          className="w-full brutalist-btn py-3 text-lg"
        >
          {isSubmitting ? 'CREATING...' : 'CREATE POLL'}
        </button>
      </form>
    </div>
  );
}
