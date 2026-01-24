import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import KeyValueEditor from './components/KeyValueEditor';
import ResponsePanel from './components/ResponsePanel';
import { IconSend, IconLink, IconSettings, IconConfig } from './components/Icons';

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

  const methodRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (methodRef.current && !methodRef.current.contains(event.target)) {
        setIsMethodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatListToObject = (list) => {
    return list.reduce((acc, current) => {
      if (current.key.trim()) acc[current.key] = current.value;
      return acc;
    }, {});
  };

  const handleSend = async () => {
    if (!url) return;
    setPhase('active');
    setLoading(true);
    setResponse(null);

    try {
      const allHeaders = formatListToObject(headers);
      if (spoofSettings.origin) allHeaders['Origin'] = spoofSettings.origin;
      if (spoofSettings.referer) allHeaders['Referer'] = spoofSettings.referer;

      let parsedBody = null;
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          alert('Invalid Body Format: Please provide valid JSON.');
          setLoading(false);
          return;
        }
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/request';

      let normalizedUrl = url.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        // Default to http for local addresses, https for everything else
        const isLocal = /^(localhost|127\.0\.0\.1|192\.168)/i.test(normalizedUrl);
        normalizedUrl = `${isLocal ? 'http' : 'https'}://${normalizedUrl}`;
      }

      const res = await axios.post(API_URL, {
        url: normalizedUrl,
        method,
        headers: allHeaders,
        params: formatListToObject(params),
        body: parsedBody
      });
      setResponse(res.data);
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
          <div style={{ color: 'var(--text-dim)', display: 'flex' }}><IconLink /></div>
          <input
            className="url-field"
            placeholder="paste the link here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="send-trigger"
            style={{ marginRight: '8px' }}
            onClick={() => setShowConfig(!showConfig)}
            title="Toggle Configuration"
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
            </div>
          </section>
        )}

        <ResponsePanel response={response} loading={loading} />
      </div>
    </div>
  );
};

export default App;
