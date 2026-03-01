const CONFIG = {
  API_URL: 'http://localhost:8000/api/getPrediction',
  ADVANCED_MODE: 0, // Set to 1 for visualizations
  OVERLAY_DURATION: 10000, // 10 seconds
  ANIMATION_DURATION: 500 // 0.5 seconds
};

if (typeof window !== 'undefined') {
  window.SPAM_DETECTOR_CONFIG = CONFIG;
}