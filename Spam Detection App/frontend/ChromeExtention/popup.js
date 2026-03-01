document.getElementById('checkButton').addEventListener('click', async () => {
  const button = document.getElementById('checkButton');
  const status = document.getElementById('status');
  
  button.disabled = true;
  button.textContent = 'Analyzing...';
  status.style.display = 'none';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    console.log('[Spam Detector Popup] Current tab URL:', tab.url);
    
    const url = tab.url;
    if (!url.includes('mail.google.com') && !url.includes('outlook') && !url.includes('mail.yahoo.com')) {
      status.textContent = 'Please open Gmail, Outlook, or Yahoo Mail';
      status.className = 'status';
      status.style.display = 'block';
      return;
    }
    
    console.log('[Spam Detector Popup] Sending extractEmail message to content script...');
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractEmail' });
    
    console.log('[Spam Detector Popup] Extract response:', response);
    
    if (!response || !response.success) {
      status.textContent = response?.error || 'Could not extract email. Open an email first.';
      status.className = 'status';
      status.style.display = 'block';
      return;
    }

    console.log('[Spam Detector Popup] Sending to API:', {
      email: response.sender,
      subject: response.subject,
      bodyLength: response.body.length
    });

    const params = new URLSearchParams({
      email: response.sender,
      subject: response.subject || "",
      body: response.body,
      advanced: 0
    });

    const apiResponse = await fetch(`http://localhost:8000/api/prediction?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('[Spam Detector Popup] API response status:', apiResponse.status);
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[Spam Detector Popup] API error:', errorText);
      throw new Error(`API error: ${apiResponse.status}`);
    }
    
    const result = await apiResponse.json();
    console.log('[Spam Detector Popup] API result:', result);
    
    const spamChance = Math.round(result.spamChance * 100);

    let statusClass = '';
    let statusIcon = '';
    let statusText = '';
    let displayPercentage = spamChance;

    if (spamChance >= 70) {
      statusClass = 'spam-high';
      statusIcon = '⚠️';
      statusText = 'HIGH SPAM RISK';
    } else if (spamChance >= 40) {
      statusClass = 'spam-medium';
      statusIcon = '⚠️';
      statusText = 'MODERATE RISK';
    } else {
      statusClass = 'spam-low';
      statusIcon = '✅';
      statusText = 'SAFE EMAIL';
      displayPercentage = 100 - spamChance;
    }

    status.className = 'status ' + statusClass;
    status.innerHTML = `
      <span class="status-icon">${statusIcon}</span>
      <span class="status-percentage">${displayPercentage}%</span>
      <span class="status-label">${statusText}</span>
    `;
    status.style.display = 'block';
    
  } catch (error) {
    console.error('[Spam Detector Popup] Error:', error);
    
    let errorMessage = 'Error analyzing email.';
    
    if (error.message.includes('Could not establish connection')) {
      errorMessage = 'Extension error. Try refreshing the page.';
    } else if (error.message.includes('API error') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Backend not running. Start the server on port 8000.';
    }
    
    status.textContent = errorMessage;
    status.className = 'status';
    status.style.display = 'block';
  } finally {
    button.disabled = false;
    button.textContent = 'Check for Spam';
  }
});

console.log('[Spam Detector Popup] Popup script loaded');
