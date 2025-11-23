import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Award, BookOpen } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Journey() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'log' | 'person' | 'achievement'>('log');
  const [activeTab, setActiveTab] = useState<'logs' | 'people' | 'achievements'>('logs');

  useEffect(() => {
    if (user) {
      loadJourneyData();
    }
  }, [user]);

  async function loadJourneyData() {
    const { data: logsData } = await supabase
      .from('journey_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('log_date', { ascending: false });

    const { data: peopleData } = await supabase
      .from('people_met')
      .select('*')
      .eq('user_id', user?.id)
      .order('met_date', { ascending: false });

    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user?.id)
      .order('achievement_date', { ascending: false });

    setLogs(logsData || []);
    setPeople(peopleData || []);
    setAchievements(achievementsData || []);
  }

  async function handleAddLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('journey_logs').insert({
      user_id: user?.id,
      log_date: formData.get('log_date'),
      title: formData.get('title'),
      content: formData.get('content'),
      what_learned: formData.get('what_learned'),
    });

    setIsModalOpen(false);
    loadJourneyData();
  }

  async function handleAddPerson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('people_met').insert({
      user_id: user?.id,
      name: formData.get('name'),
      position: formData.get('position'),
      level_rank: formData.get('level_rank'),
      linkedin_url: formData.get('linkedin_url'),
      notes: formData.get('notes'),
      met_date: formData.get('met_date'),
    });

    setIsModalOpen(false);
    loadJourneyData();
  }

  async function handleAddAchievement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('achievements').insert({
      user_id: user?.id,
      title: formData.get('title'),
      description: formData.get('description'),
      achievement_date: formData.get('achievement_date'),
      category: formData.get('category'),
    });

    setIsModalOpen(false);
    loadJourneyData();
  }

  const tabs = [
    { id: 'logs', label: 'Daily Logs', icon: BookOpen },
    { id: 'people', label: 'People Met', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Cognizant Journey</h1>
        <p className="text-gray-400">Track your professional journey at Chennai</p>
      </motion.div>

      <div className="flex gap-4 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('log'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Log
            </Button>
          </div>
          {logs.map((log) => (
            <Card key={log.id}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{log.title}</h3>
                <span className="text-sm text-gray-400">
                  {new Date(log.log_date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{log.content}</p>
              {log.what_learned && (
                <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm font-medium text-blue-400 mb-1">What I Learned</p>
                  <p className="text-gray-300">{log.what_learned}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'people' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('person'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Person
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {people.map((person) => (
              <Card key={person.id}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{person.name}</h3>
                    <p className="text-sm text-gray-400">{person.position}</p>
                    {person.level_rank && (
                      <p className="text-sm text-gray-500">Level: {person.level_rank}</p>
                    )}
                    {person.notes && (
                      <p className="text-gray-300 mt-2 text-sm">{person.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Met on: {new Date(person.met_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('achievement'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Achievement
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <div className="flex items-start gap-3">
                  <Award className="text-yellow-400" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
                    <p className="text-gray-300 mt-2">{achievement.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-400">
                      <span>{new Date(achievement.achievement_date).toLocaleDateString()}</span>
                      <span className="capitalize">{achievement.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        {modalType === 'log' && (
          <form onSubmit={handleAddLog} className="space-y-4">
            <Input name="log_date" label="Date" type="date" required />
            <Input name="title" label="Title" placeholder="First day at Chennai office" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <textarea
                name="content"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What happened today..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What I Learned</label>
              <textarea
                name="what_learned"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Key learnings from today..."
              />
            </div>
            <Button type="submit" className="w-full">Add Log</Button>
          </form>
        )}
        {modalType === 'person' && (
          <form onSubmit={handleAddPerson} className="space-y-4">
            <Input name="name" label="Name" placeholder="John Doe" required />
            <Input name="position" label="Position" placeholder="Senior Developer" />
            <Input name="level_rank" label="Level/Rank" placeholder="L4" />
            <Input name="linkedin_url" label="LinkedIn URL" placeholder="https://linkedin.com/in/..." />
            <Input name="met_date" label="Date Met" type="date" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
            <Button type="submit" className="w-full">Add Person</Button>
          </form>
        )}
        {modalType === 'achievement' && (
          <form onSubmit={handleAddAchievement} className="space-y-4">
            <Input name="title" label="Title" placeholder="Completed first project" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Achievement details..."
              />
            </div>
            <Input name="achievement_date" label="Date" type="date" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="work">Work</option>
                <option value="learning">Learning</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <Button type="submit" className="w-full">Add Achievement</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
