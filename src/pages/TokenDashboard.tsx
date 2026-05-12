import { useEffect, useState } from 'react';
import { useTokenStore } from '../stores/tokenStore';
import { useCharacterStore } from '../stores/characterStore';

export default function TokenDashboard() {
  const loadUsages = useTokenStore(s => s.loadUsages);
  const getTotalTokens = useTokenStore(s => s.getTotalTokens);
  const getMonthTokens = useTokenStore(s => s.getMonthTokens);
  const getTokensPerCharacter = useTokenStore(s => s.getTokensPerCharacter);
  const getTokensPerDay = useTokenStore(s => s.getTokensPerDay);
  const getAvgPerMessage = useTokenStore(s => s.getAvgPerMessage);
  const getCostEstimate = useTokenStore(s => s.getCostEstimate);
  const characters = useCharacterStore(s => s.characters);

  const [filterChar, setFilterChar] = useState('');
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadUsages();
  }, []);

  const totalTokens = getTotalTokens();
  const monthTokens = getMonthTokens();
  const avgPerMsg = getAvgPerMessage();
  const cost = getCostEstimate();
  const perChar = getTokensPerCharacter();
  const perDay = getTokensPerDay(days);

  const charNames = characters.reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  const maxCharTokens = Math.max(...Object.values(perChar), 1);
  const maxDayTokens = Math.max(...perDay.map(d => d.tokens), 1);

  return (
    <div className="token-dashboard">
      <h2>Токены</h2>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{totalTokens.toLocaleString()}</span>
          <span className="stat-label">Всего</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{monthTokens.toLocaleString()}</span>
          <span className="stat-label">Этот месяц</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{avgPerMsg.toLocaleString()}</span>
          <span className="stat-label">Среднее/сообщение</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${cost.toFixed(4)}</span>
          <span className="stat-label">Стоимость</span>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <select value={filterChar} onChange={e => setFilterChar(e.target.value)}>
          <option value="">Все персонажи</option>
          {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={days} onChange={e => setDays(parseInt(e.target.value))}>
          <option value={7}>7 дней</option>
          <option value={14}>14 дней</option>
          <option value={30}>30 дней</option>
        </select>
      </div>

      {/* Tokens per character */}
      <div className="chart-section">
        <h3>По персонажам</h3>
        <div className="bar-chart">
          {Object.entries(perChar).map(([charId, tokens]) => (
            <div key={charId} className="bar-row">
              <span className="bar-label">{charNames[charId] || charId}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(tokens / maxCharTokens) * 100}%` }}
                />
              </div>
              <span className="bar-value">{tokens.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(perChar).length === 0 && <p className="empty-chart">Нет данных</p>}
        </div>
      </div>

      {/* Tokens per day */}
      <div className="chart-section">
        <h3>По дням</h3>
        <div className="line-chart">
          {perDay.map(d => (
            <div key={d.date} className="line-bar">
              <div
                className="line-fill"
                style={{ height: `${(d.tokens / maxDayTokens) * 100}%` }}
              />
              <span className="line-label">{d.date.slice(5)}</span>
            </div>
          ))}
          {perDay.length === 0 && <p className="empty-chart">Нет данных</p>}
        </div>
      </div>
    </div>
  );
}
