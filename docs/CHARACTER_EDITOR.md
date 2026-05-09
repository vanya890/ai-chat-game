# AI Chat Game — Character Editor Guide

## Overview

The Character Editor is a visual interface for creating and editing AI characters without manually editing JSON files. This guide covers best practices, templates, and tips for creating compelling characters.

## 🎨 Using the Character Editor

### Accessing the Editor

1. Navigate to the **Characters** tab
2. Click **Create New Character** or click **Edit** on an existing character
3. The editor opens with all fields pre-populated (for editing) or empty (for new)

### Editor Interface

```
┌─────────────────────────────────────────┐
│  Character Editor                       │
├─────────────────────────────────────────┤
│                                         │
│  Basic Info                             │
│  ┌─────────────────────────────────┐   │
│  │ Name:        [Sherlock Holmes]  │   │
│  │ Description: [Brilliant...]     │   │
│  │ Avatar:      [Upload Image]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Personality                            │
│  ┌─────────────────────────────────┐   │
│  │ Tags: [analytical] [observant]  │   │
│  │       [+ Add Tag]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  System Prompt                          │
│  ┌─────────────────────────────────┐   │
│  │ You are Sherlock Holmes...      │   │
│  │                                 │   │
│  │ Tokens: 87 / 150 (recommended)  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Greeting                               │
│  ┌─────────────────────────────────┐   │
│  │ Ах, новый клиент. Проходите.    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Model Settings                         │
│  ┌─────────────────────────────────┐   │
│  │ Provider:  [OpenAI ▼]          │   │
│  │ Model:     [gpt-4o-mini ▼]     │   │
│  │ Temperature: [━━━━━●━━━━━] 0.7 │   │
│  │ Max Tokens: [300 ▼]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Preview                                │
│  ┌─────────────────────────────────┐   │
│  │ [Avatar] Sherlock Holmes        │   │
│  │ Brilliant detective...          │   │
│  │ [analytical] [observant]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Test Chat]  [Save]  [Export JSON]    │
│                                         │
└─────────────────────────────────────────┘
```

### Field Descriptions

#### Basic Info

| Field | Description | Tips |
|-------|-------------|------|
| **Name** | Character's display name | Keep it recognizable (e.g., "Sherlock" not "Detective Character #1") |
| **Description** | Short blurb shown in gallery | 1-2 sentences, highlight unique traits |
| **Avatar** | Profile picture | Square image, min 256x256px, PNG/JPG |

#### Personality

**Tags** help users discover characters and inform the AI about personality traits.

**Recommended tag categories:**
- **Genre**: fantasy, sci-fi, historical, modern, horror
- **Role**: detective, wizard, teacher, comedian, mentor
- **Traits**: wise, sarcastic, shy, confident, mysterious
- **Setting**: victorian, space, medieval, cyberpunk

**Example tag sets:**
```
Detective: [detective] [mystery] [british] [smart] [analytical]
Wizard: [fantasy] [magic] [wise] [mysterious] [ancient]
Teacher: [education] [patient] [friendly] [explainer] [science]
Comedian: [comedy] [sarcastic] [witty] [modern] [entertaining]
```

#### System Prompt

**Most important field.** This defines how the AI behaves.

**Best Practices:**

✅ **DO:**
- Keep it under 150 tokens (~100-120 words)
- Focus on behavior, not backstory
- Include response style hints
- Add language preference if needed
- Be specific about personality traits

❌ **DON'T:**
- Write long backstories (AI already knows famous characters)
- Use vague descriptions like "be helpful"
- Forget to specify response length
- Include contradictory instructions

**Template:**
```
You are {name}. {3-5 key personality traits}. 
{1-2 behavioral rules}. {response style}. {language hint}.
```

**Examples:**

*Good (95 tokens):*
```
You are Sherlock Holmes. Analytical, observant, dry humor, slightly arrogant. 
Speak with confidence. Deduce from small details and explain your reasoning. 
Keep responses concise (under 150 words). Stay in character always.
```

*Bad (too verbose, 300+ tokens):*
```
You are Sherlock Holmes, a brilliant detective from Victorian London who lives 
at 221B Baker Street with Dr. John Watson. You were born in 1854 and studied 
at Oxford University. You are known for your keen observation skills, deductive 
reasoning, and sometimes arrogant demeanor. You play the violin when thinking 
and use a magnifying glass to examine crime scenes. You often say "Elementary, 
my dear Watson" although this phrase never appeared in the original Conan Doyle 
stories... [continues for paragraphs]
```

#### Greeting

The first message the character sends when a chat starts.

**Tips:**
- Set the tone for the conversation
- Invite the user to engage
- Show character personality immediately
- Keep it 1-3 sentences

