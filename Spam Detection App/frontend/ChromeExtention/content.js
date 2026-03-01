const EMAIL_PROVIDERS = {
  GMAIL: 'gmail',
  OUTLOOK: 'outlook',
  YAHOO: 'yahoo'
};

function detectProvider() {
  const hostname = window.location.hostname;
  if (hostname.includes('mail.google.com')) return EMAIL_PROVIDERS.GMAIL;
  if (hostname.includes('outlook')) return EMAIL_PROVIDERS.OUTLOOK;
  if (hostname.includes('mail.yahoo.com')) return EMAIL_PROVIDERS.YAHOO;
  return null;
}

function extractEmailGmail() {
  try {
    console.log('[Spam Detector] Extracting Gmail email...');
    
    let sender = '';
    let senderName = '';
    let senderEmail = '';
    
    const emailHeader = document.querySelector('span.go');
    if (emailHeader) {
      const emailSpan = emailHeader.querySelector('span[email]');
      if (emailSpan) {
        senderEmail = emailSpan.getAttribute('email') || '';
        const nameElement = emailHeader.querySelector('.gD');
        senderName = nameElement ? (nameElement.getAttribute('name') || nameElement.textContent.trim()) : '';
      }
    }
    
    if (!senderEmail) {
      const emailElements = document.querySelectorAll('span[email], div[email]');
      for (const elem of emailElements) {
        const email = elem.getAttribute('email');
        if (email && email.includes('@')) {
          senderEmail = email;
          break;
        }
      }
    }
    
    if (senderEmail) {
      sender = senderName ? `${senderName} <${senderEmail}>` : senderEmail;
    }
    
    console.log('[Spam Detector] Gmail Sender:', sender);
    
    let subject = '';
    const subjectElement = document.querySelector('h2.hP') || 
                          document.querySelector('h2[data-legacy-thread-id]');
    if (subjectElement) {
      subject = subjectElement.textContent.trim();
    }
    
    console.log('[Spam Detector] Gmail Subject:', subject);
    
    let body = '';
    const bodyElement = document.querySelector('div.a3s.aiL') || 
                       document.querySelector('div.ii.gt') ||
                       document.querySelector('[data-message-id] div.a3s');
    
    if (bodyElement) {
      body = bodyElement.innerText.trim();
    }
    
    console.log('[Spam Detector] Gmail Body length:', body.length);
    
    return { sender, subject, body };
  } catch (error) {
    console.error('[Spam Detector] Gmail extraction error:', error);
    return { sender: '', subject: '', body: '' };
  }
}

