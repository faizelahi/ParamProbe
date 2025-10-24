// ParamProbe: static generator. Does NOT perform network requests.
function qEncode(s){ return encodeURIComponent(s); }

function buildCommands(target, paramsArray, payloads){
  if(!target) return '';
  // ensure target has no trailing ? or params
  let base = target.split('?')[0];
  let existingQS = (target.includes('?') ? target.split('?')[1] : '');
  const cmds = [];

  // Build GET probes
  paramsArray.forEach(param => {
    payloads.forEach(payload => {
      const url = `${base}?${param}=${qEncode(payload)}` + (existingQS ? `&${existingQS}` : '');
      const c = `curl -i -s -k -X GET "${url}" -H "User-Agent: ParamProbe/1.0"`;
      cmds.push(c);
    });
  });

  // Build POST form probes (curl -X POST -d param=payload)
  paramsArray.forEach(param => {
    payloads.forEach(payload => {
      const body = `${param}=${qEncode(payload)}`;
      const c = `curl -i -s -k -X POST "${base}" -H "Content-Type: application/x-www-form-urlencoded" -d "${body}" -H "User-Agent: ParamProbe/1.0"`;
      cmds.push(c);
    });
  });

  return cmds.join("\\n");
}

document.getElementById('gen').addEventListener('click', () => {
  const url = document.getElementById('url').value.trim();
  const paramsRaw = document.getElementById('params').value.trim();
  const payloadsRaw = document.getElementById('payloads').value.trim();

  const params = paramsRaw ? paramsRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];
  const payloads = payloadsRaw ? payloadsRaw.split('\\n').map(s=>s.trim()).filter(Boolean) : [];

  if(!url){
    document.getElementById('out').textContent = 'Enter a target URL first.';
    return;
  }

  const commands = buildCommands(url, params, payloads);
  document.getElementById('out').textContent = commands || '(no commands)';
});

document.getElementById('copy').addEventListener('click', async () => {
  const text = document.getElementById('out').textContent;
  if(!text) return;
  await navigator.clipboard.writeText(text);
  alert('Commands copied to clipboard — run them in your AttackBox or lab.');
});

document.getElementById('download').addEventListener('click', () => {
  const text = document.getElementById('out').textContent;
  if(!text) return;
  const blob = new Blob([text], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'paramprobe.sh'; a.click();
  URL.revokeObjectURL(url);
});
