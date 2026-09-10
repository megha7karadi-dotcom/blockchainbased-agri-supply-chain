import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConsumerFeedback: React.FC = () => {
  const { batches } = useApp();
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0].id);
  const [rating, setRating] = useState(5);
  const [freshnessRating, setFreshnessRating] = useState(5);
  const [feedback, setFeedback] = useState('Incredible aroma and sweetness! The Alphonso mangoes were perfectly ripened and free of any chemical blemishes. Knowing the farmer got ₹120/kg makes me feel great about buying this.');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 3500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-teal-600" />
          <span>Produce Quality & Farmer Rating</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit authentic consumer feedback anchored to the batch token to empower honest organic farmers
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {submitted ? (
          <div className="text-center py-8 space-y-3 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Feedback Published On-Chain!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your rating has been cryptographically attributed to the batch token and factored into the producer's decentralized reputation score.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Purchased Produce Batch</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.batchId}) - Farmer: {b.farmerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Overall Taste & Quality Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 text-amber-400 hover:scale-110 transition"
                  >
                    <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cold-Chain Freshness Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFreshnessRating(star)}
                    className="p-1.5 text-teal-500 hover:scale-110 transition"
                  >
                    <Star className={`w-7 h-7 ${star <= freshnessRating ? 'fill-teal-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consumer Comments & Testimonial</label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-300" />
              <span>Submit Verified Feedback & Support Farmer</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
