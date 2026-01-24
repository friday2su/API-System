import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import KeyValueEditor from './components/KeyValueEditor';
import ResponsePanel from './components/ResponsePanel';
import HistoryPanel from './components/HistoryPanel';
import { IconSend, IconLink, IconSettings, IconConfig, IconHistory, IconShield, IconCode, IconGithub } from './components/Icons';

const App = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [params, setParams] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState('headers');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [showConfig, setShowConfig] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [spoofSettings, setSpoofSettings] = useState({ origin: '', referer: '' });
  const [isMethodOpen, setIsMethodOpen] = useState(false);

  // New Features State
  const [auth, setAuth] = useState({ type: 'none', token: '', username: '', password: '', apiKey: '', apiValue: '' });
  const [environments, setEnvironments] = useState(() => JSON.parse(localStorage.getItem('api_envs') || '[{"key":"", "value":""}]'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('api_history') || '[]'));
  const [showHistory, setShowHistory] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);

  const methodRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (methodRef.current && !methodRef.current.contains(event.target)) {
        setIsMethodOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('api_envs', JSON.stringify(environments));
  }, [environments]);

  useEffect(() => {
    localStorage.setItem('api_history', JSON.stringify(history));
  }, [history]);

  const replaceEnvVars = (str) => {
    if (!str || typeof str !== 'string') return str;
    let newStr = str;
    environments.forEach(env => {
      if (env.key.trim()) {
        const regex = new RegExp(`\\{\\{${env.key}\\}\\ framework}`, 'g');
        newStr = newStr.replace(regex, env.value);
      }
    });
    return newStr;
  };

  const formatListToObject = (list) => {
    return list.reduce((acc, current) => {
      if (current.key.trim()) acc[replaceEnvVars(current.key)] = replaceEnvVars(current.value);
      return acc;
    }, {});
  };

  const parseCurl = (curlString) => {
    try {
      const urlMatch = curlString.match(/curl\s+(?:-\w\s+)*['"]?([^'"]+)['"]?/);
      if (urlMatch) setUrl(urlMatch[1]);

      const methodMatch = curlString.match(/-X\s+(\w+)/);
      if (methodMatch) setMethod(methodMatch[1].toUpperCase());

      const headerMatches = curlString.matchAll(/-H\s+['"]([^'"]+)['"]/g);
      const newHeaders = [];
      for (const match of headerMatches) {
        const [key, ...val] = match[1].split(':');
        newHeaders.push({ key: key.trim(), value: val.join(':').trim() });
      }
      if (newHeaders.length) setHeaders(newHeaders);

      const dataMatch = curlString.match(/--data(?:-raw)?\s+['"]([^'"]+)['"]/);
      if (dataMatch) setBody(dataMatch[1]);

      setShowConfig(true);
      setActiveTab('headers');
    } catch (e) {
      alert('Failed to parse cURL command');
    }
  };

  const handleSend = async () => {
    if (!url) return;
    setPhase('active');
    setLoading(true);
    setResponse(null);

    try {
      const processedUrl = replaceEnvVars(url);
      const allHeaders = formatListToObject(headers);

      // Inject Auth
      if (auth.type === 'bearer' && auth.token) allHeaders['Authorization'] = `Bearer ${auth.token}`;
      if (auth.type === 'basic' && auth.username) {
        const creds = btoa(`${auth.username}:${auth.password}`);
        allHeaders['Authorization'] = `Basic ${creds}`;
      }
      if (auth.type === 'apikey' && auth.apiKey) allHeaders[auth.apiKey] = auth.apiValue;

      if (spoofSettings.origin) allHeaders['Origin'] = spoofSettings.origin;
      if (spoofSettings.referer) allHeaders['Referer'] = spoofSettings.referer;

      let parsedBody = null;
      const processedBody = replaceEnvVars(body);
      if (['POST', 'PUT', 'PATCH'].includes(method) && processedBody) {
        try {
          parsedBody = JSON.parse(processedBody);
        } catch (e) {
          alert('Invalid Body Format: Please provide valid JSON.');
          setLoading(false);
          return;
        }
      }

      const isProd = import.meta.env.PROD;
      const API_URL = import.meta.env.VITE_API_URL || (isProd ? '/api/request' : 'http://localhost:5000/api/request');

      let normalizedUrl = processedUrl.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        const isLocal = /^(localhost|127\.0\.0\.1|192\.168)/i.test(normalizedUrl);
        normalizedUrl = `${isLocal ? 'http' : 'https'}://${normalizedUrl}`;
      }

      const requestPayload = {
        url: normalizedUrl,
        method,
        headers: allHeaders,
        params: formatListToObject(params),
        body: parsedBody
      };

      const res = await axios.post(API_URL, requestPayload);
      setResponse(res.data);
      setLastRequest(requestPayload);

      // Save to history
      const historyItem = { id: Date.now(), ...requestPayload, timestamp: new Date().toLocaleTimeString() };
      setHistory(prev => [historyItem, ...prev].slice(0, 20));
    } catch (err) {
      setResponse({
        status: err.response?.status || 0,
        time: err.response?.data?.time || 0,
        headers: err.response?.headers || {},
        data: err.response?.data || { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const sendHistoryItem = async (item) => {
    setUrl(item.url);
    setMethod(item.method);
    const headersArray = Object.entries(item.headers || {}).map(([key, value]) => ({ key, value }));
    setHeaders(headersArray.length ? headersArray : [{ key: '', value: '' }]);
    setBody(item.body ? JSON.stringify(item.body, null, 2) : '');

    // Trigger immediate send with the item's data
    setPhase('active');
    setLoading(true);
    setResponse(null);

    try {
      const isProd = import.meta.env.PROD;
      const API_URL = import.meta.env.VITE_API_URL || (isProd ? '/api/request' : 'http://localhost:5000/api/request');

      const res = await axios.post(API_URL, {
        url: item.url,
        method: item.method,
        headers: item.headers,
        params: item.params || {},
        body: item.body
      });
      setResponse(res.data);
      setLastRequest({
        url: item.url,
        method: item.method,
        headers: item.headers,
        params: item.params || {},
        body: item.body
      });
    } catch (err) {
      setResponse({
        status: err.response?.status || 0,
        time: err.response?.data?.time || 0,
        headers: err.response?.headers || {},
        data: err.response?.data || { error: err.message }
      });
    } finally {
      setLoading(false);
      setShowHistory(false);
    }
  };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  return (
    <div className={`app-container ${phase}`}>
      <div className="landing-logo-container">
        <img src="/logo.png" alt="Logo" className="landing-logo" />
      </div>

      <div className="request-bar-wrapper">
        <div className="method-dropdown-container" ref={methodRef}>
          <button className="method-trigger" onClick={() => setIsMethodOpen(!isMethodOpen)}>
            {method}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l4 4 4-4" /></svg>
          </button>

          {isMethodOpen && (
            <div className="method-options-list premium-box">
              {methods.map(m => (
                <div
                  key={m}
                  className={`method-option ${method === m ? 'selected' : ''}`}
                  onClick={() => { setMethod(m); setIsMethodOpen(false); }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="url-input-container premium-box">
          <div className="history-anchor" ref={historyRef}>
            <button
              className="send-trigger"
              onClick={() => url.trim() && setShowHistory(!showHistory)}
              style={{ opacity: url.trim() ? 1 : 0.3, cursor: url.trim() ? 'pointer' : 'default' }}
              title={url.trim() ? "View History" : "Enter a URL first"}
            >
              <IconHistory />
            </button>
            <HistoryPanel
              history={history}
              setHistory={setHistory}
              onSelect={sendHistoryItem}
              isOpen={showHistory && !!url.trim()}
              setIsOpen={setShowHistory}
            />
          </div>

          <div style={{ color: 'var(--text-dim)', display: 'flex', marginLeft: '12px' }}><IconLink /></div>
          <input
            className="url-field"
            placeholder="paste URL or cURL here..."
            value={url}
            onChange={(e) => {
              if (e.target.value.startsWith('curl')) {
                parseCurl(e.target.value);
              } else {
                setUrl(e.target.value);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="send-trigger"
            style={{
              marginRight: '8px',
              opacity: url.trim() ? 1 : 0.3,
              cursor: url.trim() ? 'pointer' : 'default'
            }}
            onClick={() => url.trim() && setShowConfig(!showConfig)}
            title={url.trim() ? "Toggle Configuration" : "Enter a URL first"}
          >
            <IconConfig />
          </button>
          <button className="send-trigger" onClick={handleSend} disabled={loading}>
            <IconSend />
          </button>
        </div>
      </div>

      <div className="details-container">
        {showConfig && (
          <section className="section-wrapper premium-box">
            <div className="section-header-bar">
              <div className="tab-link label">CONFIG</div>
              <div className="tab-group">
                <span className={`tab-link ${activeTab === 'headers' ? 'active' : ''}`} onClick={() => setActiveTab('headers')}>Headers</span>
                <span className={`tab-link ${activeTab === 'params' ? 'active' : ''}`} onClick={() => setActiveTab('params')}>Params</span>
                {['POST', 'PUT', 'PATCH'].includes(method) && (
                  <span className={`tab-link ${activeTab === 'body' ? 'active' : ''}`} onClick={() => setActiveTab('body')}>Body JSON</span>
                )}
                <span className={`tab-link ${activeTab === 'auth' ? 'active' : ''}`} onClick={() => setActiveTab('auth')}>Auth</span>
                <span className={`tab-link ${activeTab === 'env' ? 'active' : ''}`} onClick={() => setActiveTab('env')}>Env</span>
              </div>
            </div>

            <div className="box-body">
              {activeTab === 'headers' && (
                <>
                  <KeyValueEditor items={headers} setItems={setHeaders} placeholderKey="Header Key" placeholderValue="Value" />
                  <div
                    className="advanced-toggle-text"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <IconSettings />
                    {showAdvanced ? 'Hide Spoofing Settings' : 'Advanced Spoofing Options'}
                  </div>
                  {showAdvanced && (
                    <div className="spoof-grid">
                      <div>
                        <span className="spoof-label">ORIGIN SPOOF</span>
                        <input
                          className="kv-clean-input"
                          style={{ width: '100%' }}
                          placeholder="e.g. https://google.com"
                          value={spoofSettings.origin}
                          onChange={(e) => setSpoofSettings({ ...spoofSettings, origin: e.target.value })}
                        />
                      </div>
                      <div>
                        <span className="spoof-label">REFERER SPOOF</span>
                        <input
                          className="kv-clean-input"
                          style={{ width: '100%' }}
                          placeholder="e.g. https://github.com"
                          value={spoofSettings.referer}
                          onChange={(e) => setSpoofSettings({ ...spoofSettings, referer: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              {activeTab === 'params' && <KeyValueEditor items={params} setItems={setParams} placeholderKey="Param name" placeholderValue="Value" />}
              {activeTab === 'body' && (
                <textarea
                  className="textarea-premium"
                  placeholder='{ "example": "value" }'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              )}
              {activeTab === 'auth' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['none', 'bearer', 'basic', 'apikey'].map(t => (
                      <span
                        key={t}
                        className={`tab-link ${auth.type === t ? 'active' : ''}`}
                        onClick={() => setAuth({ ...auth, type: t })}
                        style={{ fontSize: '0.6rem' }}
                      >
                        {t.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  {auth.type === 'bearer' && (
                    <input className="kv-clean-input" placeholder="Token" value={auth.token} onChange={e => setAuth({ ...auth, token: e.target.value })} />
                  )}
                  {auth.type === 'basic' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input className="kv-clean-input" style={{ flex: 1 }} placeholder="Username" value={auth.username} onChange={e => setAuth({ ...auth, username: e.target.value })} />
                      <input className="kv-clean-input" style={{ flex: 1 }} type="password" placeholder="Password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} />
                    </div>
                  )}
                  {auth.type === 'apikey' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input className="kv-clean-input" style={{ flex: 1 }} placeholder="Header Key (e.g. X-API-KEY)" value={auth.apiKey} onChange={e => setAuth({ ...auth, apiKey: e.target.value })} />
                      <input className="kv-clean-input" style={{ flex: 1 }} placeholder="Value" value={auth.apiValue} onChange={e => setAuth({ ...auth, apiValue: e.target.value })} />
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'env' && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '16px' }}>Variables: Use {'{{key}}'} in URL or values.</div>
                  <KeyValueEditor items={environments} setItems={setEnvironments} placeholderKey="Variable Name" placeholderValue="Value" />
                </div>
              )}
            </div>
          </section>
        )}

        <ResponsePanel
          response={response}
          loading={loading}
          lastRequest={lastRequest}
        />
      </div>

      <footer className="app-footer">
        <a href="https://github.com/friday2su/API-System" target="_blank" rel="noopener noreferrer">
          Made by ! Friday | <IconGithub />
        </a>
      </footer>
    </div>
  );
};

export default App;
