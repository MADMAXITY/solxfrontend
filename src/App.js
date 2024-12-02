import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [response, setResponse] = useState(null);
  const [openTrades, setOpenTrades] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [pnlMap, setPnlMap] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/trading/api/open-trade/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_address: tokenAddress }),
      });
      const data = await res.json();
      setResponse(data);
      fetchOpenTrades();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchOpenTrades = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/trading/api/get-open-trades/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setOpenTrades(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchClosedTrades = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/trading/api/get-closed-trades/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setClosedTrades(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCloseTrade = async (tradeId) => {
    try {
      await fetch('http://127.0.0.1:8000/trading/api/close-trade/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trade_id: tradeId }),
      });
      fetchOpenTrades();
      fetchClosedTrades();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGetCurrentPnl = async (tradeId) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/trading/api/get-current-pnl/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trade_id: tradeId }),
      });
      const data = await res.json();
      setPnlMap((prevPnlMap) => ({ ...prevPnlMap, [tradeId]: data.pnl_percentage }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClearClosedTrades = async () => {
    try {
      await fetch('http://127.0.0.1:8000/trading/api/clear-closed-trades/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      fetchClosedTrades();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e6) {
      return (marketCap / 1e6).toFixed(1) + 'M';
    } else if (marketCap >= 1e3) {
      return (marketCap / 1e3).toFixed(1) + 'K';
    } else {
      return marketCap;
    }
  };

  useEffect(() => {
    fetchOpenTrades();
    fetchClosedTrades();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>SolX</h1>
        <form onSubmit={handleSubmit} className="form">
          <label className="form-label">
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="form-input"
              placeholder="Enter Token Address"
            />
          </label>
          <button type="submit" className="primary-button">
            Open Trade
          </button>
        </form>
        {response && (
          <div className="response-card">
            <h3>Trade Opened Successfully!</h3>
            <p><strong>Trade ID:</strong> {response.trade_id}</p>
          </div>
        )}
        <section className="trades-section">
          <h3>Open Trades</h3>
          <div className="trade-cards">
            {openTrades.map((trade) => (
              <div key={trade.trade_id} className="trade-card">
                <div className="card-header">
                  <a
                    href={`https://dexscreener.com/solana/${trade.token_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dexscreener-button"
                  >
                    ↗
                  </a>
                </div>
                <img src={trade.image_url} alt={trade.name} className="trade-image" />
                <p><strong>{trade.name}</strong> ({trade.symbol})</p>
                <p>Price: ${trade.price_usd}</p>
                <p>Market Cap: ${formatMarketCap(trade.market_cap)}</p>
                <div className="trade-actions">
                  <button
                    className="secondary-button"
                    onClick={() => handleCloseTrade(trade.trade_id)}
                  >
                    Close Trade
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => handleGetCurrentPnl(trade.trade_id)}
                  >
                    Show PnL
                  </button>
                </div>
                {pnlMap[trade.trade_id] !== undefined && (
                  <p><strong>Current PnL:</strong> {pnlMap[trade.trade_id]}%</p>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="trades-section">
          <h3>Closed Trades</h3>
          <button className="danger-button" onClick={handleClearClosedTrades}>
            Clear All Closed Trades
          </button>
          <div className="trade-cards">
            {closedTrades.map((trade) => (
              <div key={trade.trade_id} className="trade-card">
                <img src={trade.image_url} alt={trade.name} className="trade-image" />
                <p><strong>{trade.name}</strong> ({trade.symbol})</p>
                <p>Price: ${trade.price_usd}</p>
                <p><strong>Closed At:</strong> {trade.closed_at}</p>
                <p><strong>PnL:</strong> {trade.pnl_percentage}%</p>
              </div>
            ))}
          </div>
        </section>
      </header>
    </div>
  );
}

export default App;
