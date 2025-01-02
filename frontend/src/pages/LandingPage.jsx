import React, { useState } from 'react'
import axios from 'axios'
import { ChartBarIcon, ChatBubbleBottomCenterTextIcon, BoltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
const features = [
  {
    name: 'Advanced Analytics',
    description: 'Get deep insights into customer sentiment and key topics.',
    icon: ChartBarIcon,
  },
  {
    name: 'Real-time Processing',
    description: 'Analyze feedback as it comes in, staying ahead of trends.',
    icon: BoltIcon,
  },
  {
    name: 'AI-Powered Summaries',
    description: 'Generate concise, actionable summaries from complex feedback.',
    icon: ChatBubbleBottomCenterTextIcon,
  },
]
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager at TechCorp',
    image: '/sarah.jpeg',
    quote: 'This tool has revolutionized how we handle customer feedback. It is like having a team of analysts working 24/7.',
  },
  {
    name: 'Michael Chen',
    role: 'CEO of E-commerce Solutions',
    image: '/michael.jpeg',
    quote: 'The insights we have gained have directly contributed to a 30% increase in customer satisfaction scores.',
  },
]
export default function LandingPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [reviews, setReviews] = useState([])
  const [keyphrases, setKeyphrases] = useState([]);
  const [overallSentiment, setOverallSentiment] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setReviews([]);
    setKeyphrases([]);
    setOverallSentiment('');
    setSummary('');

    try {
        // First, get the analysis results
        const response = await axios.post('http://localhost:5000/scrape', {
            productUrl: url
        });

        // If user is logged in, store the search history
        const userEmail = localStorage.getItem('userEmail');
        const token = localStorage.getItem('token');
        
        if (userEmail && token) {
            try {
                await axios.post('http://localhost:5005/api/search-history', {
                    userEmail: userEmail,
                    searchUrl: url,
                    searchResponse: response.data
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (historyError) {
                console.log('Failed to save search history:', historyError);
                // Continue with displaying results even if history save fails
            }
        }

        // Display results regardless of login status
        setReviews(response.data.reviews);
        setKeyphrases(response.data.keyphrases);
        setOverallSentiment(response.data.overall_sentiment);
        setSummary(response.data.summary);
        setMessage(response.data.message || `Successfully analyzed ${response.data.total_reviews} reviews.`);

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to analyze reviews. Please try again.';
        setMessage(errorMessage);
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Unlock the power of</span>{' '}
                  <span className="block text-indigo-600 xl:inline">customer feedback</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Our AI-powered feedback analysis tool helps you understand your customers better than ever before.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="#how-it-works"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      {/* URL Input Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="mt-8 sm:flex">
              <label htmlFor="url" className="sr-only">Product URL</label>
              <input
                type="text"
                name="url"
                id="url"
                className="block w-full py-3 px-3 text-base rounded-md placeholder-gray-500 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:flex-1 border-gray-300"
                placeholder="Enter product URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Feedbacks'}
              </button>
            </form>
            {message && <p className="mt-4 text-green-500">{message}</p>}
          </div>
        </div>
      </div>

      {summary && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Summary</h2>
            <p className="text-gray-700 text-lg">{summary}</p>
          </div>
        </div>
      )}

      {keyphrases && keyphrases.length > 0 && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Phrases</h2>
            <div className="flex flex-wrap gap-2">
              {keyphrases.map((phrase, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {overallSentiment && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Sentiment</h2>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium bg-indigo-100 text-indigo-800">
              {overallSentiment}
            </span>
          </div>
        </div>
      )}




      {/* Display Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Analyzed Reviews</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {reviews.map((review, index) => (
                <div key={index} className="bg-gray-50 rounded-lg shadow p-6">
                  <p className="text-sm text-gray-600 mb-2">Rating: {review.rating}</p>
                  {/*<p className="text-sm font-semibold text-indigo-600 mb-2">Sentiment: {review.predicted_sentiment}</p>*/}
                  <p className='text-sm font-bold mb-2'>{review.review_title}</p>
                  <p className="text-gray-800">{review.review_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to understand your customers
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform uses cutting-edge AI to analyze and summarize customer feedback, giving you actionable insights.
            </p>
          </div>
          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      {/* How It Works Section */}
      <div id="how-it-works" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simplifying Feedback Analysis
            </p>
          </div>
          <div className="mt-10">
            <div className="flex flex-col md:flex-row justify-around items-center">
              <div className="flex flex-col items-center mb-8 md:mb-0">
                <MagnifyingGlassIcon className="h-12 w-12 text-indigo-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">1. Input URL</h3>
                <p className="text-gray-500 text-center">Enter the product page URL</p>
              </div>
              <div className="flex flex-col items-center mb-8 md:mb-0">
                <BoltIcon className="h-12 w-12 text-indigo-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">2. AI Analysis</h3>
                <p className="text-gray-500 text-center">Our AI processes the feedback</p>
              </div>
              <div className="flex flex-col items-center">
                <ChatBubbleBottomCenterTextIcon className="h-12 w-12 text-indigo-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">3. Get Insights</h3>
                <p className="text-gray-500 text-center">Receive a comprehensive summary</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonials Section */}
      <div id="testimonials" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">What our customers are saying</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-gray-50 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <img className="h-12 w-12 rounded-full mr-4" src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                    <p className="text-indigo-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-indigo-200">Start analyzing your feedback today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};