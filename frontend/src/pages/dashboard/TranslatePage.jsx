import { useState } from "react";
import { useTranslate } from "../../hooks/useTranslate.js";
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Volume2, 
  Sparkles,
  MessageCircle,
  Globe,
  Plane,
  Hotel,
  Utensils,
  HelpCircle,
  Heart
} from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", flag: "🇧🇩" },
];

// Common travel phrases
const commonPhrases = [
  { category: "Greetings", icon: MessageCircle, color: "#6366f1", phrases: [
    "Hello, how are you?",
    "Good morning",
    "Thank you very much",
    "Please",
    "Excuse me",
  ]},
  { category: "Directions", icon: Globe, color: "#10b981", phrases: [
    "Where is the train station?",
    "How do I get to the airport?",
    "Is it far from here?",
    "Turn left/right",
    "Straight ahead",
  ]},
  { category: "Transport", icon: Plane, color: "#f59e0b", phrases: [
    "I need a taxi",
    "One ticket please",
    "What time does it leave?",
    "Is this seat taken?",
    "Stop here please",
  ]},
  { category: "Hotel", icon: Hotel, color: "#8b5cf6", phrases: [
    "I have a reservation",
    "What time is checkout?",
    "Is breakfast included?",
    "Can I have the WiFi password?",
    "Room service please",
  ]},
  { category: "Food", icon: Utensils, color: "#ec4899", phrases: [
    "A table for two please",
    "The menu please",
    "I am vegetarian",
    "The bill please",
    "This is delicious!",
  ]},
  { category: "Emergency", icon: HelpCircle, color: "#ef4444", phrases: [
    "I need help",
    "Call the police",
    "I need a doctor",
    "I am lost",
    "It's an emergency",
  ]},
];

export default function TranslatePage() {
  const { 
    text, 
    sourceLang, 
    setSourceLang,
    targetLang, 
    setTargetLang, 
    translated, 
    loading, 
    onChangeText,
    swapLanguages 
  } = useTranslate("en", "es");
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCopy = async () => {
    if (translated) {
      await navigator.clipboard.writeText(translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePhraseClick = (phrase) => {
    onChangeText(phrase);
  };

  const handleSwap = () => {
    if (translated) {
      swapLanguages();
    }
  };

  const sourceLangData = languages.find(l => l.code === sourceLang);
  const targetLangData = languages.find(l => l.code === targetLang);
  const charCount = text.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
        }}>
          <Languages size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#111827", fontWeight: 600 }}>
            Travel Translator
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
            Break language barriers — translate phrases for your journey
          </p>
        </div>
      </header>

      {/* Main Translation Card */}
      <section
        style={{
          borderRadius: 24,
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          overflow: "hidden"
        }}
      >
        {/* Language Selection Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb"
        }}>
          {/* Source Language Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{sourceLangData?.flag}</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              style={{
                appearance: "none",
                background: "none",
                border: "none",
                fontSize: 15,
                fontWeight: 500,
                color: "#374151",
                cursor: "pointer",
                paddingRight: 4
              }}
            >
              {languages.filter(l => l.code !== targetLang).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!translated}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: translated ? "#fff" : "#f3f4f6",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: translated ? "pointer" : "not-allowed",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (translated) {
                e.currentTarget.style.backgroundColor = "#eef2ff";
                e.currentTarget.style.borderColor = "#6366f1";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = translated ? "#fff" : "#f3f4f6";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
            title="Swap languages"
          >
            <ArrowRightLeft size={18} color={translated ? "#6366f1" : "#9ca3af"} />
          </button>

          {/* Target Language Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              style={{
                appearance: "none",
                background: "none",
                border: "none",
                fontSize: 15,
                fontWeight: 500,
                color: "#374151",
                cursor: "pointer",
                paddingRight: 4
              }}
            >
              {languages.filter(l => l.code !== sourceLang).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: 20 }}>{targetLangData?.flag}</span>
          </div>
        </div>

        {/* Translation Areas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Source Text */}
          <div style={{ 
            padding: 24, 
            borderRight: "1px solid #e5e7eb",
            position: "relative"
          }}>
            <textarea
              rows={8}
              style={{
                width: "100%",
                border: "none",
                resize: "none",
                fontSize: 16,
                color: "#1f2937",
                backgroundColor: "transparent",
                outline: "none",
                lineHeight: 1.6
              }}
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="Type something to translate..."
            />
            <div style={{
              position: "absolute",
              bottom: 16,
              left: 24,
              right: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                {charCount} characters
              </span>
              {text && (
                <button
                  onClick={() => onChangeText("")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 12,
                    color: "#6366f1",
                    cursor: "pointer",
                    fontWeight: 500
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Translated Text */}
          <div style={{ 
            padding: 24, 
            backgroundColor: "#fafbfc",
            position: "relative",
            minHeight: 200
          }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  border: "2px solid #e5e7eb",
                  borderTopColor: "#6366f1",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                <span style={{ color: "#6b7280", fontSize: 15 }}>Translating...</span>
              </div>
            ) : translated ? (
              <p style={{ 
                margin: 0, 
                fontSize: 16, 
                color: "#1f2937",
                lineHeight: 1.6
              }}>
                {translated}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 15, color: "#9ca3af" }}>
                Translation will appear here...
              </p>
            )}

            {/* Action Buttons */}
            {translated && (
              <div style={{
                position: "absolute",
                bottom: 16,
                right: 24,
                display: "flex",
                gap: 8
              }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    color: copied ? "#10b981" : "#374151",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Common Phrases Section */}
      <section>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8, 
          marginBottom: 16 
        }}>
          <Sparkles size={18} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1f2937" }}>
            Common Travel Phrases
          </h3>
        </div>

        {/* Category Pills */}
        <div style={{ 
          display: "flex", 
          gap: 10, 
          flexWrap: "wrap",
          marginBottom: 16
        }}>
          {commonPhrases.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(isSelected ? null : cat.category)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: isSelected ? `2px solid ${cat.color}` : "1px solid #e5e7eb",
                  backgroundColor: isSelected ? `${cat.color}10` : "#fff",
                  color: isSelected ? cat.color : "#4b5563",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Icon size={16} />
                {cat.category}
              </button>
            );
          })}
        </div>

        {/* Phrases Grid */}
        {selectedCategory && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            animation: "fadeIn 0.2s ease"
          }}>
            {commonPhrases
              .find(c => c.category === selectedCategory)
              ?.phrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePhraseClick(phrase)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    color: "#374151",
                    fontSize: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <span style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: "50%", 
                    backgroundColor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#6b7280",
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  {phrase}
                </button>
              ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <p style={{ 
        fontSize: 12, 
        color: "#9ca3af", 
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6
      }}>
        <Heart size={12} />
        Powered by Lingva Translate — Free & Open Source
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

