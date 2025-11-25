import React, { useState } from 'react';
import { Send, Sparkles, TrendingUp, Mail, Share2, FileText, Target, BarChart3, Lightbulb } from 'lucide-react';

export default function MarketingAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('general');

  const modes = [
    { id: 'general', name: 'General Marketing', icon: Sparkles, color: 'bg-purple-500' },
    { id: 'social', name: 'Social Media', icon: Share2, color: 'bg-blue-500' },
    { id: 'email', name: 'Email Campaign', icon: Mail, color: 'bg-green-500' },
    { id: 'content', name: 'Content Strategy', icon: FileText, color: 'bg-orange-500' },
    { id: 'ads', name: 'Ad Copy', icon: Target, color: 'bg-red-500' },
    { id: 'analysis', name: 'Market Analysis', icon: BarChart3, color: 'bg-indigo-500' },
    { id: 'ideas', name: 'Campaign Ideas', icon: Lightbulb, color: 'bg-yellow-500' },
  ];

  const systemPrompts = {
    general: "You are a marketing AI agent for the Pakistan Entrepreneurship Society (PES). Provide strategic marketing advice, campaign planning, and general marketing guidance.",
    social: "You are a social media marketing expert for PES. Create engaging social media posts, captions, and content strategies for platforms like Facebook, Instagram, LinkedIn, and Twitter. Be creative and youth-focused.",
    email: "You are an email marketing specialist for PES. Write compelling email campaigns, subject lines, and email sequences. Focus on engagement and conversions.",
    content: "You are a content marketing strategist for PES. Develop content calendars, blog post ideas, video concepts, and comprehensive content strategies.",
    ads: "You are an advertising copywriter for PES. Create persuasive ad copy for Facebook Ads, Google Ads, and other platforms. Focus on conversions and ROI.",
    analysis: "You are a market research analyst for PES. Provide market insights, competitor analysis, and data-driven marketing recommendations for the Pakistani entrepreneurship ecosystem.",
    ideas: "You are a creative campaign ideation expert for PES. Generate innovative marketing campaign ideas, event concepts, and viral marketing strategies."
  };

  const quickPrompts = {
    social: [
      "Create 5 Instagram posts about entrepreneurship in Pakistan",
      "Write LinkedIn content for PES event announcement",
      "Generate Twitter thread about startup ecosystem"
    ],
    email: [
      "Write welcome email for new PES members",
      "Create newsletter about latest entrepreneurship news",
      "Draft event invitation email"
    ],
    content: [
      "Create 30-day content calendar for PES",
      "Generate blog post ideas about Pakistani startups",
      "Plan video content series for YouTube"
    ],
    ads: [
      "Write Facebook Ad for entrepreneurship workshop",
      "Create Google Ads for PES membership",
      "Generate Instagram Ad copy for startup event"
    ],
    analysis: [
      "Analyze Pakistani startup ecosystem trends",
      "Compare PES with similar organizations",
      "Research target audience for entrepreneurship programs"
    ],
    ideas: [
      "Generate viral campaign ideas for PES",
      "Create event concepts for student entrepreneurs",
      "Brainstorm partnership opportunities"
    ]
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: systemPrompts[activeMode],
          messages: newMessages
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">PES Marketing AI Agent</h1>
              <p className="text-purple-200">Autonomous Marketing Automation System • Live 24/7</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-white/20">
          <h3 className="text-white font-semibold mb-3 text-sm">SELECT MARKETING MODE:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveMode(mode.id);
                    setMessages([]);
                  }}
                  className={`p-3 rounded-xl transition-all ${
                    activeMode === mode.id
                      ? `${mode.color} shadow-lg scale-105`
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white mx-auto mb-1" />
                  <div className="text-xs text-white font-medium text-center">
                    {mode.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Prompts */}
        {quickPrompts[activeMode] && messages.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3 text-sm">QUICK START:</h3>
            <div className="grid gap-2">
              {quickPrompts[activeMode].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-purple-200 text-sm transition-all border border-white/10 hover:border-purple-400"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {modes.find(m => m.id === activeMode)?.name} Mode Active
                </h3>
                <p className="text-purple-200 max-w-md mx-auto">
                  {activeMode === 'general' && "Ask me anything about marketing strategy, campaigns, or general marketing advice for PES."}
                  {activeMode === 'social' && "I'll help you create engaging social media content and strategies for PES."}
                  {activeMode === 'email' && "Let's craft compelling email campaigns that drive engagement and conversions."}
                  {activeMode === 'content' && "I'll develop comprehensive content strategies and calendars for your marketing needs."}
                  {activeMode === 'ads' && "I'll write persuasive ad copy that converts and drives ROI."}
                  {activeMode === 'analysis' && "I'll provide data-driven market insights and competitive analysis."}
                  {activeMode === 'ideas' && "Let's brainstorm creative campaigns and innovative marketing ideas!"}
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/5 border-t border-white/20">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask your marketing agent anything... (${modes.find(m => m.id === activeMode)?.name} mode)`}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="2"
                disabled={loading}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="bg-red-500/20 text-red-300 p-3 rounded-xl hover:bg-red-500/30 transition-all text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-purple-300 text-sm">
          <p>🤖 AI-Powered Marketing Automation • Built for Pakistan Entrepreneurship Society</p>
          <p className="text-xs mt-1 text-purple-400">Powered by Claude Sonnet 4 • Live 24/7 on Vercel</p>
        </div>
      </div>
    </div>
  );
}
