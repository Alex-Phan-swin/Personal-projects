chrome.runtime.onInstalled.addListener(() => {
  console.log('Spam Detector extension installed successfully');

  chrome.storage.local.get(['apiUrl'], (result) => {
    if (!result.apiUrl) {
      chrome.storage.local.set({ 
        apiUrl: 'http://localhost:8000/api/getPrediction' 
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedSites = ['mail.google.com', 'outlook.live.com', 'outlook.office.com', 'mail.yahoo.com'];
    const isSupported = supportedSites.some(site => tab.url.includes(site));
    
    if (isSupported) {
      console.log('Spam Detector ready on:', tab.url);
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.id);
});