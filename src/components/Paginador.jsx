export default function Paginador({ total, pagina, tamano, onCambioPagina }) {
  const totalPaginas = Math.max(1, Math.ceil(total / tamano));
  if (totalPaginas <= 1) return null;

  function ir(p) {
    onCambioPagina(Math.min(Math.max(1, p), totalPaginas));
  }

  const rango = 1;
  const paginas = new Set([1, totalPaginas]);
  for (let p = pagina - rango; p <= pagina + rango; p += 1) paginas.add(p);
  const lista = [...paginas].filter((p) => p >= 1 && p <= totalPaginas);

  return (
    <div className="paginador">
      <span className="paginador-info">
        {total} registros · Página {pagina} de {totalPaginas}
      </span>
      <div className="paginador-controles">
        <button className="action" disabled={pagina <= 1} onClick={() => ir(pagina - 1)}>
          ← Anterior
        </button>
        {lista.map((p, i) => (
          <span key={p} className="paginador-grupo">
            {i > 0 && p !== lista[i - 1] + 1 && <span className="paginador-ellipsis">…</span>}
            <button
              className={p === pagina ? 'paginador-btn active' : 'paginador-btn'}
              disabled={p === pagina}
              onClick={() => ir(p)}
            >
              {p}
            </button>
          </span>
        ))}
        <button className="action" disabled={pagina >= totalPaginas} onClick={() => ir(pagina + 1)}>
          Siguiente →
        </button>
      </div>
    </div>
  );
}