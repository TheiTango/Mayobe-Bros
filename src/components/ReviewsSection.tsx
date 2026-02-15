import { useEffect, useState } from 'react';
import { supabase, Review } from '../lib/supabase';
import { Star, CheckCircle } from 'lucide-react';

export default function ReviewsSection() {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    rating: 5,
    comment: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (allReviews.length > 0) {
      shuffleReviews();
      const interval = setInterval(shuffleReviews, 8000);
      return () => clearInterval(interval);
    }
  }, [allReviews]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAllReviews(data);
    }
  };

  const shuffleReviews = () => {
    const shuffled = [...allReviews].sort(() => Math.random() - 0.5);
    setDisplayedReviews(shuffled.slice(0, 6));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('reviews')
      .insert([{
        ...formData,
        is_verified: false
      }]);

    if (!error) {
      setIsSubmitted(true);
      setFormData({
        user_name: '',
        rating: 5,
        comment: ''
      });
      setTimeout(() => {
        setIsSubmitted(false);
        setShowForm(false);
      }, 3000);
      loadReviews();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <section className="bg-white dark:bg-gray-900 py-16 transition-colors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">What Our Readers Say</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
            Join thousands of satisfied readers who trust Mayobe Bros for quality content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg dark:hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">{review.user_name}</h4>
                    {review.is_verified && (
                      <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors">{review.comment}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 transition-colors">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-semibold"
            >
              Write a Review
            </button>
          ) : (
            <div className="max-w-2xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-8 transition-colors">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle size={64} className="text-green-500 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Thank You!</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Share Your Experience</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="user_name"
                        required
                        value={formData.user_name}
                        onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              size={32}
                              className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500' : 'text-gray-300 dark:text-gray-600'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Your Review
                      </label>
                      <textarea
                        id="comment"
                        required
                        rows={4}
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-colors"
                        placeholder="Share your thoughts about Mayobe Bros..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-semibold"
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