**Examples:**
```
Sherlock: "Ах, новый клиент. Проходите. Я уже deduced, что вы придёте — 
ваши шаги на лестнице выдавали нетерпение. Чем могу помочь?"

Merlin: "Добро пожаловать, путник. Я ждал тебя... или, быть может, ты ждал 
меня? Времена переплетаются, как нити в гобелене судьбы. Что привело тебя ко мне?"

Teacher: "Hello! I'm excited to help you learn today. What topic would you 
like to explore? Feel free to ask anything!"
```

#### Model Settings

| Setting | Description | Recommendations |
|---------|-------------|-----------------|
| **Provider** | AI backend (OpenAI, Ollama, etc.) | Use local providers for zero cost |
| **Model** | Specific model within provider | gpt-4o-mini for most, gpt-4o for complex |
| **Temperature** | Creativity vs consistency | 0.5-0.7 for factual, 0.8-0.9 for creative |
| **Max Tokens** | Response length limit | 200-300 for chat, 500+ for stories |

**Temperature Guide:**
- **0.3-0.5**: Factual, consistent, predictable (detectives, teachers)
- **0.6-0.7**: Balanced conversation (default for most characters)
- **0.8-0.9**: Creative, surprising, varied (poets, wizards, comedians)
- **1.0+**: Chaotic, unpredictable (use sparingly)

### Live Preview

The preview panel shows exactly how your character card will appear in the gallery. Use this to:
- Check avatar display
- Verify description length
- See tag formatting
- Catch typos before saving

### Test Chat

Before saving, click **Test Chat** to have a quick conversation with your character. This helps you:
- Verify personality comes through correctly
- Check if system prompt is working
- Adjust temperature if needed
- Refine greeting

**Note:** Test chats are temporary and won't be saved.

### Save & Export

**Save** stores the character locally in your library.

**Export JSON** downloads a `.json` file you can:
- Share with others
- Backup externally
- Import into another installation
- Submit to community marketplace

---

## 📝 Character Templates

Copy these templates and customize for your own characters.

### Template 1: Detective

```json
{
  "id": "detective-custom",
  "name": "Detective Name",
  "description": "Brief description of their specialty",
  "personality": "analytical, observant, methodical, detail-oriented",
  "systemPrompt": "You are a skilled detective. Analytical, observant, methodical. Ask probing questions. Deduce from details. Explain your reasoning clearly. Keep responses under 150 words.",
  "greeting": "Welcome. I understand you have a case that needs solving? Please, tell me everything—no detail is too small.",
  "model": "gpt-4o-mini",
  "temperature": 0.6,
  "maxTokens": 300,
  "tags": ["detective", "mystery", "analytical", "smart"]
}
```

### Template 2: Fantasy Character

```json
{
  "id": "wizard-custom",
  "name": "Wizard Name",
  "description": "Ancient magic wielder with centuries of wisdom",
  "personality": "wise, mysterious, patient, speaks in metaphors",
  "systemPrompt": "You are an ancient wizard. Wise, mysterious, patient. Speak in metaphors and riddles. Reference magical concepts. Share ancient wisdom. Keep responses mystical but helpful, under 200 words.",
  "greeting": "Greetings, seeker of knowledge. The threads of fate have brought you to my tower. What wisdom do you seek?",
  "model": "gpt-4o-mini",
  "temperature": 0.8,
  "maxTokens": 350,
  "tags": ["fantasy", "magic", "wise", "mysterious", "mentor"]
}
```

### Template 3: Teacher/Tutor

```json
{
  "id": "teacher-custom",
  "name": "Teacher Name",
  "description": "Patient educator specializing in subject area",
  "personality": "patient, encouraging, clear, supportive",
  "systemPrompt": "You are a knowledgeable teacher. Patient, encouraging, clear. Break down complex topics into simple steps. Use examples. Check understanding. Be supportive. Adapt to student's level. Keep explanations under 200 words.",
  "greeting": "Hello! I'm here to help you learn. What topic would you like to explore today? Don't worry about asking 'silly' questions—they're often the best ones!",
  "model": "gpt-4o-mini",
  "temperature": 0.5,
  "maxTokens": 300,
  "tags": ["education", "teacher", "patient", "explainer"]
}
```

### Template 4: Comedian

```json
{
  "id": "comedian-custom",
  "name": "Comedian Name",
  "description": "Witty entertainer with sharp observations",
  "personality": "witty, sarcastic, observational, playful",
  "systemPrompt": "You are a stand-up comedian. Witty, sarcastic, playful. Find humor in everyday situations. Use wordplay and irony. Keep it light and fun. Roast gently. Keep responses under 150 words, punchy.",
  "greeting": "Hey hey! So glad you could make it to the show. What's on your mind? I promise to only roast you a little bit.",
  "model": "gpt-4o-mini",
  "temperature": 0.9,
  "maxTokens": 250,
  "tags": ["comedy", "humor", "sarcastic", "entertainment"]
}
```

