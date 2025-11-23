import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const generalTraits = [
  'confidence', 'discipline', 'calmness', 'emotional_control',
  'social_skills', 'leadership', 'decision_making', 'riding_confidence', 'fear_management'
];

const olqQualities = [
  { key: 'effective_intelligence', label: 'Effective Intelligence' },
  { key: 'reasoning_ability', label: 'Reasoning Ability' },
  { key: 'organizing_ability', label: 'Organizing Ability' },
  { key: 'power_of_expression', label: 'Power of Expression' },
  { key: 'social_adaptability', label: 'Social Adaptability' },
  { key: 'cooperation', label: 'Cooperation' },
  { key: 'sense_of_responsibility', label: 'Sense of Responsibility' },
  { key: 'initiative', label: 'Initiative' },
  { key: 'self_confidence', label: 'Self-Confidence' },
  { key: 'speed_of_decision', label: 'Speed of Decision' },
  { key: 'ability_to_influence_group', label: 'Ability to Influence Group' },
  { key: 'liveliness', label: 'Liveliness' },
  { key: 'determination', label: 'Determination' },
  { key: 'courage', label: 'Courage' },
  { key: 'stamina', label: 'Stamina' },
];

export default function Personality() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'traits' | 'olq' | 'ai'>('traits');
  const [traits, setTraits] = useState<any[]>([]);
  const [olqScores, setOlqScores] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRatings, setCurrentRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      loadPersonalityData();
    }
  }, [user]);

  async function loadPersonalityData() {
    const { data: traitsData } = await supabase
      .from('personality_traits')
      .select('*')
      .eq('user_id', user?.id)
      .order('trait_date', { ascending: false })
      .limit(30);

    const { data: olqData } = await supabase
      .from('olq_scores')
      .select('*')
      .eq('user_id', user?.id)
      .order('score_date', { ascending: false })
      .limit(30);

    const { data: suggestionsData } = await supabase
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', user?.id)
      .order('suggestion_date', { ascending: false })
      .limit(10);

    setTraits(traitsData || []);
    setOlqScores(olqData || []);
    setAiSuggestions(suggestionsData || []);
  }

  async function handleAddTraitRating(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const traitData: any = {
      user_id: user?.id,
      trait_date: formData.get('trait_date'),
      notes: formData.get('notes'),
    };

    generalTraits.forEach(trait => {
      traitData[trait] = parseInt(formData.get(trait) as string);
    });

    await supabase.from('personality_traits').insert(traitData);

    setIsModalOpen(false);
    loadPersonalityData();
  }

  async function handleAddOLQRating(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const olqData: any = {
      user_id: user?.id,
      score_date: formData.get('score_date'),
      notes: formData.get('notes'),
    };

    olqQualities.forEach(olq => {
      olqData[olq.key] = parseInt(formData.get(olq.key) as string);
    });

    await supabase.from('olq_scores').insert(olqData);

    setIsModalOpen(false);
    loadPersonalityData();
  }

  const getAverageScore = (data: any[], keys: string[]) => {
    if (!data.length) return 0;
    const latest = data[0];
    const sum = keys.reduce((acc, key) => acc + (latest[key] || 0), 0);
    return (sum / keys.length).toFixed(1);
  };

  const prepareChartData = (data: any[], keys: string[]) => {
    return data.slice(0, 10).reverse().map(item => {
      const avg = keys.reduce((acc, key) => acc + (item[key] || 0), 0) / keys.length;
      return {
        date: new Date(item.trait_date || item.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: parseFloat(avg.toFixed(1)),
      };
    });
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Personality Development</h1>
        <p className="text-gray-400">Track your personal growth and OLQ scores</p>
      </motion.div>

      <div className="flex gap-4 border-b border-white/10">
        {[
          { id: 'traits', label: 'General Traits' },
          { id: 'olq', label: '15 OLQs' },
          { id: 'ai', label: 'AI Suggestions' },
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

      {activeTab === 'traits' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Current Average</h2>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                {getAverageScore(traits, generalTraits)}/10
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Rate Today
            </Button>
          </div>

          {traits.length > 0 && (
            <Card>
              <h3 className="text-xl font-bold text-white mb-4">Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareChartData(traits, generalTraits)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[0, 10]} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalTraits.map(trait => {
              const latestScore = traits[0]?.[trait] || 0;
              return (
                <Card key={trait}>
                  <h3 className="text-lg font-bold text-white capitalize mb-3">
                    {trait.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-blue-400">{latestScore}/10</div>
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                </Card>
              );
            })}
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Rate Your Traits Today">
            <form onSubmit={handleAddTraitRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  name="trait_date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {generalTraits.map(trait => (
                <div key={trait}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                    {trait.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="range"
                    name={trait}
                    min="0"
                    max="10"
                    defaultValue="5"
                    className="w-full"
                    onChange={(e) => setCurrentRatings({...currentRatings, [trait]: parseInt(e.target.value)})}
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>0</span>
                    <span className="text-white font-bold">{currentRatings[trait] || 5}</span>
                    <span>10</span>
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any observations..."
                />
              </div>
              <Button type="submit" className="w-full">Save Rating</Button>
            </form>
          </Modal>
        </div>
      )}

      {activeTab === 'olq' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">OLQ Average Score</h2>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                {getAverageScore(olqScores, olqQualities.map(o => o.key))}/10
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Rate OLQs
            </Button>
          </div>

          {olqScores.length > 0 && (
            <Card>
              <h3 className="text-xl font-bold text-white mb-4">OLQ Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareChartData(olqScores, olqQualities.map(o => o.key))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[0, 10]} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {olqQualities.map(olq => {
              const latestScore = olqScores[0]?.[olq.key] || 0;
              return (
                <Card key={olq.key}>
                  <h3 className="text-sm font-bold text-white mb-3">{olq.label}</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-purple-400">{latestScore}/10</div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Rate Your OLQs" size="lg">
            <form onSubmit={handleAddOLQRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  name="score_date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {olqQualities.map(olq => (
                  <div key={olq.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {olq.label}
                    </label>
                    <input
                      type="range"
                      name={olq.key}
                      min="0"
                      max="10"
                      defaultValue="5"
                      className="w-full"
                      onChange={(e) => setCurrentRatings({...currentRatings, [olq.key]: parseInt(e.target.value)})}
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>0</span>
                      <span className="text-white font-bold">{currentRatings[olq.key] || 5}</span>
                      <span>10</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any observations..."
                />
              </div>
              <Button type="submit" className="w-full">Save OLQ Scores</Button>
            </form>
          </Modal>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Today's Motivation</h3>
            <p className="text-lg text-gray-300 italic">
              "Success is not final, failure is not fatal: it is the courage to continue that counts."
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Focus on improving your decision-making skills today. Take time to analyze situations before reacting.
            </p>
          </Card>

          {aiSuggestions.map(suggestion => (
            <Card key={suggestion.id}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">
                  {new Date(suggestion.suggestion_date).toLocaleDateString()}
                </h3>
              </div>
              {suggestion.daily_quote && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-blue-400">Daily Quote</p>
                  <p className="text-gray-300 italic">"{suggestion.daily_quote}"</p>
                </div>
              )}
              {suggestion.improvement_suggestion && (
                <div>
                  <p className="text-sm font-medium text-green-400">Improvement Suggestion</p>
                  <p className="text-gray-300">{suggestion.improvement_suggestion}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
