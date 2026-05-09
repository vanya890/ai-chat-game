# AI Chat Game — Token Dashboard Guide

## Overview

The Token Dashboard provides comprehensive analytics on your AI usage, helping you track costs, optimize spending, and understand usage patterns.

## 📊 Dashboard Features

### Main Metrics

The dashboard displays key metrics at a glance:

```
┌─────────────────────────────────────────────────────────┐
│  Token Dashboard                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Today's Usage                                          │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │ Tokens Used  │ Est. Cost    │ Messages     │        │
│  │   12,450     │   $0.0019    │     18       │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                         │
│  This Week                                              │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │   84,320     │   $0.0126    │    127       │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                         │
│  This Month                                             │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │  342,150     │   $0.0513    │    512       │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                         │
│  Monthly Projection: $0.06 (based on current usage)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Usage Charts

Visual breakdowns of your usage:

#### 1. Daily Usage Trend

Line chart showing tokens used per day:

```
Tokens
  │
  │         ╭─╮
  │    ╭──╮ │ │ ╭──╮
  │ ╭──╯  ╰─╯ │ │  ╰──╮
  │ │         │ │     │
  └─┴─────────┴─┴─────┴───── Days
    M  T  W  T  F  S  S
```

**Insights:**
- Identify peak usage days
- Spot unusual spikes
- Track weekly patterns

#### 2. Cost by Model

Pie chart showing cost distribution across models:

```
Model Costs (This Month)

    gpt-4o-mini
     ████████████  $0.042 (82%)
    
    gpt-4o
     ████  $0.009 (18%)
```

**Insights:**
- See which models drive costs
- Identify optimization opportunities
- Verify model tiering is working

#### 3. Top Characters

Bar chart showing most-used characters:

```
Characters by Messages (Week)

Sherlock     ████████████████████  45 msgs
Merlin       ██████████████        28 msgs
Teacher      ██████████            19 msgs
Comedian     ██████                12 msgs
```

**Insights:**
- Discover favorite characters
- Identify underused characters
- Understand user preferences

#### 4. Hourly Distribution

Heat map showing when you chat:

```
Hour    Mon Tue Wed Thu Fri Sat Sun
00:00   ░   ░   ░   ░   ▒   ▒   ░
06:00   ░   ░   ░   ░   ░   ▒   ▒
12:00   ▒   ▒   ▒   ▒   ░   ▒   ▒
18:00   █   █   █   █   ▒   █   █
22:00   ▒   ▒   ▒   ▒   ▒   ▒   ▒
```

**Insights:**
- Find your chat habits
- Optimize for off-peak hours (if using rate-limited APIs)

---

## 💰 Cost Tracking

### How Costs Are Calculated

The dashboard tracks costs based on:

1. **Token counts** from API responses
2. **Model pricing** from `ai-providers.json`
3. **Separate tracking** for input vs output tokens

**Formula:**
```
Cost = (input_tokens × input_price_per_1k / 1000) + 
       (output_tokens × output_price_per_1k / 1000)
```

**Example (GPT-4o-mini):**
- Input: 1,000 tokens × $0.00015/1k = $0.00015
- Output: 500 tokens × $0.00060/1k = $0.00030
- **Total: $0.00045 per message**

### Current Pricing (OpenAI)

| Model | Input (per 1M) | Output (per 1M) | Per 1k Input | Per 1k Output |
|-------|---------------|-----------------|--------------|---------------|
| gpt-4o-mini | $0.15 | $0.60 | $0.00015 | $0.00060 |
| gpt-4o | $2.50 | $10.00 | $0.0025 | $0.010 |
| o1-preview | $15.00 | $60.00 | $0.015 | $0.060 |

**Note:** Prices update automatically from provider config.

### Local Models (Zero Cost)

When using Ollama, LM Studio, or other local providers:

```
Provider: Ollama (localhost:11434)
Cost: $0.00 (free!)
Tokens tracked but not billed
```

Dashboard shows:
- ✅ Tokens used
- ✅ Messages sent
- 💚 **$0.00 cost** (highlighted in green)

---

## 🎯 Optimization Recommendations

The dashboard provides actionable insights:

### Smart Suggestions

Based on your usage patterns:

```
💡 Optimization Tips