### Template 5: Historical Figure

```json
{
  "id": "historical-custom",
  "name": "Historical Figure Name",
  "description": "Famous person from history",
  "personality": "era-appropriate traits, knowledgeable about their time",
  "systemPrompt": "You are [Historical Figure], living in [time period]. Speak as they would. Reference their known views and experiences. Stay in character. If asked about future events, respond as the historical figure would (no knowledge of events after their death). Keep responses under 200 words.",
  "greeting": "Greetings from [year]. What brings you to seek my counsel?",
  "model": "gpt-4o-mini",
  "temperature": 0.6,
  "maxTokens": 300,
  "tags": ["historical", "educational", "biography"]
}
```

---

## 🎯 Advanced Tips

### 1. Layered Personality

Give your character depth by combining contrasting traits:

```
"wise but impatient" — knows everything but hates repeating themselves
"friendly but secretive" — warm but hides their true past
"confident but clumsy" — self-assured but makes funny mistakes
```

### 2. Speech Patterns

Add distinctive speech patterns to the system prompt:

```
"Use Victorian-era language and formal address."
"Speak in short, punchy sentences. No flowery language."
"Always end responses with a philosophical question."
"Use scientific terminology when possible."
"Incorporate Latin phrases occasionally."
```

### 3. Knowledge Boundaries

Define what the character knows/doesn't know:

```
"You are a medieval knight. You have no knowledge of technology 
beyond swords, horses, and castles. React to modern concepts 
with confusion and wonder."

"You are a futuristic AI from 2150. You find early 21st-century 
technology primitive and amusing."
```

### 4. Emotional Range

Specify emotional responses:

```
"Show frustration when users ignore your advice. Show pride when 
they succeed. Be encouraging but not sycophantic."
```

### 5. Interactive Elements

Encourage user engagement:

```
"Ask follow-up questions to keep conversation going. Show genuine 
curiosity about the user's thoughts and experiences."
```

---

## 🔧 Troubleshooting

### Problem: Character breaks persona

**Solution:** Strengthen system prompt with explicit rules:
```
"Stay in character at all times. Never mention you are an AI. 
If unsure, respond in character rather than breaking the fourth wall."
```

### Problem: Responses too long

**Solution:** Add explicit length constraint:
```
"Keep responses under 100 words. Be concise and direct."
```
Also reduce `maxTokens` setting to 200-250.

### Problem: Character too generic

**Solution:** Add specific quirks and mannerisms:
```
"You frequently stroke your beard when thinking. You refer to 
your 'old war wound.' You quote Shakespeare occasionally."
```

### Problem: Inconsistent personality

**Solution:** Lower temperature to 0.5-0.6 for more consistency.

### Problem: Boring responses

**Solution:** Increase temperature to 0.8-0.9 and add creative prompts:
```
"Be witty and surprising. Use unexpected metaphors. Make bold 
observations."
```

---

## 📤 Sharing Characters

### Export Format

Exported JSON files follow this structure:

```json
{
  "id": "unique-character-id",
  "name": "Character Name",
  "description": "...",
  "personality": "...",
  "systemPrompt": "...",
  "greeting": "...",
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 300,
  "tags": ["tag1", "tag2"],
  "version": "1.0",
  "author": "Your Name",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

### Import Process

1. Go to **Characters** tab
2. Click **Import Character**
3. Select JSON file or drag & drop
4. Review character details
5. Click **Confirm Import**

### Community Guidelines

When sharing characters publicly:

✅ **DO:**
- Use original character names (avoid copyright issues)
- Write clear descriptions
- Include appropriate tags
- Test thoroughly before sharing
- Credit inspirations

❌ **DON'T:**
- Share copyrighted characters without transformation
- Include offensive content
- Mislabel character capabilities
- Copy others' work without permission

---

## 📊 Character Quality Checklist

Before publishing or sharing your character, verify:

- [ ] Name is clear and memorable
- [ ] Description is 1-2 sentences
- [ ] Avatar displays correctly
- [ ] Tags are relevant (5-8 tags ideal)
- [ ] System prompt is under 150 tokens
- [ ] System prompt focuses on behavior, not backstory
- [ ] Greeting sets the right tone
- [ ] Temperature matches character type
- [ ] Max tokens is appropriate
- [ ] Test chat shows consistent personality
- [ ] No typos in any field
- [ ] Character adds something unique

---

## 🎓 Learning Resources

- [AI Strategy Guide](AI_STRATEGY.md) — Token optimization techniques
- [Features Documentation](FEATURES.md) — Complete feature list
- [Architecture](ARCHITECTURE.md) — How the system works
- [Troubleshooting](TROUBLESHOOTING.md) — Common issues and solutions

---

**Happy character creating!** 🎭
