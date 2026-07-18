exports.handler = async function(event, context) {
  const NETLIFY_TOKEN   = process.env.NETLIFY_TOKEN;
  const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
  const FORM_NAME       = "ali-mayorista-envios";

  console.log("SITE_ID usado:", NETLIFY_SITE_ID);
  console.log("TOKEN presente?:", !!NETLIFY_TOKEN, "largo:", NETLIFY_TOKEN ? NETLIFY_TOKEN.length : 0);

  try {
    // 1. Obtener el form ID
    const r1 = await fetch(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/forms`,
      { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
    );
    console.log("Status de /forms:", r1.status);
    const forms = await r1.json();
    console.log("Respuesta de /forms:", JSON.stringify(forms));

    if (!Array.isArray(forms)) {
      return { statusCode: 500, body: JSON.stringify({ error: "La API no devolvió una lista de forms", detalle: forms }) };
    }

    const form = forms.find(f => f.name === FORM_NAME);
    console.log("Form encontrado?:", form ? form.id : "NO ENCONTRADO");

    if (!form) {
      return { statusCode: 404, body: JSON.stringify({ error: "form no encontrado", nombresDisponibles: forms.map(f => f.name) }) };
    }

    // 2. Traer TODOS los submissions con paginación
    let allSubs = [];
    let page = 1;
    const perPage = 100;
    while (true) {
      const r2 = await fetch(
        `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=${perPage}&page=${page}`,
        { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
      );
      const subs = await r2.json();
      if (!Array.isArray(subs) || subs.length === 0) break;
      allSubs = allSubs.concat(subs);
      if (subs.length < perPage) break;
      page++;
    }

    console.log("Total submissions traídas:", allSubs.length);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allSubs)
    };
  } catch (e) {
    console.log("ERROR:", e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