function extractEmailOutlook() {
  try {
    console.log('[Spam Detector] Extracting Outlook email...');
    
    // Extract sender
    let sender = '';
    let senderEmail = '';
    let senderName = '';
    
    // Method 1: Find the selected message in the message list
    // Outlook stores sender info in the message list item with aria-selected="true"
    const selectedMessage = document.querySelector('[aria-selected="true"][role="option"]') ||
                           document.querySelector('[aria-selected="true"][role="listitem"]');
    
    if (selectedMessage) {
      console.log('[Spam Detector] Found selected message');
      
      // Get sender email from span with title attribute containing @
      const emailSpan = selectedMessage.querySelector('span[title*="@"]');
      if (emailSpan) {
        senderEmail = emailSpan.getAttribute('title') || '';
        console.log('[Spam Detector] Found sender email in title:', senderEmail);
      }
      
      // Get sender name from aria-label
      const ariaLabel = selectedMessage.getAttribute('aria-label') || '';
      if (ariaLabel) {
        // Sender name is usually the first part before the subject
        // Format: "Sender Name Subject Line Date Content..."
        const parts = ariaLabel.split(/(?:Fri|Sat|Sun|Mon|Tue|Wed|Thu)\s+\d{1,2}:\d{2}/);
        if (parts[0]) {
          // The sender name is before the date/time
          // Remove "Unread" if present
          senderName = parts[0].replace('Unread', '').trim();
          // Take first 100 chars as sender name (before subject usually)
          senderName = senderName.substring(0, 100).trim();
        }
      }
    }
    
    // Method 2: Fallback - search all message items for emails
    if (!senderEmail) {
      const allMessages = document.querySelectorAll('[role="option"], [role="listitem"]');
      for (const message of allMessages) {
        const emailSpan = message.querySelector('span[title*="@"]');
        if (emailSpan) {
          senderEmail = emailSpan.getAttribute('title') || '';
          if (senderEmail) {
            console.log('[Spam Detector] Found email via fallback:', senderEmail);
            break;
          }
        }
      }
    }
    
    // Method 3: Last resort - search all spans with title containing @
    if (!senderEmail) {
      const allEmailSpans = document.querySelectorAll('span[title*="@"]');
      if (allEmailSpans.length > 0) {
        senderEmail = allEmailSpans[0].getAttribute('title') || '';
        console.log('[Spam Detector] Found email via span search:', senderEmail);
      }
    }
    
    // Format sender
    if (senderEmail) {
      sender = senderName ? `${senderName} <${senderEmail}>` : senderEmail;
    }
    
    console.log('[Spam Detector] Outlook Sender:', sender);
    
    // Extract subject
    let subject = '';
    
    // Method 1: Get all headings and find the one that's not "Inbox"
    const headings = document.querySelectorAll('[role="heading"], h1, h2, h3');
    for (const heading of headings) {
      const text = heading.textContent.trim();
      // Subject is usually longer than navigation items and not "Inbox"
      if (text.length > 10 && 
          text.length < 300 && 
          text.toLowerCase() !== 'inbox' &&
          !text.toLowerCase().includes('microsoft') &&
          !text.toLowerCase().includes('outlook')) {
        subject = text;
        console.log('[Spam Detector] Found subject in heading:', subject.substring(0, 50));
        break;
      }
    }
    
    // Method 2: Extract from selected message's aria-label if heading method fails
    if (!subject && selectedMessage) {
      const ariaLabel = selectedMessage.getAttribute('aria-label') || '';
      // Subject usually appears after sender and before date
      // Try to extract it by finding content between sender and date
      const dateMatch = ariaLabel.match(/(Fri|Sat|Sun|Mon|Tue|Wed|Thu)\s+\d{1,2}:\d{2}/);
      if (dateMatch) {
        const beforeDate = ariaLabel.substring(0, dateMatch.index).trim();
        // Remove sender name (first ~50 chars) to get subject
        const possibleSubject = beforeDate.substring(50).trim();
        if (possibleSubject.length > 10 && possibleSubject.length < 300) {
          subject = possibleSubject;
        }
      }
    }
    
    console.log('[Spam Detector] Outlook Subject:', subject);
    
    // Extract body - This already works from your test!
    let body = '';
    
    // Method 1: role="document" works perfectly based on your test
    const bodyElement = document.querySelector('[role="document"]');
    if (bodyElement) {
      body = bodyElement.innerText.trim();
      console.log('[Spam Detector] Body extracted from role=document');
    }
    
    // Fallback: if body is too short, get more content
    if (!body || body.length < 50) {
      const allDivs = document.querySelectorAll('div');
      let longestText = '';
      
      for (const div of allDivs) {
        const text = div.innerText?.trim() || '';
        if (text.length > longestText.length && text.length > 100) {
          longestText = text;
        }
      }
      
      if (longestText.length > body.length) {
        body = longestText;
        console.log('[Spam Detector] Body extracted from longest div');
      }
    }
    
    console.log('[Spam Detector] Outlook Body length:', body.length);
    
    // If we have body but no sender, try to extract sender from body
    if (!sender && body) {
      const emailMatch = body.match(/From:?\s*([\w\.-]+@[\w\.-]+\.\w+)/i) ||
                        body.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      if (emailMatch) {
        sender = emailMatch[emailMatch.length - 1];
        console.log('[Spam Detector] Extracted sender from body:', sender);
      }
    }
    
    return { sender, subject, body };
  } catch (error) {
    console.error('[Spam Detector] Outlook extraction error:', error);
    return { sender: '', subject: '', body: '' };
  }
}

function extractEmailYahoo() {
  try {
    console.log('[Spam Detector] Extracting Yahoo email...');
    
    let sender = '';
    const senderElement = document.querySelector('[data-test-id="message-from"]') ||
                         document.querySelector('[data-test-id="sender-contact"]');
    
    if (senderElement) {
      sender = senderElement.textContent.trim();
    }
    
    console.log('[Spam Detector] Yahoo Sender:', sender);
    
    let subject = '';
    const subjectElement = document.querySelector('[data-test-id="message-subject"]');
    
    if (subjectElement) {
      subject = subjectElement.textContent.trim();
    }
    
    console.log('[Spam Detector] Yahoo Subject:', subject);
    
    let body = '';
    const bodyElement = document.querySelector('[data-test-id="message-view-body-content"]');
    
    if (bodyElement) {
      body = bodyElement.innerText.trim();
    }
    
    console.log('[Spam Detector] Yahoo Body length:', body.length);
    
    return { sender, subject, body };
  } catch (error) {
    console.error('[Spam Detector] Yahoo extraction error:', error);
    return { sender: '', subject: '', body: '' };
  }
}

