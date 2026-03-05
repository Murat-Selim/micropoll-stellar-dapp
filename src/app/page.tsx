import CreatePollForm from '@/components/CreatePollForm';
import PollList from '@/components/PollList';
import StatsBar from '@/components/StatsBar';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* İstatistikler */}
      <StatsBar />

      {/* Anket oluştur ve liste - yan yana (desktop), alt alta (mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol: Anket oluştur formu */}
        <div className="lg:col-span-1">
          <CreatePollForm />
        </div>

        {/* Sağ: Anket listesi */}
        <div className="lg:col-span-2">
          <PollList />
        </div>
      </div>
    </div>
  );
}
