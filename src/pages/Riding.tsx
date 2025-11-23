import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Riding() {
  const { user } = useAuth();
  const [rides, setRides] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ride' | 'place' | 'maintenance'>('ride');
  const [activeTab, setActiveTab] = useState<'rides' | 'places' | 'maintenance'>('rides');

  useEffect(() => {
    if (user) {
      loadRidingData();
    }
  }, [user]);

  async function loadRidingData() {
    const { data: ridesData } = await supabase
      .from('rides')
      .select('*')
      .eq('user_id', user?.id)
      .order('ride_date', { ascending: false });

    const { data: placesData } = await supabase
      .from('places_explored')
      .select('*')
      .eq('user_id', user?.id)
      .order('visit_date', { ascending: false });

    const { data: maintenanceData } = await supabase
      .from('bike_maintenance')
      .select('*')
      .eq('user_id', user?.id)
      .order('maintenance_date', { ascending: false });

    setRides(ridesData || []);
    setPlaces(placesData || []);
    setMaintenance(maintenanceData || []);
  }

  async function handleAddRide(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('rides').insert({
      user_id: user?.id,
      ride_date: formData.get('ride_date'),
      distance: parseFloat(formData.get('distance') as string),
      route_map: formData.get('route_map'),
      notes: formData.get('notes'),
      food_review: formData.get('food_review'),
    });

    setIsModalOpen(false);
    loadRidingData();
  }

  async function handleAddPlace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('places_explored').insert({
      user_id: user?.id,
      place_name: formData.get('place_name'),
      visit_date: formData.get('visit_date'),
      location: formData.get('location'),
      rating: parseInt(formData.get('rating') as string),
      notes: formData.get('notes'),
    });

    setIsModalOpen(false);
    loadRidingData();
  }

  async function handleAddMaintenance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await supabase.from('bike_maintenance').insert({
      user_id: user?.id,
      maintenance_date: formData.get('maintenance_date'),
      mileage: parseFloat(formData.get('mileage') as string),
      service_type: formData.get('service_type'),
      cost: parseFloat(formData.get('cost') as string),
      notes: formData.get('notes'),
    });

    setIsModalOpen(false);
    loadRidingData();
  }

  const totalDistance = rides.reduce((sum, ride) => sum + parseFloat(ride.distance || 0), 0);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Riding & Travel</h1>
        <p className="text-gray-400">Track your rides and explore Chennai</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm text-gray-400 mb-2">Total Rides</h3>
          <p className="text-3xl font-bold text-white">{rides.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-400 mb-2">Total Distance</h3>
          <p className="text-3xl font-bold text-white">{totalDistance.toFixed(1)} km</p>
        </Card>
        <Card>
          <h3 className="text-sm text-gray-400 mb-2">Places Explored</h3>
          <p className="text-3xl font-bold text-white">{places.length}</p>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        {[
          { id: 'rides', label: 'Rides' },
          { id: 'places', label: 'Places' },
          { id: 'maintenance', label: 'Maintenance' },
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

      {activeTab === 'rides' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('ride'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Ride
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rides.map((ride) => (
              <Card key={ride.id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {new Date(ride.ride_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <p className="text-blue-400 font-bold text-2xl mt-1">{ride.distance} km</p>
                  </div>
                </div>
                {ride.notes && (
                  <p className="text-gray-300 text-sm mb-3">{ride.notes}</p>
                )}
                {ride.food_review && (
                  <div className="mt-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-sm font-medium text-orange-400 mb-1">Food Review</p>
                    <p className="text-gray-300 text-sm">{ride.food_review}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'places' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('place'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Place
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {places.map((place) => (
              <Card key={place.id}>
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="text-blue-400 flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{place.place_name}</h3>
                    <p className="text-sm text-gray-400">{place.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < place.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                      ★
                    </span>
                  ))}
                </div>
                {place.notes && (
                  <p className="text-gray-300 text-sm">{place.notes}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Visited: {new Date(place.visit_date).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setModalType('maintenance'); setIsModalOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Add Maintenance
            </Button>
          </div>
          <div className="space-y-3">
            {maintenance.map((record) => (
              <Card key={record.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{record.service_type}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(record.maintenance_date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-sm">Mileage: {record.mileage} km</p>
                    {record.notes && (
                      <p className="text-gray-300 text-sm mt-2">{record.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-400">₹{record.cost}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        {modalType === 'ride' && (
          <form onSubmit={handleAddRide} className="space-y-4">
            <Input name="ride_date" label="Date" type="date" required />
            <Input name="distance" label="Distance (km)" type="number" step="0.1" required />
            <Input name="route_map" label="Route" placeholder="Chennai to Mahabalipuram" />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How was the ride..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Food Review</label>
              <textarea
                name="food_review"
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Where did you eat..."
              />
            </div>
            <Button type="submit" className="w-full">Add Ride</Button>
          </form>
        )}
        {modalType === 'place' && (
          <form onSubmit={handleAddPlace} className="space-y-4">
            <Input name="place_name" label="Place Name" placeholder="Marina Beach" required />
            <Input name="location" label="Location" placeholder="Chennai" />
            <Input name="visit_date" label="Visit Date" type="date" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
              <input
                type="range"
                name="rating"
                min="1"
                max="5"
                defaultValue="5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What did you think..."
              />
            </div>
            <Button type="submit" className="w-full">Add Place</Button>
          </form>
        )}
        {modalType === 'maintenance' && (
          <form onSubmit={handleAddMaintenance} className="space-y-4">
            <Input name="maintenance_date" label="Date" type="date" required />
            <Input name="mileage" label="Mileage (km)" type="number" step="0.1" required />
            <Input name="service_type" label="Service Type" placeholder="Oil Change" required />
            <Input name="cost" label="Cost (₹)" type="number" step="0.01" required />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full">Add Maintenance</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