1. You used gpt-4o for 50 simple greetings.
   → Switch to gpt-4o-mini for greetings (save ~$0.12/month)

2. Your average response is 450 tokens, but max is 300.
   → Increase maxTokens to reduce truncation

3. Sherlock character uses 2x more tokens than average.
   → Review system prompt for conciseness

4. 80% of your chats are with 2 characters.
   → Consider creating similar characters with lower-cost models

5. You're using OpenAI exclusively.
   → Try Ollama for 50% cost savings (free for local models)
```

### Auto-Detected Issues

The dashboard flags potential problems:

⚠️ **Warning Signs:**
- Sudden spike in token usage (>200% increase)
- Character consistently hitting max token limit
- Using expensive model for simple queries
- Unusual activity patterns (possible bug)

---

## 📈 Advanced Analytics

### Export Data

Export usage data for external analysis:

**Formats:**
- CSV (spreadsheet compatible)
- JSON (programmatic access)
- PDF report (shareable summary)

**Steps:**
1. Click **Export** button
2. Select date range
3. Choose format
4. Download file

**CSV Columns:**
```csv
date,model,character,input_tokens,output_tokens,total_tokens,cost
2026-01-15,gpt-4o-mini,Sherlock,120,280,400,0.00018
2026-01-15,gpt-4o-mini,Merlin,95,310,405,0.00020
...
```

### Custom Date Ranges

Analyze specific periods:

**Presets:**
- Today
- Yesterday
- Last 7 days
- Last 30 days
- This month
- Last month
- All time

**Custom:**
- Pick start and end dates
- Compare two periods side-by-side

### Filtering

Filter data by:

- **Character**: View stats for specific characters only
- **Model**: Isolate usage by model type
- **Provider**: Separate cloud vs local usage
- **Chat session**: Analyze individual conversations

---

## 🔔 Alerts & Limits

### Set Spending Limits

Prevent surprise bills:

```
┌─────────────────────────────────────┐
│  Spending Alerts                    │
├─────────────────────────────────────┤
│                                     │
│  Monthly Budget: [$50.00]          │
│                                     │
│  Alert me at:                       │
│  ☑ 50%  ($25.00)                   │
│  ☑ 75%  ($37.50)                   │
│  ☑ 90%  ($45.00)                   │
│  ☑ 100% ($50.00) — Stop generating │
│                                     │
│  Notification method:               │
│  ☑ In-app notification             │
│  ☐ Email (coming soon)             │
│                                     │
│  [Save Settings]                    │
│                                     │
└─────────────────────────────────────┘
```

### Alert Types

1. **Info** (25%, 50%): Gentle reminders
2. **Warning** (75%, 90%): Strong notifications
3. **Critical** (100%): Option to stop generation

### Hard Limits

When limit is reached:

```
⚠️ Monthly budget exceeded

You've reached your $50.00 monthly limit.

Options:
- Continue with local models (free)
- Wait until next month
- Increase budget limit

