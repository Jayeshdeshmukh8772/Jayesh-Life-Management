import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, ExternalLink } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Portfolio() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'skill' | 'cert' | 'timeline'>('skill');

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  async function loadPortfolio() {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    const { data: skillsData } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user?.id)
      .order('category');

    const { data: certsData } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('issue_date', { ascending: false });

    const { data: timelineData } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('user_id', user?.id)
      .order('event_date', { ascending: false });

    setProfile(profileData);
    setSkills(skillsData || []);
    setCertifications(certsData || []);
    setTimeline(timelineData || []);
  }

  async function handleAddSkill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('skills').insert({
      user_id: user?.id,
      name: formData.get('name'),
      category: formData.get('category'),
      proficiency: parseInt(formData.get('proficiency') as string),
    });

    setIsModalOpen(false);
    loadPortfolio();
  }

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-gray-400">Professional profile and achievements</p>
      </motion.div>

      <Card>
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
            {profile?.full_name?.charAt(0) || 'J'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Jayesh'}</h2>
            <p className="text-gray-400 mt-2">{profile?.bio || 'Software Engineer at Cognizant'}</p>
            <div className="mt-4 flex gap-4">
              <Button variant="primary" size="sm">
                <Download size={16} className="mr-2" />
                Download Resume
              </Button>
              <Button variant="secondary" size="sm">
                Contact Me
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Skills</h2>
          <Button onClick={() => { setModalType('skill'); setIsModalOpen(true); }} size="sm">
            <Plus size={16} className="mr-2" />
            Add Skill
          </Button>
        </div>
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <Card key={category}>
              <h3 className="text-xl font-bold text-white mb-4 capitalize">{category} Skills</h3>
              <div className="space-y-4">
                {categorySkills.map((skill: any) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{skill.name}</span>
                      <span className="text-gray-400">{skill.proficiency}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.proficiency}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Certifications</h2>
          <Button onClick={() => { setModalType('cert'); setIsModalOpen(true); }} size="sm">
            <Plus size={16} className="mr-2" />
            Add Certification
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <Card key={cert.id}>
              <h3 className="text-lg font-bold text-white">{cert.title}</h3>
              <p className="text-gray-400 mt-1">{cert.issuer}</p>
              <p className="text-sm text-gray-500 mt-2">
                Issued: {new Date(cert.issue_date).toLocaleDateString()}
              </p>
              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-blue-400 hover:text-blue-300"
                >
                  View Credential <ExternalLink size={14} />
                </a>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Career Timeline</h2>
          <Button onClick={() => { setModalType('timeline'); setIsModalOpen(true); }} size="sm">
            <Plus size={16} className="mr-2" />
            Add Event
          </Button>
        </div>
        <Card>
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-sm text-gray-400">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-1">{event.title}</h3>
                  <p className="text-gray-400 mt-2">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        {modalType === 'skill' && (
          <form onSubmit={handleAddSkill} className="space-y-4">
            <Input name="name" label="Skill Name" placeholder="e.g., React" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skills</option>
                <option value="personal">Personal Traits</option>
              </select>
            </div>
            <Input name="proficiency" label="Proficiency (%)" type="number" min="0" max="100" defaultValue="50" required />
            <Button type="submit" className="w-full">Add Skill</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
