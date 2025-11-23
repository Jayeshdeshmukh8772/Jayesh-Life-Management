import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, Map } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Learning() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [learningLogs, setLearningLogs] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'task' | 'log' | 'roadmap'>('task');
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs' | 'roadmaps'>('tasks');

  useEffect(() => {
    if (user) {
      loadLearningData();
    }
  }, [user]);

  async function loadLearningData() {
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('deadline', { ascending: true });

    const { data: logsData } = await supabase
      .from('learning_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('log_date', { ascending: false });

    const { data: roadmapsData } = await supabase
      .from('roadmaps')
      .select('*, roadmap_milestones(*)')
      .eq('user_id', user?.id);

    setTasks(tasksData || []);
    setLearningLogs(logsData || []);
    setRoadmaps(roadmapsData || []);
  }

  async function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('tasks').insert({
      user_id: user?.id,
      task_name: formData.get('task_name'),
      assigned_date: formData.get('assigned_date'),
      deadline: formData.get('deadline'),
      status: 'pending',
    });

    setIsModalOpen(false);
    loadLearningData();
  }

  async function handleAddLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('learning_logs').insert({
      user_id: user?.id,
      log_date: formData.get('log_date'),
      topic: formData.get('topic'),
      time_spent: parseInt(formData.get('time_spent') as string),
      notes: formData.get('notes'),
    });

    setIsModalOpen(false);
    loadLearningData();
  }

  async function handleAddRoadmap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('roadmaps').insert({
      user_id: user?.id,
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      progress: 0,
    });

    setIsModalOpen(false);
    loadLearningData();
  }

  async function toggleTaskStatus(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completionDate = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null;

    await supabase
      .from('tasks')
      .update({ status: newStatus, completion_date: completionDate })
      .eq('id', taskId);

    loadLearningData();
  }

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'logs', label: 'Learning Logs', icon: Clock },
    { id: 'roadmaps', label: 'Roadmaps', icon: Map },
  ];

  const roadmapCategories = [
    'Career', 'Defence Mindset', 'Lifestyle', 'Riding', 'Finance', 'Travel', 'Self-Improvement'
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Learning & Work Tracker</h1>
        <p className="text-gray-400">Track your tasks, learning progress, and roadmaps</p>
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

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('task'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1
                      ${task.status === 'completed'
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400 hover:border-green-500'
                      }
                    `}
                  >
                    {task.status === 'completed' && (
                      <CheckCircle size={16} className="text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {task.task_name}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span>Assigned: {new Date(task.assigned_date).toLocaleDateString()}</span>
                      <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                      {task.completion_date && (
                        <span>Completed: {new Date(task.completion_date).toLocaleDateString()}</span>
                      )}
                    </div>
                    {task.status === 'completed' && task.achievement_points > 0 && (
                      <div className="mt-2 inline-block px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-400 text-sm">
                        {task.achievement_points} points earned
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('log'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Log
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningLogs.map((log) => (
              <Card key={log.id}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{log.topic}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(log.log_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <Clock size={16} />
                  <span>{log.time_spent} hours</span>
                </div>
                {log.notes && (
                  <p className="text-gray-300 text-sm">{log.notes}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roadmaps' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('roadmap'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Roadmap
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmaps.map((roadmap) => (
              <Card key={roadmap.id}>
                <h3 className="text-xl font-bold text-white mb-2">{roadmap.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{roadmap.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{roadmap.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${roadmap.progress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
                {roadmap.roadmap_milestones && roadmap.roadmap_milestones.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      {roadmap.roadmap_milestones.filter((m: any) => m.completed).length} / {roadmap.roadmap_milestones.length} milestones completed
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        {modalType === 'task' && (
          <form onSubmit={handleAddTask} className="space-y-4">
            <Input name="task_name" label="Task Name" placeholder="Complete training module" required />
            <Input name="assigned_date" label="Assigned Date" type="date" required />
            <Input name="deadline" label="Deadline" type="date" required />
            <Button type="submit" className="w-full">Add Task</Button>
          </form>
        )}
        {modalType === 'log' && (
          <form onSubmit={handleAddLog} className="space-y-4">
            <Input name="log_date" label="Date" type="date" required />
            <Input name="topic" label="Topic" placeholder="React Hooks" required />
            <Input name="time_spent" label="Time Spent (hours)" type="number" min="0" step="0.5" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What did you learn..."
              />
            </div>
            <Button type="submit" className="w-full">Add Log</Button>
          </form>
        )}
        {modalType === 'roadmap' && (
          <form onSubmit={handleAddRoadmap} className="space-y-4">
            <Input name="name" label="Roadmap Name" placeholder="Full Stack Development" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {roadmapCategories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your roadmap..."
              />
            </div>
            <Button type="submit" className="w-full">Add Roadmap</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
