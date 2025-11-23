import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Palette } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const themes = [
  { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Modern glass effect' },
  { id: 'neomorphism', name: 'Neomorphism', desc: 'Soft shadows and depth' },
  { id: 'material3', name: 'Material 3', desc: 'Google Material Design' },
  { id: 'dashboard-pro', name: 'Dashboard Pro', desc: 'Dark with neon accents' },
];

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState(false);

  async function exportData() {
    setExporting(true);

    const tables = [
      'profiles', 'skills', 'certifications', 'timeline_events',
      'journey_logs', 'people_met', 'achievements',
      'tasks', 'learning_logs', 'roadmaps', 'roadmap_milestones',
      'personality_traits', 'olq_scores', 'ai_suggestions',
      'diary_entries', 'weekly_summaries',
      'salary_info', 'savings_sip', 'expenses', 'financial_goals',
      'rides', 'places_explored', 'bike_maintenance',
      'goals', 'future_letters', 'badges', 'streaks'
    ];

    const exportData: any = {};

    for (const table of tables) {
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user?.id);

      exportData[table] = data || [];
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jayesh-life-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Customize your experience</p>
      </motion.div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-blue-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Theme</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(t.id as any)}
              className={`
                p-4 rounded-lg text-left transition-all
                ${theme === t.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }
              `}
            >
              <h3 className="font-bold mb-1">{t.name}</h3>
              <p className="text-sm opacity-80">{t.desc}</p>
            </motion.button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Download className="text-green-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Data Management</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Export Data</h3>
            <p className="text-gray-400 mb-4">
              Download all your data as a JSON file for backup or migration.
            </p>
            <Button onClick={exportData} disabled={exporting}>
              <Download size={16} className="mr-2" />
              {exporting ? 'Exporting...' : 'Export All Data'}
            </Button>
          </div>

          <div className="h-px bg-white/10 my-6" />

          <div>
            <h3 className="text-lg font-bold text-white mb-2">Import Data</h3>
            <p className="text-gray-400 mb-4">
              Restore your data from a previously exported backup.
            </p>
            <Button variant="secondary">
              <Upload size={16} className="mr-2" />
              Import Data
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-white mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Jayesh"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              rows={3}
              placeholder="Software Engineer at Cognizant"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Personal Quote</label>
            <input
              type="text"
              placeholder="Every day is a new opportunity"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button>Save Changes</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-white mb-4">About</h2>
        <p className="text-gray-400 mb-4">
          Jayesh Life Management System v1.0
        </p>
        <p className="text-gray-400">
          A comprehensive platform to track your professional journey, personal growth,
          finances, and life goals all in one place.
        </p>
      </Card>
    </div>
  );
}
