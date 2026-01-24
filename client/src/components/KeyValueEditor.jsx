import React from 'react';

const KeyValueEditor = ({ items, setItems, placeholderKey = "Key", placeholderValue = "Value" }) => {
    const handleChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleAdd = () => setItems([...items, { key: '', value: '' }]);
    const handleRemove = (index) => {
        const filtered = items.filter((_, i) => i !== index);
        setItems(filtered.length ? filtered : [{ key: '', value: '' }]);
    };

    const IconTrash = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" /></svg>
    );

    return (
        <div style={{ width: '100%' }}>
            {items.map((item, index) => (
                <div key={index} className="kv-clean-row">
                    <input
                        className="kv-clean-input"
                        placeholder={placeholderKey}
                        value={item.key}
                        onChange={(e) => handleChange(index, 'key', e.target.value)}
                    />
                    <input
                        className="kv-clean-input"
                        placeholder={placeholderValue}
                        value={item.value}
                        onChange={(e) => handleChange(index, 'value', e.target.value)}
                    />
                    <button
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleRemove(index)}
                    >
                        <IconTrash />
                    </button>
                </div>
            ))}
            <button className="btn-add-row" onClick={handleAdd}>
                + ADD NEW ROW
            </button>
        </div>
    );
};

export default KeyValueEditor;
