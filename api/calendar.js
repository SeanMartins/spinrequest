// Feed iCalendar degli eventi SpinRequest di un DJ: /api/calendar?u=<uid>
// Legge solo la collezione pubblica "events" (già leggibile dagli ospiti): nessun dato privato del cliente.
export const config = { runtime: 'edge' };

const PROJECT = 'spinrequest-c0aa1';
const API_KEY = 'AIzaSyC2pfiikTAuxdwux63ZG_HnfEwrnj6auJw';

const esc = s => String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, m => '\\' + m);
const fold = line => { // righe max 75 ottetti (RFC 5545)
  const out = []; let cur = '';
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > 74) { out.push(cur); cur = ' ' + ch; } else cur += ch;
  }
  out.push(cur); return out.join('\r\n');
};
const val = f => f == null ? '' : (f.stringValue ?? f.integerValue ?? f.doubleValue ?? (f.booleanValue != null ? String(f.booleanValue) : ''));

export default async function handler(req) {
  const uid = new URL(req.url).searchParams.get('u') || '';
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) return new Response('Missing or invalid u', { status: 400 });

  const body = { structuredQuery: {
    from: [{ collectionId: 'events' }],
    where: { fieldFilter: { field: { fieldPath: 'djUid' }, op: 'EQUAL', value: { stringValue: uid } } },
    limit: 500
  } };
  let rows = [];
  try {
    const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:runQuery?key=${API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) return new Response('Upstream error ' + r.status, { status: 502 });
    rows = (await r.json()).filter(x => x.document);
  } catch (e) {
    return new Response('Upstream error', { status: 502 });
  }

  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SpinRequest//Eventi DJ//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:DJ – Eventi confermati', 'X-WR-TIMEZONE:Europe/Rome', 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H',
    'BEGIN:VTIMEZONE', 'TZID:Europe/Rome',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
    'END:VTIMEZONE'];

  for (const { document: d } of rows) {
    const f = d.fields || {}, id = d.name.split('/').pop();
    const date = val(f.date); if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (val(f.archived) === 'true') continue;
    const st = val(f.bookingStatus);
    if (st && !['confermato', 'completato'].includes(st)) continue;
    const day = date.replace(/-/g, ''), from = val(f.timeFrom), to = val(f.timeTo);
    lines.push('BEGIN:VEVENT', 'UID:' + id + '@spinrequest', 'DTSTAMP:' + stamp);
    if (/^\d{2}:\d{2}$/.test(from)) {
      const end = /^\d{2}:\d{2}$/.test(to) ? to : String((Number(from.slice(0, 2)) + 4) % 24).padStart(2, '0') + from.slice(2);
      const endDay = end <= from ? (() => { const x = new Date(date + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10).replace(/-/g, ''); })() : day;
      lines.push('DTSTART;TZID=Europe/Rome:' + day + 'T' + from.replace(':', '') + '00', 'DTEND;TZID=Europe/Rome:' + endDay + 'T' + end.replace(':', '') + '00');
    } else {
      const x = new Date(date + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + 1);
      lines.push('DTSTART;VALUE=DATE:' + day, 'DTEND;VALUE=DATE:' + x.toISOString().slice(0, 10).replace(/-/g, ''));
    }
    lines.push(fold('SUMMARY:' + esc('🎧 ' + (val(f.name) || 'Evento DJ'))));
    if (val(f.venue)) lines.push(fold('LOCATION:' + esc(val(f.venue))));
    const desc = [val(f.pax) ? val(f.pax) + ' ospiti' : '', val(f.code) ? 'Codice SpinRequest: ' + val(f.code) : ''].filter(Boolean).join('\n');
    if (desc) lines.push(fold('DESCRIPTION:' + esc(desc)));
    lines.push('STATUS:CONFIRMED', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'public, max-age=900', 'Content-Disposition': 'inline; filename="eventi-dj.ics"', 'Access-Control-Allow-Origin': '*' }
  });
}
