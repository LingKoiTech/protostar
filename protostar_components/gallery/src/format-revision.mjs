const formatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Etc/GMT-8',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

export function formatRevision(value) {
  return `${formatter.format(new Date(value))} UTC+8`;
}
