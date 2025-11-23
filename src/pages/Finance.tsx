import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const expenseCategories = ['food', 'travel', 'rent', 'shopping', 'entertainment', 'utilities', 'healthcare', 'misc'];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

export default function Finance() {
  const { user } = useAuth();
  const [salaryInfo, setSalaryInfo] = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'goal'>('expense');
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'goals'>('overview');

  useEffect(() => {
    if (user) {
      loadFinanceData();
    }
  }, [user]);

  async function loadFinanceData() {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

    const { data: salaryData } = await supabase
      .from('salary_info')
      .select('*')
      .eq('user_id', user?.id)
      .order('month_year', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: savingsData } = await supabase
      .from('savings_sip')
      .select('*')
      .eq('user_id', user?.id)
      .order('month_year', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user?.id)
      .gte('expense_date', currentMonth)
      .order('expense_date', { ascending: false });

    const { data: goalsData } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user?.id)
      .order('target_date', { ascending: true });

    setSalaryInfo(salaryData);
    setSavings(savingsData);
    setExpenses(expensesData || []);
    setGoals(goalsData || []);
  }

  async function handleAddExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('expenses').insert({
      user_id: user?.id,
      expense_date: formData.get('expense_date'),
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category'),
      description: formData.get('description'),
    });

    setIsModalOpen(false);
    loadFinanceData();
  }

  async function handleAddGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('financial_goals').insert({
      user_id: user?.id,
      goal_name: formData.get('goal_name'),
      target_amount: parseFloat(formData.get('target_amount') as string),
      current_amount: parseFloat(formData.get('current_amount') as string),
      target_date: formData.get('target_date'),
      time_horizon: formData.get('time_horizon'),
    });

    setIsModalOpen(false);
    loadFinanceData();
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) acc[exp.category] = 0;
    acc[exp.category] += parseFloat(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Finance Dashboard</h1>
        <p className="text-gray-400">Manage your salary, savings, and expenses</p>
      </motion.div>

      <div className="flex gap-4 border-b border-white/10">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'goals', label: 'Goals' },
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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="In-Hand Salary"
              value={`₹${salaryInfo?.in_hand_salary?.toLocaleString() || '0'}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Monthly Savings"
              value={`₹${savings?.monthly_savings?.toLocaleString() || '0'}`}
              icon={PiggyBank}
              color="blue"
            />
            <StatCard
              title="Savings %"
              value={`${savings?.savings_percentage || 0}%`}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="SIP Amount"
              value={`₹${savings?.sip_amount?.toLocaleString() || '0'}`}
              icon={TrendingUp}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-xl font-bold text-white mb-4">Salary Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gross Salary</span>
                  <span className="text-white font-bold">₹{salaryInfo?.gross_salary?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax Deduction</span>
                  <span className="text-red-400">-₹{salaryInfo?.tax_deduction?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Other Deductions</span>
                  <span className="text-red-400">-₹{salaryInfo?.other_deductions?.toLocaleString() || '0'}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between">
                  <span className="text-white font-bold">In-Hand</span>
                  <span className="text-green-400 font-bold">₹{salaryInfo?.in_hand_salary?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-white mb-4">Expense Breakdown</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-12">No expenses recorded yet</p>
              )}
            </Card>
          </div>

          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Emergency Fund</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Current Balance</span>
              <span className="text-white font-bold text-2xl">₹{savings?.emergency_fund?.toLocaleString() || '0'}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((savings?.emergency_fund || 0) / 100000 * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">Target: ₹1,00,000</p>
          </Card>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400">Total Expenses This Month</p>
              <p className="text-3xl font-bold text-white mt-1">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <Button onClick={() => { setModalType('expense'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Expense
            </Button>
          </div>

          <div className="space-y-3">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">{expense.category}</h3>
                    <p className="text-gray-400 text-sm">{expense.description}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">₹{parseFloat(expense.amount).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('goal'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <Card key={goal.id}>
                  <h3 className="text-xl font-bold text-white mb-2">{goal.goal_name}</h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">₹{goal.current_amount.toLocaleString()}</span>
                    <span className="text-white font-bold">₹{goal.target_amount.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{progress.toFixed(1)}% complete</span>
                    <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        {modalType === 'expense' && (
          <form onSubmit={handleAddExpense} className="space-y-4">
            <Input
              name="expense_date"
              label="Date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>
            <Input name="amount" label="Amount (₹)" type="number" step="0.01" required />
            <Input name="description" label="Description" placeholder="What was this for?" />
            <Button type="submit" className="w-full">Add Expense</Button>
          </form>
        )}
        {modalType === 'goal' && (
          <form onSubmit={handleAddGoal} className="space-y-4">
            <Input name="goal_name" label="Goal Name" placeholder="Emergency Fund" required />
            <Input name="target_amount" label="Target Amount (₹)" type="number" step="0.01" required />
            <Input name="current_amount" label="Current Amount (₹)" type="number" step="0.01" defaultValue="0" required />
            <Input name="target_date" label="Target Date" type="date" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Horizon</label>
              <select
                name="time_horizon"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="1year">1 Year</option>
                <option value="3years">3 Years</option>
                <option value="5years">5 Years</option>
              </select>
            </div>
            <Button type="submit" className="w-full">Add Goal</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