[Switch to Local Models] [Increase Limit] [Cancel]
```

---

## 📱 Mobile View

Dashboard is responsive for mobile devices:

```
┌───────────────────┐
│ Token Dashboard   │
├───────────────────┤
│ Today             │
│ 12,450 tokens     │
│ $0.0019           │
│                   │
│ Week              │
│ 84,320 tokens     │
│ $0.0126           │
│                   │
│ [View Details ▼]  │
│ [Export]          │
└───────────────────┘
```

**Mobile features:**
- Simplified charts
- Touch-friendly controls
- Swipe between time periods
- Quick actions (export, settings)

---

## 🔍 Understanding Metrics

### Token Counts

**Input Tokens:**
- System prompts
- Message history
- User messages
- Context summaries

**Output Tokens:**
- AI responses
- Generated content

**Why it matters:**
- Output tokens typically cost 4× more than input
- Long histories increase input tokens
- Verbose responses increase output tokens

### Cost Estimates

**Important notes:**

1. **Estimates only** — Actual billing may vary slightly
2. **Doesn't include** — API overhead, failed requests, caching
3. **Local models** — Always show $0.00 (no billing)
4. **Currency** — All costs in USD

### Average Response Size

Shows typical response length:

```
Average Response: 285 tokens
─────────────────────────────
Brief (<150):    20%
Normal (150-300): 65%
Detailed (>300):  15%
```

**Use this to:**
- Adjust `maxTokens` settings
- Identify chatty characters
- Optimize system prompts

---

## 💡 Best Practices

### 1. Monitor Weekly

Check dashboard once per week to:
- Catch unexpected cost increases
- Verify optimization strategies working
- Adjust budgets if needed

### 2. Set Realistic Budgets

Start conservative:
- Light users: $10-20/month
- Moderate users: $30-50/month
- Heavy users: $100+/month

Adjust based on actual usage after 1-2 months.

### 3. Use Local Models for Development

During testing and development:
- Use Ollama or LM Studio
- Zero cost for unlimited testing
- Switch to cloud models for production quality

### 4. Review Character Efficiency

Monthly review:
- Which characters use most tokens?
- Are expensive characters worth it?
- Can system prompts be optimized?

### 5. Leverage Off-Peak Hours

If using rate-limited APIs:
- Schedule heavy usage during off-peak
- Batch processing overnight
- Avoid peak business hours

---

## 🛠️ Troubleshooting

### Problem: Costs seem incorrect

**Possible causes:**
1. Pricing data outdated in config
2. Not counting cached responses
3. Including failed requests

**Solution:**
- Check `ai-providers.json` for current pricing
- Verify cache hit rate in settings
- Filter out error responses in analytics

### Problem: Dashboard not updating

**Possible causes:**
1. Browser cache
2. Background sync disabled
3. Storage quota exceeded

**Solution:**
- Hard refresh (Ctrl+Shift+R)
- Check settings → enable background sync
- Clear old chat data if storage full

### Problem: Export fails

**Possible causes:**
1. Large date range
2. Browser memory limit
3. Permission issues

**Solution:**
- Export smaller date ranges
- Try different browser
- Check download permissions

---

## 📊 Sample Reports

### Weekly Summary Email (Future Feature)

```
Subject: Your AI Chat Game Weekly Summary

Hi there!

Here's your usage for Jan 8-15, 2026:

📊 Usage Overview
- Total messages: 127
- Total tokens: 84,320
- Estimated cost: $0.0126

🏆 Top Characters
1. Sherlock — 45 messages
2. Merlin — 28 messages
3. Teacher — 19 messages

💡 Savings Tip
You used gpt-4o for 12 simple greetings.
Switch to gpt-4o-mini to save ~$0.03/week.

📈 Trend
↑ 15% more messages than last week

Keep chatting!
The AI Chat Game Team
```

### Monthly Cost Report

```
Monthly Report — January 2026
═══════════════════════════════

Total Spend: $0.0513
Budget: $50.00
Remaining: $49.95

Breakdown by Model:
- gpt-4o-mini: $0.0421 (82%)
- gpt-4o: $0.0092 (18%)

Breakdown by Character:
- Sherlock: $0.0198
- Merlin: $0.0142
- Teacher: $0.0089
- Others: $0.0084

Comparison to Last Month:
↓ 12% decrease (saved $0.0071)

Projection for Next Month: $0.055
```

---

## 🔗 Integration

### API Access (Future Feature)

Programmatically access usage data:

```typescript
// Get current month usage
const usage = await tokenDashboard.getMonthlyUsage({
  year: 2026,
  month: 1
});

console.log(usage);
// {
//   totalTokens: 342150,
//   totalCost: 0.0513,
//   messages: 512,
//   byModel: { ... },
//   byCharacter: { ... }
// }
```

### Webhook Alerts (Future Feature)

Get notified when thresholds reached:

```json
{
  "event": "budget_threshold",
  "threshold": 0.75,
  "currentSpend": 37.50,
  "budget": 50.00,
  "timestamp": "2026-01-15T14:30:00Z"
}
```

---

## 📚 Related Documentation

- [AI Strategy](AI_STRATEGY.md) — Token optimization techniques
- [Character Editor](CHARACTER_EDITOR.md) — Creating efficient characters
- [Deployment](DEPLOYMENT.md) — Setting up local models
- [Troubleshooting](TROUBLESHOOTING.md) — Common issues

---

**Track smart, spend less, chat more!** 💰📊
