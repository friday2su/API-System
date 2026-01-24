import React from 'react';
import { IconHistory, IconTrash } from './Icons';

const HistoryPanel = ({ history, setHistory, onSelect, isOpen, setIsOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="history-mini-popup premium-box">
            <div className="history-mini-header">
                <span>RECENT REQUESTS</span>
                <button className="clear-history-mini" onClick={() => setHistory([])}>CLEAR</button>
            </div>

            <div className="history-mini-list">
                {history.length === 0 && <div className="history-empty-text">No history yet.</div>}
                {history.map(item => (
                    <div key={item.id} className="history-mini-item" onClick={() => onSelect(item)}>
                        <span className={`mini-badge ${item.method.toLowerCase()}`}>{item.method}</span>
                        <span className="mini-url">{item.url}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
