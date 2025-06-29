// Updated App.jsx with modal overlay for Rockle help
import { useState } from 'react';
import bands from './data/bands.json';
import bandImages from './data/bandImages.json';
import './App.css';
import { getSpotifyToken } from './useSpotify';

const todayIndex = new Date().getDate() % bands.length;
const answer = bands[todayIndex];
console.log('Answer of the day:', answer.Name);

function getHintState(key, value, correct) {
  if (value === correct) return 'match';
  const diff = Math.abs(value - correct);
  if (key === 'Debut Year') return diff <= 5 ? 'close' : 'miss';
  if (key === 'Members') return diff <= 1 ? 'close' : 'miss';
  if (key === 'Popularity Score') return diff <= 10 ? 'close' : 'miss';
  return 'miss';
}

function getArrow(key, value, correct) {
  if (value === correct) return '';
  if (key === 'Popularity Score' || typeof value === 'number') {
    return value < correct ? '🔺' : '🔻';
  }
  return '';
}

function getFlagEmoji(country) {
  const code = {
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'Sweden': '🇸🇪',
    'Ireland': '🇮🇪',
    'Norway': '🇳🇴',
    'Finland': '🇫🇮',
    'Iceland': '🇮🇸',
    'Mexico': '🇲🇽',
  }[country];
  return code || '';
}

function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="modal-title">How to Play</h2>
        <p>Guess the alt band of the day. You have 10 tries.</p>
        <p>Each guess reveals the band's attributes. The colors and arrows help you narrow it down:</p>

<div className="hint-guide">
  <div className="hint-row">
    <span className="hint-box match">Purple</span>
    <span className="hint-text">= Exact match ✅</span>
  </div>
  <div className="hint-row">
    <span className="hint-box close">Yellow</span>
    <span className="hint-text">= Close guess</span>
  </div>
  <ul className="hint-subpoints">
    <li>Debut Year: within 5 years</li>
    <li>Members: within 1</li>
    <li>Popularity Score: within 10</li>
  </ul>
  <div className="hint-row">
    <span className="hint-box miss">Gray</span>
    <span className="hint-text">= Incorrect</span>
  </div>
  <div className="hint-row">
    <span className="hint-arrow">🔺 / 🔻</span>
    <span className="hint-text">= Too low / high for numbers</span>
  </div>
</div>


        <p style={{ marginTop: '1.2rem' }}>Hint Categories:</p>
        <ul className="modal-list">
          <li><strong>Genre</strong>: Music style</li>
          <li><strong>Debut Year</strong>: Year of first album or when the band became active</li>
          <li><strong>Members</strong>: Number of current members in the lineup</li>
          <li><strong>Country</strong>: Where the band is from</li>
          <li><strong>Frontperson</strong>: Gender of the lead singer</li>
          <li><strong>Popularity Score</strong>: Relative Spotify popularity (out of 100)</li>
        </ul>
      </div>
    </div>
  );
}


export default function App() {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [result, setResult] = useState('');
  const [filteredBands, setFilteredBands] = useState([]);
  const [selected, setSelected] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (e) => {
    const input = e.target.value;
    setGuess(input);
    setSelected(false);
    if (input.length === 0) {
      setFilteredBands([]);
      return;
    }
    const matches = bands
      .map((b) => b.Name)
      .filter((name) => name.toLowerCase().startsWith(input.toLowerCase()));
    setFilteredBands(matches);
  };

  const handleSelect = (name) => {
    setGuess(name);
    setFilteredBands([]);
    setSelected(true);
  };

  const checkGuess = async () => {
    if (!selected) return;
    const trimmed = guess.trim().toLowerCase();
    const isCorrect = trimmed === answer['Name'].toLowerCase();
    const updatedGuesses = [guess, ...guesses];
    setGuesses(updatedGuesses);
    setResult(
      isCorrect
        ? '🎉 Correct!'
        : updatedGuesses.length >= 10
        ? `❌ Out of tries! It was ${answer['Name']}`
        : '❌ Try again'
    );
    setGuess('');
    setSelected(false);
  };

  return (
    <div className="container">
      <button className="help-button" onClick={() => setShowHelp(true)}>?</button>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <img
        src="/rockle-1.png"
        alt="Rockle logo"
        style={{ width: '100%', maxWidth: '250px', display: 'block', margin: '1rem auto' }}
      />

      <header className="header">
        <p className="subtitle" style={{ fontSize: '1.1rem', textAlign: 'center', margin: '0 1rem' }}>
          Guess the alt band of the day. You’ve got 10 chances. Use the clues and trust your gut.
        </p>
      </header>

      <div className="input-block">
        <div>
          <input
            type="text"
            value={guess}
            onChange={handleChange}
            placeholder="Enter band name"
          />
          {filteredBands.length > 0 && (
            <ul className="dropdown">
              {filteredBands.map((name) => (
                <li key={name} onClick={() => handleSelect(name)}>
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={checkGuess}>Submit Guess</button>
      </div>

      <div className="guesses">
        {guesses.map((g, idx) => {
          const band = bands.find((b) => b['Name'].toLowerCase() === g.trim().toLowerCase());
          return (
            <div key={idx} className="guess-block">
              {band && (
                <>
                  <h3>{band.Name}</h3>
                  {bandImages[band.Name] && (
                    <img
                      src={bandImages[band.Name]}
                      alt={band.Name}
                      style={{ maxWidth: '180px', borderRadius: '8px', marginBottom: '0.5rem' }}
                    />
                  )}
                  <div className="hint-grid">
                    {['Genre', 'Debut Year', 'Members', 'Country', 'Frontperson', 'Popularity Score'].map((key) => {
                      const value = band[key];
                      const correct = answer[key];
                      const hintState = getHintState(key, value, correct);
                      const arrow = getArrow(key, value, correct);
                      const flag = key === 'Country' ? getFlagEmoji(value) : '';

                      return (
                        <div key={key} className={`hint-box ${hintState}`}>
                          <div className="hint-key">{key}</div>
                          <div className="hint-value">
                            {key === 'Country' ? (
                              <>
                                <span>{value} {flag}</span>
                                {hintState === 'match' && <span className="hint-arrow">✅</span>}
                              </>
                            ) : (
                              <>
                                <span>{typeof value === 'number' || typeof value === 'string' ? value : '—'}</span>
                                {value !== correct && <span className="hint-arrow">{arrow}</span>}
                                {value === correct && <span className="hint-arrow">✅</span>}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {result && <div className="result">{result}</div>}
    </div>
  );
}