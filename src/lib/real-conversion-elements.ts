/**
 * Real-world conversion element snippets for landing pages.
 * These are returned as HTML strings so they can be dropped into non-React contexts
 * (e.g., LLM-generated content or server-rendered blocks).
 */

export type ConversionTemplate = (...args: unknown[]) => string;

export const REAL_CONVERSION_ELEMENTS = {
  // 1. THE "SCARCITY STACK" (Real marketers use 3+ scarcity elements)
  scarcityStack: {
    template: (productName: string, price: number) => `
      <div class="scarcity-stack">
        <!-- Tier 1: Timer -->
        <div class="scarcity-tier timer">
          <div class="icon">⏰</div>
          <div class="content">
            <strong>PRICE INCREASE IN: <span class="countdown">23:59:59</span></strong>
            <small>The price of ${productName} goes up to $${price * 2} at midnight</small>
          </div>
        </div>
        
        <!-- Tier 2: Limited Spots -->
        <div class="scarcity-tier spots">
          <div class="icon">🔥</div>
          <div class="content">
            <strong>ONLY 8 SPOTS LEFT AT THIS PRICE</strong>
            <small>12 people have purchased in the last hour</small>
          </div>
        </div>
        
        <!-- Tier 3: Bonus Deadline -->
        <div class="scarcity-tier bonus">
          <div class="icon">🎁</div>
          <div class="content">
            <strong>FREE BONUS EXPIRES IN: <span class="countdown">01:59:59</span></strong>
            <small>${productName} + 3 Free Bonuses (Value: $${price * 3})</small>
          </div>
        </div>
      </div>`
  },

  // 2. THE "FAKE URGENCY NOTIFICATION" BAR
  fakeUrgencyBar: {
    template: () => {
      const notifications = [
        "⚠️ WARNING: This page will self-destruct in 00:10:00",
        "🔥 HOT OFFER: 3 people are viewing this right now",
        "🚨 ALERT: Prices increase after next 5 purchases",
        "📈 TRENDING: This product sold out twice last week"
      ];
      return `
        <div class="urgency-bar">
          <marquee behavior="scroll" direction="left">
            ${notifications.join(' • ')} • 
            <span class="blink">⚠️ DON'T MISS OUT ⚠️</span>
          </marquee>
        </div>`;
    }
  },

  // 3. THE "BEN FRANKLIN" DECISION MATRIX (Real conversion tactic)
  decisionMatrix: {
    template: (productName: string) => `
      <div class="decision-matrix">
        <h3>⏳ The "Do Nothing" Cost Calculator</h3>
        <p>What will it cost you to keep doing what you're doing?</p>
        
        <table class="cost-table">
          <tr>
            <td><strong>If you do nothing for 1 more month:</strong></td>
            <td class="cost">$${Math.floor(Math.random() * 500) + 500} wasted</td>
          </tr>
          <tr>
            <td><strong>If you wait 3 months:</strong></td>
            <td class="cost">$${Math.floor(Math.random() * 2000) + 1000} wasted</td>
          </tr>
          <tr>
            <td><strong>If you wait 1 year:</strong></td>
            <td class="cost">$${Math.floor(Math.random() * 10000) + 5000} wasted</td>
          </tr>
        </table>
        
        <p class="small"><strong>Meanwhile:</strong> The people who act TODAY are already getting results.</p>
        <p class="small">Jessica saved $3,247 in her first 90 days with ${productName}.</p>
      </div>`
  },

  // 4. THE "ONE-CALL CLOSE" (Sales page technique)
  oneCallClose: {
    template: () => `
      <div class="one-call-close">
        <div class="close-header">
          <h3>🚨 FINAL NOTICE: Read This Before You Leave</h3>
          <p>(This is your last chance at this price)</p>
        </div>
        
        <div class="close-content">
          <p>I know you're skeptical. I was too.</p>
          <p>But ask yourself this:</p>
          
          <ul class="close-questions">
            <li>What will it cost you to do nothing?</li>
            <li>Can you afford another year of the same results?</li>
            <li>What's the REAL risk? (We offer a 100% money-back guarantee)</li>
            <li>What if this actually works?</li>
          </ul>
          
          <div class="close-cta">
            <p><strong>The choice is simple:</strong></p>
            <p>Click the button below and get instant access...</p>
            <p><em>Or close this page and wonder "what if" forever.</em></p>
            
            <button class="final-cta">⚡ YES, I WANT TO ESCAPE THE CYCLE</button>
            
            <p class="final-note">This offer expires when you leave this page. No second chances.</p>
          </div>
        </div>
      </div>`
  },

  // 5. FAKE "LIVE CHAT" POPUP
  fakeChatPopup: {
    template: (productName: string) => `
      <div class="chat-popup" id="fakeChat">
        <div class="chat-header">
          <span class="status-dot"></span>
          <strong>Support Agent (Online)</strong>
          <button class="close-chat" onclick="document.getElementById('fakeChat').style.display='none'">×</button>
        </div>
        <div class="chat-body">
          <div class="message agent">
            <strong>Alex (Support):</strong> Hi there! I noticed you're looking at ${productName}. Any questions I can answer?
          </div>
          <div class="message agent">
            <strong>Alex (Support):</strong> Just FYI - we're almost sold out. Only 3 left at the discount price.
          </div>
          <div class="typing-indicator">
            <strong>Alex (Support):</strong> <span class="typing">is typing...</span>
          </div>
        </div>
        <div class="chat-input">
          <input type="text" placeholder="Type your question..." readonly>
          <button>Send</button>
        </div>
      </div>
      <script>
        setTimeout(() => {
          const el = document.getElementById('fakeChat');
          if (el) el.style.display = 'block';
        }, 15000);
      </script>`
  },

  // 6. THE "PRICE ANCHOR" DECEPTION
  priceDeception: {
    template: (currentPrice: number) => {
      const original = currentPrice * 4;
      const monthly = Math.floor(currentPrice / 3);
      return `
        <div class="price-anchor-deception">
          <div class="price-comparison">
            <div class="bad-price">
              <h4>What Others Charge:</h4>
              <p class="strike">$${original}/year</p>
              <p class="small">(That's $${Math.floor(original/12)}/month!)</p>
            </div>
            
            <div class="vs">VS</div>
            
            <div class="good-price">
              <h4>Our Price TODAY Only:</h4>
              <p class="main-price">$${currentPrice} <span>one-time</span></p>
              <p class="equivalent">(That's like $${monthly}/month for lifetime access!)</p>
            </div>
          </div>
          
          <div class="savings-calculator">
            <p><strong>🔥 YOU SAVE: $${original - currentPrice} (${Math.round((original - currentPrice)/original*100)}% OFF)</strong></p>
            <p class="small">Plus 3 free bonuses worth $${currentPrice * 2}</p>
          </div>
        </div>`;
    }
  }
} as const;

export type RealConversionElementKey = keyof typeof REAL_CONVERSION_ELEMENTS;