function extractEmail() {
  const provider = detectProvider();
  console.log('[Spam Detector] Detected provider:', provider);
  
  switch (provider) {
    case EMAIL_PROVIDERS.GMAIL:
      return extractEmailGmail();
    case EMAIL_PROVIDERS.OUTLOOK:
      return extractEmailOutlook();
    case EMAIL_PROVIDERS.YAHOO:
      return extractEmailYahoo();
    default:
      console.log('[Spam Detector] Unsupported email provider');
      return { sender: '', subject: '', body: '' };
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractEmail') {
    console.log('[Spam Detector] Received extractEmail request');
    
    const emailData = extractEmail();
    
    console.log('[Spam Detector] Extracted data:', {
      sender: emailData.sender ? 'Found' : 'Missing',
      subject: emailData.subject ? 'Found' : 'Missing',
      bodyLength: emailData.body.length
    });
    
    if (emailData.sender && emailData.body) {
      sendResponse({ 
        success: true, 
        sender: emailData.sender, 
        subject: emailData.subject || '', 
        body: emailData.body 
      });
    } else {
      sendResponse({ 
        success: false, 
        error: 'Could not extract email data. Make sure an email is open and fully loaded.'
      });
    }
    return true;
  }
  
  if (request.action === 'showResult') {
    showSpamOverlay(request.data);
    sendResponse({ success: true });
    return true;
  }
});

function showSpamOverlay(data) {
  const existing = document.getElementById('spam-detector-overlay');
  if (existing) existing.remove();
  
  const spamChance = Math.round(data.spamChance * 100);
  const isSpam = data.label === 1;
  
  const overlay = document.createElement('div');
  overlay.id = 'spam-detector-overlay';
  overlay.className = 'spam-detector-slide-in';
  
  let warningIcon, warningText, barColor, buttonClass, buttonText;
  
  if (spamChance >= 70) {
    warningIcon = '⚠️';
    warningText = `⚠️ WARNING ⚠️<br>This Email is ${spamChance}% likely to be spam`;
    barColor = '#e74c3c';
    buttonClass = 'spam-high';
    buttonText = `⚠️ ${spamChance}% Spam Likelihood`;
  } else if (spamChance >= 40) {
    warningIcon = '⚠️';
    warningText = `This Email has a ${spamChance}%<br>likelihood to be spam`;
    barColor = '#f39c12';
    buttonClass = 'spam-medium';
    buttonText = `${spamChance}% Spam Likelihood`;
  } else {
    warningIcon = '✅';
    warningText = `This Email has a ${spamChance}%<br>likelihood to be spam`;
    barColor = '#4caf50';
    buttonClass = 'legitimate';
    buttonText = `${spamChance}% Spam Likelihood`;
  }
  
  overlay.innerHTML = `
    <div class="spam-detector-header">
      <span class="spam-detector-icon">✉️</span>
      <span class="spam-detector-title">Spam Detector</span>
    </div>
    
    <div class="spam-detector-message">
      ${warningText}
    </div>
    
    <div class="spam-detector-bar-container">
      <div class="spam-detector-bar" style="width: ${spamChance}%; background: ${barColor};"></div>
    </div>
    
    <button class="spam-detector-button ${buttonClass}">
      ${buttonText}
    </button>
  `;
  
  document.body.appendChild(overlay);
  
  const duration = window.SPAM_DETECTOR_CONFIG?.OVERLAY_DURATION || 10000;
  setTimeout(() => {
    overlay.classList.remove('spam-detector-slide-in');
    overlay.classList.add('spam-detector-slide-out');
    setTimeout(() => overlay.remove(), 500);
  }, duration);
  
  overlay.addEventListener('click', () => {
    overlay.classList.remove('spam-detector-slide-in');
    overlay.classList.add('spam-detector-slide-out');
    setTimeout(() => overlay.remove(), 500);
  });
}

console.log('[Spam Detector] Content script loaded on:', window.location.hostname);
