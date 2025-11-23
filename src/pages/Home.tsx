import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Brain, BookOpen, Award, Flame } from 'lucide-react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface DashboardStats {
  dailyStreak: number;
  savingsProgress: number;
  olqScore: number;
  learningProgress: number;
  totalBadges: number;
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    dailyStreak: 0,
    savingsProgress: 0,
    olqScore: 0,
    learningProgress: 0,
    totalBadges: 0,
  });

  const [profile, setProfile] = useState<{ full_name: string; quote: string } | null>(null);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, quote')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);

    const { data: streakData } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user?.id)
      .eq('streak_type', 'diary')
      .maybeSingle();

    const { data: savingsData } = await supabase
      .from('savings_sip')
      .select('monthly_savings, savings_percentage')
      .eq('user_id', user?.id)
      .order('month_year', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: olqData } = await supabase
      .from('olq_scores')
      .select('*')
      .eq('user_id', user?.id)
      .order('score_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: learningData } = await supabase
      .from('learning_logs')
      .select('time_spent')
      .eq('user_id', user?.id)
      .gte('log_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: badgesData } = await supabase
      .from('badges')
      .select('id')
      .eq('user_id', user?.id);

    const avgOlq = olqData
      ? Math.round(
          (olqData.effective_intelligence +
            olqData.reasoning_ability +
            olqData.organizing_ability +
            olqData.power_of_expression +
            olqData.social_adaptability +
            olqData.cooperation +
            olqData.sense_of_responsibility +
            olqData.initiative +
            olqData.self_confidence +
            olqData.speed_of_decision +
            olqData.ability_to_influence_group +
            olqData.liveliness +
            olqData.determination +
            olqData.courage +
            olqData.stamina) /
            15
        )
      : 0;

    const totalLearningHours = learningData?.reduce((sum, log) => sum + (log.time_spent || 0), 0) || 0;

    setStats({
      dailyStreak: streakData?.current_streak || 0,
      savingsProgress: savingsData?.savings_percentage || 0,
      olqScore: avgOlq,
      learningProgress: totalLearningHours,
      totalBadges: badgesData?.length || 0,
    });

    const motivations = [
      'Every day is a new opportunity to grow stronger.',
      'Discipline is the bridge between goals and accomplishment.',
      'Your journey is your greatest teacher.',
      'Small daily improvements lead to stunning results.',
      'Believe in yourself and you are unstoppable.',
    ];
    setMotivation(motivations[Math.floor(Math.random() * motivations.length)]);
  }

  const quickLinks = [
    { path: '/diary', title: 'Today\'s Diary', color: 'from-blue-500 to-cyan-500' },
    { path: '/learning', title: 'Learning Tracker', color: 'from-purple-500 to-pink-500' },
    { path: '/personality', title: 'OLQ Assessment', color: 'from-green-500 to-emerald-500' },
    { path: '/finance', title: 'Finance Dashboard', color: 'from-orange-500 to-yellow-500' },
    { path: '/goals', title: 'Goals & Achievements', color: 'from-red-500 to-rose-500' },
    { path: '/journey', title: 'Journey Logs', color: 'from-indigo-500 to-blue-500' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Welcome back, {profile?.full_name || 'Jayesh'}
        </h1>
        <p className="text-xl text-gray-300 italic">"{profile?.quote || motivation}"</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Daily Streak"
          value={`${stats.dailyStreak} days`}
          icon={Flame}
          color="orange"
          subtitle="Keep it going!"
        />
        <StatCard
          title="Savings Progress"
          value={`${stats.savingsProgress}%`}
          icon={TrendingUp}
          color="green"
          subtitle="Monthly savings rate"
        />
        <StatCard
          title="OLQ Score"
          value={`${stats.olqScore}/10`}
          icon={Brain}
          color="purple"
          subtitle="Average improvement"
        />
        <StatCard
          title="Learning Hours"
          value={`${stats.learningProgress}h`}
          icon={BookOpen}
          color="blue"
          subtitle="Last 30 days"
        />
        <StatCard
          title="Badges Earned"
          value={stats.totalBadges}
          icon={Award}
          color="purple"
          subtitle="Total achievements"
        />
        <StatCard
          title="Active Goals"
          value="8"
          icon={Calendar}
          color="green"
          subtitle="In progress"
        />
      </div>

      <Card>
        <h2 className="text-2xl font-bold text-white mb-4">AI-Generated Daily Motivation</h2>
        <p className="text-lg text-gray-300 italic">{motivation}</p>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className={`
                  p-6 rounded-xl bg-gradient-to-r ${link.color}
                  shadow-lg hover:shadow-2xl transition-all cursor-pointer
                `}
              >
                <h3 className="text-xl font-bold text-white">{link.title}</h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
