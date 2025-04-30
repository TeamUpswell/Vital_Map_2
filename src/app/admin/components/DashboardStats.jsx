import { useState, useEffect } from 'react';

export default function DashboardStats({ data }) {
  const [stats, setStats] = useState({
    total: 0,
    caresForGirl: { yes: 0, no: 0 },
    receivedDose: { yes: 0, no: 0 },
    readyForVaccine: { yes: 0, needsInfo: 0 },
    whatsappJoined: 0,
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const calculatedStats = {
      total: data.length,
      caresForGirl: {
        yes: data.filter((item) => item.cares_for_girl === true).length,
        no: data.filter((item) => item.cares_for_girl === false).length,
      },
      receivedDose: {
        yes: data.filter((item) => item.received_hpv_dose === true).length,
        no: data.filter((item) => item.received_hpv_dose === false).length,
      },
      readyForVaccine: {
        yes: data.filter((item) => item.ready_for_vaccine === 'yes').length,
        needsInfo: data.filter(
          (item) => item.ready_for_vaccine === 'needs_info'
        ).length,
      },
      whatsappJoined: data.filter((item) => item.whatsapp_joined === true)
        .length,
    };

    setStats(calculatedStats);
  }, [data]);

  const StatCard = ({ title, value, subtext }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Responses" value={stats.total} />
      <StatCard
        title="Care for Girls 9+"
        value={stats.caresForGirl.yes}
        subtext={`${((stats.caresForGirl.yes / stats.total) * 100).toFixed(
          1
        )}% of total`}
      />
      <StatCard
        title="Already Vaccinated"
        value={stats.receivedDose.yes}
        subtext={`${(
          (stats.receivedDose.yes /
            (stats.receivedDose.yes + stats.receivedDose.no || 1)) *
          100
        ).toFixed(1)}% of eligible`}
      />
      <StatCard
        title="WhatsApp Engagement"
        value={stats.whatsappJoined}
        subtext={`${((stats.whatsappJoined / stats.total) * 100).toFixed(
          1
        )}% conversion rate`}
      />
    </div>
  );
}
