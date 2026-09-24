import { useState } from 'react';

export default function Combobox({ items, value, onChange, placeholder, exclude = [], maxResults = 80 }) {
  const [abierto, setAbierto] = useState(false);

  const q = value.trim().toLowerCase();
  const excluidos = new Set(exclude.map((e) => e.trim().toLowerCase()));
  const filtrados = items.filter(
    (item) => !excluidos.has(item.toLowerCase()) && (!q || item.toLowerCase().includes(q))
  );

  function elegir(item) {
    onChange(item);
    setAbierto(false);
  }

  return (
    <div className="combobox">
      <input
        className="text-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && filtrados[0]) {
            elegir(filtrados[0]);
          }
        }}
      />
      {abierto && (
        <ul className="combobox-list">
          {filtrados.length === 0 ? (
            <li className="combobox-empty">Sin coincidencias</li>
          ) : (
            filtrados.slice(0, maxResults).map((item) => (
              <li
                key={item}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(item)}
              >
                {item}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}