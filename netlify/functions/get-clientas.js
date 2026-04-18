exports.handler = async function(event, context) {
  const NETLIFY_TOKEN   = process.env.NETLIFY_TOKEN;
  const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
  const FORM_NAME       = "ali-mayorista-envios";

  try {
    const r1 = await fetch(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/forms`,
      { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
    );
    const forms = await r1.json();
    const form  = forms.find(f => f.name === FORM_NAME);
    if (!form) {
      return { statusCode: 404, body: JSON.stringify([]) };
    }

    const r2 = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=200`,
      { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
    );
    const subs = await r2.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subs)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
