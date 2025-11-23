import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Award, Mail } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const goalCategories = ['career', 'fitness', 'riding', 'finance', 'mental-health', 'skill-development'];

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [futureLetters, setFutureLetters] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'goal' | 'letter'>('goal');
  const [activeTab, setActiveTab] = useState<'goals' | 'badges' | 'letters'>('goals');

  useEffect(() => {
    if (user) {
      loadGoalsData();
    }
  }, [user]);

  async function loadGoalsData() {
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    const { data: badgesData } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user?.id)
      .order('earned_date', { ascending: false });

    const { data: lettersData } = await supabase
      .from('future_letters')
      .select('*')
      .eq('user_id', user?.id)
      .order('written_date', { ascending: false });

    setGoals(goalsData || []);
    setBadges(badgesData || []);
    setFutureLetters(lettersData || []);
  }

  async function handleAddGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('goals').insert({
      user_id: user?.id,
      goal_name: formData.get('goal_name'),
      category: formData.get('category'),
      description: formData.get('description'),
      target_date: formData.get('target_date'),
      status: 'active',
      progress: 0,
    });

    setIsModalOpen(false);
    loadGoalsData();
  }

  async function handleAddLetter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('future_letters').insert({
      user_id: user?.id,
      written_date: new Date().toISOString().split('T')[0],
      open_date: formData.get('open_date'),
      content: formData.get('content'),
      is_locked: true,
    });

    setIsModalOpen(false);
    loadGoalsData();
  }

  async function updateGoalProgress(goalId: string, newProgress: number) {
    await supabase
      .from('goals')
      .update({ progress: newProgress, status: newProgress === 100 ? 'completed' : 'active' })
      .eq('id', goalId);

    loadGoalsData();
  }

  const goalsByCategory = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) acc[goal.category] = [];
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Goals & Achievements</h1>
        <p className="text-gray-400">Track your progress and celebrate wins</p>
      </motion.div>

      <div className="flex gap-4 border-b border-white/10">
        {[
          { id: 'goals', label: 'Goals' },
          { id: 'badges', label: 'Badges' },
          { id: 'letters', label: 'Future Letters' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`
              px-4 py-3 border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('goal'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Goal
            </Button>
          </div>

          {Object.entries(goalsByCategory).map(([category, categoryGoals]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">{category.replace('-', ' ')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryGoals.map((goal) => (
                  <Card key={goal.id}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">{goal.goal_name}</h3>
                        {goal.description && (
                          <p className="text-gray-400 text-sm mt-1">{goal.description}</p>
                        )}
                      </div>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${goal.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}
                      `}>
                        {goal.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                    </div>

                    {goal.target_date && (
                      <p className="text-sm text-gray-500 mt-3">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}

                    {goal.status !== 'completed' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 10, 100))}
                        >
                          +10%
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 25, 100))}
                        >
                          +25%
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateGoalProgress(goal.id, 100)}
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Your Achievements</h2>
            <p className="text-gray-400 mb-6">You have earned {badges.length} badges!</p>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-2">
                    <Award className="text-white" size={32} />
                  </div>
                  <p className="text-sm font-medium text-white">{badge.badge_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(badge.earned_date).toLocaleDateString()}
                  </p>
                </div>
              ))}

              <div className="text-center opacity-50">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-2">
                  <Award className="text-gray-600" size={32} />
                </div>
                <p className="text-sm text-gray-600">Locked</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'letters' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('letter'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Write Letter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futureLetters.map((letter) => {
              const canOpen = new Date(letter.open_date) <= new Date();

              return (
                <Card key={letter.id}>
                  <div className="flex items-start gap-3 mb-3">
                    <Mail className="text-blue-400" size={24} />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">
                        Letter to Future Self
                      </h3>
                      <p className="text-sm text-gray-400">
                        Written: {new Date(letter.written_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Open on: {new Date(letter.open_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {canOpen && !letter.is_locked ? (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg">
                      <p className="text-gray-300 whitespace-pre-wrap">{letter.content}</p>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-blue-500/10 rounded-lg text-center">
                      <p className="text-blue-400">
                        {canOpen ? 'Click to unlock' : 'Locked until target date'}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        {modalType === 'goal' && (
          <form onSubmit={handleAddGoal} className="space-y-4">
            <Input name="goal_name" label="Goal Name" placeholder="Learn React" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {goalCategories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What do you want to achieve..."
              />
            </div>
            <Input name="target_date" label="Target Date" type="date" />
            <Button type="submit" className="w-full">Add Goal</Button>
          </form>
        )}
        {modalType === 'letter' && (
          <form onSubmit={handleAddLetter} className="space-y-4">
            <Input
              name="open_date"
              label="When should this open?"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Letter Content</label>
              <textarea
                name="content"
                rows={12}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dear future me..."
                required
              />
            </div>
            <Button type="submit" className="w-full">Save & Lock Letter</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
