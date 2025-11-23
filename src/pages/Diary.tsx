// src/pages/Diary.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Download } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const moods = ["happy", "excited", "neutral", "sad", "stressed", "anxious", "grateful", "proud"];

export default function Diary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) loadEntries();
  }, [user]);

  async function loadEntries() {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", user?.id)
      .order("entry_date", { ascending: false });

    if (!error) setEntries(data || []);
  }

  async function handleAddEntry(e: any) {
    e.preventDefault();
    const f = new FormData(e.target);

    await supabase.from("diary_entries").insert({
      user_id: user?.id,
      entry_date: f.get("entry_date"),
      content: f.get("content"),
      mood: f.get("mood"),
      what_learned: f.get("what_learned"),
      what_made_happy: f.get("what_made_happy"),
      what_to_improve: f.get("what_to_improve"),
    });

    setIsModalOpen(false);
    loadEntries();
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Daily Diary</h1>
            <p className="text-gray-400">Capture your thoughts and memories</p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download size={16} className="mr-2" /> Export PDF
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" /> New Entry
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {new Date(entry.entry_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                <div
                  className="mt-2 inline-block px-3 py-1 rounded-full text-sm capitalize"
                  style={{
                    backgroundColor:
                      entry.mood === "happy" || entry.mood === "excited"
                        ? "#10b98120"
                        : entry.mood === "sad" || entry.mood === "anxious"
                        ? "#ef444420"
                        : "#3b82f620",
                    color:
                      entry.mood === "happy" || entry.mood === "excited"
                        ? "#10b981"
                        : entry.mood === "sad" || entry.mood === "anxious"
                        ? "#ef4444"
                        : "#3b82f6",
                  }}
                >
                  {entry.mood}
                </div>
              </div>
            </div>

            <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>

            {entry.what_learned && (
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm font-medium text-blue-400 mb-1">What I Learned</p>
                <p className="text-gray-300">{entry.what_learned}</p>
              </div>
            )}

            {entry.what_made_happy && (
              <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm font-medium text-green-400 mb-1">What Made Me Happy</p>
                <p className="text-gray-300">{entry.what_made_happy}</p>
              </div>
            )}

            {entry.what_to_improve && (
              <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-sm font-medium text-orange-400 mb-1">What I Must Improve</p>
                <p className="text-gray-300">{entry.what_to_improve}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Diary Entry" size="lg">
        <form onSubmit={handleAddEntry} className="space-y-4">
          <Input
            name="entry_date"
            label="Date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />

          <div>
            <label className="block text-sm text-gray-300 mb-2">Mood</label>
            <select
              name="mood"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              required
            >
              {moods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <textarea
            name="content"
            rows={8}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            placeholder="Dear diary..."
            required
          />

          <textarea
            name="what_learned"
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            placeholder="What did you learn today?"
          />

          <textarea
            name="what_made_happy"
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            placeholder="What made you happy?"
          />

          <textarea
            name="what_to_improve"
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            placeholder="What to improve?"
          />

          <Button type="submit" className="w-full">
            Save Entry
          </Button>
        </form>
      </Modal>
    </div>
  );
}
